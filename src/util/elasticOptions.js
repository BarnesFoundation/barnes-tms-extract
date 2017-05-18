const config = require('config');

module.exports.makeElasticsearchOptions = function() {
	const rawOptions = config.Elasticsearch;
	let esCredentials = null;
	if (rawOptions.credentials) {
		const upass = config.Credentials.es[rawOptions.credentials];
		esCredentials = `${upass.username}:${upass.password}`;
	}

	return {
		host: [
			{
				host: rawOptions.host,
				auth: esCredentials || undefined,
				protocol: rawOptions.protocol || 'http',
				port: rawOptions.port || 9200
			}
		]
	};
}