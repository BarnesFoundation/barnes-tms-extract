var shell = require('shelljs');

shell.echo("Creating tmsdiff Python environment");
shell.exec("conda create -n tmsdiff -yq");

shell.echo("Installing python dependencies");
shell.exec("source activate tmsdiff");
shell.exec("pip install -r py_csv_diff/requirements.txt");

shell.echo("Deactivating python source");
shell.exec("source deactivate");
