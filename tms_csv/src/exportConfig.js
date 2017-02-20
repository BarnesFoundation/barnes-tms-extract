import logger from "./logger.js";

import fs from "fs";
import _ from "lodash";

export default class ExportConfig {
	constructor(configPath) {
		logger.info(`Loading CSV export config at ${configPath}`);
		const configFile = fs.readFileSync(configPath, 'utf8');

		const jsonConfig = JSON.parse(configFile);

		this._primaryKey = _.findKey(jsonConfig.commonFields, (entry) => entry.primaryKey === true);

		if (this._primaryKey === undefined) {
			throw {
				name: "InvalidConfig",
				message: "CSV export config does not specify a primary key"
			};
		}

		const lastKey = _.findLastKey(jsonConfig.commonFields, (entry) => entry.primaryKey === true);

		if (this._primaryKey !== lastKey) {
			throw {
				name: "InvalidConfig",
				message: `CSV export config designates more than one primary key: (${this._primaryKey}) and (${lastKey})`
			};
		}

		this._config = jsonConfig;
	}

	get apiURL() {
		return this._config.apiURL;
	}

	get collectionsCount() {
		if (this._config.collections === undefined) return 1;
		return this._config.collections.length + 1;
	}

	get commonFields() {
		return _.map(this._config.commonFields, "name");
	}

	get debug() {
		return this._config.debug;
	}

	get outputDirectory() {
		return this._config.outputDirectory;
	}

	get primaryKey() {
		return this._primaryKey;
	}

	fieldsForCollectionAtIndex(idx) {
		if (idx === 0) return this.commonFields;
		return _.map(this._config.collections[idx].fields, "name");
	}

	nameForCollectionAtIndex(idx) {
		if (idx === 0) return "objects";
		return this._config.collections[idx].name;
	}

	pathForCollectionAtIndex(idx) {
		if (idx === 0) return "/";
		return this._config.collections[idx].path;
	}
}