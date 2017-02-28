var shelljs = require('shelljs');
var exec = require('child_process').exec;

function lastRunTime() {
  var runTimesString = shelljs.grep("Beginning CSV export", "../tms_csv/logs/all-logs.log");
  var lines = runTimesString.split('\n');
  lines.pop();
  var lastRunTime = JSON.parse(lines[lines.length-1]);
  return lastRunTime.timestamp;
}


function tmstocsv(options) {
  this.add('role:tmstocsv,cmd:info', function info(msg, respond) {
    respond( null, {time: lastRunTime()});
  });

  this.add('role:tmstocsv,cmd:run', function run(msg, respond) {
    exec("cd ../tms_csv && npm start &");
    respond(null, {time: lastRunTime()});
  });
}

module.exports = tmstocsv;
