import React, { useState, useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// It takes a very long time to load the larger map. Might have to use a different one
import world from "../data/0.05_crisp.json"; // 5.84 seconds to load after running start
//import world from "../data/crisp_world.json"; // 12.10 seconds to load after running start
//import world from "../data/world.json"; // 4.30 seconds to load after running start

 
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

    const [tracking, setTracking] = useState(false);
    const trackingRef = useRef(false);

    const [targetLat, setTargetLat] = useState(0);
    const [targetLon, setTargetLon] = useState(0);
    const [targetEl, setTargetEl] = useState(0);

    const [cameraPoint, setCameraPoint] = useState(false);

    const [allAircraft, setAllAircraft] = useState([]);
    const [trackingFilter, setTrackingFilter] = useState("all");

    const mapRef = useRef(null)
    const leafletMapRef = useRef(null);
    const aircraftLayerRef = useRef(null);

    const filteredAircraft = allAircraft.filter(
        (aircraft) =>
            trackingFilter === "all" ||
            aircraft.trackingType?.toLowerCase() === trackingFilter
    );

    const getAircraftIcon = (aircraft) => {

        let color = "blue";

        if (aircraft.trackingType === "p5") {
            color = "red";
        }

        if (aircraft.id === target) {
            color = "green";
        }

        return L.divIcon({
            className: "aircraft-marker",
            html: `<span style="color:${color}">✈</span>`,
            iconSize: [30,30],
            iconAnchor:[15,15]
        });
    };

    const handleClick = async() => {
        console.log("Put a relevant GPS message here");

        const data = await window.api.pointTo(
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

    const handleTracking = async () => {
        if (trackingRef.current) {
            trackingRef.current = false;
            setTracking(false);
            return;
        }

        trackingRef.current = true;
        setTracking(true);

        while (trackingRef.current) {
            try {
                const data = await window.api.gpsPoint(
                    startLat,
                    startLon,
                    startEl,
                    target,
                    cameraPoint
                );

                if (data) {
                    setTargetLat(data.lat);
                    setTargetLon(data.lon);
                    setTargetEl(data.el);
                }
            }
            catch (err) {
                console.error(err);
            }

            await sleep(1000);
        }
    };

    // update display
    const loadAllAircraft = async () => {
        try {
            const data = await window.api.getAllAircraft();

            // Convert object into array
            setAllAircraft(Object.values(data));
        }
        catch (err) {
            console.error(err);
        }
    }

    // update display
    useEffect(() => {
        loadAllAircraft();

        const interval = setInterval(loadAllAircraft, 1000);

        return () => clearInterval(interval);
    }, []);

    // Maybe?
    useEffect(() => {
        return () => {
            trackingRef.current = false;
        };
    }, []);

    useEffect(() => {
        const map = L.map(mapRef.current).setView([30.4719, -86.5422], 7);
        
        leafletMapRef.current = map;
        
        L.geoJSON(world, {
            style: {
                color: "#666666",
                weight: 0.5,
                //fillColor: "#d9d9d9",
                fillColor: "#d9d9d9",
                fillOpacity: 1
            }
        }).addTo(map);
        return () => {
            map.remove();
        };
    }, []);
    
    useEffect(() => {

        if (!leafletMapRef.current) return;

        if (aircraftLayerRef.current) {
            aircraftLayerRef.current.clearLayers();
        }

        const markers = L.layerGroup();

        filteredAircraft.forEach((aircraft) => {

            if (!aircraft.lat || !aircraft.lon) return;

            const marker = L.marker(
                [
                    aircraft.lat,
                    aircraft.lon
                ],
                {
                    icon: getAircraftIcon(aircraft)
                }
            );

            marker.bindPopup(`
                <b>${aircraft.id}</b><br>
                Altitude: ${aircraft.alt ?? "--"} m
            `);

            marker.on("click", () => {
                setTarget(aircraft.id);
            });

            markers.addLayer(marker);
        });

        markers.addTo(leafletMapRef.current);

        aircraftLayerRef.current = markers;

    }, [filteredAircraft]);
    
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





            <h2>Track Aircraft</h2>

            <label htmlFor="target">Selected Target: </label>
                <input
                    type="text"
                    id="target"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                />
            
            <br />

            <div>Target Latitude: {targetLat ?? "--"} Target Longitude: {targetLon ?? "--"} Target Elevation: {targetEl ?? "--"}</div>
            
            <button
                type="button"
                className="automated"
                onClick={handleTracking}
                style={{
                    backgroundColor: tracking ? "red" : "green",
                    color: "white"
                }}
            >
                {tracking ? "Stop Tracking" : "Start Tracking"}
            </button>

            <label htmlFor="trackingType">Filter Tracking Type: </label>
            <select id="trackingType" className="trackingType" value={trackingFilter} onChange={(e) => setTrackingFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="adsb">ADSB</option>
                <option value="p5">P5</option>
            </select>

            <div ref={mapRef} className="map"></div>
            
            <div className="aircraft-table">
                <table border="1">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Altitude (m)</th>
                            <th>Tracking Type</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAircraft.map((aircraft) => (
                            <tr
                                key={aircraft.id}
                                className={target === aircraft.id ? "selected-aircraft" : ""}
                                onClick={() => setTarget(aircraft.id)}
                                style={{ cursor: "pointer" }}
                            >
                                <td>{aircraft.id}</td>
                                <td>{aircraft.lat?.toFixed(6) ?? "--"}</td>
                                <td>{aircraft.lon?.toFixed(6) ?? "--"}</td>
                                <td>{aircraft.alt?.toFixed(1) ?? "--"}</td>
                                <td>{aircraft.trackingType}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            

        </section>
    )   
}