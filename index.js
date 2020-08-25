const assistenteAPI = require('./app/chatbot_api');
const { createIssue } = require('./app/utils/send_issue');
const { sendMainMenu } = require('./app/utils/mainMenu');
const flow = require('./app/utils/flow');
const help = require('./app/utils/helper');
const dialogs = require('./app/utils/dialogs');
const attach = require('./app/utils/attach');
const whatsapp = require('./app/utils/whatsapp');
const input = require('./app/utils/input');

module.exports = async function App(context) {
	try {
		await whatsapp.handleWhatsapp(context);
		await dialogs.saveUser(context);
		await dialogs.loadChatbotData(context);

		if (context.event.isPostback) {
			console.log(`${context.state.sessionUser.name} clicou em Postback ${context.event.postback.payload}`);
			await input.handlePostback(context, context.event.postback);
		} else if (context.event.isQuickReply) {
			console.log(`${context.state.sessionUser.name} clicou em QR ${context.event.quickReply.payload}`);
			await input.handleQuickReplies(context, context.event.quickReply.payload);
		} else if (context.event.isText) {
			console.log(`\n${context.state.sessionUser.name} digitou ${context.event.text} (dialog: ${context.state.dialog}) - DF Status: ${context.state.chatbotData.use_dialogflow}`);
			await input.handleText(context, context.event.text);
		} else if (context.event.isMedia) {
			console.log('context.event.media', context.event.media);
			await context.sendMsg(`received the media message: ${context.event.media.contentType} ${context.event.media.url}`);
			await context.setState({ dialog: 'mainMenu' });
		}


		switch (context.state.dialog) {
		case 'greetings':
			await attach.sendMsgFromAssistente(context, 'greetings', [flow.greetings.text1], flow.avatarImage);
			await sendMainMenu(context);
			break;
		case 'mainMenu':
			await sendMainMenu(context);
			break;
		case 'myPoints':
			await dialogs.myPoints(context);
			break;
		case 'showProducts':
			await dialogs.showProducts(context);
			break;
		case 'viewUserProducts':
			await context.setState({ pageNumber: 1 });
			// fallsthrough
		case 'userProducts':
			await dialogs.viewUserProducts(context, context.state.pageNumber);
			break;
		case 'viewAllProducts':
			await context.setState({ pageNumber: 1 });
			// fallsthrough
		case 'allProducts':
			await dialogs.viewAllProducts(context, context.state.pageNumber);
			break;
		case 'productBuy':
			await dialogs.productBuy(context);
			break;
		case 'rewardQtd':
			await dialogs.rewardQtd(context);
			break;
		case 'productPageQtd': // pagination
			await context.sendMsg(flow.rewardQtd.text1.replace('<PRODUTO>', context.state.desiredReward.name),
				await attach.buildQtdButtons(context.state.qtdButtons, 8, context.state.productPage));
			break;
		case 'productNo': {
			const newBtns = JSON.parse(JSON.stringify(flow.productNo));
			newBtns.menuPostback[0] = context.state.productBtnClicked;
			await context.sendMsg(flow.productNo.text1, await attach.getQR(newBtns));
		}	break;
		case 'productError':
			await context.sendMsg(flow.productNo.productError.replace('<WHATSAPP>', process.env.WHATSAPP_NUMBER));
			await sendMainMenu(context);
			break;
		case 'productFinish':
			await dialogs.productFinish(context, process.env.PRODUCT_TICKETID);
			break;
		case 'schoolPoints':
			await dialogs.schoolPoints(context);
			break;
		case 'join':
			await context.sendMsg(flow.joinAsk.text1);
			// fallsthrough
		case 'joinAsk':
			await context.sendMsg(flow.joinAsk.text2, await attach.getQR(flow.joinAsk));
			break;
		case 'activateSMS':
			await context.sendMsg(flow.SMSToken.intro);
			await dialogs.sendSMSTokenForDev(context);
			// fallsthrough
		case 'activateSMSAsk':
			await context.sendMsg(flow.SMSToken.ask, await attach.getQR(flow.joinAsk));
			break;
		case 'compartilhar':
			await context.sendMsg(flow.share.txt1);
			await attach.sendShare(context, flow.share.cardData);
			await sendMainMenu(context);
			break;
		case 'createIssueDirect':
			await createIssue(context);
			await sendMainMenu(context);
			break;
		case 'notificationOn':
			await assistenteAPI.updateBlacklistMA(context.state.fbID, 1);
			await assistenteAPI.logNotification(context.state.fbID, context.state.chatbotData.user_id, 3);
			await context.sendMsg(flow.notifications.on);
			break;
		case 'notificationOff':
			await assistenteAPI.updateBlacklistMA(context.state.fbID, 0);
			await assistenteAPI.logNotification(context.state.fbID, context.state.chatbotData.user_id, 4);
			await context.sendMsg(flow.notifications.off);
			break;
		default:
			await sendMainMenu(context);
			break;
		} // end switch case
	} catch (error) {
		const date = new Date();
		console.log(`Parece que aconteceu um erro as ${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1} =>`);
		console.log(error);
		await context.sendMsg('Ops. Tive um erro interno. Tente novamente.'); // warning user

		await help.Sentry.configureScope(async (scope) => { // sending to sentry
			scope.setUser({ username: context.state.sessionUser.name });
			scope.setExtra('state', context.state);
			throw error;
		});
	} // catch
}; // handler function
