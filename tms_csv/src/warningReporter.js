const CSVWriter = require("./csvWriter.js");
const logger = require("./logger.js");

const _ = require("lodash");

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

	_checkSingletonFields() {
		_.forEach(this._enumeratedFieldCounts, (valueCountDict, field) => {
			_.forEach(valueCountDict, (objectIds, fieldValue) => {
				if (objectIds.length < this._singletonCap) {
					_.forEach(objectIds, (objectId) => {
						const newWarning = {
							type: "singleton",
							object: objectId,
							message: `Value ${fieldValue} for field ${field} only appears ${objectIds.length} times — maybe a typo`
						};

						logger.debug(`Export warning: ${JSON.stringify(newWarning)}`);
						this._csv.write(newWarning);
					});
				}
			})
		})
	}

	appendFieldsForObject(objectId, artObject, fields) {
		debugger;
		const desc = artObject.fullDescription;

		_.forEach(desc, (value, key) => {
			if (!_.has(fields, key)) {
				const newWarning = {
					type: "unused",
					object: objectId,
					message: `Object description has field ${key}, but that field was not selected for export`
				};

				logger.debug(`Export warning: ${JSON.stringify(newWarning)}`);
				this._csv.write(newWarning);
			}

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

		_.forEach(fields, (value, field) => {
			if (this._searchConfig.fieldIsRequired(field)) {

				if (value === undefined) {
					const newWarning = {
						type: "missing",
						object: objectId,
						message: `Object is missing a required field ${field}`
					};

					logger.debug(`Export warning: ${JSON.stringify(newWarning)}`);
					this._csv.write(newWarning);
				}
			}
		})
	}

	end() {
		this._checkSingletonFields();
		this._csv.end();
	}
}