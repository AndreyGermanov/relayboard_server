// Load ModBus module;
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();

// connect to Serial port
client.connectRTU("/dev/ttyAMA0", { baudrate: 115200 }, {
    client.setID(1);
    // Turn ON relay on digital pin 4
    client.writeRegisters(4,1, function() {
        // Turn OFF relay on digital pin 4
        client.writeRegisters(4,0);
    });
});

