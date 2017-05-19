const CSVWriter = require('../../../csvWriter.js');
const logger = require('./logger.js');

const _ = require('lodash');

/**
 * Writes warnings to a CSV file as they are emitted by the TMS export script. Warning file will
 * be called `warnings.csv`
 * @param {string} outputDirectory - Directory contaning the `meta.json` and `objects.csv` files
 * exported by the TMS script
 * @param {ExportConfig} searchConfig - Export configuration
 * @throws Error if the output file cannot be opened for some reason
 */
class WarningReporter {
	constructor(outputDirectory, searchConfig) {
		this._outputDirectory = outputDirectory;
		this._searchConfig = searchConfig;
		this._enumeratedFieldCounts = {};
		this._singletonCap = 4;
		const warningPath = `${this._outputDirectory}/warnings.csv`;

		logger.info(`Writing warnings to ${warningPath}`);
		this._csv = new CSVWriter(warningPath, [], logger);
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

	/**
	 * Call this function to process the object with the given identifier
	 * @param {number|string} objectId - Unique identifier for collection objects
	 * @param {ArtObject} artObject - the object itself
	 * @param {object} description - The fields that should be exported
	 * @throws Error if writing to the CSV file fails for some reason
	 */
	appendFieldsForObject(objectId, artObject, description) {
		const desc = artObject.transformedDescription;
		const mappedFields = _.mapKeys(description, (v, key) => this._searchConfig.transformKey(key));

		if (this._searchConfig.warnings.unusedFields) {
			this._checkUnusedFields(desc, objectId, artObject, mappedFields);
		}

		if (this._searchConfig.warnings.singletonFields) {
			this._countEnumeratedFields(desc, objectId);
		}

		if (this._searchConfig.warnings.missingFields) {
			this._checkMissingFields(objectId, mappedFields);
		}
	}

	/**
	 * Close the `warnings.csv` output file
	 * @throws Error if closing the file fails for some reason
	 */
	end() {
		if (this._searchConfig.warnings.singletonFields) this._checkSingletonFields();
		this._csv.end();
	}
};

module.exports = WarningReporter;