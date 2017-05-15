const argv = require('minimist')(process.argv.slice(2));
const path = require('path');

const config = require('config');

require('seneca')()

  .use('./esPluginAPI.js', {
  	esOptions: config.Elasticsearch,
  	csvDir: config.CSV.path
  })

  // listen for role:math messages
  // IMPORTANT: must match client
  .listen({ type: 'tcp', pin: 'role:es', port: 10203 });
