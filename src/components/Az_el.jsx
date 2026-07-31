import React, { useState, useRef } from "react";

// Hmmm azel point only works after i enter numbers. even with 180 and 90 pre-loaded

export default function Az_el(){

    const [azimuth, setAzimuth] = useState(180);
    const [elevation, setElevation] = useState(90);
    
    const handleClick = async() => {
        console.log(azimuth, elevation)
        const data = await window.api.azElPoint((azimuth - 180), elevation); // send azimuth-180 because of the change I made to which way the gimbal should point. Towards the gulf for tests
        console.log(data);
    }

    return (
        <section>
            <h2 className="center_elements header-with-subtext">Point to Azimuth/Elevation</h2>
            <h4 className="center_elements subtext-header">(Default Points South)</h4>
            <div className="center_elements">
                <label htmlFor="azimuth">Destination Azimuth,0 to 360.00: </label>
                <input type="text" id="azimuth" name = "azimuth" value={azimuth} onChange={(e) => setAzimuth(Number(e.target.value))} />
            </div>
            <br />
            <div className="center_elements">
                <label htmlFor ="elevation">Destination Elevation, -90.00 to 90.00: </label>
                <input type="text" id="elevation" name="elevation" value={elevation} onChange={(e) => setElevation(Number(e.target.value))}/>
            </div>
            <br />
            <div className="center_elements"><button type="button" className="automated" onClick={() => handleClick()}>Point to az/el</button></div>
        </section>
    )
}

