require( 'seneca' )()

  .use( 'tmstocsv' )

  // listen for role:math messages
  // IMPORTANT: must match client
  .listen( { type:'tcp', pin:'role:tmstocsv' } )