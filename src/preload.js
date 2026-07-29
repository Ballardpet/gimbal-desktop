// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
    manualMove: (direction, speed) =>
        ipcRenderer.invoke("manualMove", direction, speed),

    manualStop: () =>
        ipcRenderer.invoke("manualStop"),

    azElPoint: (azimuth, elevation) =>
        ipcRenderer.invoke("azElPoint", azimuth, elevation),

    getAz: () => 
        ipcRenderer.invoke("getAz"),

    getEl: () => 
        ipcRenderer.invoke("getEl"),

    //////////

    adsb: (startLat, startLon, startEl, targetHexID, cameraPoint) => 
        ipcRenderer.invoke("adsb", startLat, startLon, startEl, targetHexID, cameraPoint),

    p5Point: (startLat, startLon, startEl, targetCallsign, cameraPoint) => 
        ipcRenderer.invoke("p5Point", startLat, startLon, startEl, targetCallsign, cameraPoint),

    getP5Aircraft: () => 
        ipcRenderer.invoke("getP5Aircraft"),

    pointTo: () => 
        ipcRenderer.invoke("pointTo", startLat, startLon, startEl, destLat, destLon, destEl, cameraPoint),

});