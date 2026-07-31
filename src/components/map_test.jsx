import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import world from "../data/world.json";

//import ne_50m_admin_0_countries.json

// maybe actually use protomaps and maplibre

// maybe pm tiles with leaflet? https://docs.protomaps.com/pmtiles/leaflet

// This map might be what I'm looking for: https://www.naturalearthdata.com/

// probably do actually start with leaflet. seems simpler for a first prototype 
    // I have a geojson file downloaded now. gotta figure out how to use thiss


export default function Map_Test() {

    const mapRef = useRef(null)

    useEffect(() => {
        const map = L.map(mapRef.current).setView([20, 0], 2);
        L.geoJSON(world).addTo(map);
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