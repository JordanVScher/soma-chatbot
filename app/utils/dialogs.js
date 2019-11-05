const flow = require('./flow');
const help = require('./helper');

async function sendMainMenu(context, text) {
	const textToSend = text || help.getRandomArray(flow.mainMenu.text1);
	await context.typing(1000 * 6);
	await context.sendText(textToSend);
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

module.exports = {
	sendMainMenu, checkFullName, checkCPF, checkPhone, checkEmail, handleReset,
};
