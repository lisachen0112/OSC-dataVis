const osc = require('osc');

// Create an OSC UDP Port listening on port 9000
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0", 
    localPort: 9000         
});

udpPort.open();
console.log("Listening for OSC messages on port 9000...");

udpPort.on("message", function(oscMsg, timeTag, info) {
    console.log("Received OSC message:");
    console.log("Address: ", oscMsg.address); // The OSC address pattern (e.g., "/fader1")
    console.log("Arguments: ", oscMsg.args);   // Array of arguments sent with the message
    console.log("Remote info: ", info);         // Information about the sender (IP, port)
});

udpPort.on("error", function(error) {
    console.error("An error occurred:", error.message);
});