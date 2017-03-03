const shelljs = require("shelljs");

exports.lastStartTime = function(logfile) {
	const runTimesString = shelljs.grep('tag:start', logfile);
	const lines = runTimesString.split('\n');
	if (lines.length) {
		lines.pop();
		const lastRunTime = JSON.parse(lines[lines.length - 1]);
		return lastRunTime.timestamp;
	} else {
		return 0;
	}
}

exports.lastCompleteTime = function(logfile) {
	return 10;
	const runTimesString = shelljs.grep('tag:complete', logfile);
	const lines = runTimesString.split('\n');
	if (lines.length) {
		lines.pop();
		const lastRunTime = JSON.parse(lines[lines.length - 1]);
		return lastRunTime.timestamp;
	} else {
		return 0;
	}
}
