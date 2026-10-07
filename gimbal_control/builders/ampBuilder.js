// Establish connection to the amplifier
// Generate and send serial messages

import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";


class AmpBuilder {

    static masterAddress = 0x00;
    static amplifierAddress = 0x01;

    static port = new SerialPort({
        path: 'COM5', // just a placeholder. no clue what port itll be yet
        dataBits: 8,
        stopBits: 1,
        baudRate: 115200,
        autoOpen: false
    })
    //static parser = new ReadlineParser(); // readline parser isn't appropriate, but I'm leaving it here for reference

    constructor(){
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

    // send built commands to the amp
    async sendCommand(command) {
        AmpBuilder.port.write(Buffer.from(command));
        console.log(Buffer.from(command))
    }

    // Control commands
    async enableRF(){
        //
    }

    async disableRF(){
        //
    }

    async clearFaults(){
        //
    }

    async setAttenuation(decibels){
        //
    }

    // Data commands
    async getModuleState(){
        //
    }

    async getTemp(){
        //
    }

    async getVoltage(){
        //
    }

    async getCurrent(){
        //
    }

    async getFaults(){
        //
    }

    async getTempalarmStatus(){
        // Another one we may not need
    }
}

export const ampBuilder = new AmpBuilder();