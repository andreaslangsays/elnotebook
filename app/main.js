const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const redNotebookRepository = {};

//const windows = new Set();
const openFiles = new Map();

const moment = require('moment');



app.on('window-all-closed', () => {
    //if (process.platform === 'darwin') {
    //  return false;
    //}
    app.quit();
});

app.on('activate', (event, hasVisibleWindows) => {
    if (!hasVisibleWindows) { createWindow(); }
});

let mainWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({ show: false });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    mainWindow.on('close', (event) => {
        if (mainWindow.isDocumentEdited()) {
            event.preventDefault();

            const result = dialog.showMessageBox(mainWindow, {
                type: 'warning',
                title: 'Quit with Unsaved Changes?',
                message: 'Your changes will be lost permanently if you do not save.',
                buttons: [
                    'Quit Anyway',
                    'Cancel',
                ],
                cancelId: 1,
                defaultId: 0
            });

            if (result === 0) mainWindow.destroy();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

});



const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
    const files = dialog.showOpenDialog(targetWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Markdown Files', extensions: ['md', 'markdown'] }
        ]
    });

    if (files) { openFile(targetWindow, files[0]); }
};

const openFile = exports.openFile = (targetWindow, file) => {
    const content = fs.readFileSync(file).toString();
    app.addRecentDocument(file);
    targetWindow.setRepresentedFilename(file);
    targetWindow.webContents.send('file-opened', file, content);
    startWatchingFile(targetWindow, file);
};


const saveMarkdown = exports.saveMarkdown = (targetWindow, file, content) => {
    if (!file) {
        file = dialog.showSaveDialog(targetWindow, {
            title: 'Save Markdown',
            defaultPath: app.getPath('documents'),
            filters: [
                { name: 'Markdown Files', extensions: ['md', 'markdown'] }
            ]
        });
    }

    if (!file) return;

    fs.writeFileSync(file, content);
    openFile(targetWindow, file);
};

const saveHtml = exports.saveHtml = (targetWindow, content) => {
    const file = dialog.showSaveDialog(targetWindow, {
        title: 'Save HTML',
        defaultPath: app.getPath('documents'),
        filters: [
            { name: 'HTML Files', extensions: ['html', 'htm'] }
        ]
    });

    if (!file) return;

    fs.writeFileSync(file, content);
};

const startWatchingFile = (targetWindow, file) => {
    stopWatchingFile(targetWindow);

    const watcher = fs.watchFile(file, () => {
        const content = fs.readFileSync(file).toString();
        targetWindow.webContents.send('file-changed', file, content);
    });

    openFiles.set(targetWindow, watcher);
};

const stopWatchingFile = (targetWindow) => {
    if (openFiles.has(targetWindow)) {
        openFiles.get(targetWindow).stop();
        openFiles.delete(targetWindow);
    }
};

const openFolder = exports.openFolder = (targetWindow) => {
    const folder = dialog.showOpenDialog(targetWindow, { properties: ["openDirectory"] }, );

    var data = readDataFromFiles(folder[0], 'txt');
    console.log(getFileName());
    console.log(data.length);
    //if (folder) { openPath(targetWindow, folder); };

};

const readDataFromFiles = (folder, filter) => {
    let dataCompound = [];
    if (!fs.existsSync(folder)) {
        console.log("no dir ", folder);
        return false;
    }
    var files = fs.readdirSync(folder);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(folder, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            fromDir(filename, filter); //recurse
        } else if (filename.indexOf(filter) >= 0) {
            //do a simple filter over the current filename
            // name is used later to set year and month
            /**
             * advanced: filter by pattern to see if filename is in right format
             */
            let fileName = files[i].replace('.' + filter, '');
            let fileContent = fs.readFileSync(filename).toString();
            console.log(fileName);
            dataCompound.push({
                [fileName]: fileContent
            });
            // parseRednotebookData(fileContent);
            /** remove the constraint below if parser is finished */

        };
    }
    return dataCompound;
}

const openMonth = exports.openMonth = (targetWindow, month, year) => {
    const filename = getFileName(new Date(year, month));

}

const getFileName = (notebookDate) => {
    if (typeof notebookDate == "undefined") {
        notebookDate = new Date();
    }
    const fileName = moment(notebookDate).format('YYYY-MM') + ".txt";
    return fileName;
}

console.log(getFileName());

const parseRednotebookData = (data) => {
    /**
     * @TODO:
     * parse data to a structure useful for javascript
     * structure: notebook={year:{month:{day:{text},day:{text}},month:{day:{text},day:{text}}}}
     * remove linebreaks
     * use filename as base!
     * 
     */
    console.log(data);

    return;

}

const importRedNotebook = data => {
    /**
     * idea to import all from RedNotebook files to a different plainfile format (real markdown) 
     */
}