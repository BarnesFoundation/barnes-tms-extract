const exec = require('child_process').exec;
const path = require('path');
const logger = require('../util/logger.js')(path.join(__dirname, "logs/cron_logs.txt"));

logger.info("Beginning color process nightly cron");

// Run the CSV processing script
logger.info("Processing Cooper-Hewitt color data");
const seneca = require('seneca')() // eslint-disable-line
	.client({ type: 'tcp', pin: 'role:color', port: 10205 })
	.act('role:color,cmd:process', () => {
		logger.info("Exiting");
		process.exit(0);
	});
