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
		return handleRequestAnswer(await this.request.post(`${this.URL}/link-user`).set(this.opt).query({ fb_id: FBID, cpf }));
	}

	async getUser(userID) {
		return handleRequestAnswer(await this.request.get(`${this.URL}/users/${userID}`).set(this.opt));
	}

	async getUserBalance(userID) {
		return handleRequestAnswer(await this.request.get(`${this.URL}/users/${userID}/balance`).set(this.opt));
	}

	async getSchoolBalance(schoolID) {
		return handleRequestAnswer(await this.request.get(`${this.URL}/school/${schoolID}/balance`).set(this.opt));
	}

	async getRewards(userID) {
		return handleRequestAnswer(await this.request.get(`${this.URL}/rewards/${userID}`).set(this.opt));
	}
}

module.exports = new SomaAPI(somaURL, somaToken);
