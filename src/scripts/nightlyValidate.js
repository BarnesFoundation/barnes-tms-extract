const exec = require('child_process').exec;
const path = require('path');
const logger = require('../util/logger.js')(path.join(__dirname, "logs/cron_logs.txt"));
const { getLastCompletedCSV } = require('../util/csvUtil.js');

const argv = require('minimist')(process.argv.slice(2));

const source = argv.d || path.resolve(__dirname, '../dashboard/public/output');

const lastCompletedCSV = getLastCompletedCSV(source);

logger.info("Beginning nightly validation");

if (!lastCompletedCSV) {
	logger.info('No completed CSV\'s---nothing to validate');
} else {
	logger.info(`Validating elasticsearch index for csv ${lastCompletedCSV}`);
	const seneca = require('seneca')() // eslint-disable-line
	.client({ type: 'tcp', pin: 'role:es' })
	.act('role:es,cmd:validateAndResync', { csv: lastCompletedCSV }, (res) => {
		logger.info('Exiting');
		process.exit(0);
	});
}
