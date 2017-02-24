function test( options ) { 

  this.add( 'role:test', function( msg, respond ) {
    respond(null, { message: 'test is successful!'});
  });

}

module.exports = test;