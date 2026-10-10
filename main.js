const { app, BrowserWindow, screen, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 220,
    height: 430,
    x: Math.floor(width / 2 - 110), // Center horizontally
    y: 0,                           // Snap to top edge of screen
    transparent: true,              // Transparent window
    frame: false,                   // Frameless
    alwaysOnTop: true,              // Stay above normal windows
    skipTaskbar: false,             // Show on taskbar so you can see it running
    resizable: false,
    hasShadow: false,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Dynamic click-through:
  // When cursor is NOT over Spidey, clicks pass straight through to background windows
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
      win.setIgnoreMouseEvents(ignore, options);
    }
  });

  // Allow repositioning window via drag
  ipcMain.on('move-window', (event, { deltaX, deltaY }) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const [currentX, currentY] = mainWindow.getPosition();
    mainWindow.setPosition(currentX + deltaX, currentY + deltaY);
  });

  // Quit command from renderer
  ipcMain.on('quit-app', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});