const flow = require('./flow');
const help = require('./helper');
const attach = require('./attach');
const product = require('./product');

async function sendMainMenu(context, text) {
	const textToSend = text || help.getRandomArray(flow.mainMenu.text1);
	await context.typing(1000 * 6);
	await context.sendText(textToSend, await attach.getQR(flow.mainMenu));
}

async function checkFullName(context, stateName, successDialog, invalidDialog, reaskMsg) {
	if (/^[a-zA-Z\s]+$/.test(context.state.whatWasTyped)) {
		await context.setState({ [stateName]: context.state.whatWasTyped, dialog: successDialog });
	} else {
		if (reaskMsg) await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function checkCPF(context, stateName, successDialog, invalidDialog, reaskMsg) {
	const cpf = await help.getCPFValid(context.state.whatWasTyped);

	if (cpf) {
		await context.setState({ [stateName]: cpf, dialog: successDialog });
	} else {
		if (reaskMsg) await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function checkPhone(context, stateName, successDialog, invalidDialog, reaskMsg) {
	const phone = await help.getPhoneValid(context.state.whatWasTyped);

	if (phone) {
		await context.setState({ [stateName]: phone, dialog: successDialog });
		// await context.setState({ titularPhone: phone, dialog: 'askRevogarMail' });
	} else {
		if (reaskMsg) await context.sendText(flow.revogarDados.askRevogarPhoneFail);
		// await context.sendText(flow.revogarDados.askRevogarPhoneFail);
		await context.setState({ dialog: invalidDialog });
		// await context.setState({ dialog: 'invalidPhone' });
	}
}

async function checkEmail(context, stateName, successDialog, invalidDialog, reaskMsg) {
	if (context.state.whatWasTyped.includes('@')) {
		await context.setState({ [stateName]: context.state.whatWasTyped, dialog: successDialog });
	} else {
		if (reaskMsg)	await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function handleReset(context) {
	await context.setState({ dialog: 'greetings', quizEnded: false, sendShare: false });
}

async function viewUserProducts(context) {
	await attach.sendUserProductsCarrousel(context, context.state.userProducts, context.state.userPoints);
	await context.typing(1000 * 3);
	await sendMainMenu(context);
}

async function viewAllProducts(context) {
	await attach.sendAllProductsCarrousel(context, context.state.userProducts, context.state.userPoints);
	await context.typing(1000 * 3);
	await sendMainMenu(context);
}

async function myPoints(context) {
	if (!context.state.userPoints) {
		await context.sendText(flow.myPoints.noPoints);
		await sendMainMenu(context);
	} else {
		await context.sendText(flow.myPoints.showPoints.replace('<KILOS>', context.state.userKilos).replace('<POINTS>', context.state.userPoints));
		const cheapest = await product.getSmallestPoint(context.state.userProducts);

		if (context.state.userPoints >= cheapest) {
			await context.sendText(flow.myPoints.hasEnough, await attach.getQR(flow.myPoints));
		} else {
			await context.sendText(flow.myPoints.notEnough.replace('<POINTS>', cheapest), await attach.getQR(flow.notEnough));
		}
	}
}

module.exports = {
	sendMainMenu, checkFullName, checkCPF, checkPhone, checkEmail, handleReset, myPoints, viewUserProducts, viewAllProducts,
};
