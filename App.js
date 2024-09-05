const express = require('express')
const app = express()
const oscModule = require('./public/osc')
const server = require('http').createServer(app);
const WebSocket = require('ws');
const osc = require('osc');
// const fs = require('fs');
// const path = require('path');
// const yahooFinance = require('yahoo-finance2').default;
// const moment = require('moment');

// async function fetchHistoricalStockPrices() {
//     const tickers = ['AMZN', 'AAPL', 'TSLA', 'NFLX'];
//     const endDate = new Date();
//     const startDate = moment().subtract(6, 'months').toDate();

//     const historicalData = {};

//     for (const ticker of tickers) {
//         try {
//             // Fetch historical stock data
//             const data = await yahooFinance.historical(ticker, {
//                 period1: startDate,
//                 period2: endDate,
//                 interval: '1d'
//             });

//             historicalData[ticker] = data;
//         } catch (error) {
//             console.error(`Error fetching historical data for ${ticker}:`, error);
//         }
//     }

//     // Define the JSON content
//     const jsonContent = JSON.stringify(historicalData, null, 2);

//     // Define the path
//     const dir = 'public/data';
//     const filePath = path.join(dir, 'historical_stock_prices.json');

//     // Ensure the directory exists
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//     }

//     // Write the JSON content to a file
//     fs.writeFile(filePath, jsonContent, (err) => {
//         if (err) {
//             console.error('Error writing file:', err);
//         } else {
//             console.log('Historical stock prices saved successfully in public/data');
//         }
//     });
// }

// fetchHistoricalStockPrices();

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