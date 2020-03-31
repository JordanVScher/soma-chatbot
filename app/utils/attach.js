const { sentryError } = require('./helper');
const { buildSubtitle } = require('./helper');
const { paginate } = require('./helper');

function capQR(text) {
	let result = text;
	if (result.length > 20) {
		result = `${result.slice(0, 17)}...`;
	}
	return result;
}

async function buildButton(url, title) { return [{ type: 'web_url', url, title }]; } module.exports.buildButton = buildButton;

// sends one card with an image and link
async function sendCardWithLink(context, cardData, url, text) {
	await context.sendAttachment({
		type: 'template',
		payload: {
			template_type: 'generic',
			elements: [
				{
					title: cardData.title,
					subtitle: (text && text !== '') ? text : cardData.sub,
					image_url: cardData.imageLink,
					default_action: {
						type: 'web_url',
						url,
						messenger_extensions: 'false',
						webview_height_ratio: 'full',
					},
				},
			],
		},
	});
}

async function cardLinkNoImage(context, title, url) {
	await context.sendAttachment({
		type: 'template',
		payload: { template_type: 'generic', elements: [{ title, subtitle: ' ', buttons: [{ type: 'web_url', url, title }] }] },
	});
}

async function sendSequenceMsgs(context, msgs, buttonTitle) {
	for (let i = 0; i < msgs.length; i++) {
		if (msgs[i] && msgs[i].text && msgs[i].url) {
			await context.sendButtonTemplate(msgs[i].text, await buildButton(msgs[i].url, buttonTitle));
		}
	}
}

// get quick_replies opject with elements array
// supossed to be used with menuOptions and menuPostback for each dialog on flow.js

async function getQR(opt) {
	const elements = [];
	const firstArray = opt.menuOptions;
	firstArray.forEach(async (element, index) => {
		elements.push({
			content_type: 'text',
			title: await capQR(element),
			payload: opt.menuPostback[index],
		});
	});

	return { quick_replies: elements };
}

async function getVoltarQR(lastDialog) {
	let lastPostback = '';

	if (lastDialog === 'optDenun') {
		lastPostback = 'goBackMenu';
	} else {
		lastPostback = lastDialog;
	}

	return {
		content_type: 'text',
		title: 'Voltar',
		payload: lastPostback,
	};
}


async function getErrorQR(opt, lastDialog) {
	const elements = [];
	const firstArray = opt.menuOptions;

	firstArray.forEach((element, index) => {
		elements.push({
			content_type: 'text',
			title: element,
			payload: opt.menuPostback[index],
		});
	});

	elements.push(await getVoltarQR(lastDialog));

	console.log('ERRORQR', elements);

	return { quick_replies: elements };
}

async function sendShare(context, cardData) {
	const buttons = [
		{
			type: 'web_url',
			title: 'Ver Chatbot',
			url: `m.me/${process.env.PAGE_ID}`,
		},
	];

	await context.sendAttachment({
		type: 'template',
		payload: {
			template_type: 'generic',
			elements: [
				{
					title: cardData.title,
					subtitle: (cardData.text && cardData.text !== '') ? cardData.text : cardData.sub,
					image_url: cardData.image_url,
					default_action: {
						type: 'web_url',
						url: `${cardData.item_url}/${process.env.PAGE_ID}`,
						messenger_extensions: 'false',
						webview_height_ratio: 'full',
					},
					buttons,
				},
			],
		},
	});
}

async function sendMsgFromAssistente(context, code, defaultMsgs) {
	try {
		const answers = context.state && context.state.chatbotData && context.state.chatbotData.answers ? context.state.chatbotData.answers : false;
		let msgToSend;

		if (answers && answers.length > 0) {
			const currentMsg = answers.find(x => x.code === code);
			if (currentMsg && currentMsg.content) msgToSend = currentMsg.content;
		}

		if (msgToSend && msgToSend.length > 0) {
			await context.sendText(msgToSend);
		} else if (defaultMsgs && defaultMsgs.length > 0) {
			for (const msg of defaultMsgs) { // eslint-disable-line
				await context.sendText(msg);
			}
		}
	} catch (error) {
		sentryError('Erro em sendMsgFromAssistente', error);
	}
}

async function buildPagination(totalProducts, pageNumber) {
	const pivot = 7; // number of items per page
	let startAt = pageNumber === 1 ? 0 : pivot * (pageNumber - 1) + 1;
	let limit = startAt + pivot;

	if (limit > totalProducts) {
		startAt += 1;
		limit = totalProducts;
	}

	return { startAt, limit };
}

async function addPaginationButtons(elements, pageNumber, hasNext, payload) {
	if (pageNumber > 1) {
		elements.unshift({
			title: 'Anterior',
			subtitle: 'Ver produtos anteriores',
			image_url: 'https://i.imgur.com/Woe8E1X.png',
			buttons: [
				{ type: 'postback', title: 'Anteriores', payload: `${payload}${pageNumber - 1}` },
			],
		});
	}

	if (hasNext) {
		elements.push({
			title: 'Próximo',
			subtitle: 'Ver próximos produtos',
			image_url: 'https://imgur.com/YNeLV04.png',
			buttons: [
				{ type: 'postback', title: 'Próximo', payload: `${payload}${pageNumber + 1}` },
			],
		});
	}

	return elements;
}

async function sendAllProductsCarrousel(context, userPoints, productList, pageNumber) {
	let elements = [];
	const totalProducts = productList.length;

	const { startAt, limit } = await buildPagination(totalProducts, pageNumber);

	for (let i = startAt; i <= limit; i++) {
		const e = productList[i];
		if (e) {
			const subtitle = await buildSubtitle(e, userPoints);
			const buttons = [];
			if (userPoints >= e.score) {
				buttons.push({ type: 'postback', title: 'Trocar', payload: `productBuy${e.id}` });
			} else {
				buttons.push({ type: 'postback', title: 'Cancelar', payload: 'mainMenu' });
			}

			elements.push({
				title: e.name,
				subtitle,
				image_url: e.image,
				buttons,
			});
		}
	}

	elements = await addPaginationButtons(elements, pageNumber, limit < totalProducts, 'allProducts');

	await context.sendAttachment({
		type: 'template',
		payload: {
			template_type: 'generic',
			elements,
		},
	});

	return elements;
}

async function sendUserProductsCarrousel(context, productList, userPoints, pageNumber) {
	let elements = [];
	const totalProducts = productList.length;

	const { startAt, limit } = await buildPagination(totalProducts, pageNumber);

	for (let i = startAt; i < limit; i++) {
		const e = productList[i];
		if (userPoints >= e.score) {
			const subtitle = await buildSubtitle(e, userPoints);

			elements.push({
				title: e.name,
				subtitle,
				image_url: e.image,
				buttons: [
					{ type: 'postback', title: 'Trocar', payload: `productBuy${e.id}` }],
			});
		}
	}

	elements = await addPaginationButtons(elements, pageNumber, limit < totalProducts, 'userProducts');

	await context.sendAttachment({
		type: 'template',
		payload: {
			template_type: 'generic',
			elements,
		},
	});

	return elements;
}

/**
 * Builds obj with the quick replies array for the number of units of a product for the user to choose. Adds pagination as needed.
 * @param {string[]} buttons Full array with the names of each button, will be paginated and stored on btns (see: buildQtdButtons on helper.js)
 * @param {integer} page_size The size of the page
 * @param {integer} page_number The number of the page, needed for the button payload
 */
async function buildQtdButtons(buttons, pageSize, pageNumber) {
	const btns = await paginate(buttons, pageSize, pageNumber);
	const res = [];
	for (let i = 0; i < btns.length; i++) {
		const e = btns[i];
		res.push({ content_type: 'text', title: e, payload: `productQtd${i + 1}` });
	}

	// if the first element of buttons is different from res, it's not the first page, adds pagination button
	// if (res && res[0].title !== buttons[0]) res.unshift({ content_type: 'text', title: 'Anterior', payload: `productPageQtd${pageNumber - 1}` });
	// if the last element is different, it's not the last page, adds pagination button
	// if (res && res[res.length - 1].title !== buttons[buttons.length - 1]) res.push({ content_type: 'text', title: 'Próximo', payload: `productPageQtd${pageNumber + 1}` });
	// res.splice(res.length - 1, 0, { content_type: 'text', title: 'Desistir', payload: 'productNo' }); // permanent button, gets added before Próximo

	res.push({ content_type: 'text', title: 'Desistir', payload: 'productNo' });
	return { quick_replies: res };
}


module.exports = {
	sendShare,
	getErrorQR,
	getVoltarQR,
	getQR,
	sendSequenceMsgs,
	sendCardWithLink,
	cardLinkNoImage,
	capQR,
	buildButton,
	sendMsgFromAssistente,
	sendUserProductsCarrousel,
	sendAllProductsCarrousel,
	buildQtdButtons,
};
