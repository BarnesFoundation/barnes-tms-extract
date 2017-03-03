const argv = require('minimist')(process.argv.slice(2));

const configFile = argv.config;
const credfile = argv.creds;

require('seneca')()

  .use('tmstocsv', {config: configFile, creds: credfile})

  // listen for role:math messages
  // IMPORTANT: must match client
  .listen({ type: 'tcp', pin: 'role:tmstocsv' });
