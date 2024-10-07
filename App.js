const express = require('express')
const app = express()
const oscModule = require('./public/osc')
const server = require('http').createServer(app);
const WebSocket = require('ws');
const osc = require('osc');
const path = require('path');
// const fs = require('fs');
// const path = require('path');
// const yahooFinance = require('yahoo-finance2').default;
// const moment = require('moment');

// async function fetchHistoricalStockPrices() {
//     const tickers = ['AMZN', 'AAPL', 'TSLA', 'NFLX'];
//     const endDate = new Date();
//     const startDate = moment().subtract(6, 'months').toDate();

//     const historicalData = [];

//     for (const ticker of tickers) {
//         try {
//             // Fetch historical stock data
//             const data = await yahooFinance.historical(ticker, {
//                 period1: startDate,
//                 period2: endDate,
//                 interval: '1d'
//             });

//             // Push each stock's data into the array with a ticker label
//             data.forEach(entry => {
//                 historicalData.push({
//                     ticker: ticker,
//                     date: entry.date,
//                     open: entry.open,
//                     high: entry.high,
//                     low: entry.low,
//                     close: entry.close,
//                     adjClose: entry.adjClose,
//                     volume: entry.volume
//                 });
//             });
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

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files (optional, for CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index')
})

// Create WebSocket server
const wss = new WebSocket.Server({ server:server });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        oscModule.send(JSON.parse(message),"192.168.0.81", 20);
    });
    
});


oscModule.on("ready", () => {
    server.listen(port, () => {
        console.log(`Listening on port ${port}`)
    });
});

oscModule.on("message", (oscMsg, timeTag, info) => {
    console.log("Received OSC message:");
    console.log("Address: ", oscMsg.address);
    console.log("Arguments: ", oscMsg.args);
    console.log("Remote info: ", info);
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(oscMsg));
        }
    });
});