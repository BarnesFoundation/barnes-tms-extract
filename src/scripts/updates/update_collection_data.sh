#!/bin/bash
shopt -s nullglob
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for script in ${DIR}/[0-9][0-9]_*.js; do
  node $script
done
