const CSVWriter = require('./csvWriter.js');
const logger = require('./logger.js');

const _ = require('lodash');

module.exports = class WarningReporter {
	constructor(outputDirectory, searchConfig) {
		this._outputDirectory = outputDirectory;
		this._searchConfig = searchConfig;
		this._enumeratedFieldCounts = {};
		this._singletonCap = 4;
		const warningPath = `${this._outputDirectory}/warnings.csv`;

		logger.info(`Writing warnings to ${warningPath}`);
		this._csv = new CSVWriter(warningPath);
	}

	_checkMissingFields(objectId, fields) {
		_.forEach(fields, (value, field) => {
			if (this._searchConfig.fieldIsRequired(field)) {
				if (value === undefined) {
					const newWarning = {
						type: 'missing',
						object: objectId,
						field,
						message: `Object is missing a required field ${field}`,
					};

					logger.debug(`Export warning: ${JSON.stringify(newWarning)}`);
					this._csv.write(newWarning);
				}
			}
		});
	}

	_checkSingletonFields() {
		_.forEach(this._enumeratedFieldCounts, (valueCountDict, field) => {
			_.forEach(valueCountDict, (objectIds, fieldValue) => {
				if (objectIds.length < this._singletonCap) {
					_.forEach(objectIds, (objectId) => {
						const newWarning = {
							type: 'singleton',
							object: objectId,
							field,
							message: `Value ${fieldValue} for field ${field} only appears ${objectIds.length} times — maybe a typo`,
						};

						logger.debug(`Export warning: ${JSON.stringify(newWarning)}`);
						this._csv.write(newWarning);
					});
				}
			});
		});
	}

	_checkUnusedFields(desc, objectId, artObject, fields) {
		_.forEach(desc, (value, key) => {
			if (!_.has(fields, key)) {
				const newWarning = {
					type: 'unused',
					object: objectId,
					field: key,
					message: `Object description has field ${key}, but that field was not selected for export`,
				};

				logger.debug(`Export warning: ${JSON.stringify(newWarning)}`);
				this._csv.write(newWarning);
			}
		});
	}

	_countEnumeratedFields(desc, objectId) {
		_.forEach(desc, (value, key) => {
			if (this._searchConfig.fieldIsEnumerated(key)) {
				if (!this._enumeratedFieldCounts[key]) this._enumeratedFieldCounts[key] = {};
				if (!this._enumeratedFieldCounts[key][value]) this._enumeratedFieldCounts[key][value] = [];

				// If a particular field already has more than the required number of object id's associated with it,
				// then we don't need to store it. Save a bit of memory this way
				if ((this._enumeratedFieldCounts[key][value]).length <= this._singletonCap) {
					(this._enumeratedFieldCounts[key][value]).push(objectId);
				}
			}
		});
	}

	appendFieldsForObject(objectId, artObject, fields) {
		const desc = artObject.fullDescription;

		if (this._searchConfig.warnings.unusedFields) {
			this._checkUnusedFields(desc, objectId, artObject, fields);
		}

		if (this._searchConfig.warnings.singletonFields) {
			this._countEnumeratedFields(desc, objectId);
		}

		if (this._searchConfig.warnings.missingFields) {
			this._checkMissingFields(objectId, fields);
		}
	}

	end() {
		if (this._searchConfig.warnings.singletonFields) this._checkSingletonFields();
		this._csv.end();
	}
};
