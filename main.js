const express = require('express');
const webSocket = require("ws");

let ws = new webSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

const server = new webSocket.Server({ port: 8080 });

let socket = null;

let isTradeRunning = false;
let tradeType = "even";

let initianAccountBalance = 0;
let amountPutForTrading = 0;
let amountPercentage = 0.1;
let stake = 0.35;
let updatedAccountBalance = 0;
let netProfit = 0;
let tickCount = 1;
let market = null;



server.on("connection", (sc) => {
    console.log("Client connected.");

    socket = sc;

    sc.on("message", (message) => {
        let res = JSON.parse(message);

        if (res.type === 'auth') {
            getAuthentication();
        }

        if (res.type === 'start') {
            setInitData(res.params);
            botStart(res.params);
            // getAuthentication();
        }
    });

    sc.on("close", () => {
        console.log("Client disconnected.");
    });

    sc.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
});




// Create an instance of express
const app = express();

// Define a port to listen on
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());


ws.onopen = function () {
    console.log("Connection open");

};

ws.onmessage = function (event) {
    wsResponse = JSON.parse(event.data);
    console.log("wsResponse: ", wsResponse);

    socket.send(JSON.stringify(wsResponse));
};





// // Define a simple route
// app.get('/', (req, res) => {
// });


// app.get('/greet/:name', (req, res) => {
//     const name = req.params.name;
//     res.send(`Hello, ${name}!`);
//   });

// // Define a route with a parameter
// app.get('/authenticate', (req, res) => {
//     getAuthentication();
//     res.send(`Authenticating...,`);
// });

// // Define a POST route
// app.post('/data', (req, res) => {
//   const data = req.body;
//   res.json({ message: 'Data received', data });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });




const getAuthentication = () => {
    // setFlashNotification("Authenticating....", 0);
    console.log("Authenticating....");
    ws.send(JSON.stringify({ authorize: "iVOpdm24hBhw3JI" }));
};


const botStart = (data) => {
    if (!isTradeRunning) {
        placeTrade();
    }
};

const setInitData = (data) => {
    console.log('data : ', data);

    initianAccountBalance = data.initianAccountBalance;
    amountPutForTrading = data.amountPutForTrading;
    stake = data.stake;
    updatedAccountBalance = data.updatedAccountBalance;
    netProfit = data.netProfit;
    market = data.market;
};


const placeTrade = (result = null) => {
    if (isTradeRunning == false) {
        if (result != null) {
            if (result == "even") {
                tradeState = "DIGITODD";
            } else if (result == "odd") {
                tradeState = "DIGITEVEN";
            }
        } else {
            if (tradeType == "even") {
                tradeState = "DIGITEVEN";
                tradeType = "odd";
            } else if (tradeType == "odd") {
                tradeState = "DIGITODD";
                tradeType = "even";
            }
        }
        stake = Number(stake);
        stake < 0.35 ? (stake = 0.35) : (stake = stake);

        // tickCount = 1;
        tickCount = getRandomNumber(5, 8);

        const tradeRequest = {
            proposal: 1,
            amount: stake.toFixed(2),
            basis: "stake",
            contract_type: tradeState, // Use 'DIGITEVEN' for even and 'DIGITODD' for odd
            currency: "USD",
            duration: tickCount,
            duration_unit: "t",
            symbol: market,
        };

        onTradeCount = 1;
        // Send the trade request to the WebSocket
        ws.send(JSON.stringify(tradeRequest));
    }
};




function getRandomNumber(min, max) {
    if (min > max) {
        throw new Error("Min value must be less than or equal to Max value");
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}