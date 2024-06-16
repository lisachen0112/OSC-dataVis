const express = require('express')
const app = express()
const oscModule = require('./public/osc')
const server = require('http').createServer(app);
const WebSocket = require('ws');
const osc = require('osc');

const port = 8080

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index')
})

// Create WebSocket server
const wss = new WebSocket.Server({ server:server });

wss.on('connection', function connection(ws) {
    console.log('Client connected');
    ws.send('Server sees client connected');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
    
});

oscModule.on("ready", () => {
    server.listen(port, () => {
        console.log(`Listening on port ${port}`)
    });
});

oscModule.on("message", (oscMsg, timeTag, info) => {
    console.log("Received OSC message:");
    console.log("Address: ", oscMsg.address); // The OSC address pattern (e.g., "/fader1")
    console.log("Arguments: ", oscMsg.args);   // Array of arguments sent with the message
    console.log("Remote info: ", info);         // Information about the sender (IP, port)
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(oscMsg));
        }
    });
});