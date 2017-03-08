#!/usr/bin/python

import os
import sys
import json
import csvdiff

csv_dir = sys.argv[1]

print "Diffing CSV output in " + csv_dir

csv_folders = sorted([x for x in os.listdir(sys.argv[1]) if x.startswith('csv_')])

if len(csv_folders) < 2:
	sys.exit("Not enough output to diff")

csv_object_files = [os.path.join(csv_dir, x, "objects.csv") for x in csv_folders]

for idx in range(1, len(csv_folders)):
	with open(os.path.join(csv_dir, csv_folders[idx], "diff.json"), "w+") as f:
		d = csvdiff.diff_files(csv_object_files[0], csv_object_files[1], ["id"])
		json.dump(d, f)
