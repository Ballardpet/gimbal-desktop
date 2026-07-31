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

    gpsPoint: (startLat, startLon, startEl, targetID, cameraPoint) => 
        ipcRenderer.invoke("gpsPoint", startLat, startLon, startEl, targetID, cameraPoint),

    getAllAircraft: () => 
        ipcRenderer.invoke("getAllAircraft"),

    pointTo: (startLat, startLon, startEl, destLat, destLon, destEl, cameraPoint) => 
        ipcRenderer.invoke("pointTo", startLat, startLon, startEl, destLat, destLon, destEl, cameraPoint),

});