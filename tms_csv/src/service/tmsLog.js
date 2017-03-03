const shelljs = require("shelljs");

exports.lastStartTime = function(logfile) {
	const runTimesString = shelljs.grep('tag:start', logfile).trim();
	const lines = runTimesString.split('\n');
	if (runTimesString.length && lines.length) {
		const lastRunTime = JSON.parse(lines[lines.length - 1]);
		return lastRunTime.timestamp;
	} else {
		return 0;
	}
}

exports.lastCompleteTime = function(logfile) {
	const runTimesString = shelljs.grep('tag:complete', logfile).trim();
	const lines = runTimesString.split('\n');
	if (runTimesString.length && lines.length) {
		const lastRunTime = JSON.parse(lines[lines.length - 1]);
		return lastRunTime.timestamp;
	} else {
		return 0;
	}
}
