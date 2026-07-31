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

    // Tracking stuff
    const [target, setTarget] = useState("");

    const [tracking, setTracking] = useState(false);
    const trackingRef = useRef(false);

    const [targetLat, setTargetLat] = useState(0);
    const [targetLon, setTargetLon] = useState(0);
    const [targetEl, setTargetEl] = useState(0);

    // Option to tilt the face of the gimbal 90 degrees. If you have a camera attached instead of an antennta
    const [cameraPoint, setCameraPoint] = useState(false);

    // List of aircraft and it's filter
    const [allAircraft, setAllAircraft] = useState([]);
    const [trackingFilter, setTrackingFilter] = useState("all");

    // Creation of the map
    const mapRef = useRef(null)
    const leafletMapRef = useRef(null);

    // Display aircraft on the map
    const aircraftLayerRef = useRef(null);

    // Filter aircraft by tracking type
    const filteredAircraft = allAircraft.filter(
        (aircraft) =>
            trackingFilter === "all" ||
            aircraft.trackingType?.toLowerCase() === trackingFilter
    );

    // Generate an icon of the appropriate specifications for an aircraft
    const getAircraftIcon = (aircraft) => {

        // Default catch-all in case I forget to specify color of a new tracking type
        let color = "black";

        if (aircraft.trackingType === "adsb") {
            color = "blue";
        }

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

    // Point to GPS coordinates
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

    // Track aircraft
    const handleTracking = async () => {
        // Turn tracking off if it's already running when you press the button
        if (trackingRef.current) {
            trackingRef.current = false;
            setTracking(false);
            return;
        }

        // Set tracking tracker to true when program starts
        trackingRef.current = true;
        setTracking(true);

        // Run until tracking is turned off
        while (trackingRef.current) {
            try {
                // Call the function to point to the aircraft
                const data = await window.api.gpsPoint(
                    startLat,
                    startLon,
                    startEl,
                    target,
                    cameraPoint
                );

                // Set LLA for display
                if (data) {
                    setTargetLat(data.lat);
                    setTargetLon(data.lon);
                    setTargetEl(data.el);
                }
            }
            catch (err) {
                console.error(err);
            }

            // Wait a second then loop again
            await sleep(1000);
        }
    };

    // Update the list of all aircraft
    const loadAllAircraft = async () => {
        try {
            // Call function to get list of aircrat
            const data = await window.api.getAllAircraft();

            // Convert object into array
            setAllAircraft(Object.values(data));
        }
        catch (err) {
            console.error(err);
        }
    }

    // Update every second
    useEffect(() => {
        loadAllAircraft();

        const interval = setInterval(loadAllAircraft, 1000);

        return () => clearInterval(interval);
    }, []);

    // Stop tracking if the aircraft is gone
    useEffect(() => {
        return () => {
            trackingRef.current = false;
        };
    }, []);

    // Create the map
    useEffect(() => {
        // Create a map that points to current coordinates at zoom 7
        const map = L.map(mapRef.current).setView([30.4719, -86.5422], 7);
        
        // Make the reference reference this map
        leafletMapRef.current = map;
        
        // Add styling to the map
        L.geoJSON(world, {
            style: {
                color: "#666666",
                weight: 0.5,
                fillColor: "#d9d9d9",
                fillOpacity: 1
            }
        }).addTo(map);

        // Cleans up the map
        return () => {
            map.remove();
        };
    }, []);
    
    // Update the map when the list of filtered aircraft changes
    useEffect(() => {

        // Stop if the map doesn't exist yet
        if (!leafletMapRef.current) return;

        // Clear the layer if one already exists
        if (aircraftLayerRef.current) {
            aircraftLayerRef.current.clearLayers();
        }

        // Make a new layer to hold the aircraft
        const markers = L.layerGroup();

        // For each aircraft
        filteredAircraft.forEach((aircraft) => {

            // Don't try to display an aircraft without lat and lon
            if (!aircraft.lat || !aircraft.lon) return;

            // Make a new market at the right spot with appropriate styling
            const marker = L.marker(
                [
                    aircraft.lat,
                    aircraft.lon
                ],
                {
                    icon: getAircraftIcon(aircraft)
                }
            );

            // Creates a popup when you hover over an aircraft
            marker.bindPopup(`
                <b>${aircraft.id}</b><br>
                Altitude: ${aircraft.alt != null ? aircraft.alt.toFixed(0) : "--"} m
            `);

            // Makes it so you can see the popup my mousing over it, not click it
            marker.on("mouseover", () => marker.openPopup());
            marker.on("mouseout", () => marker.closePopup());

            // Set this aircraft as target when you click it
            marker.on("click", () => {
                setTarget(aircraft.id);
            });

            // Add this marker to the layer group
            markers.addLayer(marker);
        });

        // Add all markers to the map
        markers.addTo(leafletMapRef.current);

        // Reference this layergroup to be cleared the next time this function is called
        aircraftLayerRef.current = markers;

    }, [filteredAircraft]);
    
    // Use DD
    return (
        <section>
            <h2 className="center_elements header-with-subtext">Point to GPS Coordinates</h2>
            <h4 className="center_elements subtext-header">(Use DD)</h4>

            <label className="center_elements"><input type="checkbox" checked={cameraPoint} onChange={(e) => setCameraPoint(e.target.checked)}/>Camera Point: Adjust "level" to be flat or forward</label>
            
            <br />
            <div className="center_elements">
                <label htmlFor="currentLat">Current Latitude: </label>
                <input type="text" id="currentLat" name="currentLat" value={startLat} onChange={(e) => setStartLat(e.target.value)}/>
                <label htmlFor="currentLong">Current Longitude: </label>
                <input type="text" id="currentLong" name="currentLong" value={startLon} onChange={(e) => setStartLon(e.target.value)}/>
                <label htmlFor="currentEl">Current Elevation: </label>
                <input type="text" id="currentEl" name="currentEl" value={startEl} onChange={(e) => setStartEl(e.target.value)}/>
            </div>

            <br />

            <div className="center_elements">
                <label htmlFor="destinationLat">Destination Latitude: </label>
                <input type="text" id="destinationLat" name="destinationLat" value={destLat} onChange={(e) => setDestLat(e.target.value)}/>
                <label htmlFor="destinationLong">Destination Longitude: </label>
                <input type="text" id="destinationLong" name="destinationLong" value={destLon} onChange={(e) => setDestLon(e.target.value)}/>
                <label htmlFor="destinationEl">Destination Elevation: </label>
                <input type="text" id="destinationEl" name="destinationEl" value={destEl} onChange={(e) => setDestEl(e.target.value)}/>
            </div>
            <br />
            <div className="center_elements"><button type="button" className="automated" onClick={() => handleClick()}>Point to coordinates</button></div>

            <h2 className="center_elements">Track Aircraft</h2>

            <div className="center_elements">
                <label htmlFor="target" >Selected Target: </label>
                    <input
                        type="text"
                        id="target"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                    />
            </div>

            <div className="center_elements">Target Latitude: {targetLat ?? "--"} Target Longitude: {targetLon ?? "--"} Target Elevation: {targetEl ?? "--"}</div>
            
            <div className="center_elements">
                <label htmlFor="trackingType">Filter Tracking Type: </label>
                <select id="trackingType" className="trackingType" value={trackingFilter} onChange={(e) => setTrackingFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="adsb">ADSB</option>
                    <option value="p5">P5</option>
                </select>

                <div>     </div>

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
            </div>

            <br/>

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