require('seneca')()

  .use('./tmsExportAPI.js')

  .client({ type: 'tcp', pin: 'role:es', port: 10203 })
  .client({ type: 'tcp', pin: 'role:images', port: 10204 })
  .listen({ type: 'tcp', pin: 'role:tmstocsv' });
