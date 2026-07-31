import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import world from "../data/crisp_world.json";
// import world from "../data/world.json";

//import ne_50m_admin_0_countries.json

// maybe actually use protomaps and maplibre

// maybe pm tiles with leaflet? https://docs.protomaps.com/pmtiles/leaflet

// This map might be what I'm looking for: https://www.naturalearthdata.com/
// Convert it to geoJSON: https://mapshaper.org/

// probably do actually start with leaflet. seems simpler for a first prototype 
    // I have a geojson file downloaded now. gotta figure out how to use thiss

// Using the fancy map makes the program slow to load. Maybe do a different map?

export default function Map_Test() {

    const mapRef = useRef(null)

    useEffect(() => {
        const map = L.map(mapRef.current).setView([30.4719, -86.5422], 6);
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

    return (
        <section>
            <div ref={mapRef} className="map"></div>
        </section>
    )
}