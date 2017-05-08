const config = require('config');
const moment = require('moment');
const Express = require('express');
const path = require('path');
const Promise = require('bluebird');
const SenecaWeb = require('seneca-web');
const _ = require('lodash');
const bodyParser = require('body-parser');

const Router = Express.Router;
const context = new Router();

const senecaWebConfig = {
	context,
	adapter: require('seneca-web-adapter-express'), // eslint-disable-line
	options: { parseBody: false },
};

const app = Express();
app.use(bodyParser.json());
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

// Promisify Seneca functions
const act = Promise.promisify(seneca.act, { context: seneca });

app.get('/', (req, res) => {
	res.render('index');
});

app.post('/sync', (req, res) => {
	const csv = req.body.csv;
	if (csv) {
		act('role:es,cmd:sync', { csv }).then(() => {
			res.send(JSON.stringify({
				success:true,
				csv: csv
			}));
		});
	} else {
		res.send(JSON.stringify({ success:false }));
	}
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
const socketNames = {};
io.on('connection', (socket) => {
	socket.on('listNames', () => {
		socket.broadcast.emit('introduce');
	});

	socket.on('name', (name) => {
		socketNames[socketNames.id] = name;
		socket.broadcast.emit('announce', name);
	});

	socket.on('disconnect', () => {
		if (socketNames[socket.id] !== undefined) {
			_.forOwn(io.sockets.sockets, (s) => {
				s.emit('farewell', socketNames[socket.id]);
			});
		}
	});

	socket.on('status', (name, status, data) => {
		socket.broadcast.emit('status', name, status, data);
	});
});
server.listen(config.Server.port);
