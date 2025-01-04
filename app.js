const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path')
const { v4: uuidv4 } = require("uuid");
const screenshot = require('screenshot-desktop');

const socket = require('socket.io-client')('http://localhost:5000');
let interval;

function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 150,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })

    win.removeMenu();
    win.webContents.openDevTools();
    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


ipcMain.on("start-share", function (event, arg) {
    try {
        let uuid = uuidv4();
        socket.emit("join-message", uuid);
        event.reply("uuid", uuid);

        interval = setInterval(function () {
            screenshot().then((img) => {
                let imgStr = new Buffer(img).toString('base64');

                let obj = {};
                obj.room = uuid;
                obj.image = imgStr;

                socket.emit("screen-data", JSON.stringify(obj));
            }).catch(err => {
                console.log(err);
            })
        }, 100)
    } catch (err) {
        console.log(err);
    }
    //Take continuous screenshot

    //Broadcast to other user
});

ipcMain.on("stop-share", function (event, arg) {
    // Stop Boradcasting & Screencapturing
    clearInterval(interval);

});