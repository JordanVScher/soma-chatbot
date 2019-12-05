require('dotenv').config();

const fs = require('fs');
const broadcast = require('./utils/broadcast');

const testFolder = './.sessions/';
const integerRegex = /^-?[0-9]+$/;

async function sendMultipleMessages(users, text, res, notFound) {
	const results = {};
	results.users_found = users.length;
	results.successes = 0;
	results.failures = 0;
	results.details = [];
	for (let i = 0; i < users.length; i++) {
		const e = users[i];
		if (!integerRegex.test(e.id) || e.id.toString().length !== 16) {
			results.failures += 1;
			results.details.push({ aluno_name: e.name, recipient_id: e.id, error: 'Invalid user key. User fb_id must be integer with 16 digits.', status: 'failure' }); // eslint-disable-line object-curly-newline
		} else {
			const aux = await broadcast.sendBroadcastAluna(e.id, text);
			if (aux && aux.message_id) {
				results.successes += 1;
				results.details.push({ aluno_name: e.name, message_id: aux.message_id, recipient_id: e.id, status: 'success',  }); // eslint-disable-line
			} else {
				results.failures += 1;
				results.details.push({ aluno_name: e.name, recipient_id: e.id, status: 'failure' });
			}
		}
	}
	if (notFound) results.users_not_found = notFound.length;
	if (notFound) results.details_not_found = notFound;
	res.status(200); res.send(results);
}

async function sendResponse(result, res) { // eslint-disable-line
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

async function findUserByFBID(FBID) { // eslint-disable-line
	let res = false;
	await fs.readdirSync(testFolder).forEach(async (file) => {
		const obj = JSON.parse(await fs.readFileSync(testFolder + file, 'utf8'));
		if (!res && FBID.toString() === obj.user.id.toString()) {
			res = true;
		}
	});

	return res;
}
async function findUserByFBIDList(users) { // eslint-disable-line
	const res = [];
	await fs.readdirSync(testFolder).forEach(async (file) => {
		const obj = JSON.parse(await fs.readFileSync(testFolder + file, 'utf8'));
		if (users.includes(obj.user.id)) {
			res.push({ id: obj.user.id, name: obj.user.name });
		}
	});

	return res;
}

async function findUserByState(value, key) { // eslint-disable-line
	const res = [];
	await fs.readdirSync(testFolder).forEach(async (file) => {
		const obj = JSON.parse(await fs.readFileSync(testFolder + file, 'utf8'));
		if (value.toString() === obj._state[key].toString()) {
			res.push({ id: obj.user.id, name: obj.user.name });
		}
	});

	return res;
}


async function handler(res, body) {
	if (!body) { res.status(400); res.send({ error: 'Empty body' }); }
	if (!body.token_api) { res.status(400); res.send({ error: 'Param token_api missing' }); }
	if (body.token_api !== process.env.API_TOKEN) { res.status(400); res.send({ error: 'Invalid token_api' }); }
	const { text } = body;
	const { users } = body;

	if (!text) { res.status(400); res.send({ error: 'Param text missing' }); }
	if (Array.isArray(users) !== true) { res.status(400); res.send({ error: 'Invalid users format.' }); }

	if (!users) {
		const usersToSend = await getUsers();
		await sendMultipleMessages(usersToSend, text, res);
	}


	if (users) {
		const usersToSend = await findUserByFBIDList(users.map(String));
		let notFound;
		if (usersToSend.length !== users.length) { notFound = await users.filter(x => !usersToSend.find(y => y.id === x)); }

		await sendMultipleMessages(usersToSend, text, res, notFound);
	}
}


module.exports = { handler };
