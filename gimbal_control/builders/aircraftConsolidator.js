import fs from "fs";
import { readFile } from "fs/promises";

const JSON_FILE = "./gimbal_control/data/all_aircraft.json";
const TEMP_FILE = "./gimbal_control/data/all_aircraft.tmp";

const aircraftDict = {}

// stop a race condition
let exporting = false;

class Aircraft {
    constructor() {
        this.id = "";
        this.lat = 0.0;
        this.lon = 0.0;
        this.alt = 0.0;
        this.timestamp = null;
        this.trackingType = null;
    }

    print() {
        console.log(
            "ID:", this.id,
            "lat:", this.lat,
            "lon:", this.lon,
            "alt:", this.alt,
            "last updated:", this.timestamp,
            "tracking type:", this.trackingType
        );
    }

    toJSON() {
        return {
            id: this.id,
            lat: this.lat,
            lon: this.lon,
            alt: this.alt,
            timestamp: this.timestamp.toISOString(),
            trackingType: this.trackingType
        };
    }
}

async function exportDictionary() {
    if (exporting) return; // stop race condition

    exporting = true;

    try {
        await readP5()

        await readADSB()

        const now = new Date();

        // delete aircraft that haven't been updated in 10 seconds
        for (const id of Object.keys(aircraftDict)) {
            const aircraft = aircraftDict[id]

            if (now - aircraft.timestamp > 10000) {
                delete aircraftDict[id];
            }
        }

        // Convert to JSON
        const jsonData = {};
        for (const aircraft of Object.values(aircraftDict)) {
            jsonData[aircraft.id] = aircraft.toJSON();
        }

        // write to temp file
        fs.writeFileSync(
            TEMP_FILE,
            JSON.stringify(jsonData, null, 4)
        );

        // replace previous JSON
        fs.renameSync(TEMP_FILE, JSON_FILE);

        // debug output
        console.clear();
    } catch (error) {
        console.error(error);
    } finally {
        exporting = false;
    }
    
}

//export every half second
setInterval(exportDictionary, 500);

async function readP5(){
    const file= "./gimbal_control/data/p5_aircraft.json";

    try {
        const text = await readFile(file, "utf8");
        const data = JSON.parse(text);

        for (const [id, p5Aircraft] of Object.entries(data)) {
            if (!(id in aircraftDict)) {
                const target = new Aircraft();
                target.id = id;
                aircraftDict[id] = target;
            }

            const target = aircraftDict[id];

            target.lat = Number(p5Aircraft.lat);
            target.lon = Number(p5Aircraft.lon);
            target.alt = Number(p5Aircraft.alt);
            target.timestamp = new Date(p5Aircraft.timestamp);
            target.trackingType = "p5";
        }
    }
    catch (error) {
        console.error(error)
    }
}

async function readADSB() {
    try {
        const url= "http://localhost:8080/data/aircraft.json";
        const response = await fetch(url);
        const data = await response.json();

        const timestamp = new Date();

        for (let i = 0; i < data.aircraft.length; i++) {
            const id = data.aircraft[i].hex;

            // check if aircraft is in dictionary
            if (!(id in aircraftDict)) {
                const target = new Aircraft();
                target.id = id;

                aircraftDict[id] = target;
            }

            const target = aircraftDict[id]

            target.lat = Number(data.aircraft[i].lat);
            target.lon = Number(data.aircraft[i].lon);
            target.alt = Number(data.aircraft[i].altitude);
            target.timestamp = timestamp;
            target.trackingType = "adsb";
        }
    }
    catch (error) {
        console.error(error)
    }
    
}