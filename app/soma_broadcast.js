require('dotenv').config();

const fs = require('fs');
const broadcast = require('./utils/broadcast');

const testFolder = './.sessions/';

async function sendMultipleMessages(users, text, res) {
	const results = {};
	results.alunos_in_turma = users.length;
	results.successes = 0;
	results.failures = 0;
	results.details = [];
	for (let i = 0; i < users.length; i++) {
		const e = users[i];
		const aux = await broadcast.sendBroadcastAluna(e.id, text);
		if (aux && aux.message_id) {
			results.successes += 1;
      results.details.push({ aluno_name: e.name, message_id: aux.message_id, recipient_id: e.id, status: 'success',  }); // eslint-disable-line
		} else {
			results.failures += 1;
			results.details.push({ aluno_name: e.name, recipient_id: e.id, status: 'failure' });
		}
	}
	res.status(200); res.send(results);
}

async function sendResponse(result, res) {
	if (result && result.id) { res.status(200); res.send({ response: 'success', broadcast_id: result.id }); }
	if (result && result.message_id) { res.status(200); res.send({ response: 'success', message_id: result.message_id, recipient_id: result.recipient_id }); }
	res.status(500); res.send({ error: 'Couldnt send broadcast' });
}

async function getUsers() {
	const result = [];

	await fs.readdirSync(testFolder).forEach(async (file) => {
		const obj = JSON.parse(await fs.readFileSync(testFolder + file, 'utf8'));
		result.push({ id: obj.user.id, name: obj.user.name });
	});

	return result;
}
async function findUserByFBID(FBID) {
	let res = false;
	await fs.readdirSync(testFolder).forEach(async (file) => {
		const obj = JSON.parse(await fs.readFileSync(testFolder + file, 'utf8'));
		if (!res && FBID.toString() === obj.user.id.toString()) {
			res = true;
		}
	});

	return res;
}
async function findUserByState(value, key) {
	const res = [];
	await fs.readdirSync(testFolder).forEach(async (file) => {
		const obj = JSON.parse(await fs.readFileSync(testFolder + file, 'utf8'));
		if (value.toString() === obj._state[key].toString()) {
			res.push({ id: obj.user.id, name: obj.user.name });
		}
	});

	return res;
}

const integerRegex = /^-?[0-9]+$/;

async function handler(res, body) {
	if (!body) { res.status(400); res.send({ error: 'Empty body' }); }
	if (!body.token_api) { res.status(400); res.send({ error: 'Param token_api missing' }); }
	if (body.token_api !== process.env.API_TOKEN) { res.status(400); res.send({ error: 'Invalid token_api' }); }
	const { text } = body;
	const { turma } = body;
	const { user } = body;

	if (!text) { res.status(400); res.send({ error: 'Param text missing' }); }
	if (turma && user) { res.status(400); res.send({ error: "Dont send both 'turma' and 'user' keys. Choose one or none to send for all users." }); }
	if (!turma && !user) {
		// const result = await broadcast.broadcastAll(text);
		// await sendResponse(result, res);
		const users = await getUsers();
		await sendMultipleMessages(users, text, res);
	}

	if (user) {
		if (!integerRegex.test(user) || user.toString().length !== 16) {
			res.status(400); res.send({ error: 'Invalid user key. User fb_id must be integer with 16 digits.' });
		} else if (await findUserByFBID(user) !== true) {
			res.status(400); res.send({ error: `User with fb_id '${user}' not found!` });
		} else {
			const result = await broadcast.sendBroadcastAluna(user, text);
			await sendResponse(result, res);
		}
	}

	// const { escola } = body;
	// if (turma && !escola) { res.status(400); res.send({ error: "Missing 'escola' param. Always send 'escola' together with 'turma'." }); }
	// if (!turma && escola) { res.status(400); res.send({ error: "Missing 'turma' param. Always send 'escola' together with 'turma'." }); }
	if (turma) {
		const users = await findUserByState(turma, 'userTurmaID');
		if (!users || users.length === 0) { res.status(400); res.send({ error: `No aluno in 'turma' ${turma}` }); }
		await sendMultipleMessages(users, text, res);
	}
}


module.exports = { handler };
