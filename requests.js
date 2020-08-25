require('dotenv').config();

const testFolder = './.sessions/';
const fs = require('fs');
const { associatesLabelToUser } = require('./app/utils/postback');

async function getfbIDJson() { // eslint-disable-line
	const result = {};
	await fs.readdirSync(testFolder).forEach(async (file) => {
		const obj = JSON.parse(await fs.readFileSync(testFolder + file, 'utf8'));
		result[obj._state.sessionUser.name] = obj.user.id;
	});

	return result;
}

async function getNamefbID(req, res) {
	const { body } = req;

	if (!body || !body.security_token) {
		res.status(400); res.send('Param security_token is required!');
	} else {
		const securityToken = body.security_token;
		if (securityToken !== process.env.SECURITY_TOKEN_MA) {
			res.status(401); res.send('Unauthorized!');
		} else {
			const result = await getfbIDJson();
			if (result) {
				res.status(200); res.send(result);
			} else {
				res.status(500); res.send('Failure');
			}
		}
	}
}

async function addLabel(req, res) {
	if (!req.body || !req.body.user_id || !req.body.label_name || !req.body.security_token) {
		res.status(400); res.send('Params user_id, label_name and security_token are required!');
	} else {
		const userID = req.body.user_id;
		const labelName = req.body.label_name;
		const securityToken = req.body.security_token;
		if (securityToken !== process.env.SECURITY_TOKEN_MA) {
			res.status(401); res.send('Unauthorized!');
		} else {
			const response = await associatesLabelToUser(userID, labelName);
			res.status(200); res.send(response);
		}
	}
}


module.exports = {
	getNamefbID, addLabel,
};
