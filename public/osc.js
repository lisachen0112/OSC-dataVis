const osc = require('osc');

// Create an OSC UDP Port listening on port 9000
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0", 
    localPort: 9000         
});

udpPort.open();

udpPort.on("ready", function() {
    console.log("OSC UDP Port is ready!");
    udpPort.send({
        address: "/2/fader3",
        args: [
            {
                type: "s",
                value: "Hello, World!"
            }
        ]
    }, "192.168.0.81", 20);
});

udpPort.on("error", function(error) {
    console.error("An error occurred:", error.message);
});

module.exports = udpPort;