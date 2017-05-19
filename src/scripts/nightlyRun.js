const exec = require('child_process').exec;
const path = require('path');
const logger = require('../util/logger.js')(path.join(__dirname, "logs/cron_logs.txt"));

const argv = require('minimist')(process.argv.slice(2));

const source = argv.d || path.resolve(__dirname, '../dashboard/public/output');

logger.info("Beginning nightly cron");

// Cleanup old CSVs
logger.info("Cleaning up old CSVs");
exec(['node', path.resolve(__dirname, './oldCSVClean.js'), '-d', source].join(' '));

// Run the CSV processing script
logger.info("Pulling latest from TMS");
const seneca = require('seneca')() // eslint-disable-line
	.client({ type: 'tcp', pin: 'role:tmstocsv' })
	.act('role:tmstocsv,cmd:runNightly', () => {
		logger.info("Exiting");
		process.exit(0);
	});
