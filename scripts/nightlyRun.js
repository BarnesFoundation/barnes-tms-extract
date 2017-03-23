const seneca = require('seneca')()
  .client({ type: 'tcp', pin: 'role:tmstocsv' })
  .act('role:tmstocsv,cmd:run', function(res) {
    process.exit(0);
  });
