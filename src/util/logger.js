const winston = require('winston');
winston.emitErrs = true;
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const logger = function (filename) {
	mkdirp.sync(path.dirname(filename));
	fs.closeSync(fs.openSync(filename, 'w+'));
	const retlog = new winston.Logger({
		transports: [
			new winston.transports.File({
				level: 'info',
				filename,
				handleExceptions: true,
				json: true,
				maxsize: 5242880, // 5MB
				maxFiles: 5,
				colorize: false,
			}),
			new winston.transports.Console({
				level: 'debug',
				handleExceptions: true,
				json: false,
				colorize: true,
			}),
		],
		exitOnError: false,
	});

	retlog.stream = {
		write(message, encoding) {
			logger.info(message);
		},
	};
	return retlog;
};

module.exports = logger;
