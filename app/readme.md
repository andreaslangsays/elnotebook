# ElNotebook my RedNotebook replacement for mac-os

## DOD

### fileformat:

* one file per _day_
* filename scheme: yyyy-mm-dd.md
* _markdown_ as basic text format

### folder structure: 
* _flat folder_ with all files in it
* **archive folder**

### calendar view:
* scan folder on startup and collect all files based on filename
* rescan on save and open
* build internal list of filenames
* open file on click of existing date
* create file on click of not existing data
* treat calendar as folder view with filter 
 
## required redNotebook importer:
* read folder
* create files in a new folder

-------------
First separate backend and frontend fuctions for electron usage
main.js 