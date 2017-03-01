
const SenecaWeb = require('seneca-web');
const Express = require('express');
const Router = Express.Router;
const context = new Router();
const path = require('path');
const shelljs = require('shelljs');

const senecaWebConfig = {
	context,
	adapter: require('seneca-web-adapter-express'),
	options: { parseBody: false },
};

const app = Express();
app.use(require('body-parser').json());
app.use(context);
app.listen(3000);

app.get('/', (req, res) => {
	res.sendFile(path.join(`${__dirname}/index.html`));
});

app.get('/last-run', (req, res) => {
	const runTimesString = shelljs.grep('Beginning CSV export', '../tms_csv/logs/all-logs.log');
	const lines = runTimesString.split('\n');
	lines.pop();
	const lastRunTime = JSON.parse(lines[lines.length - 1]);
	res.json({ time: lastRunTime.timestamp });
});

const seneca = require('seneca')()
      .use(SenecaWeb, senecaWebConfig)
      .use('api')
// this is where we list the microservices
      .client({ type: 'tcp', pin: 'role:tmstocsv' });
