module.exports = class ArtObject {
	constructor(jsonDescription) {
		this._jsonObj = jsonDescription;
	}

	descriptionWithFields(fields) {
		const ret = {};
		for (let i = 0; i < fields.length; i++) {
			ret[fields[i]] = this._jsonObj[fields[i]] !== undefined ? this._jsonObj[fields[i]].value : undefined;
		}
		return ret;
	}
}