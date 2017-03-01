const logger = require('./logger.js');

const fs = require('fs');
const _ = require('lodash');

module.exports = class ExportConfig {
	constructor(configPath) {
		logger.info(`Loading CSV export config at ${configPath}`);
		const configFile = fs.readFileSync(configPath, 'utf8');

		const jsonConfig = JSON.parse(configFile);

		const primaryKeyObj = _.find(jsonConfig.fields, entry => entry.primaryKey === true);

		if (primaryKeyObj === undefined) {
			throw {
				name: 'InvalidConfig',
				message: 'CSV export config does not specify a primary key',
			};
		} else {
			this._primaryKey = primaryKeyObj.name;
		}

		const lastKeyObj = _.findLast(jsonConfig.fields, entry => entry.primaryKey === true);

		if (lastKeyObj !== primaryKeyObj) {
			throw {
				name: 'InvalidConfig',
				message: `CSV export config designates more than one primary key: (${this._primaryKey}) and (${lastKey.name})`,
			};
		}

		this._config = jsonConfig;

		this._fields = {};
		_.forEach(this._config.fields, (field) => {
			this._fields[field.name] = field;
		});
	}

	get apiURL() {
		return this._config.apiURL;
	}

	get fields() {
		return _.keys(this._fields);
	}

	get debug() {
		return this._config.debug;
	}

	get outputDirectory() {
		return this._config.outputDirectory;
	}

	get primaryKey() {
		return this._primaryKey;
	}

	get warnings() {
		return this._config.warnings;
	}

	fieldIsEnumerated(field) {
		return this._fields[field] ? this._fields[field].enumerated === true : false;
	}

	fieldIsRequired(field) {
		return this._fields[field] ? this._fields[field].required === true : false;
	}
};
