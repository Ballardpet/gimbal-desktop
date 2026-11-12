// Establish connection to the amplifier
// Generate and send serial messages

import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

// Brunt of the work to do is here
// Still don't have enough info to connect to the amp
// Should have enough info to start generating commands

// Data ones will require parsing the response too :(

class AmpBuilder {

    static masterAddress = 0x00;
    static amplifierAddress = 0x01;

    static port = new SerialPort({
        path: 'COM4', // just a placeholder. no clue what port it'll be yet
        dataBits: 8,
        stopBits: 1,
        baudRate: 115200,
        autoOpen: false
    })
    //static parser = new ReadlineParser(); // readline parser isn't appropriate, but I'm leaving it here for reference

    constructor(){
        AmpBuilder.port.on("data", (data) => {
            console.log("Received bytes:", data.toString("hex"));
        });

        // maybe add a port.on("error")
        // maybe add a porn.on("close")

        this.connectSerial();
        //AmpBuilder.port.pipe(AmpBuilder.parser); // readline parser isn't appropriate, but I'm leaving it here for reference
    }

    async connectSerial(){
        AmpBuilder.port.open((error) => {
            if (error) {
                console.log(error.message);

                setTimeout(() => {
                    this.connectSerial();
                }, 5000);
                
                return;
            }
            else {
                console.log("Amplifer serial port connected.");
            }
        });
    }
/*
    // build the command
    async buildCommand(command, payload = []){
        const status = 0x00;
        
        // Length counts Status through Checksum, inclusive.
        const length = 1 + 1 + payload.length + 1;

        const packet = [
            AmpBuilder.masterAddress,
            AmpBuilder.amplifierAddress,
            length,
            status,
            command,
            ...payload
        ];
        
        // XOR Length, Status, Command, and Payload.
        // This matches the documented Echo example.
        let checksum = 0;

        // CHECK THIS!!!!!!!
        for (const byte of packet.slice(2)) {
            checksum ^= byte;
        }

        packet.push(checksum);

        return Buffer.from(packet);
    }
*/
    // send built commands to the amp
    async sendCommand(command) {
        AmpBuilder.port.write(Buffer.from(command));
        console.log(Buffer.from(command));
        // Need to wait for response here?
    }

    // Control commands
    async enableRF(){
        // 0x06
        const packet = Buffer.from([
            0x00,
            0x00,
            0x03,
            0x00,
            0x06,
            0x05
        ]);

        await this.sendCommand(packet);
    }

    async disableRF(){
        // 0x05
        const packet = Buffer.from([
            0x00,
            0x00,
            0x03,
            0x00,
            0x05,
            0x06
        ]);

        await this.sendCommand(packet);
    }

    async clearFaults(){
        // 0x09
        const packet = Buffer.from([
            0x00,
            0x00,
            0x03,
            0x00,
            0x09,
            0x0A
        ]);

        await this.sendCommand(packet);
    }

    async softReset(){
        // 0x03
        const packet = Buffer.from([
            0x00,
            0x00,
            0x03,
            0x00,
            0x03,
            0x00
        ]);

        await this.sendCommand(packet);
    }

    async setAttenuation(decibels){
        // 0x0D
        // eventually make sure decibels are formatted correctly
            // They definitely are not

        // Convert dB to tenths of a dB
        const value = Math.round(decibels * 10);

        // Split into two bytes (big-endian)
        const data1 = (value >> 8) & 0xFF;
        const data2 = value & 0xFF;

        const packet = Buffer.from([
            0x00,
            0x00,
            0x05,
            0x00,
            0x0D,
            data1,
            data2,
            0x00 // Placeholder for checksum
        ]);

        // XOR checksum
        let checksum = 0;

        for (const byte of packet.slice(2, 7)) {
            checksum ^= byte;
        }

        packet[7] = checksum;

        await this.sendCommand(packet);
    }

    // Data commands

    // Handles most telemetry functions
    // Straight AI garbage but it works
    async getModuleState() {
        const packet = Buffer.from([
            0x00,
            0x00,
            0x03,
            0x00,
            0x02,
            0x01
        ]);

        // Collect the response
        const responsePromise = new Promise((resolve, reject) => {
            let responseBuffer = Buffer.alloc(0);

            const cleanup = () => {
                AmpBuilder.port.off("data", onData);
                clearTimeout(timeout);
            };

            const onData = (data) => {
                responseBuffer = Buffer.concat([responseBuffer, data]);

                // Wait until we have enough bytes to read the length
                if (responseBuffer.length < 3) return;

                // Find packet header
                const headerIndex = responseBuffer.indexOf(
                    Buffer.from([0x00, 0x00])
                );

                if (headerIndex === -1) {
                    responseBuffer = Buffer.alloc(0);
                    return;
                }

                responseBuffer = responseBuffer.subarray(headerIndex);

                if (responseBuffer.length < 3) return;

                // Total response length = length field + 3
                const expectedLength = responseBuffer[2] + 3;

                if (responseBuffer.length < expectedLength) return;

                const response = responseBuffer.subarray(0, expectedLength);

                cleanup();
                resolve(response);
            };

            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error("Timed out waiting for amplifier response."));
            }, 2000);

            AmpBuilder.port.on("data", onData);
        });

        // Send query
        await this.sendCommand(packet);

        // Wait for response
        const response = await responsePromise;

        console.log("Amplifier response:", response.toString("hex"));

        // Validate minimum packet size
        if (response.length < 6) {
            throw new Error("Response packet is too short.");
        }

        // Validate command
        if (response[4] !== 0x02) {
            throw new Error("Unexpected response command.");
        }

        // Validate length
        if (response.length !== response[2] + 3) {
            throw new Error("Invalid response length.");
        }

        // Validate checksum
        let checksum = 0;

        for (let i = 2; i < response.length - 1; i++) {
            checksum ^= response[i];
        }

        if (checksum !== response[response.length - 1]) {
            throw new Error("Invalid response checksum.");
        }

        // Parse telemetry
        // TODO: Add byte offsets and scaling from manufacturer's documentation.
        
        const telemetry = {
            currents: [],
            voltage: null,
            temperature: null,
            faults: [],
            rawResponse: response
        };

        return telemetry;
    }

    async getFaults(){
        // 0x08 (maybe?)
        //const packet = await this.buildCommand(0x08); 
        const packet = Buffer.from([
            0x00,
            0x00,
            0x03,
            0x00,
            0x08,
            0x0B
        ]);

        await this.sendCommand(packet);

        // STILL NEED TO GET AND PARSE RESPONSE
    }

    // PLACEHOLDER
    async getTempAlarmStatus(){
        // Another one we may not need
        let packet = "message"
        
        await this.sendCommand(packet);
    }

    // Add a getAttenuation()?

    // add a function to send that exact command?
    async sendTestCommand(){
        const packet = Buffer.from([
            0x00,
            0x00,
            0x03,
            0x00,
            0x00,
            0x03
        ]);

       await this.sendCommand(packet);
    }
}

export const ampBuilder = new AmpBuilder();