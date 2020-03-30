
const checkQR = require('./checkQR');
const flow = require('./flow');
const help = require('./helper');

async function sendMainMenu(context, text, time = 1000 * 6) {
	const textToSend = text || help.getRandomArray(flow.mainMenu.text1);
	if (process.env.ENV !== 'local' && time) await context.typing(time);
	await context.sendText(textToSend, await checkQR.buildMainMenu(context));
}

module.exports = { sendMainMenu };
