const path = require('path');
const shell = require('shelljs');
const pypath = '$HOME/.miniconda/bin';

const output = shell.exec('which bash');
const bashPath = output.stdout.trim();
const reqPath = path.resolve(__dirname, '../python_scripts/requirements.txt');

shell.echo('Creating tmsdiff Python environment');
shell.exec(`${pypath}/conda create --yes -n tmsdiff python`, { shell: bashPath });

shell.echo('Installing python dependencies');
shell.exec(`source ${pypath}/activate tmsdiff`, { shell: bashPath });
shell.exec(`pip install -r ${reqPath}`, { shell: bashPath });

shell.echo('Deactivating python source');
shell.exec(`source ${pypath}/deactivate`, { shell: bashPath });
