/* eslint camelcase: 0 */ // --> OFF
/* eslint no-param-reassign: 0 */ // --> OFF

const request = require('requisition');
const queryString = require('query-string');
const { handleRequestAnswer } = require('./utils/helper');

const security_token = process.env.SECURITY_TOKEN_MA;
const apiUri = process.env.MANDATOABERTO_API_URL;
const apiKey = process.env.API_KEY;

module.exports = {
	async getChatbotData(pageId) {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/politician?fb_page_id=${pageId}&security_token=${security_token}`));
	},

	async addAssistenteUser(name, email, password) {
		return handleRequestAnswer(await request.post(`${apiUri}/api/register?security_token=${security_token}`).query({ name, email, password }));
	},

	async addFBKeysToAssistenteUser(id, fb_page_id, fb_page_access_token) {
		return handleRequestAnswer(await request.put(`${apiUri}/api/politician/${id}?api_key=${apiKey}`).query({ fb_page_id, fb_page_access_token }));
	},

	async getPollData(pageId) {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/poll?fb_page_id=${pageId}&security_token=${security_token}`));
	},

	async postRecipient(user_id, recipient) {
		const recipientData_qs = queryString.stringify(recipient);
		return handleRequestAnswer(await request.post(`${apiUri}/api/chatbot/recipient?${recipientData_qs}&security_token=${security_token}&`).query({ politician_id: user_id }));
	},

	async postPollAnswer(fb_id, poll_question_option_id, origin) {
		return handleRequestAnswer(await request.post(
			`${apiUri}/api/chatbot/poll-result?fb_id=${fb_id}&poll_question_option_id=${poll_question_option_id}&origin=${origin}&security_token=${security_token}`,
		));
	},

	async getPollAnswer(fb_id, poll_id) {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/poll-result?fb_id=${fb_id}&poll_id=${poll_id}&security_token=${security_token}`));
	},

	async getDialog(politician_id, dialog_name) {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/dialog?politician_id=${politician_id}&dialog_name=${dialog_name}&security_token=${security_token}`));
	},

	async getAnswer(politician_id, question_name) {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/answer?politician_id=${politician_id}&question_name=${question_name}&security_token=${security_token}`));
	},

	async postIssue(politician_id, fb_id, message, entities, issue_active) {
		if (issue_active === 1 || issue_active === true) {
			message = encodeURI(message);
			entities = JSON.stringify(entities);
			return handleRequestAnswer(await request.post(`${apiUri}/api/chatbot/issue?politician_id=${politician_id}&fb_id=${fb_id}&message=${message}&entities=${entities}&security_token=${security_token}`));
		}
		return false;
	},

	async postIssueWithoutEntities(politician_id, fb_id, message, issue_active) {
		if (issue_active === 1 || issue_active === true) {
			message = encodeURI(message);
			return handleRequestAnswer(await request.post(`${apiUri}/api/chatbot/issue?politician_id=${politician_id}&fb_id=${fb_id}&message=${message}&security_token=${security_token}`));
		}
		return false;
	},

	async getknowledgeBase(politician_id, entities, fb_id) {
		entities = JSON.stringify(entities);
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/knowledge-base?politician_id=${politician_id}&entities=${entities}&fb_id=${fb_id}&security_token=${security_token}`));
	},

	async getknowledgeBaseByName(politician_id, entities) {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/knowledge-base?politician_id=${politician_id}&entities=${entities}&security_token=${security_token}`));
	},

	async postPrivateReply(item, page_id, post_id, comment_id, permalink, user_id) {
		return handleRequestAnswer(await request.post(`${apiUri}/api/chatbot/private-reply?page_id=${page_id}&item=${item}&post_id=${post_id}&comment_id=${comment_id}&permalink=${permalink}&user_id=${user_id}&security_token=${security_token}`));
	},

	// 0 -> turn off notification && 1 -> turn on notification
	async updateBlacklistMA(fb_id, active) {
		return handleRequestAnswer(await request.post(`${apiUri}/api/chatbot/blacklist?fb_id=${fb_id}&active=${active}&security_token=${security_token}`));
	},

	// has pagination
	async getAvailableIntents(pageId, page) {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/intents/available?fb_page_id=${pageId}&page=${page}&security_token=${security_token}`));
	},

	async getAllAvailableIntents(pageId) {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/intents/available?fb_page_id=${pageId}&security_token=${security_token}`));
	},

	async getTicketTypes(chatbot_id) {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/ticket/type?security_token=${security_token}`).query({ chatbot_id }));
	},

	async getUserTickets(fb_id) {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/ticket?security_token=${security_token}`).query({ fb_id }));
	},

	async putStatusTicket(TicketID, status) {
		return handleRequestAnswer(await request.put(`${apiUri}/api/chatbot/ticket/${TicketID}?security_token=${security_token}`).query({ status }));
	},

	async putAddMsgTicket(TicketID, message) {
		return handleRequestAnswer(await request.put(`${apiUri}/api/chatbot/ticket/${TicketID}?security_token=${security_token}`).query({ message }));
	},

	async postNewTicket(chatbot_id, fb_id, type_id, data, message = '') {
		return handleRequestAnswer(await request.post(`${apiUri}/api/chatbot/ticket?security_token=${security_token}`).query({
			chatbot_id, fb_id, type_id, message, data: JSON.stringify(data),
		}));
	},

	async logFlowChange(recipient_fb_id, politician_id, payload, human_name) {
		const d = new Date();
		return handleRequestAnswer(await request.post(`${apiUri}/api/chatbot/log?security_token=${security_token}`).query({
			timestamp: d.toGMTString(),
			recipient_fb_id,
			politician_id,
			action_id: 1,
			payload,
			human_name,
		}));
	},

	async logAnsweredPoll(recipient_fb_id, politician_id, field_id) {
		const d = new Date();
		return handleRequestAnswer(await request.post(`${apiUri}/api/chatbot/log?security_token=${security_token}`).query({
			timestamp: d.toGMTString(),
			recipient_fb_id,
			politician_id,
			action_id: 2,
			field_id,
		}));
	},

	async logAskedEntity(recipient_fb_id, politician_id, field_id) {
		const d = new Date();
		return handleRequestAnswer(await request
			.post(`${apiUri}/api/chatbot/log?security_token=${security_token}&`)
			.query({
				timestamp: d.toGMTString(),
				recipient_fb_id,
				politician_id,
				action_id: 5,
				field_id,
			}));
	},

	// action_id should be 3 for ACTIVATED_NOTIFICATIONS and 4 for DEACTIVATED_NOTIFICATIONS
	async logNotification(recipient_fb_id, politician_id, action_id) {
		const d = new Date();
		return handleRequestAnswer(await request
			.post(`${apiUri}/api/chatbot/log?security_token=${security_token}&`)
			.query({
				timestamp: d.toGMTString(),
				recipient_fb_id,
				politician_id,
				action_id,
			}));
	},

	async getLogAction() {
		return handleRequestAnswer(await request(`${apiUri}/api/chatbot/log/actions?security_token=${security_token}`));
	},

	async setIntentStatus(politician_id, recipient_fb_id, intent, entity_is_correct) {
		if (intent && intent.id) {
			return handleRequestAnswer(await request.post(
				`${apiUri}/api/chatbot/politician/${politician_id}/intents/${
					intent.id
				}/stats?entity_is_correct=${entity_is_correct}&recipient_fb_id=${recipient_fb_id}&security_token=${security_token}`,
			));
		}
		return false;
	},

	async getPendinQuestion(fb_id, type = 'preparatory') {
		return handleRequestAnswer(await request.get(`${apiUri}/api/chatbot/questionnaire/pending?security_token=${security_token}`).query({ fb_id, type }));
	},

	async postQuizAnswer(fb_id, type, code, answer_value) {
		return handleRequestAnswer(await request.post(`${apiUri}/api/chatbot/questionnaire/answer?security_token=${security_token}`).query({
			fb_id, type, code, answer_value,
		}));
	},

	async resetQuiz(fb_id, type) {
		return handleRequestAnswer(await request.post(`${apiUri}/api/chatbot/questionnaire/reset?security_token=${security_token}`).query({
			fb_id, type,
		}));
	},
};
