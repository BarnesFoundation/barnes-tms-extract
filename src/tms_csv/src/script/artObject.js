const _ = require('lodash');

/**
 * Thin wrapper around the JSON description of a collection object in TMS
 * @param {object} jsonDescription - JSON description as returned by the TMS API
 */
class ArtObject {
	constructor(jsonDescription) {
		this._jsonObj = jsonDescription;
	}

	/**
	 * @property {object} fullDescription - JSON description with TMS field metadata stripped
	 */
	get fullDescription() {
		return _.mapValues(this._jsonObj, 'value');
	}

	/**
	 * Returns a description of the collection object, stripped of TMS metadata, and limited to
	 * the specified fields.
	 * @param {string[]} fields - Fields to retrieve from the object description
	 * @return {object} Selected JSON description
	 */
	descriptionWithFields(fields) {
		const ret = {};
		for (let i = 0; i < fields.length; i += 1) {
			ret[fields[i]] = this._jsonObj[fields[i]] !== undefined ? this._jsonObj[fields[i]].value : undefined;
		}
		return ret;
	}
};

module.exports = ArtObject;