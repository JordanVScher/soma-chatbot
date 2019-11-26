const flow = require('./flow');
const help = require('./helper');
const attach = require('./attach');
const product = require('./product');
const checkQR = require('./checkQR');

async function sendMainMenu(context, text, time = 1000 * 6) {
	const textToSend = text || help.getRandomArray(flow.mainMenu.text1);
	if (process.env.ENV !== 'local' && time) await context.typing(time);
	await context.sendText(textToSend, await checkQR.buildMainMenu(context));
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
	// await sendMainMenu(context, '', 1000 * 3);
}

async function viewAllProducts(context) {
	await attach.sendAllProductsCarrousel(context, context.state.userProducts, context.state.userPoints);
	// await sendMainMenu(context, '', 1000 * 3);
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

async function productBuyHelp(context, button) {
	await context.setState({ dialog: 'productBuy', productId: button.replace('productBuy', '') });
	await context.setState({ productBtnClicked: button });
}

async function productBuy(context) {
	await context.setState({ desiredProduct: context.state.userProducts.find(x => x.id && (x.id.toString() === context.state.productId.toString())) });
	// if (context.state.desiredProduct.image) await context.sendImage(context.state.desiredProduct.image);
	const textToSend = await help.buildProductView(context.state.desiredProduct);
	if (textToSend) await context.sendText(textToSend);
	await context.setState({ desiredProductQtd: await help.calculateProductUnits(context.state.desiredProduct.points, context.state.userPoints) });
	await context.setState({ qtdButtons: await help.buildQtdButtons(context.state.desiredProductQtd, context.state.desiredProduct.points), paginationNumber: 0 });
	await context.sendText(flow.productQtd.text1.replace('<PRODUTO>', context.state.desiredProduct.name),
		await attach.buildQtdButtons(context.state.qtdButtons, 9, 1));
}

async function productQtd(context) {
	await context.setState({ productPrice: context.state.desiredProduct.points * context.state.productQtd });
	await context.setState({ userPointsLeft: context.state.userPoints - context.state.productPrice });

	await context.sendText(flow.productQtd.text2
		.replace('<QTD>', context.state.productQtd)
		.replace('<PRODUTO>', context.state.desiredProduct.name)
		.replace('<PRICE>', context.state.productPrice)
		.replace('<POINTS>', context.state.userPointsLeft),
	await attach.getQR(flow.productQtd));
}

module.exports = {
	sendMainMenu,
	checkFullName,
	checkCPF,
	checkPhone,
	checkEmail,
	handleReset,
	myPoints,
	viewUserProducts,
	viewAllProducts,
	productBuy,
	productQtd,
	productBuyHelp,
};
