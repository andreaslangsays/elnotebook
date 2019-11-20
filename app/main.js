const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

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
    console.log(folder);
    console.log(getFileName());
    //if (folder) { openPath(targetWindow, folder); };

};

const openMonth = exports.openMonth = (targetWindow, month) => {

}

const getFileName = (notebookDate) => {
    if (typeof notebookDate == "undefined") {
        notebookDate = new Date();
    }
    const fileName = moment(notebookDate).format('YYYY-MM') + ".txt";
    return fileName;
}

console.log(getFileName());