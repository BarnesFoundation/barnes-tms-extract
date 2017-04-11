const argv = require('minimist')(process.argv.slice(2));

const d = argv.d;

require('seneca')()

  .use('./csvPluginAPI.js', { d })

  // listen for role:math messages
  // IMPORTANT: must match client
  .listen({ type: 'tcp', pin: 'role:csv', port: 10202 });
