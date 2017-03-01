const shelljs = require('shelljs');
const exec = require('child_process').exec;

function lastRunTime() {
	const runTimesString = shelljs.grep('Beginning CSV export', '../tms_csv/logs/all-logs.log');
	const lines = runTimesString.split('\n');
	lines.pop();
	const lastRunTime = JSON.parse(lines[lines.length - 1]);
	return lastRunTime.timestamp;
}


function tmstocsv(options) {
	this.add('role:tmstocsv,cmd:info', (msg, respond) => {
		respond(null, { time: lastRunTime() });
	});

	this.add('role:tmstocsv,cmd:run', (msg, respond) => {
		exec('cd ../tms_csv && npm start &');
		respond(null, { time: lastRunTime() });
	});
}

module.exports = tmstocsv;
