const assistenteAPI = require('./chatbot_api');
const { createIssue } = require('./utils/send_issue');
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
			await DF.dialogFlow(context);
		}

		switch (context.state.dialog) {
		case 'greetings':

			// await context.setState({ userPoints: 100, userKilos: 40, userTurmaID: '40' });
			await context.setState({ userProducts: mockProduct.sort((a, b) => a.points - b.points) });
			// await context.setState({ schoolData: { name: 'Desembargador Eliseu', points: 1000, turmaPoints: 100 } });
			if (process.env.ENV !== 'local') await context.sendImage(flow.avatarImage);
			await attach.sendMsgFromAssistente(context, 'greetings', [flow.greetings.text1]);
			await dialogs.sendMainMenu(context);
			break;
		case 'mainMenu':
			await dialogs.sendMainMenu(context);
			break;
		case 'myPoints':
			await dialogs.myPoints(context);
			break;
		case 'showProducts':
			await dialogs.showProducts(context);
			break;
		case 'viewUserProducts':
			await dialogs.viewUserProducts(context);
			break;
		case 'viewAllProducts':
			await dialogs.viewAllProducts(context);
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
			await dialogs.sendMainMenu(context);
			break;
		case 'productFinish':
			await dialogs.productFinish(context);
			break;
		case 'schoolPoints':
			await context.sendText(flow.schoolPoints.text1);
			await context.sendText(flow.schoolPoints.text2
				.replace('<NAME>', context.state.schoolData.name.trim())
				.replace('<POINTS>', context.state.schoolData.points)
				.replace('<POINTS2>', context.state.schoolData.turmaPoints));
			await dialogs.sendMainMenu(context, false, 3 * 1000);
			break;
		case 'compartilhar':
			// await context.sendText(flow.share.txt1);
			// await attach.sendShare(context, flow.share.cardData);
			// await dialogs.sendMainMenu(context);
			break;
		case 'createIssueDirect':
			await createIssue(context);
			await dialogs.sendMainMenu(context);
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
