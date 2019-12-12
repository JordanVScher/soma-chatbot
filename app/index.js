require('dotenv').config();

const { MessengerBot, FileSessionStore, withTyping } = require('bottender');
const { createServer } = require('bottender/restify');
const restify = require('restify');
const requests = require('../requests');
const broadcast = require('./soma_broadcast');

restify.createServer = createServer;
const config = require('./bottender.config.js').messenger;
const { getChatbotData } = require('./chatbot_api');

const mapPageToAccessToken = async (pageId) => {
	if (process.env.ENV === 'local') { return config.accessToken; }
	const perfilData = await getChatbotData(pageId);
	return perfilData.fb_access_token;
};

const bot = new MessengerBot({
	mapPageToAccessToken,
	// accessToken: config.accessToken,
	appSecret: config.appSecret,
	verifyToken: config.verifyToken,
	sessionStore: new FileSessionStore(),
});

bot.setInitialState({});

const messageWaiting = eval(process.env.WITH_TYPING); // eslint-disable-line no-eval
if (messageWaiting) { bot.use(withTyping({ delay: messageWaiting })); }

const handler = require('./handler');

bot.onEvent(handler);

const server = restify.createServer(bot, { verifyToken: config.verifyToken });
server.use(restify.plugins.bodyParser({	requestBodyOnGet: true }));

server.post('/add-label', async (req, res) => {
	await requests.addLabel(req, res);
});

server.get('/name-id', async (req, res) => {
	await requests.getNameFBID(req, res);
});

server.post('/soma-broadcast', async (req, res) => {
	if (req.header('Api-Token') === process.env.API_TOKEN) {
		await broadcast.handler(res, req.body);
	} else {
		res.status(400); res.send({ error: 'Invalid Api-Token on Header' });
	}
});

server.get('/soma-broadcast/:id', async (req, res) => {
	if (req.header('Api-Token') === process.env.API_TOKEN) {
		await broadcast.getOneBroadcast(res, req.params.id);
	} else {
		res.status(400); res.send({ error: 'Invalid Api-Token on Header' });
	}
});

server.get('/soma-broadcast', async (req, res) => {
	if (req.header('Api-Token') === process.env.API_TOKEN) {
		await broadcast.getAllBroadcasts(res);
	} else {
		res.status(400); res.send({ error: 'Invalid Api-Token on Header' });
	}
});

server.get(`/${process.env.FACEBOOK_SERVER_VERIFY}.html`, restify.plugins.serveStatic({	directory: './html' }));

server.listen(process.env.API_PORT, () => {
	console.log(`Server is running on ${process.env.API_PORT} port...`);
	console.log(`App: ${process.env.APP} & Page: ${process.env.PAGE}`);
	console.log(`MA User: ${process.env.MA_USER}`);
});
