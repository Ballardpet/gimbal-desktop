/*
import React from 'react';

export default function GPS() {
    return (
        <div>Put ALL the GPS stuff here</div>
    )
}
*/
import React, { useState, useRef, useEffect } from "react";

export default function GPS(){

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    // GPS point
    // default to easy calibration coordinates (point at window)
    const [startLat, setStartLat] = useState(30.48805497184136 );
    const [startLon, setStartLon] = useState(-86.4974440391438);
    const [startEl, setStartEl] = useState(0);
    const [destLat, setDestLat] = useState(30.488513065621497 );
    const [destLon, setDestLon] = useState(-86.49811890303361);
    const [destEl, setDestEl] = useState(1);

    // ADSB stuff
    const [target, setTarget] = useState("");

    // used for the buttons
    const [trackingMode, setTrackingMode] = useState(null); // null | "adsb" | "p5"
    // used for the loop
    const loopRef = useRef("none"); // "none" | "adsb" | "p5"

    const [targetLat, setTargetLat] = useState(0);
    const [targetLon, setTargetLon] = useState(0);
    const [targetEl, setTargetEl] = useState(0);

    const [cameraPoint, setCameraPoint] = useState(false);

    // P5
    const [p5Aircraft, setP5Aircraft] = useState([]);
    const [p5Target, setP5Target] = useState("");      // P5 callsign

    const handleClick = async() => {
        console.log("Put a relevant GPS message here");
        /**
        const res = await fetch("/api/gps/gpsPoint", { 
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startLat: startLat,
                startLon: startLon,
                startEl: startEl,
                destLat: destLat,
                destLon: destLon,
                destEl: destEl, 
                cameraPoint: cameraPoint
            }),
        });
        const data = await res.json(); */ ////////////////////////////////////////////////////////
        
        const data = await window.api.gpsPoint(
            startLat,
            startLon,
            startEl,
            destLat,
            destLon,
            destEl,
            cameraPoint
        );
        
        console.log(data);
    }

    const handleADSB = async() => {
        // handle start/stop & adsb/p5
        if (trackingMode === "adsb") {
            loopRef.current = "none";
            setTrackingMode(null);
            return;
        }

        loopRef.current = "adsb";
        setTrackingMode("adsb");

        while (loopRef.current === "adsb"){
            try {
                /*
                const res = await fetch("/api/gps/adsb", { //////////////////////////////////////////////////////////
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        startLat: startLat,
                        startLon: startLon,
                        startEl: startEl,
                        targetHexID: target, 
                        cameraPoint: cameraPoint
                    }),
                });
                const data = await res.json(); //////////////////////////////////////////////////////////
                */
                const data = await window.api.adsb(
                    startLat,
                    startLon,
                    startEl,
                    target,
                    cameraPoint
                );

                setTargetLat(data.lat);
                setTargetLon(data.lon);
                setTargetEl(data.el);
            }
            catch (err) {
                console.error(err);
            }
            // Call api every second
            await sleep (1000);
        }
    }

    const handleP5 = async () => {
        // handle start/stop & adsb/p5
        if (trackingMode === "p5") {
            loopRef.current = "none";
            setTrackingMode(null);
            return;
        }

        loopRef.current = "p5";
        setTrackingMode("p5");

        while (loopRef.current === "p5") {
            try {
                /*
                const res = await fetch("/api/gps/p5Point", { //////////////////////////////////////////////////////////
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        startLat,
                        startLon,
                        startEl,
                        targetCallsign: p5Target,
                        cameraPoint,
                    }),
                });

                const data = await res.json(); //////////////////////////////////////////////////////////
                */
                const data = await window.api.p5Point(
                    startLat,
                    startLon,
                    startEl,
                    p5Target,
                    cameraPoint
                );

                setTargetLat(data.lat);
                setTargetLon(data.lon);
                setTargetEl(data.el);
            }
            catch (err) {
                console.error(err);
            }

            // Update once per second
            await sleep(1000);
        }
    };

    // update display
    const loadP5Aircraft = async () => {
        try {
            //const res = await fetch("/api/gps/p5Aircraft"); //////////////////////////////////////////////////////////
            //const data = await res.json(); //////////////////////////////////////////////////////////

            const data = await window.api.getP5Aircraft();

            // Convert object into array
            setP5Aircraft(Object.values(data));
        }
        catch (err) {
            console.error(err);
        }
    }

    // update display
    useEffect(() => {
        loadP5Aircraft();

        const interval = setInterval(loadP5Aircraft, 1000);

        return () => clearInterval(interval);
    }, []);
    
    
    return (
        <section>
            <h2>Point to GPS Coordinate. Using DD </h2>


            <label><input type="checkbox" checked={cameraPoint} onChange={(e) => setCameraPoint(e.target.checked)}/>Camera Point: Adjust "level" to be flat or forward</label>
            
            <br />
            
            <label htmlFor="currentLat">Current Latitude: </label>
            <input type="text" id="currentLat" name="currentLat" value={startLat} onChange={(e) => setStartLat(e.target.value)}/>
            <label htmlFor="currentLong">Current Longitude: </label>
            <input type="text" id="currentLong" name="currentLong" value={startLon} onChange={(e) => setStartLon(e.target.value)}/>
            <label htmlFor="currentEl">Current Elevation: </label>
            <input type="text" id="currentEl" name="currentEl" value={startEl} onChange={(e) => setStartEl(e.target.value)}/>

            <br />

            <label htmlFor="destinationLat">Destination Latitude: </label>
            <input type="text" id="destinationLat" name="destinationLat" value={destLat} onChange={(e) => setDestLat(e.target.value)}/>
            <label htmlFor="destinationLong">Destination Longitude: </label>
            <input type="text" id="destinationLong" name="destinationLong" value={destLon} onChange={(e) => setDestLon(e.target.value)}/>
            <label htmlFor="destinationEl">Destination Elevation: </label>
            <input type="text" id="destinationEl" name="destinationEl" value={destEl} onChange={(e) => setDestEl(e.target.value)}/>
            <br />
            <button type="button" className="automated" onClick={() => handleClick()}>Point to coordinates</button>

            <br />

            <h2>Track ADS-B</h2>
            <label htmlFor="target">Enter target hex code: </label>
            <input type="text" id="target" name = "target" value={target} onChange={(e) => setTarget(e.target.value)} />
            <div>Target Latitude: {targetLat} Target Longitue: {targetLon} Target Elevation: {targetEl}</div>
            <button type="button" className="automated" onClick={handleADSB} style={{backgroundColor: trackingMode === "adsb" ? "red" : "green",color: "white"}}>{trackingMode === "adsb"? "Stop Tracking": "Start Tracking"}</button>

            <br />

            <h2>Track P5</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Callsign</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Altitude (m)</th>
                    </tr>
                </thead>

                <tbody>
                    {p5Aircraft.map((aircraft) => (
                        <tr
                            key={aircraft.callsign}
                            className={p5Target === aircraft.callsign ? "selected-aircraft" : ""}
                            onClick={() => setP5Target(aircraft.callsign)}
                            style={{ cursor: "pointer" }}
                        >
                            <td>{aircraft.callsign}</td>
                            <td>{aircraft.lat.toFixed(6)}</td>
                            <td>{aircraft.lon.toFixed(6)}</td>
                            <td>{aircraft.alt.toFixed(1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <label htmlFor="p5Target">Selected Callsign: </label>
                <input
                    type="text"
                    id="p5Target"
                    value={p5Target}
                    onChange={(e) => setP5Target(e.target.value)}
                />
            
            <br />
            
            <button
                type="button"
                className="automated"
                onClick={handleP5}
                style={{
                    backgroundColor: trackingMode === "p5" ? "red" : "green",
                    color: "white"
                }}
            >
                {trackingMode === "p5"? "Stop Tracking": "Start Tracking"}
            </button>

        </section>
    )   
}