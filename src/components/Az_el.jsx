/*import React from 'react';

export default function Az_el() {
    return (
        <div>Put the point-to stuff here</div>
    )
}
*/

// This will allow the user to input azimuth and elevation to point the gimbal towards
import React, { useState, useRef } from "react";

export default function Az_el(){

    const [azimuth, setAzimuth] = useState(180);
    const [elevation, setElevation] = useState(90);
    
    const handleClick = async() => {
        console.log(azimuth, elevation)
        const data = await window.api.azElPoint(azimuth, elevation);
        console.log(data);
    }

    return (
        <section>
            <h2>Point to Azimuth/Elevation: Default Points South</h2>
            <label htmlFor="azimuth">Destination Azimuth,0 to 360.00: </label>
            <input type="text" id="azimuth" name = "azimuth" value={azimuth} onChange={(e) => setAzimuth(e.target.value)} />
            <br />
            <label htmlFor ="elevation">Destination Elevation, -90.00 to 90.00: </label>
            <input type="text" id="elevation" name="elevation" value={elevation} onChange={(e) => setElevation(e.target.value)}/>
            <br />
            <button type="button" className="automated" onClick={() => handleClick()}>Point to az/el</button>
        </section>
    )
}