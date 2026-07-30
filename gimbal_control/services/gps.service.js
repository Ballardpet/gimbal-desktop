import { pelcoBuilder } from "../builders/pelcoBuilder.js";
import { gpsBuilder } from "../builders/gpsBuilder.js";
// running udpreader as a process
import { spawn } from "child_process";
// for reading P5 JSON file
import { readFile } from "fs/promises";

class GpsService {

    constructor() {
        this.udpReader = spawn("node", ["./gimbal_control/builders/udpReader.js"], {
            stdio: "inherit"
        });

        this.udpReader.on("error", (err) => {
            console.error("Failed to start udpReader:", err);
        });

        this.aircraftConsolidator = spawn("node", ["./gimbal_control/builders/aircraftConsolidator.js"], {
            stdio: "inherit"
        });

        this.aircraftConsolidator.on("error", (err) => {
            console.error("Failed to start aircraftConsolidator:", err);
        });
    }

    async adsb(startLat, startLon, startEl, targetHexID, cameraPoint){
        // Get data from dump1090
        const url= "http://localhost:8080/data/aircraft.json";
        
        try {
            // get json of all planes nearby
            const response = await fetch(url);
            const data = await response.json();

            // find the aircraft with matching hexid
            const target = data.aircraft.find(plane => plane.hex === targetHexID.toLowerCase());

            // use relevant aircraft info to get target LLA
            let targetLat = target.lat;
            let targetLon = target.lon;
            let targetEl = target.altitude; // I'm assuming this is barometric (above sea level), but I'll have to double check

            // Reject invalid values
            if (![targetLat, targetLon, targetEl].every(Number.isFinite)) {
                return null;
            }

            // convert elevation from feet to meters
            targetEl = targetEl * 0.3048;
            // can call pointTo using start and target LLA
            this.pointTo(startLat, startLon, startEl, targetLat, targetLon, targetEl, cameraPoint)

            return {
                lat: targetLat,
                lon: targetLon,
                el: targetEl
            };
        }
        catch(error){
            console.log(error);
            return null;
        }
    }

    async p5Point(startLat, startLon, startEl, targetCallsign, cameraPoint){
        // get data from p5 json file
        const file= "./gimbal_control/data/p5_aircraft.json";
        
        try {
            // read JSON from file
            const text = await readFile(file, "utf8");
            const data = JSON.parse(text);

            // Select the right target
            const target = data[targetCallsign];

            // use relevant aircraft info to get target LLA
            let targetLat = target.lat;
            let targetLon = target.lon;
            let targetEl = target.alt;

            // Reject invalid values
            if (![targetLat, targetLon, targetEl].every(Number.isFinite)) {
                return null;
            }

            // no need to convert elevation from feet to meters. ecef->gps conversion does this already
            
            // can call pointTo using start and target LLA
            this.pointTo(startLat, startLon, startEl, targetLat, targetLon, targetEl, cameraPoint)

            return {
                lat: targetLat,
                lon: targetLon,
                el: targetEl
            };
        }
        catch(error){
            console.log(error);
            return null;
        }
    }

    async getP5Aircraft() {
        const text = await readFile("./gimbal_control/data/p5_aircraft.json", "utf8");
        return JSON.parse(text);
    }

    async pointTo(startLat, startLon, startEl, destLat, destLon, destEl, cameraPoint) {
        console.log({
            startLat,
            startLon,
            startEl,
            destLat,
            destLon,
            destEl
        });


        let azAngle = await gpsBuilder.findAzimuthAngle(startLat, startLon, destLat, destLon);
        let elAngle = await gpsBuilder.findElevationAngle(startLat, startLon, startEl, destLat, destLon, destEl);

        // calibrate to point gimbal south for better gulf testing
        azAngle = azAngle + 180;
        if (azAngle > 360) {
            azAngle = azAngle - 360;
        }

        // adjust orientation if pointing with camera instead of antenna 
        if (cameraPoint) {
            elAngle = elAngle - 90;
        }
        // handle wraparound
        if (elAngle < 0) {
            elAngle = elAngle + 360;
        }

        // convert to be usable by pelco-D
        azAngle = azAngle * 100;
        elAngle = elAngle * 100;

        console.log("Az Angle: ", azAngle);
        console.log("El Angle: ", elAngle);

        return(pelcoBuilder.pointTo(azAngle, elAngle));
    }
}

export default GpsService;