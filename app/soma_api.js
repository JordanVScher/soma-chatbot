const request = require('requisition');

const somaURL = process.env.SOMA_URL;
const somaToken = process.env.SOMA_TOKEN;

async function getAnswer(response) {
	let res = {};
	const { statusCode } = response;

	try {
		const headers = response.headers || {};
		const contentType = headers['content-type'] || '';
		if (contentType.indexOf('application/json') !== -1) {
			res = await response.json();
		}
	} catch (error) {
		console.log('error', error);
	}

	res.statusCode = statusCode;
	return res;
}

module.exports = {
	async getStatus() {
		const res = await request.get(`${somaURL}/v1/status`);
		return getAnswer(res);
	},

	async linkUser(fbId, cpf) {
		console.log('fbId', fbId);
		const res = await request.post(`${somaURL}/v1/link-user`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbId,
		}).send({ cpf });

		return getAnswer(res);
	},

	async unlinkUser(fbId, cpf) {
		const res = await request.delete(`${somaURL}/v1/unlink-user`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbId,
		}).send({ cpf });

		return getAnswer(res);
	},

	async getToken(fbId, cpf) {
		const res = await request.get(`${somaURL}/v1/token/${cpf}`).set({
			cpf,
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbId,
		});

		return getAnswer(res);
	},

	async activateToken(fbId, cpf, code) {
		const res = await request.post(`${somaURL}/v1/activate`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbId,
		}).send({ cpf, code });

		return getAnswer(res);
	},
};
