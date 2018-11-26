require('dotenv').config();

const {
	MessengerBot, FileSessionStore, withTyping, MessengerHandler,
} = require('bottender');
const { createServer } = require('bottender/restify');
//const dialogFlow = require('apiai-promise');

const config = require('./bottender.config.js').messenger;
const FrontAPI = require('./mandatoaberto_api.js');
const opt = require('./utils/options');
const { createIssue } = require('./send_issue');
const { Sentry } = require('./utils/helper');

const mapPageToAccessToken = async (pageId) => {
	const perfilData = await FrontAPI.getPoliticianData(pageId);
	return perfilData.fb_access_token;
};

const bot = new MessengerBot({
	mapPageToAccessToken,
	appSecret: config.appSecret,
	sessionStore: new FileSessionStore(),
});

bot.setInitialState({});

bot.use(withTyping({ delay: 1000 * 2 }));

async function waitTypingEffect(context) {
	await context.typingOn();
	setTimeout(async () => {
		await context.typingOff();
	}, 2500);
}

async function getBlockFromPayload(context) {
	let payload = context.event.message.quick_reply.payload
	await context.setState({ dialog: payload });
	return;
}

const handler = new MessengerHandler()
	.onEvent(async (context) => { // eslint-disable-line
		try {
			// console.log(await FrontAPI.getLogAction()); // print possible log actions
			if (!context.state.dialog || context.state.dialog === '' || (context.event.postback && context.event.postback.payload === 'greetings')) { // because of the message that comes from the comment private-reply
				await context.resetState();
				await context.setState({ dialog: 'greetings' });
			}
			await context.typingOn();
			if (context.event.isQuickReply && context.state.dialog !== 'recipientData') {
				await getBlockFromPayload(context)
			}
			//let user = await getUser(context)
			// we reload politicianData on every useful event
			// we update context data at every interaction that's not a comment or a post
			await context.setState({ politicianData: await FrontAPI.getPoliticianData(context.event.rawEvent.recipient.id) });
			await FrontAPI.postRecipient(context.state.politicianData.user_id, {
				fb_id: context.session.user.id,
				name: `${context.session.user.first_name} ${context.session.user.last_name}`,
				origin_dialog: 'greetings',
				picture: context.session.user.profile_pic,
				// session: JSON.stringify(context.state),
			});
			if (context.event.isText) {
				await context.setState({ whatWasTyped: context.event.message.text }); // has to be set here because of talkToUs
				await createIssue(context, 'Não entendi sua mensagem pois ela é muito complexa. Você pode escrever novamente, de forma mais direta?')
			}

		// Tratando dados adicionais do recipient
		if (context.state.dialog === 'recipientData' && context.state.recipientData) {
			if (context.event.isQuickReply) {
				if (context.state.dataPrompt === 'email') {
					await context.setState({ email: context.event.message.quick_reply.payload });
				}
			} else if (context.event.isText) {
				if (context.state.dataPrompt === 'email') {
					await context.setState({ email: context.event.message.text });
				}
			} if (context.event.isPostback) {
				if (context.state.dataPrompt === 'email') {
					await context.setState({ email: context.event.postback.payload });
				}
			}
		}

		if (context.state.dialog === 'recipientData' && context.state.recipientData) {
			if (context.state.recipientData === 'email') {
				await FrontAPI.postRecipient(context.state.politicianData.user_id, {
					fb_id: context.session.user.id,
					email: context.state.email,
				});
			}
		}

		await context.typingOff();
		switch (context.state.dialog) {
			case 'greetings': // primeiro

				break;
			/*
				Dialog flow here
			*/
		} // end switch de diálogo
	} catch (err) {
		const date = new Date();
		console.log('\n');
		console.log(`Parece que aconteceu um erro as ${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1} =>`);
		console.log(err);
		// if (context.event.rawEvent.field === 'feed') {
		// 	if (context.event.rawEvent.value.item === 'comment' || context.event.rawEvent.value.item === 'post') {
		// 		// we update user data at every interaction that's not a comment or a post
		// 		await context.setState({ politicianData: await FrontAPI.getPoliticianData(context.event.rawEvent.recipient.id) });
		// 		await context.setState({ pollData: await FrontAPI.getPollData(context.event.rawEvent.recipient.id) });
		// 	}
		// } else {
		await context.setState({ politicianData: await FrontAPI.getPoliticianData(context.event.rawEvent.recipient.id) });
		await context.setState({ pollData: await FrontAPI.getPollData(context.event.rawEvent.recipient.id) });
		// }

		// console.log('\n\n\n\nrawEvent.recipient.id no catch', context.event.rawEvent.recipient.id);
		// console.log('politicianData no catch', context.state.politicianData);

		await Sentry.configureScope(async (scope) => {
			if (context.session.user && context.session.user.first_name && context.session.user.last_name) {
				scope.setUser({ username: `${context.session.user.first_name} ${context.session.user.last_name}` });
				console.log(`Usuário => ${context.session.user.first_name} ${context.session.user.last_name}`);
			} else {
				scope.setUser({ username: 'no_user' });
				console.log('Usuário => Não conseguimos descobrir o nome do cidadão');
			}
			if (context.state && context.state.politicianData && context.state.politicianData.name
				&& context.state.politicianData.office && context.state.politicianData.office.name) {
				scope.setExtra('admin', `${context.state.politicianData.office.name} ${context.state.politicianData.name}`);
				console.log(`Administrador => ${context.state.politicianData.office.name} ${context.state.politicianData.name}`);
			} else {
				scope.setExtra('admin', 'no_admin');
				console.log('Administrador => Não conseguimos descobrir o nome do político');
			}

			scope.setExtra('state', context.state);
			throw err;
		});
	} // catch
		// }); // sentry context
}); // function handler


bot.onEvent(handler);

const server = createServer(bot, { verifyToken: config.verifyToken });


server.listen(process.env.API_PORT, () => {
	console.log(`Server is running on ${process.env.API_PORT} port...`);
});
