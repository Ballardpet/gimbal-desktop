// Eventually make some sort of graphic?
import React, { useState, useEffect } from "react";

// MAYBE MAKE AN INDICATOR TO DISPLAY IF YOU ARE CONNECTED TO THE GIMBAL OR NOT!!!

export default function Display(){
    const [azimuth, setAzimuth] = useState(0);
    const [elevation, setElevation] = useState(0);

    // function to fetch data
    const fetchAzEl = async () => {
        try {

            const az = await window.api.getAz();
            const el = await window.api.getEl();

            setAzimuth(az);
            setElevation(el);

            console.log(az, el);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        // fetch immediately on mount
        fetchAzEl();

        // then fetch repeatedly
        const interval = setInterval(() => {
            fetchAzEl();
        }, 1000); // every 1 second

        // cleanup when component unmounts
        return () => clearInterval(interval);
    }, []);


    return (
        <section>
            <h2 className="center_elements">Gimbal Orientation</h2>
            <div className="center_elements">Current Azimuth: {azimuth}</div>
            <div className="center_elements">Current Elevation: {elevation}</div>
        </section>
    )
}