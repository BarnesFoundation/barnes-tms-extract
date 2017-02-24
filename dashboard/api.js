function api(options) {

  //an example of configuring a path to a microservice
  // var valid_ops = { sum:'sum', product:'product' }

  var valid_commands = {info:'info'};
  this.add('role:api,path:test', function( msg, respond ) {
    this.act( 'role:test', {}, respond )
  });

  this.add('role:api,path:tmstocsv', function(msg, respond) {
    //do something to msg if necessary
    //msg.args.params url params, msg.args.query query string params
    var command = msg.args.params.cmd
    this.act('role:tmstocsv', {cmd: valid_commands[command]}, respond);
  });

  this.add( 'init:api', function( msg, respond ) {
    this.act('role:web',{routes:{
      prefix: '/api',
      pin:    'role:api,path:*',
      //this is where we add the route to the microservice
      map: {
        test: { GET:true },
        tmstocsv: { GET:true, suffix:'/:cmd' }
      }
    }}, respond )
  });

}

module.exports = api;
