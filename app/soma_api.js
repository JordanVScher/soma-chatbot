const request = require('requisition');
const { handleRequestAnswer } = require('./utils/helper');

const somaURL = process.env.SOMA_URL;
const somaToken = process.env.SOMA_TOKEN;

class SomaAPI {
	constructor(URL, token) {
		this.URL = URL;
		this.token = token;
		this.opt = { 'Api-Token': this.token };
		this.request = request;
	}

	async linkUser(FBID, cpf) {
		return handleRequestAnswer(await this.request.set(this.opt).post(`${this.URL}/link-user`).query({ fb_id: FBID, cpf }));
	}

	async getUser(userID) {
		return handleRequestAnswer(await this.request.set(this.opt).get(`${this.URL}/users/${userID}`));
	}

	async getUserBalance(userID) {
		return handleRequestAnswer(await this.request.set(this.opt).get(`${this.URL}/users/${userID}/balance`));
	}

	async getSchoolBalance(schoolID) {
		return handleRequestAnswer(await this.request.set(this.opt).get(`${this.URL}/school/${schoolID}/balance`));
	}

	async getRewards(userID) {
		return handleRequestAnswer(await this.request.set(this.opt).get(`${this.URL}/rewards/${userID}`));
	}
}

module.exports = new SomaAPI(somaURL, somaToken);
