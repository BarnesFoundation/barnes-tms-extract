#!/usr/bin/python

import os
import sys
import json
import csvdiff
import click

@click.command()
@click.option('--force', is_flag=True, help='Overwrite existing diff.json files')
@click.argument('src_dir')
def cli(src_dir, force):
	"""Diffs all of the files named objects.csv inside of all of the csv_* directories in src_dir"""
	csv_dir = src_dir

	print "Diffing CSV output in " + csv_dir

	csv_folders = sorted([x for x in os.listdir(csv_dir) if x.startswith('csv_')])

	if len(csv_folders) < 2:
		sys.exit("Not enough output to diff")

	csv_object_files = [os.path.join(csv_dir, x, "objects.csv") for x in csv_folders]

	print "Root CSV at " + csv_folders[0]

	for idx in range(1, len(csv_folders)):
		diffpath = os.path.join(csv_dir, csv_folders[idx], "diff.json")
		if force or not os.path.exists(diffpath):
			with open(diffpath, "w+") as f:
				d = csvdiff.diff_files(csv_object_files[idx-1], csv_object_files[idx], ["id"])
				json.dump(d, f)
				print "Diff created for " + csv_folders[idx]
		else:
			print "Existing diff for " + csv_folders[idx] + ", skipping"

if __name__ == "__main__":
		cli()