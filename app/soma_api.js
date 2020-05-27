const request = require('requisition');

const somaURL = process.env.SOMA_URL;
const somaToken = process.env.SOMA_TOKEN;

async function getAnswer(response, params = {}) {
	let res = {};
	const { options } = response;
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

	let msg = `Endereço: ${options.host}`;
	msg += `\nPath: ${options.path}`;
	msg += `\nQuery: ${JSON.stringify(options.query, null, 2)}`;
	msg += `\nParams: ${JSON.stringify(params, null, 2)}`;
	msg += `\nHeaders: ${JSON.stringify(options.headers, null, 2)}`;
	msg += `\nMethod: ${options.method}`;
	msg += `\nMoment: ${new Date()}`;
	msg += `\nResposta: ${JSON.stringify(res, null, 2)}`;

	console.log('----------------------------------------------', `\n${msg}`, '\n\n');


	return res;
}

module.exports = {
	async getStatus() {
		const res = await request.get(`${somaURL}/v1/status`);
		return getAnswer(res);
	},

	async linkUser(fbId, cpf) {
		const params = { cpf };
		const res = await request.post(`${somaURL}/v1/link-user`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbId,
		}).send(params);

		return getAnswer(res, params);
	},

	async unlinkUser(fbId, cpf) {
		const params = { cpf };
		const res = await request.delete(`${somaURL}/v1/unlink-user`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbId,
		}).send(params);

		return getAnswer(res, params);
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
		const params = { cpf, code };
		const res = await request.post(`${somaURL}/v1/activate`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbId,
		}).send({ cpf, code });

		return getAnswer(res, params);
	},

	async getUser(fbId, userId) {
		const res = await request.get(`${somaURL}/v1/user/${userId}`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbId,
			userId,
		});

		return getAnswer(res);
	},

	async getUserBalance(fbId, userId) {
		const res = await request.get(`${somaURL}/v1/user/${userId}/balance`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbId.toString(),
			userId,
		});
		return getAnswer(res);
	},

	async getSchoolBalance(fbId, userId) {
		// const res = await request.get(`${somaURL}/v1/user/${userId}/school/balance`).set({
		// 	'X-Api-Token': somaToken,
		// 	'X-Fb-Id': fbId,
		// 	userId,
		// });

		// return getAnswer(res);

		return {
			balance: 3000,
			residues: [
				{
					name: 'BB',
					amount: 40,
					unitType: 'Kilogram',
				},
				{
					name: 'AA',
					amount: 35,
					unitType: 'Kilogram',
				},
				{
					name: 'VV',
					amount: 15,
					unitType: 'Gram',
				},
			],
		};
	},

	async getUserRewards(fbId, userId) {
		const res = await request.get(`${somaURL}/v1/reward/${userId}`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbId,
			userId,
		});

		return getAnswer(res);
	},

};
