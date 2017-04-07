const exec = require('child_process').exec;
const path = require('path');

const argv = require('minimist')(process.argv.slice(2));

const source = argv.d || path.resolve(__dirname, '../dashboard/public/output');

// Cleanup old CSVs
exec(['node', path.resolve(__dirname, './oldCSVClean.js'), '-d', source].join(' '));

// Run the CSV processing script
const seneca = require('seneca')() // eslint-disable-line
	.client({ type: 'tcp', pin: 'role:tmstocsv' })
	.act('role:tmstocsv,cmd:run', () => {
		process.exit(0);
	});
