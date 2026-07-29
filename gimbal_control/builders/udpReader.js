// This will be the class for reading udp messages
// Follow the python version pretty closely


// start by getting messages
    // open port
    // get messages
    // send to parser
    // parse and save it
// use threads
    // output stored data every half second


// js version of socket. how to read udp messages
import dgram from "dgram";
// needed for writing to file
import fs from "fs";
import path from "path";
// conversion from ecef to gps
import projector from "ecef-projector";

console.log("Current working directory:", process.cwd());

// JSON file locations
const JSON_FILE = "./gimbal_control/data/p5_aircraft.json";
const TEMP_FILE = "./gimbal_control/data/p5_aircraft.tmp";
fs.mkdirSync("data", { recursive: true });

const HOST = "0.0.0.0";
const PORT = 3000;

const aircraftDict = {};

class Aircraft {
    constructor() {
        this.callsign = "";
        this.lat = 0.0;
        this.lon = 0.0;
        this.alt = 0.0;
        this.timestamp = null;
    }

    print() {
        console.log(
            "Callsign:", this.callsign,
            "lat:", this.lat,
            "lon:", this.lon,
            "alt:", this.alt,
            "last updated:", this.timestamp
        );
    }

    toJSON() {
        return {
            callsign: this.callsign,
            lat: this.lat,
            lon: this.lon,
            alt: this.alt,
            timestamp: this.timestamp.toISOString()
        };
    }
}

// Export dictionary to JSON
function exportDictionary() {

    const now = new Date();

    // Delete aircraft that haven't been updated in 10 seconds
    for (const callsign of Object.keys(aircraftDict)) {

        const aircraft = aircraftDict[callsign];

        if (now - aircraft.timestamp > 10000) {
            delete aircraftDict[callsign];
        }
    }

    // Convert to JSON
    const jsonData = {};
    for (const aircraft of Object.values(aircraftDict)) {
        jsonData[aircraft.callsign] = aircraft.toJSON();
    }

    // Write to temporary file
    fs.writeFileSync(
        TEMP_FILE,
        JSON.stringify(jsonData, null, 4)
    );

    // Replace previous JSON atomically
    fs.renameSync(TEMP_FILE, JSON_FILE);

    // Debug output
    console.clear();
    // Print to console for debugging 
    // console.log(JSON.stringify(jsonData, null, 4));
}

// export every half second
setInterval(exportDictionary, 500);

function parseP5(message) {

    // Isolate callsign
    const callsign = message.toString("ascii", 129, 140).replace(/\0/g, "");

    // Ignore packets that aren't P5 aircraft
    if (!(callsign.includes("CALLSGN") || callsign.includes("GND"))) {
        return;
    }

    // Read ECEF coordinates
    const ecefX = message.readDoubleBE(48);
    const ecefY = message.readDoubleBE(56);
    const ecefZ = message.readDoubleBE(64);

    // Convert to GPS
    const gps = projector.unproject(
        ecefX,
        ecefY,
        ecefZ
    );

    const timestamp = new Date();

    // If callsign not in dictionary, create aircraft
    if (!(callsign in aircraftDict)) {

        const aircraft = new Aircraft();
        aircraft.callsign = callsign;

        aircraftDict[callsign] = aircraft;
    }

    // Retrieve aircraft
    const aircraft = aircraftDict[callsign];

    // Update aircraft
    aircraft.lat = gps.at(0);
    aircraft.lon = gps.at(1);
    aircraft.alt = gps.at(2);
    aircraft.timestamp = timestamp;    
}

// UDP Receiver
const socket = dgram.createSocket("udp4");

socket.on("listening", () => {
    console.log(`Listening on UDP port ${PORT}...`);
});

socket.on("message", (message) => {
    parseP5(message);
});

socket.on("error", (err) => {
    console.error(err);
});

socket.bind(PORT, HOST);