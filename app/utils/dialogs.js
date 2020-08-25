const somaAPI = require('../soma_api');
const flow = require('./flow');
const help = require('./helper');
const attach = require('./attach');
const whatsapp = require('./whatsapp');
const assistenteAPI = require('../chatbot_api');
const { sendMainMenu } = require('./mainMenu');

async function loadChatbotData(context) {
	let pageID = '';
	if (context.session.platform === 'whatsapp') {
		pageID = process.env.MESSENGER_PAGE_ID;
	} else if (context.session.platform === 'messenger') {
		pageID = context.event.rawEvent.recipient.id;
	}

	await context.setState({ chatbotData: await assistenteAPI.getChatbotData(pageID), pageID });
}

async function saveUser(context) {
	try {
		if (context.session.platform === 'messenger') {
			await context.setState({ fbID: context.session.user.id });
			await context.setState({ sessionUser: { ...await context.getUserProfile() } });
		}

		await assistenteAPI.postRecipient(context.state.chatbotData.user_id, await help.buildRecipientObj(context));
		if (!context.state.somaUser) await context.setState({ somaUser: {} });
	} catch (error) {
		await context.setState({ sessionUser: { name: context.session.user.id, profilePic: '' } });
	}
}

async function sendPointsMsg(context, residues, balance, fullMsg, pointMsg) {
	const kilos = help.countKilos(residues);

	if (kilos) { // count how many kilos the user has to send the proper message
		await context.sendMsg(fullMsg.replace('<KILOS>', help.addDot(kilos)).replace('<POINTS>', help.addDot(balance)));
	} else { // in case there was an error with the kilos counting, send a message that has only the points
		await context.sendMsg(pointMsg.replace('<POINTS>', help.addDot(balance)));
	}
}

async function schoolPoints(context) {
	const schoolData = await somaAPI.getSchoolBalance(context.state.fbID, context.state.somaUser.id);
	await context.setState({ schoolData });

	if (schoolData && schoolData.balance && schoolData.residues) {
		await context.sendMsg(flow.schoolPoints.text1);
		await sendPointsMsg(context, schoolData.residues, schoolData.balance, flow.schoolPoints.text2, flow.schoolPoints.text3);
	} else {
		await context.sendMsg(flow.schoolPoints.failure);
	}

	await sendMainMenu(context, false, 3 * 1000);
}

async function linkUserAPI(context, cpf) {
	const linkResponse = await somaAPI.linkUser(context.state.fbID, cpf);
	const { statusCode } = linkResponse;
	switch (statusCode) {
	case 200: // user was found successfully
		await context.sendMsg(flow.joinAsk.success);
		await context.setState({ cpf, linked: true });
		await context.setState({ dialog: 'activateSMS' });
		break;
	case 404: // user cpf was not found
		await context.sendMsg(flow.joinAsk.notFound);
		await context.setState({ dialog: 'joinAsk' });
		break;
	case 409: // user cpf was found but it's already linked with another facebook user
		await context.sendMsg(flow.joinAsk.alreadyLinked);
		await context.setState({ dialog: 'joinAsk' });
		break;
	default:
		await help.sentryError('Status inválido em /link-user', { user: context.state, statusCode });
		await context.sendMsg(flow.joinAsk.notFound);
		await context.setState({ dialog: 'joinAsk' });
		break;
	}
}

async function handleCPF(context) {
	const cpf = await help.getCPFValid(context.state.whatWasTyped);
	if (!cpf) {
		await context.sendMsg(flow.joinAsk.invalid);
		await context.setState({ dialog: 'joinAsk' });
	} else {
		await linkUserAPI(context, cpf);
	}
}


async function handleSMS(context) {
	const somaUser = await somaAPI.activateToken(context.state.fbID, context.state.cpf, context.state.whatWasTyped);

	if (somaUser && somaUser.id) {
		await context.sendMsg(flow.SMSToken.success);
		await context.setState({ somaUser });
		await context.setState({ dialog: 'mainMenu' });
	} else {
		await context.sendMsg(flow.SMSToken.error);
		await context.setState({ dialog: 'activateSMSAsk' });
	}
}

async function sendSMSTokenForDev(context) {
	const { ENV } = process.env;
	if (ENV === 'local' || ENV === 'homol') {
		const res = await somaAPI.getToken(context.state.fbID, context.state.cpf);
		if (res && res.token) {
			await context.sendMsg(flow.SMSToken.dev.intro + flow.SMSToken.dev.token + res.token);
		} else {
			await context.sendMsg(flow.SMSToken.dev.intro + flow.SMSToken.dev.error + res);
			await help.sentryError(`Erro ao buscar token em ${ENV}`, { user: context.state, session: context.session, res });
		}
	}
}

// checks if both requests worked as expected
async function checkData(context, userBalance, rewards) {
	await context.setState({ userBalance, rewards });

	if (!userBalance || userBalance.balance === null || typeof userBalance.balance === 'undefined' || !rewards || !rewards[0]) {
		await context.sendMsg(flow.myPoints.failure);
		await sendMainMenu(context);
		return false;
	}

	return true;
}

async function viewUserProducts(context, pageNumber) {
	const rewards = await somaAPI.getUserRewards(context.state.fbID, context.state.somaUser.id);
	const userBalance = await somaAPI.getUserBalance(context.state.fbID, context.state.somaUser.id);

	if (await checkData(context, userBalance, rewards) === true) {
		let userRewards = help.getAffortableRewards(rewards, userBalance.balance);
		userRewards = help.orderRewards(userRewards);
		await attach.sendUserProductsCarrousel(context, userBalance.balance, userRewards, pageNumber);
		if (context.isWhatsapp() === false) await sendMainMenu(context, null, 1000 * 3);
	}
}

async function viewAllProducts(context, pageNumber) {
	const rewards = await somaAPI.getUserRewards(context.state.fbID, context.state.somaUser.id);
	const userBalance = await somaAPI.getUserBalance(context.state.fbID, context.state.somaUser.id);

	if (await checkData(context, userBalance, rewards) === true) {
		await attach.sendAllProductsCarrousel(context, userBalance.balance, rewards, pageNumber);
		if (context.isWhatsapp() === false) await sendMainMenu(context, null, 1000 * 3);
	}
}

async function showProducts(context) {
	const rewards = await somaAPI.getUserRewards(context.state.fbID, context.state.somaUser.id);
	const userBalance = await somaAPI.getUserBalance(context.state.fbID, context.state.somaUser.id);

	if (await checkData(context, userBalance, rewards) === true) {
		const cheapestScore = help.getSmallestPoint(rewards);

		if (userBalance.balance >= cheapestScore) {
			await context.sendMsg(flow.showProducts.text1, await attach.getQR(flow.showProducts));
		} else {
			await context.sendMsg(flow.showProducts.noPoints1);
			await context.sendMsg(flow.showProducts.noPoints2);
			await viewAllProducts(context, 1);
		}
	}
}

async function myPoints(context) {
	const rewards = await somaAPI.getUserRewards(context.state.fbID, context.state.somaUser.id);
	const userBalance = await somaAPI.getUserBalance(context.state.fbID, context.state.somaUser.id);

	if (await checkData(context, userBalance, rewards) === true) {
		if (!userBalance.balance) { // if user has no points, send him to the menu
			await context.sendMsg(flow.myPoints.noPoints);
			await sendMainMenu(context);
		} else {
			await sendPointsMsg(context, userBalance.residues, userBalance.balance, flow.myPoints.showPoints, flow.myPoints.onlyPoints);

			// find the cheapest reward
			const cheapestScore = help.getSmallestPoint(rewards);

			if (userBalance.balance >= cheapestScore) { // can the user get the cheapest reward whith his points?
				await context.sendMsg(flow.myPoints.hasEnough, await attach.getQR(flow.myPoints));
			} else {
				await context.sendMsg(flow.myPoints.notEnough.replace('<POINTS>', help.addDot(cheapestScore)), await attach.getQR(flow.notEnough));
			}
		}
	}
}

async function productBuyHelp(context, button) {
	await context.setState({ dialog: 'productBuy', productId: button.replace('productBuy', '') });
	await context.setState({ productBtnClicked: button, paginationNumber: 0 });
}

async function sendRewardtext(context, reward) {
	const textToSend = await help.buildProductView(reward); // build details text
	if (textToSend) await context.sendMsg(textToSend);
}

async function productBuy(context) {
	const rewards = await somaAPI.getUserRewards(context.state.fbID, context.state.somaUser.id);
	const userBalance = await somaAPI.getUserBalance(context.state.fbID, context.state.somaUser.id);

	if (await checkData(context, userBalance, rewards) === true) {
		// find the product the user clicked
		const desiredReward = rewards.find(x => x.id && (x.id.toString() === context.state.productId.toString()));
		await context.setState({ desiredReward });

		if (desiredReward && desiredReward.id && desiredReward.score) {
			// if (desiredReward.imageUrl) await context.sendImage(desiredReward.imageUrl); // send image if there's one url

			await sendRewardtext(context, desiredReward);

			// calculate and build quantity buttons
			const desiredRewardQtd = await help.calculateProductUnits(desiredReward.score, userBalance.balance);
			await context.setState({ desiredRewardQtd });

			if (!desiredRewardQtd) {
				await context.sendMsg(flow.rewardQtd.priceChanged);
				await viewAllProducts(context, 1);
			} else {
				const qtdButtons = await help.buildQtdButtons(desiredRewardQtd, desiredReward.score);
				await context.setState({ qtdButtons });
				await context.sendMsg(flow.rewardQtd.text1.replace('<PRODUTO>', desiredReward.name),	await attach.buildQtdButtons(context.state.qtdButtons, 3, 1));
			}
		} else {
			await context.sendMsg(flow.rewardQtd.notFound);
			await viewAllProducts(context, 1);
		}
	}
}

async function rewardQtd(context) {
	await context.setState({ rewardPrice: context.state.desiredReward.score * context.state.rewardQtd });
	await context.setState({ userPointsLeft: context.state.userBalance.balance - context.state.rewardPrice });

	await context.sendMsg(flow.rewardQtd.text2
		.replace('<QTD>', context.state.rewardQtd)
		.replace('<PRODUTO>', context.state.desiredReward.name)
		.replace('<PRICE>', help.addDot(context.state.rewardPrice))
		.replace('<POINTS>', help.addDot(context.state.userPointsLeft)),
	await attach.getQR(flow.rewardQtd));
}

async function productFinish(context, ticketID) {
	try {
		await context.setState({ chatbotTickets: await assistenteAPI.getTicketTypes(context.state.chatbotData.organization_chatbot_id) });
		const { id } = context.state.chatbotTickets.ticket_types.find(x => x.ticket_type_id && x.ticket_type_id.toString() === ticketID.toString());
		const res = await assistenteAPI.postNewTicket(context.state.chatbotData.organization_chatbot_id, context.state.fbID, id, await help.buildTicket(context.state));
		if (!res || !res.id) {
			console.log(context.state.sessionUser.name);
			console.log('res', res);
			console.log('ticketID', ticketID);
			console.log(' context.state.chatbotTickets', context.state.chatbotTickets);
			throw new Error('Error Saving user product ticket');
		} else {
			await context.setState({ userPoints: context.state.userPointsLeft });
			await context.sendMsg(flow.productFinish.text1);
			await context.sendMsg(flow.productFinish.text2.replace('<TICKET_ID>', res.id));
		}
	} catch (error) {
		console.log('error', error);
		await help.sentryError('Error Saving user product ticket', error);
		await context.sendMsg(flow.productFinish.error);
	}
	await sendMainMenu(context);
}

// async function checkFullName(context, stateName, successDialog, invalidDialog, reaskMsg) {
// 	if (/^[a-zA-Z\s]+$/.test(context.state.whatWasTyped)) {
// 		await context.setState({ [stateName]: context.state.whatWasTyped, dialog: successDialog });
// 	} else {
// 		if (reaskMsg) await context.sendMsg(reaskMsg);
// 		await context.setState({ dialog: invalidDialog });
// 	}
// }

// async function checkPhone(context, stateName, successDialog, invalidDialog, reaskMsg) {
// 	const phone = await help.getPhoneValid(context.state.whatWasTyped);

// 	if (phone) {
// 		await context.setState({ [stateName]: phone, dialog: successDialog });
// 		// await context.setState({ titularPhone: phone, dialog: 'askRevogarMail' });
// 	} else {
// 		if (reaskMsg) await context.sendMsg(flow.revogarDados.askRevogarPhoneFail);
// 		// await context.sendMsg(flow.revogarDados.askRevogarPhoneFail);
// 		await context.setState({ dialog: invalidDialog });
// 		// await context.setState({ dialog: 'invalidPhone' });
// 	}
// }

// async function checkEmail(context, stateName, successDialog, invalidDialog, reaskMsg) {
// 	if (context.state.whatWasTyped.includes('@')) {
// 		await context.setState({ [stateName]: context.state.whatWasTyped, dialog: successDialog });
// 	} else {
// 		if (reaskMsg)	await context.sendMsg(reaskMsg);
// 		await context.setState({ dialog: invalidDialog });
// 	}
// }

module.exports = {
	sendMainMenu,
	// checkFullName,
	// checkPhone,
	// checkEmail,
	myPoints,
	viewUserProducts,
	viewAllProducts,
	productBuy,
	rewardQtd,
	productBuyHelp,
	showProducts,
	productFinish,
	linkUserAPI,
	handleCPF,
	schoolPoints,
	sendSMSTokenForDev,
	handleSMS,
	sendPointsMsg,
	checkData,
	sendRewardtext,
	loadChatbotData,
	saveUser,
};
