var shell = require('shelljs');

var output = shell.exec("which bash");
var bashPath = output.stdout.trim();

shell.echo("Creating tmsdiff Python environment");
shell.exec("conda create -n tmsdiff -yq", { shell: bashPath });

shell.echo("Installing python dependencies");
shell.exec("source activate tmsdiff", { shell: bashPath });
shell.exec("pip install -r py_csv_diff/requirements.txt", { shell: bashPath });

shell.echo("Deactivating python source");
shell.exec("source deactivate", { shell: bashPath });
