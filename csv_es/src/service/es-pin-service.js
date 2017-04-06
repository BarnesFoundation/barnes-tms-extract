const argv = require('minimist')(process.argv.slice(2));
const path = require('path');

const config = require(path.relative(__dirname, path.resolve(process.cwd(), argv.config)));

require('seneca')()

  .use('es', { host: config.elasticsearchHost })

  // listen for role:math messages
  // IMPORTANT: must match client
  .listen({ type: 'tcp', pin: 'role:es', port: 10203 });
