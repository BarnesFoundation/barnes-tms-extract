const argv = require('minimist')(process.argv.slice(2));

const credfile = argv.creds;

require('seneca')()

  .use('tmstocsv', { creds: credfile })

  .client({ type: 'tcp', pin: 'role:es', port: 10203 })
  .client({ type: 'tcp', pin: 'role:images', port: 10204 })
  .listen({ type: 'tcp', pin: 'role:tmstocsv' });
