function api(options) {
  // an example of configuring a path to a microservice
  // var valid_ops = { sum:'sum', product:'product' }

	this.add('role:api,path:csv', function (msg, respond) {
		const valid_commands = {
			list: 'list',
		};

    // do something to msg if necessary
    // msg.args.params url params, msg.args.query query string params
		const command = msg.args.params.cmd;
		this.act('role:csv', { cmd: valid_commands[command] }, respond);
	});

	this.add('role:api,path:es', function (msg, respond) {
		const valid_commands = {
			desc: 'desc',
			sync: 'sync',
		};

		const command = msg.args.params.cmd;

		this.act('role:es', { cmd: valid_commands[command] }, respond);
	});

	this.add('role:api,path:tmstocsv', function (msg, respond) {
		const valid_commands = {
			info: 'info',
			run: 'run',
			cancel: 'cancel',
			active: 'active',
		};

    // do something to msg if necessary
    // msg.args.params url params, msg.args.query query string params
		const command = msg.args.params.cmd;
		this.act('role:tmstocsv', { cmd: valid_commands[command] }, respond);
	});

	this.add('init:api', function (msg, respond) {
		this.act('role:web', { routes: {
			prefix: '/api',
			pin: 'role:api,path:*',
      // this is where we add the route to the microservice
			map: {
				csv: { GET: true, suffix: '/:cmd' },
				es: { GET: true, suffix: '/:cmd' },
				tmstocsv: { GET: true, suffix: '/:cmd' },
			},
		} }, respond);
	});
}

module.exports = api;
