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

	async linkUser(fbID, cpf) {
		const params = { cpf };
		const res = await request.post(`${somaURL}/v1/link-user`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbID,
		}).send(params);

		return getAnswer(res, params);
	},

	async unlinkUser(fbID, cpf) {
		const params = { cpf };
		const res = await request.delete(`${somaURL}/v1/unlink-user`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbID,
		}).send(params);

		return getAnswer(res, params);
	},

	async getToken(fbID, cpf) {
		const res = await request.get(`${somaURL}/v1/token/${cpf}`).set({
			cpf,
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbID,
		});

		return getAnswer(res);
	},

	async activateToken(fbID, cpf, code) {
		const params = { cpf, code };
		const res = await request.post(`${somaURL}/v1/activate`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbID,
		}).send({ cpf, code });

		return getAnswer(res, params);
	},

	async getUser(fbID, userId) {
		const res = await request.get(`${somaURL}/v1/user/${userId}`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbID,
			userId,
		});

		return getAnswer(res);
	},

	async getUserBalance(fbID, userId) {
		// const res = await request.get(`${somaURL}/v1/user/${userId}/balance`).set({
		// 	'X-Api-Token': somaToken,
		// 	'X-Fb-Id': fbID.toString(),
		// 	userId,
		// });
		// return getAnswer(res);
		return {
			balance: 1500,
			residues: [
				{
					name: 'BB',
					amount: 50,
					unitType: 'Kilogram',
				},
				{
					name: 'AA',
					amount: 70,
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

	async getSchoolBalance(fbID, userId) {
		// const res = await request.get(`${somaURL}/v1/user/${userId}/school/balance`).set({
		// 	'X-Api-Token': somaToken,
		// 	'X-Fb-Id': fbID,
		// 	userId,
		// });

		// return getAnswer(res);

		return {
			balance: 10000,
			residues: [
				{
					name: 'BB',
					amount: 400,
					unitType: 'Kilogram',
				},
				{
					name: 'AA',
					amount: 3500,
					unitType: 'Kilogram',
				},
				{
					name: 'VV',
					amount: 1500,
					unitType: 'Gram',
				},
			],
		};
	},

	async getUserRewards(fbID, userId) {
		const res = await request.get(`${somaURL}/v1/reward/${userId}`).set({
			'X-Api-Token': somaToken,
			'X-Fb-Id': fbID,
			userId,
		});

		return getAnswer(res);
	},

};
