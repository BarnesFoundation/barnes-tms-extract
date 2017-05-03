const config = require('config');
const fs = require('fs');
const path = require('path');
const pug = require('pug');

let outputStr = "";
const views = fs.readdirSync(config.Dashboard.views);
views.forEach((view) => {
	if (path.extname(view) === ".pug") {
		outputStr += pug.compileFileClient(path.join(config.Dashboard.views, view), {name: path.basename(view, ".pug")});
	}
});

fs.writeFileSync(path.join(config.Dashboard.public, "scripts", "templates.js"), outputStr);