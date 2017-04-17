const _ = require('lodash');

/**
 * Wrapper and validator for a JSON object implementing {@link TMSExporter~TMSExportConfiguration}
 * @param {TMSExporter~TMSExportConfiguration} config - TMS export configuration
 * @throws Error if the TMS export configuration is impropertly constructed
 */
class ExportConfig {
	constructor(config) {
		const jsonConfig = config;

		const primaryKeyObj = _.find(jsonConfig.fields, entry => entry.primaryKey === true);

		if (primaryKeyObj === undefined) {
			const errObj = {
				name: 'InvalidConfig',
				message: 'CSV export config does not specify a primary key',
			};
			throw errObj;
		} else {
			this._primaryKey = primaryKeyObj.name;
		}

		const lastKeyObj = _.findLast(jsonConfig.fields, entry => entry.primaryKey === true);

		if (lastKeyObj !== primaryKeyObj) {
			const errObj = {
				name: 'InvalidConfig',
				message: `CSV export config designates more than one primary key: (${this._primaryKey}) and (${lastKeyObj.name})`,
			};
			throw errObj;
		}

		this._config = jsonConfig;

		this._fields = {};
		_.forEach(this._config.fields, (field) => {
			this._fields[field.name] = field;
		});
	}

	// @property {string} apiURL - The root URL of the TMS API
	get apiURL() {
		return this._config.apiURL;
	}

	// @property {string[]} fields - Which fields to retrieve for each collection object in TMS
	get fields() {
		return _.keys(this._fields);
	}

	// @property {object} debug - Any specified debug keys
	get debug() {
		return this._config.debug;
	}

	// @property {string} outputDirectory - The directory into which to write all TMS files
	get outputDirectory() {
		return this._config.outputDirectory;
	}

	// @property {string} primaryKey - Field name to use as a unique identifier for each TMS collection object
	get primaryKey() {
		return this._primaryKey;
	}

	// @property {string} warnings - Which warnings to emit
	get warnings() {
		return this._config.warnings;
	}

	/**
	 * Whether or not the field with a given name represents an enumerated value
	 * @param {string} field - the name of the field
	 */
	fieldIsEnumerated(field) {
		return this._fields[field] ? this._fields[field].enumerated === true : false;
	}

	/**
	 * Whether or not the field with a given name represents a mask value
	 * @param {string} field - the name of the field
	 */
	fieldIsMask(field) {
		return this._fields[field] && this._fields[field].dataType === "mask";
	}

	/**
	 * Whether or not the field with a given name must be included
	 * @param {string} field - the name of the field
	 */
	fieldIsRequired(field) {
		return this._fields[field] ? this._fields[field].required === true : false;
	}

	/**
	 * Returns the mask string to select given a field name
	 * @param {string} field - the name of the field
	 */
	fieldMaskSelector(field) {
		return this.fieldIsMask(field) ? this._fields[field].select : field;
	}

	transformKey(key) {
		if (this.fieldIsMask(key)) {
			return this.fieldMaskSelector(key);
		}
		return key;
	}

};

module.exports = ExportConfig;