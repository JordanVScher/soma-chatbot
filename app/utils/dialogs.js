const somaAPI = require('../soma_api');
const flow = require('./flow');
const help = require('./helper');
const attach = require('./attach');
const product = require('./product');
const assistenteAPI = require('../chatbot_api');
const { sendMainMenu } = require('./mainMenu');

async function schoolPoints(context, schoolData) {
	await context.setState({ schoolData });

	if (schoolData && (schoolData.school_balance !== undefined && schoolData.school_balance !== null)) {
		await context.sendText(flow.schoolPoints.text1);
		const msg = await help.buildSchoolMsg(schoolData.school_balance, schoolData.classroom_balance);
		if (msg && typeof msg === 'string' && msg.length > 0) await context.sendText(msg);
	} else {
		await context.sendText(flow.schoolPoints.failure);
	}

	await sendMainMenu(context, false, 3 * 1000);
}

async function checkFullName(context, stateName, successDialog, invalidDialog, reaskMsg) {
	if (/^[a-zA-Z\s]+$/.test(context.state.whatWasTyped)) {
		await context.setState({ [stateName]: context.state.whatWasTyped, dialog: successDialog });
	} else {
		if (reaskMsg) await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function linkUserAPI(context, cpf, linkResponse) {
	console.log('linkResponse', linkResponse);
	const { statusCode } = linkResponse;
	switch (statusCode) {
	case 200: // user was found successfully
		await context.sendText(flow.joinAsk.success);
		await context.setState({ cpf, linked: true });
		await context.setState({ dialog: 'activateSMS' });
		break;
	case 404: // user cpf was not found
		await context.sendText(flow.joinAsk.notFound);
		await context.setState({ dialog: 'joinAsk' });
		break;
	case 409: // user cpf was found but it's already linked with another facebook user
		await context.sendText(flow.joinAsk.alreadyLinked);
		await context.setState({ dialog: 'joinAsk' });
		break;
	default:
		await help.sentryError('Status inválido em /link-user', { user: context.state, statusCode });
		await context.sendText(flow.joinAsk.notFound);
		await context.setState({ dialog: 'joinAsk' });
		break;
	}
}

async function handleCPF(context) {
	const cpf = await help.getCPFValid(context.state.whatWasTyped);
	if (!cpf) {
		await context.sendText(flow.joinAsk.invalid);
		await context.setState({ dialog: 'joinAsk' });
	} else {
		await linkUserAPI(context, cpf, await somaAPI.linkUser(context.session.user.id, cpf));
	}
}


async function handleSMS(context) {
	const somaUser = await somaAPI.activateToken(context.session.user.id, context.state.cpf, context.state.whatWasTyped);

	if (somaUser && somaUser.id) {
		await context.sendText(flow.SMSToken.success);
		await context.setState({ somaUser });
		await context.setState({ dialog: 'mainMenu' });
	} else {
		await context.sendText(flow.SMSToken.error);
		await context.setState({ dialog: 'activateSMSAsk' });
	}
}

async function sendSMSTokenForDev(context) {
	const { ENV } = process.env;
	if (ENV === 'local' || ENV === 'homol') {
		const res = await somaAPI.getToken(context.session.user.id, context.state.cpf);
		if (res && res.token) {
			await context.sendText(flow.SMSToken.dev.intro + flow.SMSToken.dev.token + res.token);
		} else {
			await context.sendText(flow.SMSToken.dev.intro + flow.SMSToken.dev.error + res);
			await help.sentryError(`Erro ao buscar token em ${ENV}`, { user: context.state, session: context.session, res });
		}
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

async function checkData(context, userBalance, rewards) {
	if (!userBalance || userBalance.error || !rewards || rewards.error) {
		await context.sendText(flow.myPoints.failure);
		await sendMainMenu(context);

		return false;
	}

	return true;
}

async function viewUserProducts(context, userBalance, rewards, pageNumber) {
	if (await checkData(context, userBalance, rewards) === true) {
		let userRewards = rewards.filter(x => x.score <= userBalance.balance); // remove items user can't buy
		userRewards = userRewards.sort((a, b) => a.score - b.score); // order rewards by score
		await attach.sendUserProductsCarrousel(context, userBalance.balance, userRewards, pageNumber);
		await sendMainMenu(context, null, 1000 * 3);
	}
}

async function viewAllProducts(context, userBalance, rewards, pageNumber) {
	if (await checkData(context, userBalance, rewards) === true) {
		await attach.sendAllProductsCarrousel(context, userBalance.balance, rewards, pageNumber);
		await sendMainMenu(context, null, 1000 * 3);
	}
}

async function showProducts(context, userBalance, rewards) {
	if (await checkData(context, userBalance, rewards) === true) {
		await context.setState({ userBalance });

		const cheapest = await product.getSmallestPoint(rewards);

		if (context.state.userBalance.balance >= cheapest) {
			await context.sendText(flow.showProducts.text1, await attach.getQR(flow.showProducts));
		} else {
			await context.sendText(flow.showProducts.noPoints1);
			await context.sendText(flow.showProducts.noPoints2);
			await viewAllProducts(context, userBalance, rewards, 1);
		}
	}
}

async function myPoints(context, userBalance, rewards) {
	if (await checkData(context, userBalance, rewards) === true) {
		await context.setState({ userBalance });

		if (!context.state.userBalance.balance) {
			await context.sendText(flow.myPoints.noPoints);
			await sendMainMenu(context);
		} else {
			await context.sendText(flow.myPoints.showPoints
				.replace('<KILOS>', context.state.userBalance.user_plastic)
				.replace('<POINTS>', context.state.userBalance.balance));
		}

		const cheapest = await product.getSmallestPoint(rewards);

		if (context.state.userBalance.balance >= cheapest) {
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

async function productBuy(context, userBalance, rewards) {
	if (await checkData(context, userBalance, rewards) === true) {
		await context.setState({ desiredProduct: rewards.find(x => x.id && (x.id.toString() === context.state.productId.toString())) });
		// if (context.state.desiredProduct.image) await context.sendImage(context.state.desiredProduct.image);
		const textToSend = await help.buildProductView(context.state.desiredProduct);
		if (textToSend) await context.sendText(textToSend);
		await context.setState({ desiredProductQtd: await help.calculateProductUnits(context.state.desiredProduct.score, context.state.userBalance.balance) });
		await context.setState({ qtdButtons: await help.buildQtdButtons(context.state.desiredProductQtd, context.state.desiredProduct.points), paginationNumber: 0 });
		await context.sendText(flow.productQtd.text1.replace('<PRODUTO>', context.state.desiredProduct.name),
			await attach.buildQtdButtons(context.state.qtdButtons, 9, 1));
	}
}

async function productQtd(context) {
	await context.setState({ productPrice: context.state.desiredProduct.points * context.state.productQtd });
	await context.setState({ userPointsLeft: context.state.userBalance.balance - context.state.productPrice });

	await context.sendText(flow.productQtd.text2
		.replace('<QTD>', context.state.productQtd)
		.replace('<PRODUTO>', context.state.desiredProduct.name)
		.replace('<PRICE>', context.state.productPrice)
		.replace('<POINTS>', context.state.userBalance.balanceLeft),
	await attach.getQR(flow.productQtd));
}

async function productFinish(context) {
	const ticketID = process.env.PRODUCT_TICKETID || '';
	try {
		await context.setState({ chatbotTickets: await assistenteAPI.getTicketTypes(context.state.chatbotData.organization_chatbot_id) });
		const { id } = context.state.chatbotTickets.ticket_types.find(x => x.ticket_type_id && x.ticket_type_id.toString() === ticketID.toString());
		const res = await assistenteAPI.postNewTicket(context.state.chatbotData.organization_chatbot_id, context.session.user.id, id, await help.buildTicket(context.state));
		if (!res || !res.id) {
			throw new Error('Error Saving user product ticket');
		} else {
			await context.setState({ userPoints: context.state.userBalance.balanceLeft });
		}
	} catch (error) {
		console.log('ticketID', ticketID); console.log(' context.state.chatbotTickets', context.state.chatbotTickets);
		await help.sentryError('Error Saving user product ticket', error);
	}

	await context.sendText(flow.productFinish.text1);
	await sendMainMenu(context);
}


module.exports = {
	sendMainMenu,
	checkFullName,
	checkPhone,
	checkEmail,
	handleReset,
	myPoints,
	viewUserProducts,
	viewAllProducts,
	productBuy,
	productQtd,
	productBuyHelp,
	showProducts,
	productFinish,
	linkUserAPI,
	handleCPF,
	schoolPoints,
	sendSMSTokenForDev,
	handleSMS,
};
