function tmstocsv(options) {
  this.add('role:tmstocsv,cmd:info', function info(msg, respond) {
    respond( null, {message: 'testing'});
  });
}

module.exports = tmstocsv;
