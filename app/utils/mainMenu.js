
const checkQR = require('./checkQR');
const flow = require('./flow');
const help = require('./helper');
const somaAPI = require('../soma_api');

async function reloadUserData(context) {
	if (context.state.somaUser && context.state.somaUser.id) {
		const schoolData = await somaAPI.getSchoolBalance(context.session.user.id, context.state.somaUser.id);

		if (schoolData && schoolData.balance) {
			await context.setState({ schoolData });
		} else {
			await context.setState({ schoolData: null });
		}
	}
}


async function sendMainMenu(context, text, time = 1000 * 6) {
	const textToSend = text || help.getRandomArray(flow.mainMenu.text1);
	if (process.env.ENV !== 'local' && time) await context.typing(time);

	await reloadUserData(context);

	await context.sendText(textToSend, await checkQR.buildMainMenu(context));
}

module.exports = { sendMainMenu };
