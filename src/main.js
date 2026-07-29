import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import ManualService from '../gimbal_control/services/manual.service.js';
import AzElService from "../gimbal_control/services/azEl.service.js";
import DisplayService from "../gimbal_control/services/display.service.js"; //
import GpsService from '../gimbal_control/services/gps.service.js';

// imports for spawning Dump1090 as a process
import { spawn } from "child_process";

const manualService = new ManualService();
const azElService = new AzElService();
const displayservice = new DisplayService();
const gpsService = new GpsService();

let dump1090Process = null;


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

function startDump1090() {

    if (dump1090Process) {
        console.log("Dump1090 already running.");
        return;
    }

    const dump1090Path = path.join(
        process.cwd(),
        "Dump1090",
        "dump1090.exe"
    );

    console.log("Starting Dump1090...");
    console.log(dump1090Path);

    dump1090Process = spawn(
        dump1090Path,
        //["--interactive", "--net"],
        ["--net"],
        {
            windowsHide: false, //////////////// EVENTUALLY MAKE THIS TRUE SO WE DON'T SEE IT!!!
            stdio: "ignore",
        }
    );

    dump1090Process.stdout?.on("data", data => {
        console.log("[Dump1090]", data.toString());
    });

    dump1090Process.stderr?.on("data", data => {
        console.error("[Dump1090]", data.toString());
    });

    dump1090Process.on("close", code => {
        console.log(`Dump1090 exited with code ${code}`);
        dump1090Process = null;
    });
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  // I think this is where we add the services
  // This is basically the new controller I think
  // Then we also add to preload.js?

  startDump1090();

  // Manual
  ipcMain.handle("manualMove", async (_, direction, speed) => {
    return manualService.manualMove(direction, speed);
  });

  ipcMain.handle("manualStop", async () => {
    return manualService.stop();
  });

  // AzEl
  ipcMain.handle("azElPoint", async (_, azimuth, elevation) => {
    return azElService.pointTo(azimuth, elevation);
  });

  // Display
  ipcMain.handle("getAz", async () => {
    return displayservice.getAz();
  });

  ipcMain.handle("getEl", async () => {
    return displayservice.getEl();
  });

  // GPS
  ipcMain.handle("adsb", async (_, startLat, startLon, startEl, targetHexID, cameraPoint) => {
    return gpsService.adsb(startLat, startLon, startEl, targetHexID, cameraPoint);
  });

  ipcMain.handle("p5Point", async (_, startLat, startLon, startEl, targetCallsign, cameraPoint) => {
    return gpsService.p5Point(startLat, startLon, startEl, targetCallsign, cameraPoint);
  });

  ipcMain.handle("getP5Aircraft", async () => {
    return gpsService.getP5Aircraft();
  });

  ipcMain.handle("pointTo", async (_, startLat, startLon, startEl, destLat, destLon, destEl, cameraPoint) => {
    return gpsService.pointTo(startLat, startLon, startEl, destLat, destLon, destEl, cameraPoint);
  });



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
  if (dump1090Process) {
    dump1090Process.kill();
  }

  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
