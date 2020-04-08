require('dotenv').config();

const { MessengerClient } = require('messaging-api-messenger');
const { sentryError } = require('./helper');

const config = require('../../bottender.config').channels.messenger;

const client = MessengerClient.connect({
	accessToken: config.accessToken,
	appSecret: config.appSecret,
});

const broadcastMenu = [{
	content_type: 'text',
	title: 'Voltar para o Menu',
	payload: 'mainMenu',
}];

async function sendBroadcastAluna(USER_ID, textMsg, QR = broadcastMenu) {
	const result = await client.sendText(USER_ID.toString(), textMsg, { quick_replies: QR }).then(resp => resp).catch((err) => {
		sentryError(`Erro em sendBroadcastAluna - ${USER_ID}`, err);
		return err;
	});

	return result;
}

async function sendCardAluna(USER_ID, cards, cpf) {
	if (USER_ID) {
		const elements = [];
		const newCards = JSON.parse(cards);
		newCards.forEach(async (element) => {
			elements.push({
				title: element.title,
				subtitle: element.subtitle,
				image_url: element.image_url,
				default_action: {
					type: 'web_url',
					url: element.url.replace('CPFRESPOSTA', cpf),
					// messenger_extensions: 'false',
					// webview_height_ratio: 'full',
				},
				buttons: [
					{ type: 'web_url', url: element.url.replace('CPFRESPOSTA', cpf), title: 'Fazer Atividade' }],
			});
		});

		const error = await client.sendAttachment(USER_ID, {
			type: 'template',
			payload: {
				template_type: 'generic',
				elements,
			},
		}).then(resp => false).catch((err) => { // eslint-disable-line no-unused-vars
			if (err.stack) { console.log(err.stack); return err.stack; }
			console.log(err); return err;
		});

		if (!error) { console.log(`Card Broadcast sent to ${USER_ID}`); }
		return error;
	}

	return 'error: no USER_ID';
}

async function broadcastAll(text, labelID, QR = broadcastMenu) {
	let label = {};
	if (labelID) label = { custom_label_id: labelID };
	const results = await client.createMessageCreative([{ text, quick_replies: QR }]).then(async (result) => {
		const broadcastResult = await client.sendBroadcastMessage(result.message_creative_id, label);
		return broadcastResult;
	}).catch((err) => {
		sentryError('Erro em broadcastAll', err);
		return err;
	});

	return results;
}


module.exports = {
	sendCardAluna, sendBroadcastAluna, broadcastAll,
};
