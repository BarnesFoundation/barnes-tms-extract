const seneca = require('seneca')({ // eslint-disable-line
	transport: {
		tcp: {
			timeout: 60000,
		},
	},
})
  .client({ type: 'tcp', pin: 'role:images', port: 10204, timeout: 60000 })
  .act('role:images,cmd:tile', () => {
	process.exit(0);
});
