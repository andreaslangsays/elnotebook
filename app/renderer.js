const { remote, ipcRenderer } = require('electron');
const path = require('path');
const mainProcess = remote.require('./main.js');
const currentWindow = remote.getCurrentWindow();

const marked = require('marked');
const moment = require("moment");
const Pikaday = require("pikaday");
const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-folder');
const openFolderButton = document.querySelector('#open-folder');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');
let picker;

let filePath = null;
let originalContent = '';

const isDifferentContent = (content) => content !== markdownView.value;

const renderMarkdownToHtml = (markdown) => {
    htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const renderFile = (file, content) => {
    filePath = file;
    originalContent = content;

    markdownView.value = content;
    renderMarkdownToHtml(content);

    updateUserInterface(false);
};

const updateUserInterface = (isEdited) => {
    let title = moment.format();

    if (filePath) { title = `${path.basename(filePath)} - ${title}`; }
    if (isEdited) { title = `${title} (Edited)`; }

    currentWindow.setTitle(title);
    currentWindow.setDocumentEdited(isEdited);

    saveMarkdownButton.disabled = !isEdited;
    revertButton.disabled = !isEdited;
};

markdownView.addEventListener('keyup', (event) => {
    const currentContent = event.target.value;
    renderMarkdownToHtml(currentContent);
    updateUserInterface(currentContent !== originalContent);
});

newFileButton.addEventListener('click', () => {
    mainProcess.createWindow();
});

saveMarkdownButton.addEventListener('click', () => {
    mainProcess.saveMarkdownc;
});

revertButton.addEventListener('click', () => {
    markdownView.value = originalContent;
    renderMarkdownToHtml(originalContent);
});

saveHtmlButton.addEventListener('click', () => {
    mainProcess.saveHtml(currentWindow, htmlView.innerHTML);
});
openFolderButton.addEventListener('click', () => {
    const result = mainProcess.openFolder(currentWindow);
    /** this action has to lead to reading all dates and update calendar entries in pickaday! */
    console.log(result);
})
ipcRenderer.on('file-opened', (event, file, content) => {
    if (currentWindow.isDocumentEdited() && isDifferentContent(content)) {
        const result = remote.dialog.showMessageBox(currentWindow, {
            type: 'warning',
            title: 'Overwrite Current Unsaved Changes?',
            message: 'Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?',
            buttons: [
                'Yes',
                'Cancel',
            ],
            defaultId: 0,
            cancelId: 1,
        });

        if (result === 1) { return; }
    }

    renderFile(file, content);
});

ipcRenderer.on('file-changed', (event, file, content) => {
    if (!isDifferentContent(content)) return;
    const result = remote.dialog.showMessageBox(currentWindow, {
        type: 'warning',
        title: 'Overwrite Current Unsaved Changes?',
        message: 'Another application has changed this file. Load changes?',
        buttons: [
            'Yes',
            'Cancel',
        ],
        defaultId: 0,
        cancelId: 1
    });

    renderFile(file, content);
});

/* Implement Drag and Drop */
document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('dragleave', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];

const fileTypeIsSupported = (file) => {
    return ['text/plain', 'text/markdown'].includes(file.type);
};

markdownView.addEventListener('dragover', (event) => {
    const file = getDraggedFile(event);

    if (fileTypeIsSupported(file)) {
        markdownView.classList.add('drag-over');
    } else {
        markdownView.classList.add('drag-error');
    }
});

markdownView.addEventListener('dragleave', () => {
    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
});

markdownView.addEventListener('drop', (event) => {
    const file = getDroppedFile(event);

    if (fileTypeIsSupported(file)) {
        mainProcess.openFile(currentWindow, file.path);
    } else {
        alert('That file type is not supported');
    }

    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
});
/*
openInDefaultButton.addEventListener('click', () => {
    console.log("irre");
    mainProcess.openFolder(currentWindow);
})
*/
const addDate = exports.addDate = (eventData) => {
    if (typeof(picker) == "undefined") {
        return false;
    }
    picker.events.push(eventData)
}

! function() {
    var data = [
        { eventName: 'Lunch Meeting w/ Mark', calendar: 'Work', color: 'orange' },
        { eventName: 'Interview - Jr. Web Developer', calendar: 'Work', color: 'orange' },
        { eventName: 'Demo New App to the Board', calendar: 'Work', color: 'orange' },
        { eventName: 'Dinner w/ Marketing', calendar: 'Work', color: 'orange' },

    ];


    //var calendar = new Calendar('#calendar', data);
    let eventData = ['Fri Feb 07 2020', 'Wed Feb 12 2020', ];
    picker = new Pikaday({
        field: document.getElementById('datepicker'),
        container: document.getElementById('calendarview'),
        events: eventData,
        firstDay: 1,
        minDate: new Date(1970, 0, 1),
        maxDate: new Date(2040, 12, 31),
        yearRange: [1970, 2040],
        bound: false,
    });
}();