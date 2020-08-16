require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');

const { bottender } = require('bottender');
const requests = require('./requests');
const broadcast = require('./app/soma_broadcast');

const app = bottender({ dev: true });

const port = Number(process.env.PORT) || 5000;

const handle = app.getRequestHandler();

const { sequelize } = require('./app/server/models/index');


sequelize.authenticate().then(() => {
	console.log('PSQL Connection has been established successfully.');
}).catch((err) => {
	console.error('Unable to connect to the database:', err);
});


app.prepare().then(() => {
	const server = express();

	server.use(
		bodyParser.json({
			verify: (req, _, buf) => {
				req.rawBody = buf.toString();
			},
		}),
	);

	server.get('/api', (req, res) => {
		res.json({ ok: true });
	});

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

	server.all('*', (req, res) => handle(req, res));

	server.listen(port, (err) => {
		if (err) throw err;
		console.log(`Server is running on ${port} port...`);
		console.log(`App: ${process.env.APP} & Page: ${process.env.PAGE}`);
		console.log(`MA User: ${process.env.MA_USER}`);
	});
});
