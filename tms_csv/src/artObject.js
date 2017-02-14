export default class ArtObject {
	constructor(jsonDescription, collection="Common") {
		const jsonObj = JSON.parse(jsonDescription);

		this._artist = jsonObj.people.value;
		this._title = jsonObj.title.value;
		this._displayDate = jsonObj.displayDate !== undefined ? jsonObj.displayDate.value : undefined;
		this._medium = jsonObj.medium.value;
		this._dimensions = jsonObj.dimensions.value;
		this._accessionNumber = jsonObj.invno.value;
		this._description = jsonObj.description.value;
		this._primaryMedia = jsonObj.primaryMedia.value;
		this._id = jsonObj.id.value;
	}

	get description() {
		return this._description;
	}
}