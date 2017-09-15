# Quick Steps to Manually Update the Site

This is a temporary process to get us ready for launch in time. We need to update all of this in the future.

On the production server, from the root of this repo:

1. Export a new CSV from TMS.
```
node src/scripts/debugging/tmsToCSV.js
```
2. Note the name of the CSV logged by the previous step. It should look like `csv_1505491700669`.
3. Update the `csvTimestamp` variable in `src/scripts/debugging/csvToES.js` accordingly. (In this case, change it to `1505491700669`.
4. Import this CSV into ES. This step will clear all the images from the front-end of the site, so be careful.
```
node src/scripts/debugging/csvToES.js
```
5. Save the image keys to ES. After this step, you should see images once again.
```
node src/scripts/saveImageKeysToEs.js
```
6. Run the color processing scripts to add CH-style color data back. It'll take a few minutes to see the color filters working properly again.
```
node src/scripts/nightlyColorProcess.js
```
7. Import Ahmed's and Sam's computer vision data. This will import all CSVs in the `src/dashboard/public/data` directory. If the CSV isn't in the directory, it's not going into ES.
```
node src/scripts/importCSV.js --all
```

