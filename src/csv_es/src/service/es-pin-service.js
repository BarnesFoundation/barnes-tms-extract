const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const { makeElasticsearchOptions } = require('../../../util/elasticOptions.js');

const config = require('config');

require('seneca')()

  .use('./esPluginAPI.js', {
  	esOptions: makeElasticsearchOptions(),
  	csvRootDirectory: config.CSV.rootDirectory
  })

  // listen for role:math messages
  // IMPORTANT: must match client
  .listen({ type: 'tcp', pin: 'role:es', port: 10203 });
