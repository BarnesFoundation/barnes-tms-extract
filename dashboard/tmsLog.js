exports.lastStartTime = function() {
	const runTimesString = shelljs.grep('tag:start', './logs/all-logs.log');
	const lines = runTimesString.split('\n');
	lines.pop();
	const lastRunTime = JSON.parse(lines[lines.length - 1]);
	return lastRunTime.timestamp;
}

exports.lastCompleteTime = function() {
	const runTimesString = shelljs.grep('tag:complete', './logs/all-logs.log');
	const lines = runTimesString.split('\n');
	lines.pop();
	const lastRunTime = JSON.parse(lines[lines.length - 1]);
	return lastRunTime.timestamp;
}
