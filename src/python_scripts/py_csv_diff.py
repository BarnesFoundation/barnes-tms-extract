#!/usr/bin/python

import os
import sys
import json
import csvdiff
import click

@click.command()
@click.argument('old_csv_path')
@click.argument('new_csv_path')
@click.argument('output_file')
def cli(old_csv_path, new_csv_path, output_file):
	"""Calculate the diff between old_csv_path and new_csv_path, and write JSON to output_file"""
	print "Diffing CSV " + old_csv_path + " with " + new_csv_path
	print os.getcwd()

	with open(output_file, "w+") as f:
		d = csvdiff.diff_files(old_csv_path, new_csv_path, ["id"])
		json.dump(d, f)

if __name__ == "__main__":
		cli()