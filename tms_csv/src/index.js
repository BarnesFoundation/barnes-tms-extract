import TMSReader from "./tmsReader.js";

var tms = new TMSReader("data/json");

for (var i = 0; i < tms.length; i++) {
	console.log(tms.objectAtIndex(i).description);
}
