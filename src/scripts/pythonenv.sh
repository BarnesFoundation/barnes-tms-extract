#!/bin/sh

PYPATH=$HOME/.miniconda/bin

echo "Creating tmsdiff Python environment"
$PYPATH/conda create --yes -n tmsdiff python

echo "Installing python dependencies"
source $PYPATH/activate tmsdiff
conda install pip
pip install -r src/python_scripts/requirements.txt

echo "Deactivating python source"
source $PYPATH/deactivate
