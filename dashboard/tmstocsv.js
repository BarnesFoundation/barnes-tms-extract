var shelljs = require('shelljs');
var exec = require('child_process').exec;
const TMSExporter = require('../tms_csv/src/tmsExporter.js');

const tmsExporter = new TMSExporter('../tms_csv/credentials.json');

const searchConfig = '../tms_csv/searchConfig.json';

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
    if (tmsExporter.active) {
      console.log("Already running");
      respond(null, {time: lastRunTime()});
    } else {
      tmsExporter.exportCSV(searchConfig);
      respond(null, {time: lastRunTime()});
    }
  });

  this.add('role:tmstocsv,cmd:active', function run(msg, respond) {
    respond(null, {active: tmsExporter.active});
  });
}

module.exports = tmstocsv;
