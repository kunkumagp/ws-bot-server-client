const express = require('express');
const webSocket = require("ws");

let ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

const server = new webSocket.Server({ port: 8080 });

let socket = null;



server.on("connection", (sc) => {
    console.log("Client connected.");

    socket = sc;

    sc.on("message", (message) => {
        let res = JSON.parse(message);

        if(res.type === 'auth') {
            getAuthentication();
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

const getAuthentication = () => {
    // setFlashNotification("Authenticating....", 0);
    console.log("Authenticating....");
    ws.send(JSON.stringify({ authorize: "iVOpdm24hBhw3JI" }));

    // setInterval(() => {
    //     ws.send(JSON.stringify({ authorize: "iVOpdm24hBhw3JI" }));
    // }, 3000);
};

ws.onopen = function () {
    console.log("Connection open");

};

ws.onmessage = function (event) {
    wsResponse = JSON.parse(event.data);
    socket.send(JSON.stringify(wsResponse));
    console.log("wsResponse: ",wsResponse);
};
// Define a simple route
app.get('/', (req, res) => {
});


app.get('/greet/:name', (req, res) => {
    const name = req.params.name;
    res.send(`Hello, ${name}!`);
  });

// Define a route with a parameter
app.get('/authenticate', (req, res) => {
    getAuthentication();
    res.send(`Authenticating...,`);
});

// Define a POST route
app.post('/data', (req, res) => {
  const data = req.body;
  res.json({ message: 'Data received', data });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

