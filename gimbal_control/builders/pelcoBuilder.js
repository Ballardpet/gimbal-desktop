import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

// Potential JS serial port guides
    // https://developer.mozilla.org/en-US/docs/Web/API/SerialPort
    // https://serialport.io/
    // https://medium.com/@machadogj/arduino-and-node-js-via-serial-port-bcf9691fab6a

// Extended comand set at 5.2: https://asset.fujifilm.com/www/fr/files/2023-06/ae28bf99f63dfae9f930c3353239eb2b/pelco-d_protocol_specification_for_sx1600_v.1.00.0_en.pdf
    // This gimbal uses degrees * 100 for it's positioning 
        // 0-36000 for pan
        // probably -9000 to 9000
            // doesn't send negative so it does 36000 - 9000, bringing it to 31000 for 90 degrees the other way


class PelcoBuilder {
    static sync = 0xFF;
    static gimbalAddress = 0x01; // may also be 0x00
    static port = new SerialPort({
        path: 'COM4',
        dataBits: 8,
        stopBits: 1,
        baudRate: 2400, // May also be 4800 or 9600
        autoOpen: false, // this keeps the program from crashing if the usb-to-rs485 coverter isn't plugged in
    });
    static parser = new ReadlineParser();
    

    constructor(){
        this.connectSerial();
        PelcoBuilder.port.pipe(PelcoBuilder.parser); // connect the parser to the port
    }

    async connectSerial(){
        
        PelcoBuilder.port.open((error) => {
            if (error) {
                console.log(error.message);
                
                setTimeout(() => {
                    this.connectSerial();
                }, 5000);
                
                return;
            }
            else {
                console.log("Serial port connected.");
            }
        });
    }

    async buildMove(direction, speed) {
        let cmd1 = 0x00; // won't need data in cmd1
        let cmd2;
        let data1;
        let data2;
        let checksum;
        if (speed == 8) { // Fixing the max speed issue
            speed = 7.875
        }
        if (direction == "up") {
            // 00001000
            cmd2 = 0x08;
            data1 = 0x00;
            data2 = (speed * 8 - 1);
            checksum = await this.calculateChecksum( PelcoBuilder.gimbalAddress, cmd1, cmd2, data1, data2 );
        }
        else if(direction == "down") {
            // 00010000
            cmd2 = 0x10;
            data1 = 0x00;
            data2 = (speed * 8 - 1);
            checksum = await this.calculateChecksum( PelcoBuilder.gimbalAddress, cmd1, cmd2, data1, data2 );
        }
        else if(direction == "left") {
            // 00000100
            cmd2 = 0x04;
            data1 = (speed * 32 - 1); // For some reason, gimbal can't take ff speed
            data2 = 0x00;
            checksum = await this.calculateChecksum( PelcoBuilder.gimbalAddress, cmd1, cmd2, data1, data2 );
        }
        else if(direction == "right") {
            // 00000010
            cmd2 = 0x02;
            data1 = (speed * 32 - 1); // For some reason, gimbal can't take ff speed
            data2 = 0x00;
            checksum = await this.calculateChecksum( PelcoBuilder.gimbalAddress, cmd1, cmd2, data1, data2 );
        }
        else {
            // stop if unrecognized
            // 00000000
            cmd2 = 0x00;
            data1 = 0x00;
            data2 = 0x00;
            checksum = await this.calculateChecksum( PelcoBuilder.gimbalAddress, cmd1, cmd2, data1, data2 );
        }
        let packet = [PelcoBuilder.sync, PelcoBuilder.gimbalAddress, cmd1, cmd2, data1, data2, checksum];

        console.log(direction, " ", speed);
        this.sendCommand(packet);
        return("Move command received on server and sent to gimbal.");
    }

    async buildStop() {
        let cmd1 = 0x00;
        let cmd2 = 0x00;
        let data1 = 0x00;
        let data2 = 0x00;
        let checksum = await this.calculateChecksum( PelcoBuilder.gimbalAddress, cmd1, cmd2, data1, data2 );
        let packet = [PelcoBuilder.sync, PelcoBuilder.gimbalAddress, cmd1, cmd2, data1, data2, checksum];

        console.log("stop");
        this.sendCommand(packet);
        return("Stop command received on server and sent to gimbal.");
    }

    // point to a specified az/el. also used this for gps and tspi feed
    async pointTo(azimuth, elevation) {
        let panCommand = await pelcoBuilder.buildSetPan(azimuth);
        let tiltCommand = await pelcoBuilder.buildSetTilt(elevation);

        console.log(panCommand, " ", tiltCommand)
        pelcoBuilder.sendCommand(panCommand);
        pelcoBuilder.sendCommand(tiltCommand);

        return("Pointed to location");
    }

    async buildSetPan(azimuth){
        const data1 = (azimuth >> 8) & 0xFF;
        const data2 = azimuth & 0xFF;
        const packet = [
            PelcoBuilder.sync,
            PelcoBuilder.gimbalAddress,
            0x00,
            0x4B, // set absolute pan
            data1,
            data2,
            await this.calculateChecksum( PelcoBuilder.gimbalAddress, 0x00, 0x4B, data1, data2 )
        ]

        return packet;
    }

    async buildSetTilt(elevation){
        const data1 = (elevation >> 8) & 0xFF;
        const data2 = elevation & 0xFF;
        const packet = [
            PelcoBuilder.sync,
            PelcoBuilder.gimbalAddress,
            0x00,
            0x4D, // set absolute tilt
            data1,
            data2,
            await this.calculateChecksum( PelcoBuilder.gimbalAddress, 0x00, 0x4D, data1, data2 )
        ]

        return packet;
    }

    async sendCommand(command) {
        PelcoBuilder.port.write(Buffer.from(command));
        console.log(Buffer.from(command))
    }

    async calculateChecksum(address, cmd1, cmd2, data1, data2){
        return ((address + cmd1 + cmd2 + data1 + data2) % 256);
    }

    // well at least this code works. We're sticking with the chatgpt code
    async getAz() {
        return new Promise(async (resolve, reject) => {

            // build query packet
            const cmd1 = 0x00;
            const cmd2 = 0x51;
            const data1 = 0x00;
            const data2 = 0x00;

            const checksum = await this.calculateChecksum(
                PelcoBuilder.gimbalAddress,
                cmd1,
                cmd2,
                data1,
                data2
            );

            const packet = Buffer.from([
                PelcoBuilder.sync,
                PelcoBuilder.gimbalAddress,
                cmd1,
                cmd2,
                data1,
                data2,
                checksum
            ]);

            let responses = [];

            // timeout safety
            const timer = setTimeout(() => {

                PelcoBuilder.port.off("data", onData);

                reject(new Error("Timed out waiting for pan response"));

            }, 1000);

            // listen for response
            const onData = (data) => {

                responses.push(...data);

                while (responses.length >= 7) {

                    const responsePacket = Buffer.from(
                        responses.splice(0, 7)
                    );

                    console.log("PAN RESPONSE:", responsePacket);

                    const command = responsePacket[3];

                    // pan response command
                    if (command === 0x59) {

                        clearTimeout(timer);

                        PelcoBuilder.port.off("data", onData);

                        const pan =
                            (responsePacket[4] << 8) |
                            responsePacket[5];

                        resolve(pan);

                    }
                }
            };

            PelcoBuilder.port.on("data", onData);

            // send query
            PelcoBuilder.port.write(packet);

        });
    }


    // well at least this code works. We're sticking with the chatgpt code
    async getEl() {
        return new Promise(async (resolve, reject) => {

            // build query packet
            const cmd1 = 0x00;
            const cmd2 = 0x53;
            const data1 = 0x00;
            const data2 = 0x00;

            const checksum = await this.calculateChecksum(
                PelcoBuilder.gimbalAddress,
                cmd1,
                cmd2,
                data1,
                data2
            );

            const packet = Buffer.from([
                PelcoBuilder.sync,
                PelcoBuilder.gimbalAddress,
                cmd1,
                cmd2,
                data1,
                data2,
                checksum
            ]);

            let responses = [];

            // timeout safety
            const timer = setTimeout(() => {

                PelcoBuilder.port.off("data", onData);

                reject(new Error("Timed out waiting for tilt response"));

            }, 1000);

            // listen for response
            const onData = (data) => {

                responses.push(...data);

                while (responses.length >= 7) {

                    const responsePacket = Buffer.from(
                        responses.splice(0, 7)
                    );

                    console.log("TILT RESPONSE:", responsePacket);

                    const command = responsePacket[3];

                    // tilt response command
                    if (command === 0x5B) {

                        clearTimeout(timer);

                        PelcoBuilder.port.off("data", onData);

                        const tilt =
                            (responsePacket[4] << 8) |
                            responsePacket[5];

                        resolve(tilt);

                    }
                }
            };

            PelcoBuilder.port.on("data", onData);

            // send query
            PelcoBuilder.port.write(packet);

        });
    }
    
}

export const pelcoBuilder = new PelcoBuilder();
