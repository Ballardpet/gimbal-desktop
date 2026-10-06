import React, { useState, useRef } from "react";

export default function Amplifier(){
    // Put actual shit up here
    // Do I make a distinction for if we're 
    return (
        <section>
            <h2 className="center_elements">Amplifier Control</h2>
            <div className="center_elements">
                <button>Enable RF</button>
                <button>Disable RF</button>
                <button>Clear Faults</button>
                <button>Software Reset</button>
            </div>
            <div className="center_elements">
                <label htmlFor ="attenuation">Attenuation(db)(find actual range): </label>
                <input type="range" min="1" max="40" className="slider " id="attenuation" name="attenuation" />
            </div>
            
            <h2 className="center_elements">Amplifier Telemetry</h2>
            <div className="center_elements">Module State: </div>
            <div className="center_elements">Temperature: </div>
            <div className="center_elements">Voltage: </div>
            <div className="center_elements">Current: </div>
            <div className="center_elements">Faults: </div>
            <div className="center_elements">Temp Alarm: </div>
        </section>
    )
}