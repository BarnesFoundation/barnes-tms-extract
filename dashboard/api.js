function api(options) {

  //an example of configuring a path to a microservice
  // var valid_ops = { sum:'sum', product:'product' }

  this.add( 'role:api,path:test', function( msg, respond ) {
    this.act( 'role:test', {}, respond )
  })

  this.add( 'init:api', function( msg, respond ) {
    this.act('role:web',{routes:{
      prefix: '/api',
      pin:    'role:api,path:*',
      //this is where we add the route to the microservice
      map: {
        test: { GET:true }
      }
    }}, respond )
  });

}

module.exports = api;
