const assistenteAPI = require('./app/chatbot_api');
const somaAPI = require('./app/soma_api');
const { createIssue } = require('./app/utils/send_issue');
const { sendMainMenu } = require('./app/utils/mainMenu');
const flow = require('./app/utils/flow');
const help = require('./app/utils/helper');
const dialogs = require('./app/utils/dialogs');
const attach = require('./app/utils/attach');
const DF = require('./app/utils/dialogFlow');

module.exports = async function App(context) {
	try {
		await context.setState({ sessionUser: { ...await context.getUserProfile() } });
		if (!context.state.somaUser) await context.setState({ somaUser: {} });
		await context.setState({ chatbotData: await assistenteAPI.getChatbotData(context.event.rawEvent.recipient.id) });
		await assistenteAPI.postRecipient(context.state.chatbotData.user_id, await help.buildRecipientObj(context));

		if (context.event.isPostback) {
			await context.setState({ lastPBpayload: context.event.postback.payload });
			if (context.state.lastPBpayload === 'greetings' || !context.state.dialog || context.state.dialog === '') {
				await context.setState({ dialog: 'greetings' });
			} else if (context.state.lastPBpayload.startsWith('productBuy')) {
				await dialogs.productBuyHelp(context, context.state.lastPBpayload);
			} else if (context.state.lastPBpayload.startsWith('allProducts')) {
				await context.setState({ dialog: 'allProducts', pageNumber: parseInt(context.state.lastPBpayload.replace('allProducts', ''), 10) });
			} else if (context.state.lastPBpayload.startsWith('userProducts')) {
				await context.setState({ dialog: 'userProducts', pageNumber: parseInt(context.state.lastPBpayload.replace('userProducts', ''), 10) });
			} else {
				await context.setState({ dialog: context.state.lastPBpayload });
			}
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.chatbotData.user_id,
				context.event.postback.payload, context.event.postback.title);
		} else if (context.event.isQuickReply) {
			await context.setState({ lastQRpayload: context.event.quickReply.payload });
			if (context.state.lastQRpayload.startsWith('rewardQtd')) {
				await context.setState({ dialog: 'rewardQtd', rewardQtd: context.state.lastQRpayload.replace('rewardQtd', '') });
			} else if (context.state.lastQRpayload.startsWith('productBuy')) {
				await dialogs.productBuyHelp(context, context.state.lastQRpayload);
			} else if (context.state.lastQRpayload.startsWith('productPageQtd')) {
				await context.setState({ dialog: 'productPageQtd', productPage: context.state.lastQRpayload.replace('productPageQtd', '') });
				await context.setState({ productPage: parseInt(context.state.productPage, 10)	});
			} else {
				await context.setState({ dialog: context.state.lastQRpayload });
			}
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.chatbotData.user_id,
				context.state.lastQRpayload, context.state.lastQRpayload);
		} else if (context.event.isText) {
			await context.setState({ whatWasTyped: context.event.message.text });
			if (process.env.ENV !== 'prod' && context.state.whatWasTyped === process.env.UNLINK_KEY) {
				await somaAPI.unlinkUser(context.session.user.id, context.state.cpf);
				await context.setState({ dialog: 'greetings', linked: false, somaUser: null });
			} else if (['join', 'joinAsk'].includes(context.state.dialog)) {
				await dialogs.handleCPF(context);
			} else if (['activateSMS', 'activateSMSAsk'].includes(context.state.dialog)) {
				await dialogs.handleSMS(context);
			} else {
				await DF.dialogFlow(context);
			}
		}

		switch (context.state.dialog) {
		case 'greetings':
			if (process.env.ENV !== 'local') await context.sendImage(flow.avatarImage);
			await attach.sendMsgFromAssistente(context, 'greetings', [flow.greetings.text1]);
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
			await context.sendText(flow.rewardQtd.text1.replace('<PRODUTO>', context.state.desiredReward.name),
				await attach.buildQtdButtons(context.state.qtdButtons, 8, context.state.productPage));
			break;
		case 'productNo': {
			const newBtns = JSON.parse(JSON.stringify(flow.productNo));
			newBtns.menuPostback[0] = context.state.productBtnClicked;
			await context.sendText(flow.productNo.text1, await attach.getQR(newBtns));
		}	break;
		case 'productError':
			await context.sendText(flow.productNo.productError.replace('<WHATSAPP>', process.env.WHATSAPP_NUMBER));
			await sendMainMenu(context);
			break;
		case 'productFinish':
			await dialogs.productFinish(context);
			break;
		case 'schoolPoints':
			await dialogs.schoolPoints(context);
			break;
		case 'join':
			await context.sendText(flow.joinAsk.text1);
			// fallsthrough
		case 'joinAsk':
			await context.sendText(flow.joinAsk.text2, await attach.getQR(flow.joinAsk));
			break;
		case 'activateSMS':
			await context.sendText(flow.SMSToken.intro);
			await dialogs.sendSMSTokenForDev(context);
			// fallsthrough
		case 'activateSMSAsk':
			await context.sendText(flow.SMSToken.ask, await attach.getQR(flow.joinAsk));
			break;
		case 'compartilhar':
			await context.sendText(flow.share.txt1);
			await attach.sendShare(context, flow.share.cardData);
			await sendMainMenu(context);
			break;
		case 'createIssueDirect':
			await createIssue(context);
			await sendMainMenu(context);
			break;
		case 'notificationOn':
			await assistenteAPI.updateBlacklistMA(context.session.user.id, 1);
			await assistenteAPI.logNotification(context.session.user.id, context.state.chatbotData.user_id, 3);
			await context.sendText(flow.notifications.on);
			break;
		case 'notificationOff':
			await assistenteAPI.updateBlacklistMA(context.session.user.id, 0);
			await assistenteAPI.logNotification(context.session.user.id, context.state.chatbotData.user_id, 4);
			await context.sendText(flow.notifications.off);
			break;
		default:
			await sendMainMenu(context);
			break;
		} // end switch case
	} catch (error) {
		const date = new Date();
		console.log(`Parece que aconteceu um erro as ${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1} =>`);
		console.log(error);
		await context.sendText('Ops. Tive um erro interno. Tente novamente.'); // warning user

		await help.Sentry.configureScope(async (scope) => { // sending to sentry
			scope.setUser({ username: context.state.sessionUser.name });
			scope.setExtra('state', context.state);
			throw error;
		});
	} // catch
}; // handler function
