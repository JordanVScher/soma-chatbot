const assistenteAPI = require('./chatbot_api');
const somaAPI = require('./soma_api');
const { createIssue } = require('./utils/send_issue');
const { sendMainMenu } = require('./utils/mainMenu');
const flow = require('./utils/flow');
const help = require('./utils/helper');
const dialogs = require('./utils/dialogs');
const attach = require('./utils/attach');
const DF = require('./utils/dialogFlow');
const { mockProduct } = require('./utils/product');

module.exports = async (context) => {
	try {
		await context.setState({ chatbotData: await assistenteAPI.getChatbotData(context.event.rawEvent.recipient.id) });
		await assistenteAPI.postRecipient(context.state.chatbotData.user_id, await help.buildRecipientObj(context));

		if (context.event.isPostback) {
			await context.setState({ lastPBpayload: context.event.postback.payload });
			if (context.state.lastPBpayload === 'greetings' || !context.state.dialog || context.state.dialog === '') {
				await context.setState({ dialog: 'greetings' });
			} else if (context.state.lastPBpayload.slice(0, 10) === 'productBuy') {
				await dialogs.productBuyHelp(context, context.state.lastPBpayload);
			} else if (context.state.lastPBpayload.slice(0, 11) === 'allProducts') {
				await context.setState({ dialog: 'allProducts', pageNumber: parseInt(context.state.lastPBpayload.replace('allProducts', ''), 10) });
			} else {
				await context.setState({ dialog: context.state.lastPBpayload });
			}
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.chatbotData.user_id,
				context.event.postback.payload, context.event.postback.title);
		} else if (context.event.isQuickReply) {
			await context.setState({ lastQRpayload: context.event.quickReply.payload });
			if (context.state.lastQRpayload.slice(0, 10) === 'productQtd') {
				await context.setState({ dialog: 'productQtd', productQtd: context.state.lastQRpayload.replace('productQtd', '') });
			} else if (context.state.lastQRpayload.slice(0, 10) === 'productBuy') {
				await dialogs.productBuyHelp(context, context.state.lastQRpayload);
			} else if (context.state.lastQRpayload.slice(0, 14) === 'productPageQtd') {
				await context.setState({ dialog: 'productPageQtd', productPage: context.state.lastQRpayload.replace('productPageQtd', '') });
				await context.setState({ productPage: parseInt(context.state.productPage, 10)	});
			} else {
				await context.setState({ dialog: context.state.lastQRpayload });
			}
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.chatbotData.user_id,
				context.event.message.quick_reply.payload, context.event.message.quick_reply.payload);
		} else if (context.event.isText) {
			await context.setState({ whatWasTyped: context.event.message.text });
			if (['join', 'joinAsk'].includes(context.state.dialog)) {
				await dialogs.handleCPF(context);
			} else {
				await DF.dialogFlow(context);
			}
		}

		switch (context.state.dialog) {
		case 'greetings':
			await context.setState({ userPoints: 100, userKilos: 40, userTurmaID: '40' });
			await context.setState({ userProducts: mockProduct.sort((a, b) => a.points - b.points) });
			await context.setState({ schoolData: { name: 'Desembargador Eliseu', points: 1000, turmaPoints: 100 } });
			await context.setState({ userPoints: 100, userKilos: 40, userTurmaID: '40' });
			await context.setState({ apiUser: { id: 'foobar' } });
			if (process.env.ENV !== 'local') await context.sendImage(flow.avatarImage);
			await attach.sendMsgFromAssistente(context, 'greetings', [flow.greetings.text1]);
			await sendMainMenu(context);
			break;
		case 'mainMenu':
			await sendMainMenu(context);
			break;
		case 'myPoints':
			await dialogs.myPoints(context, await somaAPI.getUserBalance(context.state.apiUser.id), await somaAPI.getRewards(context.state.apiUser.id));
			break;
		case 'showProducts':
			await dialogs.showProducts(context, await somaAPI.getUserBalance(context.state.apiUser.id), await somaAPI.getRewards(context.state.apiUser.id));
			break;
		case 'viewUserProducts':
			await dialogs.viewUserProducts(context, await somaAPI.getUserBalance(context.state.apiUser.id), await somaAPI.getRewards(context.state.apiUser.id));
			break;
		case 'viewAllProducts':
			await context.setState({ pageNumber: 1 });
			// fallsthrough
		case 'allProducts':
			await dialogs.viewAllProducts(context, await somaAPI.getUserBalance(context.state.apiUser.id), await somaAPI.getRewards(context.state.apiUser.id), context.state.pageNumber);
			break;
		case 'productBuy':
			// await context.setState({ userPoints: 100, userKilos: 40 });
			// await context.setState({ userProducts: mockProduct.sort((a, b) => a.points - b.points) });
			// await context.setState({ dialog: 'productBuy', productId: 1 });
			await dialogs.productBuy(context);
			break;
		case 'productQtd':
			await dialogs.productQtd(context);
			break;
		case 'productPageQtd': // pagination
			await context.sendText(flow.productQtd.text1.replace('<PRODUTO>', context.state.desiredProduct.name),
				await attach.buildQtdButtons(context.state.qtdButtons, 8, context.state.productPage));
			break;
		case 'productNo': {
			const newBtns = JSON.parse(JSON.stringify(flow.productNo));
			newBtns.menuPostback[1] = context.state.productBtnClicked;
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
			await dialogs.schoolPoints(context, await somaAPI.getSchoolBalance(context.state.apiUser.id));
			break;
		case 'join':
			await context.sendText(flow.joinAsk.text1);
			await context.sendText(flow.joinAsk.text2, await attach.getQR(flow.joinAsk));
			break;
		case 'joinAsk':
			await context.sendText(flow.joinAsk.text2, await attach.getQR(flow.joinAsk));
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
			scope.setUser({ username: context.session.user.first_name });
			scope.setExtra('state', context.state);
			throw error;
		});
	} // catch
}; // handler function
