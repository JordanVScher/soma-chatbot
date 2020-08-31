const assistenteAPI = require('../chatbot_api');
const dialogs = require('./dialogs');
const DF = require('./dialogFlow');
const somaAPI = require('../soma_api');

function handleQROptions(options, input) {
	if (!options || !input) return null;

	let chosenOption = null;
	const keys = Object.keys(options);
	keys.forEach((e) => {
		if (e.toString() === input.toString()) chosenOption = options[e];
	});

	return chosenOption;
}

async function handleQuickReplies(context, newQR) {
	await context.setState({ lastQRpayload: newQR, lastPBpayload: '' }); // update last quick reply chosen

	if (context.state.lastQRpayload.startsWith('rewardQtd')) {
		await context.setState({ dialog: 'rewardQtd', rewardQtd: context.state.lastQRpayload.replace('rewardQtd', '') });
	} else if (context.state.lastQRpayload.startsWith('productBuy')) {
		await dialogs.productBuyHelp(context, context.state.lastQRpayload);
	} else if (context.state.lastQRpayload.startsWith('productPageQtd')) {
		await context.setState({ dialog: 'productPageQtd', productPage: context.state.lastQRpayload.replace('productPageQtd', '') });
		await context.setState({ productPage: parseInt(context.state.productPage, 10) });
	} else {
		await context.setState({ dialog: context.state.lastQRpayload });
	}

	await assistenteAPI.logFlowChange(context.state.fbID, context.state.chatbotData.user_id,
		context.state.lastQRpayload, context.state.lastQRpayload);
}

async function handlePostback(context, newPostback) {
	await context.setState({ lastPBpayload: newPostback.payload, lastQRpayload: '' });
	console.log('newPostback', newPostback);
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

	if (newPostback) {
		await assistenteAPI.logFlowChange(context.state.fbID, context.state.chatbotData.user_id,
			newPostback.payload, newPostback.title);
	}
}

async function handleText(context, newText) {
	await context.setState({ whatWasTyped: newText, lastQRpayload: '', lastPBpayload: '' });


	if (context.isWhatsapp()) {
		if (!context.state.dialog) return context.setState({ dialog: 'greetings' });
		if (['0', 'voltar', 'menu', 'reset', 'ajuda', 'oi'].includes(context.state.whatWasTyped.toLowerCase())) {
			context.setState({ dialog: 'greetings' });
			context.setState({ dialog: 'viewAllProducts' });
			return null;
		}

		const chosenQR = handleQROptions(context.state.qrOptions, context.state.whatWasTyped);
		if (chosenQR && chosenQR.payload) return handleQuickReplies(context, chosenQR.payload);


		const chosenPostback = handleQROptions(context.state.pbOptions, context.state.whatWasTyped);
		if (chosenPostback && chosenPostback.payload) return handlePostback(context, chosenPostback);
	}

	if (process.env.ENV !== 'prod' && context.state.whatWasTyped === process.env.UNLINK_KEY) {
		await somaAPI.unlinkUser(context.state.fbID, context.state.cpf);
		await context.setState({ dialog: 'greetings', linked: false, somaUser: null });
	} else if (['join', 'joinAsk'].includes(context.state.dialog)) {
		await dialogs.handleCPF(context);
	} else if (['activateSMS', 'activateSMSAsk'].includes(context.state.dialog)) {
		await dialogs.handleSMS(context);
	} else {
		await DF.dialogFlow(context);
	}
	return null;
}

module.exports = { handleQuickReplies, handlePostback, handleText };
