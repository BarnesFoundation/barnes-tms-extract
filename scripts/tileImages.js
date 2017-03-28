const seneca = require('seneca')({
  transport:{
    tcp:{
      timeout: 60000
    }
  }
})
  .client({ type: 'tcp', pin: 'role:images', port: 10204, timeout: 60000 })
  .act('role:images,cmd:tile', function(res) {
    process.exit(0);
  });
