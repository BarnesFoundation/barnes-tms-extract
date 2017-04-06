const SenecaWeb = require('seneca-web');
const Express = require('express');
const Router = Express.Router;
const context = new Router();
const path = require('path');
const shelljs = require('shelljs');
const moment = require('moment');
const Promise = require('bluebird');
const _ = require('lodash');

const senecaWebConfig = {
	context,
	adapter: require('seneca-web-adapter-express'),
	options: { parseBody: false },
};

const app = Express();
app.use(require('body-parser').json());
app.use(context);
app.use(Express.static(path.resolve(`${__dirname}/../public`)));
app.set('view engine', 'pug');
app.set('views', path.resolve(`${__dirname}/../views`));

const seneca = require('seneca')()
			.use(SenecaWeb, senecaWebConfig)
			.use('api')
			.client({ type: 'tcp', pin: 'role:tmstocsv' })
			.client({ type: 'tcp', pin: 'role:csv', port: 10202 })
			.client({ type: 'tcp', pin: 'role:es', port: 10203 })
			.client({ type: 'tcp', pin: 'role:images', port: 10204 });

// Promisify Seneca.act
const act = Promise.promisify(seneca.act, { context: seneca });

app.get('/', (req, res) => {
	const infos = [
		act('role:es,cmd:desc'),
		act('role:tmstocsv,cmd:info'),
		act('role:csv,cmd:list'),
		act('role:images,cmd:info')
	];
	Promise.all(infos).then((resArray) => {
		const args = _.zipObject(['desc', 'info', 'list', 'imageInfo'], resArray);
		args.moment = moment;
		res.render('index', args);
	});
});

app.get('/csvFiles', (req, res) => {
	const infos = [
		act('role:es,cmd:desc'),
		act('role:csv,cmd:list')
	];
	Promise.all(infos).then((resArray) => {
		res.render('csvFiles', _.zipObject(['desc', 'list'], resArray));
	});
});

app.get('/:csv_id/objects', (req, res) => {
	res.render('csv', { csvId: req.params.csv_id, csvType: 'objects' });
});

app.get('/:csv_id/warnings', (req, res) => {
	res.render('csv', { csvId: req.params.csv_id, csvType: 'warnings' });
});

// Start the server
const server = require('http').createServer(app);
const io = require('socket.io')(server);
io.on('connection', (socket) => {
	socket.on('status', (name, status, data) => {
		socket.broadcast.emit('status', name, status, data);
	});
});
server.listen(3000);
