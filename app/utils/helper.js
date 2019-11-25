const Sentry = require('@sentry/node');
const moment = require('moment');
const accents = require('remove-accents');
// const validarCpf = require('validar-cpf');

// Sentry - error reporting
Sentry.init({	dsn: process.env.SENTRY_DSN, environment: process.env.ENV, captureUnhandledRejections: false });
moment.locale('pt-BR');

function sentryError(msg, err) {
	console.log(msg, err || '');
	if (process.env.ENV !== 'local') { Sentry.captureMessage(msg); }
	return false;
}

// async function addChar(a, b, position) { return a.substring(0, position) + b + a.substring(position); }

// separates string in the first dot on the second half of the string
async function separateString(someString) {
	if (someString.trim()[someString.length - 1] !== '.') { // trying to guarantee the last char is a dot so we never use halfLength alone as the divisor
		someString += '.'; // eslint-disable-line no-param-reassign
	}
	const halfLength = Math.ceil(someString.length / 2.5); // getting more than half the length (the bigger the denominator the shorter the firstString tends to be)
	const newString = someString.substring(halfLength); // get the second half of the original string
	const sentenceDot = new RegExp('(?<!www)\\.(?!com|br|rj|sp|mg|bh|ba|sa|bra|gov|org)', 'i');// Regex -> Don't consider dots present in e-mails and urls
	// getting the index (in relation to the original string -> halfLength) of the first dot on the second half of the string. +1 to get the actual dot.
	const dotIndex = halfLength + newString.search(sentenceDot) + 1;

	const firstString = someString.substring(0, dotIndex);
	const secondString = someString.substring(dotIndex);

	return { firstString, secondString };
}

async function formatDialogFlow(text) {
	let result = text.toLowerCase();
	result = await result.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF])/g, '');
	result = await accents.remove(result);
	if (result.length >= 250) {
		result = result.slice(0, 250);
	}
	return result.trim();
}

async function handleErrorApi(options, res, err) {
	let msg = `Endereço: ${options.host}`;
	msg += `\nPath: ${options.path}`;
	msg += `\nQuery: ${JSON.stringify(options.query, null, 2)}`;
	msg += `\nMethod: ${options.method}`;
	msg += `\nMoment: ${new Date()}`;
	if (res) msg += `\nResposta: ${JSON.stringify(res, null, 2)}`;
	if (err) msg += `\nErro: ${err.stack}`;

	console.log('----------------------------------------------', `\n${msg}`, '\n\n');

	if ((res && (res.error || res.form_error)) || (!res && err)) {
		if (process.env.ENV !== 'local') {
			msg += `\nEnv: ${process.env.ENV}`;
			await Sentry.captureMessage(msg);
		}
	}
}

async function handleRequestAnswer(response) {
	try {
		const res = await response.json();
		await handleErrorApi(response.options, res, false);
		return res;
	} catch (error) {
		await handleErrorApi(response.options, false, error);
		return {};
	}
}

function getRandomArray(array) {
	return array[Math.floor((Math.random() * array.length))];
}
async function buildRecipientObj(context) {
	const state = {
		fb_id: context.session.user.id,
		name: `${context.session.user.first_name} ${context.session.user.last_name}`,
		picture: context.session.user.profile_pic,
		// origin_dialog: 'greetings',
		// session: JSON.stringify(context.state),
	};

	if (context.state.gotAluna && context.state.gotAluna.email) state.email = context.state.alunaMail;
	if (context.state.gotAluna && context.state.gotAluna.cpf) state.cpf = context.state.cpf;

	return state;
}

async function buildSubtitle(product, userPoints) {
	let res = '';

	if (product.points) res += `Pontos: ${product.points}\n`;
	if (userPoints < product.points) {
		const missingPoints = product.points - userPoints;
		if (missingPoints === 1) {
			res += `Te falta só ${missingPoints} ponto\n`;
		} else if (missingPoints > 1) {
			res += `Te faltam ${missingPoints} pontos\n`;
		}
	}
	if (product.description) res += product.description;

	return res;
}

async function buildProductView(product = {}) {
	let text = '';
	if (product.name) text += `${product.name}\n`;
	if (product.description) text += `${product.description}\n`;
	if (product.points) text += `Custo: ${product.points} pontos`;
	
	return text;
}

/**
 * Paginates an array
 * @param {array} array The array to be paginated
 * @param {integer} page_size The size of the page
 * @param {integer} page_number The number of the page
 * @returns {array} array with the elements of the page
 */
function paginate(array, page_size, page_number) {
	page_number = page_number - 1; // because pages logically start with 1, but technically with 0
	return array.slice(page_number * page_size, (page_number + 1) * page_size);
}

/**
 * Builds an array with the title of every product, with the quantity of the product and the cost for them 
 * @param {integer} qtd The max number of units the user can get with his points
 * @param {integer} productCost How much the product costs (price is productCost * qtd)
 * @returns {string[]} - array with the title of every product.
 */
async function buildQtdButtons(qtd, productCost) {
	const buttons = [];
	for (let i = 1; i <= qtd; i++) {
		buttons.push(`${i} - ${productCost * i} pontos`);
	}

	return buttons;
}

module.exports = {
	Sentry,
	moment,
	separateString,
	formatDialogFlow,
	handleRequestAnswer,
	sentryError,
	getRandomArray,
	buildRecipientObj,
	buildSubtitle,
	buildProductView,
	buildQtdButtons,
	paginate,
};
