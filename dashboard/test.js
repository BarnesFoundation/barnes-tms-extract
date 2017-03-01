function test(options) {
	this.add('role:test', (msg, respond) => {
		respond(null, { message: 'test is successful!' });
	});
}

module.exports = test;
