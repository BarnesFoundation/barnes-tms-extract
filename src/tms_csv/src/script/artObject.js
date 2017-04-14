const _ = require('lodash');

/**
 * Thin wrapper around the JSON description of a collection object in TMS
 * @param {object} jsonDescription - JSON description as returned by the TMS API
 * @param {ExportConfig} searchConfig - Export configuration
 */
class ArtObject {
	constructor(jsonDescription, searchConfig) {
		this._jsonObj = jsonDescription;
		this._searchConfig = searchConfig;
	}

	_flattenTMSValue(desc, key) {
		if (this._searchConfig.fieldIsMask(key)) {
			const select = this._searchConfig.fieldMaskSelector(key);
			return desc.value.indexOf(select) >= 0;
		}
		return desc.value;
	}

	/**
	 * @property {object} transformedDescription - JSON description with TMS field metadata stripped
	 */
	get transformedDescription() {
		const updateValues = _.mapValues(this._jsonObj, this._flattenTMSValue.bind(this));
		return _.mapKeys(updateValues, (value, key) => this._searchConfig.transformKey(key));
	}

	/**
	 * Returns a description of the collection object, stripped of TMS metadata, and limited to
	 * the specified fields.
	 * @param {string[]} fields - Fields to retrieve from the object description
	 * @return {object} Selected JSON description
	 */
	descriptionWithFields(fields) {
		const mappedFields = fields.map(this._searchConfig.transformKey.bind(this._searchConfig));
		return _.pick(this.transformedDescription, mappedFields);
	}
};

module.exports = ArtObject;