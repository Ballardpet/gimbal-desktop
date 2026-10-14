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
        path: 'COM5', // just a placeholder. no clue what port it'll be yet
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

    // send built commands to the amp
    async sendCommand(command) {
        AmpBuilder.port.write(Buffer.from(command));
        console.log(Buffer.from(command));
        // Need to wait for response here?
    }

    // Control commands
    async enableRF(){
        // 0x06
        const packet = await this.buildCommand(0x06); 

        await this.sendCommand(packet);
    }

    async disableRF(){
        // 0x05
        const packet = await this.buildCommand(0x05); 
        
        await this.sendCommand(packet);
    }

    async clearFaults(){
        // 0x09
        const packet = await this.buildCommand(0x09); 
        
        await this.sendCommand(packet);
    }

    async softReset(){
        // 0x03
        const packet = await this.buildCommand(0x03); 
        
        await this.sendCommand(packet);
    }

    async setAttenuation(decibels){
        // 0x0D
        // eventually make sure decibels are formatted correctly
            // They definitely are not
        const packet = await this.buildCommand(0x0D, decibels); 
        
        await this.sendCommand(packet);
    }

    // Data commands
    // PLACEHOLDER
    async getModuleState(){
        // Probably connected vs not
        // 0x02?
        let packet = "message"
        
        await this.sendCommand(packet);
    }

    async getTemp(){
        // 0x07
        const packet = await this.buildCommand(0x07); 
        
        await this.sendCommand(packet);
    }

    async getVoltage(){
        // 0x0B
        const packet = await this.buildCommand(0x0B); 
        
        await this.sendCommand(packet);
    }

    async getCurrent(){
        // 0x0A
        const packet = await this.buildCommand(0x0A); 
        
        await this.sendCommand(packet);
    }

    async getFaults(){
        // 0x08 (maybe?)
        const packet = await this.buildCommand(0x08); 
        
        await this.sendCommand(packet);
    }

    // PLACEHOLDER
    async getTempAlarmStatus(){
        // Another one we may not need
        let packet = "message"
        
        await this.sendCommand(packet);
    }

    // Add a getAttenuation()?
}

export const ampBuilder = new AmpBuilder();