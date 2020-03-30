const Sentry = require('@sentry/node');
const moment = require('moment');
const accents = require('remove-accents');
// const validarCpf = require('validar-cpf');

// Sentry - error reporting
Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.ENV, captureUnhandledRejections: false });
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

async function handleErrorApi(options = {}, res, err) {
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

async function getCPFValid(cpf) {
	const result = cpf.toString().replace(/[_.,-]/g, '');
	if (!result || cpf.length < 11 || !/^\d+$/.test(result)) { return false; }
	return result;
}

async function buildTicket(state) {
	const result = {};
	if (state.titularNome) { result.titularNome = state.titularNome; }
	if (state.titularCPF) { result.cpf = state.titularCPF; }
	// if (state.titularPhone) { result.telefone = state.titularPhone; }
	if (state.titularMail) { result.mail = state.titularMail; }

	if (state.desiredProduct.name) { result.productName = state.desiredProduct.name; }
	if (state.desiredProduct.id) { result.productID = state.desiredProduct.id; }
	if (state.productQtd) { result.productQtd = state.productQtd; }
	if (state.productPrice) { result.totalPoints = state.productPrice; }

	return result;
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
 * @param {integer} pageSize The size of the page
 * @param {integer} pageNumber The number of the page
 * @returns {array} array with the elements of the page
 */
function paginate(array, pageSize, pageNumber) {
	pageNumber -= 1; // because pages logically start with 1, but technically with 0
	return array.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
}

/**
 * calculates how many units of one product the user can get
 * @param {integer} productCost How much the product costs
 * @param {integer} userPoins The points the user has
 * @returns {integer} - how many units the user can get
 */
async function calculateProductUnits(productCost, userPoins) {
	let count = 0;
	// checks if one more unit fits the budget
	while (userPoins >= (productCost * (count + 1)) && count < 3) { // count < 3, limits units in 3
		count += 1;
	}

	return count;
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

const buildPontoText = async value => (value === 1 ? `${value} ponto` : `${value} pontos`);

async function buildSchoolMsg(schoolBalance, classroomBalance) {
	let msg;

	const school = parseInt(schoolBalance, 10);

	if (Number.isInteger(school)) {
		if (school === 0) return 'A sua escola ainda não acumulou nenhum ponto 😟';
		msg += `A sua escola já acumulou o total de ${await buildPontoText(school)}`;
	}

	const classroom = parseInt(classroomBalance, 10);

	if (Number.isInteger(classroom)) {
		if (classroom === 0) return `${msg} mas a sua turma ainda não acumulou nenhum ponto 😟`;
		msg += `e sua turma contribuiu com o total de ${await buildPontoText(classroom)} para isso`;
	}

	if (msg) msg += ' 😊';

	return msg;
}

module.exports = {
	buildPontoText,
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
	buildTicket,
	calculateProductUnits,
	getCPFValid,
	buildSchoolMsg,
};
