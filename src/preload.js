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

    // Put amplifier functions here
    enableRF: () =>
        ipcRenderer.invoke("enableRF"),

    disableRF: () =>
        ipcRenderer.invoke("disableRF"),

    clearFaults: () =>
        ipcRenderer.invoke("clearFaults"),

    softwareReset: () =>
        ipcRenderer.invoke("softwareReset"),

    setAttenuation: (decibels) =>
        ipcRenderer.invoke("setAttenuation", decibels),

    getModuleState: () =>
        ipcRenderer.invoke("getModuleState"),

    getTemp: () =>
        ipcRenderer.invoke("getTemp"),

    getVoltage: () =>
        ipcRenderer.invoke("getVoltage"),

    getCurrent: () =>
        ipcRenderer.invoke("getCurrent"),

    getFaults: () =>
        ipcRenderer.invoke("getFaults"),

    getTempAlarmStatus: () =>
        ipcRenderer.invoke("getTempAlarmStatus"),
});