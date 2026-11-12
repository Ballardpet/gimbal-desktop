import React, { useState, useRef, useEffect } from "react";

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
    const [attenuation, setAttenuationValue] = useState(0);

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

    const softReset = async () => {
        const data = await window.api.softReset();
        console.log(data);
    }

    const setAttenuation = async () => {
        const data = await window.api.setAttenuation(attenuation);
        console.log(data);
    }

    const sendTestCommand = async () => {
        const data = await window.api.sendTestCommand();
        console.log(data);
    }

    
    // Reference Display.jsx for telemetry info
    // maybe consolidate the fetches a bit
    // Call all every second maybe?
    // fetchModState should cover everything relevant
    const fetchModState = async () => {
        try {
            const mod = await window.api.getModuleState();

            setTemperature(mod.temperature);
            setVoltage(mod.voltage);
            setCurrent(mod.totalCurrent);
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

    useEffect(() => {
        // fetch immediately on mount
        fetchModState();

        // then fetch repeatedly
        const interval = setInterval(() => {
            fetchModState();
        }, 1000); // every 1 second

        // cleanup when component unmounts
        return () => clearInterval(interval);
    }, []);

    return (
        <section>
            <h2 className="center_elements">Amplifier Control</h2>
            <div className="center_elements">
                <button onClick={() => enableRF()}>Enable RF</button>
                <button onClick={() => disableRF()}>Disable RF</button>
                <button onClick={() => clearFaults()}>Clear Faults</button>
                <button onClick={() => softReset()}>Soft Reset</button>
                <button onClick={() => sendTestCommand()}>Test Command</button>
            </div>
            <div className="center_elements">
                <label htmlFor ="attenuation">Attenuation(db){attenuation.toFixed(1)}: </label>
                <input type="range" min="0" max="31.5" step="0.1" className="slider " id="attenuation" name="attenuation" value={attenuation} onChange={(e) => setAttenuationValue(Number(e.target.value))} />
            </div>
            <div className="center_elements" onClick={() => setAttenuation()}><button>Set Attenuation</button></div>
            
            <h2 className="center_elements">Amplifier Telemetry</h2>
            <div className="center_elements">Module State: {moduleState}</div>
            <div className="center_elements">Temperature: {temperature} F</div>
            <div className="center_elements">Voltage: {voltage} V</div>
            <div className="center_elements">Current: {current} A</div>
            <div className="center_elements">Faults: {faults}</div>
            <div className="center_elements">Temp Alarm: {tempAlarm}</div>
        </section>
    )
}