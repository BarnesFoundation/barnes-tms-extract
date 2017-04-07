const path = require('path');
const shell = require('shelljs');

const output = shell.exec("which bash");
const bashPath = output.stdout.trim();
const reqPath = path.resolve(__dirname, '../py_csv_diff/requirements.txt');

shell.echo("Creating tmsdiff Python environment");
shell.exec("conda create -n tmsdiff -yq", { shell: bashPath });

shell.echo("Installing python dependencies");
shell.exec("source activate tmsdiff", { shell: bashPath });
shell.exec(`pip install -r ${reqPath}`, { shell: bashPath });

shell.echo("Deactivating python source");
shell.exec("source deactivate", { shell: bashPath });
