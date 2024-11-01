const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs'); 

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

function createWindow (){
  // Create the browser window.
  mainWindow = new BrowserWindow({
    fullscreen:true,
    frame:false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/products.html`);
  // Remove the default menu
  mainWindow.setMenu(null);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle quit-app signal from renderer process
ipcMain.on('quit-app', () => {
  app.quit();
});

// IPC for reading favorites
ipcMain.on('read-favorites', () => {
  const filePath = path.join(__dirname, 'favorites.txt');
  if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      mainWindow.webContents.send('read-favorites-reply', JSON.parse(data));
  } else {
      mainWindow.webContents.send('read-favorites-reply', []);
  }
});

// IPC for removing a favorite
ipcMain.on('remove-favorite', (event, productId) => {
  const filePath = path.join(__dirname, 'favorites.txt');
  if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const favorites = JSON.parse(data);
      const updatedFavorites = favorites.filter(favorite => favorite.id !== productId);
      fs.writeFileSync(filePath, JSON.stringify(updatedFavorites), 'utf-8');
      mainWindow.webContents.send('read-favorites-reply', updatedFavorites);
  }
});

// IPC for editing a favorite
ipcMain.on('edit-favorite', (event, favorite) => {
  const filePath = path.join(__dirname, 'favorites.txt');
  if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const favorites = JSON.parse(data);
      const updatedFavorites = favorites.map(f => f.id === favorite.id ? favorite : f);
      fs.writeFileSync(filePath, JSON.stringify(updatedFavorites), 'utf-8');
      mainWindow.webContents.send('read-favorites-reply', updatedFavorites);
  }
});