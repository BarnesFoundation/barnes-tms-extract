
var SenecaWeb = require('seneca-web');
var Express = require('express');
var Router = Express.Router;
var context = new Router();
var path = require('path');
var shelljs = require('shelljs');

var senecaWebConfig = {
      context: context,
      adapter: require('seneca-web-adapter-express'),
      options: { parseBody: false }
};

var app = Express();
app.use( require('body-parser').json() );
app.use( context )
app.listen(3000);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/last-run', function(req, res) {
  var runTimesString = shelljs.grep("Beginning CSV export", "../tms_csv/logs/all-logs.log");
  var lines = runTimesString.split('\n');
  lines.pop();
  var lastRunTime = JSON.parse(lines[lines.length-1]);
  res.json({time: lastRunTime.timestamp});
});

var seneca = require( 'seneca' )()
      .use( SenecaWeb, senecaWebConfig )
      .use( 'api' )
//this is where we list the microservices
      .client( { type:'tcp', pin:'role:test' } )
      .client( { type:'tcp', pin:'role:tmstocsv' } )