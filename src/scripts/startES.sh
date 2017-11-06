#!/bin/sh

[[ `uname` -eq 'Darwin' ]] && elasticsearch -d || sudo systemctl start elasticsearch.service
