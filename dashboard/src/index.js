
const SenecaWeb = require('seneca-web');
const Express = require('express');
const Router = Express.Router;
const context = new Router();
const path = require('path');
const shelljs = require('shelljs');
const moment = require('moment');

const senecaWebConfig = {
	context,
	adapter: require('seneca-web-adapter-express'),
	options: { parseBody: false },
};

const app = Express();
app.use(require('body-parser').json());
app.use(context);
console.log(path.resolve(`${__dirname}/../public`));
app.use(Express.static(path.resolve(`${__dirname}/../public`)));
app.set('view engine', 'pug');
app.set('views', path.resolve(`${__dirname}/../views`));
app.listen(3000);

const seneca = require('seneca')()
      .use(SenecaWeb, senecaWebConfig)
      .use('api')
// this is where we list the microservices
      .client({ type: 'tcp', pin: 'role:tmstocsv' })
      .client({ type: 'tcp', pin: 'role:csv', port: 10202 });

app.get('/', (req, res) => {
  let info;
  let list;
  seneca.act('role:tmstocsv,cmd:info', function(err, result) {
    info = result;
    seneca.act('role:csv,cmd:list', function(err, result) {
      list = result;
      res.render('index', {info: info, list: list, moment: moment});
    });
  });
});

