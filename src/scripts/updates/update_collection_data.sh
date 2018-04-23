#!/bin/bash
shopt -s nullglob

for script in [0-9][0-9]_*.js; do
  node $script
done
