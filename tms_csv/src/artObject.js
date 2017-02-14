export default class ArtObject {
	constructor(jsonDescription) {
		this._description = jsonDescription;
	}

	get description() {
		return this._description;
	}
}