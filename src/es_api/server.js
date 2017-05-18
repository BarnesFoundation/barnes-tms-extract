const auth = require('http-auth');
const bodyParser = require('body-parser');
const config = require('config');
const elasticsearch = require('elasticsearch');
const Express = require('express');
const passport = require('passport');
const path = require('path');
const Router = Express.Router;
const _ = require('lodash');
const { makeElasticsearchOptions } = require('../util/elasticOptions.js');

const context = new Router();

const basicAuth = auth.basic({
	file: config.ElasticsearchAPI.htpasswd
});
passport.use(auth.passport(basicAuth));

const app = Express();
app.use(bodyParser.json());
app.use(context);

// redirect http to https
if (process.env.NODE_ENV === "production") {
	app.enable('trust proxy');
	app.use(function(req, res, next) {
		if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'].toLowerCase() === 'http') {
			return res.redirect('https://' + req.headers.host + req.url);
		}
		return next();
	});
}

app.get('/health', (req, res) => {
	const client = new elasticsearch.Client(makeElasticsearchOptions());
	if (!client) {
		res.json({ status: "red" });
	} else {
		client.cluster.health({index: "collection"}, function(error, esRes) {
			if (error) {
				res.json((Object.assign({status: "red"}, esRes)));
			} else {
				res.json(esRes);
			}
		});
	}
});

if (process.env.NODE_ENV === "production") {
	app.use(passport.authenticate('http', {session: false}));
}

// Start the server
const server = require('http').createServer(app);
server.listen(config.ElasticsearchAPI.port);
