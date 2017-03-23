const argv = require('minimist')(process.argv.slice(2));

const host = argv.host; // Elasticsearch host address

require('seneca')()

  .use('es', { host })

  // listen for role:math messages
  // IMPORTANT: must match client
  .listen({ type: 'tcp', pin: 'role:es', port: 10203 });
