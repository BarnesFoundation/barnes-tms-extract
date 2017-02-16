import fs from "fs";
import _ from "lodash";

export default class ExportConfig {
	constructor(configPath) {
		const configFile = fs.readFileSync(configPath, 'utf8');
		const jsonConfig = JSON.parse(configFile);

		// Extract the primary key
		// TODO: Error if none or duplicate
		this._primaryKey = _.findKey(jsonConfig.commonFields, (entry) => entry.primaryKey === true);

		this._config = jsonConfig;
	}

	get apiURL() {
		return this._config.apiURL;
	}

	get outputDirectory() {
		return this._config.outputDirectory;
	}

	get fields() {
		return Object.keys(this._config.commonFields);
	}
}