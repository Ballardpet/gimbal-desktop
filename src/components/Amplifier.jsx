import React, { useState, useRef } from "react";

// MAKE A FUNCTION TO ACTUALLY UPDATE THE DISPLAY!!!
    // Probably call all fetch functions once every second or something

export default function Amplifier(){
    // Put actual shit up here
    const [moduleState, setModuleState] = useState(null);
    const [temperature, setTemperature] = useState(0);
    const [voltage, setVoltage] = useState(0);
    const [current, setCurrent] = useState(0);
    const [faults, setFaults] = useState([]);
    const [tempAlarm, setTempAlarm] = useState(null);
    
    // Reference Manual_Control.jsc for control info
    const enableRF = async () => {
        const data = await window.api.enableRF();
        console.log(data);
    }

    const disableRF = async () => {
        const data = await window.api.disableRF();
        console.log(data);
    }

    const clearFaults = async () => {
        const data = await window.api.clearFaults();
        console.log(data);
    }

    const softwareReset = async () => {
        const data = await window.api.softwareReset();
        console.log(data);
    }

    const setAttenuation = async () => {
        const attenuation = document.getElementById("attenuation").value
        const data = await window.api.setAttenuation(attenuation);
        console.log(data);
    }
    
    // Reference Display.jsx for telemetry info
    // maybe consolidate the fetches a bit
    // Call all every second maybe?
    const fetchModState = async () => {
        try{
            const mod = await window.api.getModuleState();
            setModuleState(mod);
        }
        catch (error) {
            console.error(error);
        }
    };

    const fetchTemperature = async () => {
        try{
            const mod = await window.api.getTemperature();
            setTemperature(mod);
        }
        catch (error) {
            console.error(error);
        }
    };

    const fetchVoltage = async () => {
        try{
            const mod = await window.api.getVoltage();
            setVoltage(mod);
        }
        catch (error) {
            console.error(error);
        }
    };

    const fetchCurrent = async () => {
        try{
            const mod = await window.api.getCurrent();
            setCurrent(mod);
        }
        catch (error) {
            console.error(error);
        }
    };

    const fetchFaults = async () => {
        try{
            const mod = await window.api.getFaults();
            setFaults(mod);
        }
        catch (error) {
            console.error(error);
        }
    };
    const fetchTempAlarm = async () => {
        try{
            const mod = await window.api.getTempAlarmStatus();
            setTempAlarm(mod);
        }
        catch (error) {
            console.error(error);
        }
    };

    return (
        <section>
            <h2 className="center_elements">Amplifier Control</h2>
            <div className="center_elements">
                <button onClick={() => enableRF()}>Enable RF</button>
                <button onClick={() => disableRF()}>Disable RF</button>
                <button onClick={() => clearFaults()}>Clear Faults</button>
                <button onClick={() => softwareReset()}>Software Reset</button>
            </div>
            <div className="center_elements">
                <label htmlFor ="attenuation">Attenuation(db)(find actual range)(maybe show the attenuation): </label>
                <input type="range" min="0" max="40" className="slider " id="attenuation" name="attenuation" />
            </div>
            <div className="center_elements" onClick={() => setAttenuation()}><button>Set Attenuation</button></div>
            
            <h2 className="center_elements">Amplifier Telemetry</h2>
            <div className="center_elements">Module State: {moduleState}</div>
            <div className="center_elements">Temperature: {temperature}</div>
            <div className="center_elements">Voltage: {voltage}</div>
            <div className="center_elements">Current: {current}</div>
            <div className="center_elements">Faults: {faults}</div>
            <div className="center_elements">Temp Alarm: {tempAlarm}</div>
        </section>
    )
}