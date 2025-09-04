// Replace with your WebSocket server URL
const clientSocket = new WebSocket("ws://localhost:8080");

const scriptButton = document.getElementById("scriptRun");
let isBotRunning = false;


clientSocket.onopen = function(event) {
    console.log("WebSocket connection established.");
//  document.getElementById("messages").innerHTML += "<p>Connected to server.</p>";
};

clientSocket.onmessage = function(event) {

    let eventDataObject = JSON.parse(event.data);

    console.log(eventDataObject);

};