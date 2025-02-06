 // Replace with your WebSocket server URL
 const clientSocket = new WebSocket("ws://localhost:8080");

 clientSocket.onopen = function(event) {
     console.log("WebSocket connection established.");
    //  document.getElementById("messages").innerHTML += "<p>Connected to server.</p>";
 };

 clientSocket.onmessage = function(event) {
     console.log(JSON.parse(event.data));
     // console.log("Message received: " + event.data);
     // document.getElementById("messages").innerHTML += "<p>Server: " + event.data + "</p>";
 };

 clientSocket.onclose = function(event) {
     console.log("WebSocket connection closed.");
    //  document.getElementById("messages").innerHTML += "<p>Connection closed.</p>";
 };

 clientSocket.onerror = function(error) {
     console.log("WebSocket error:", error);
    //  document.getElementById("messages").innerHTML += "<p>Error occurred.</p>";
 };

 function authenticate() {
     const message = "Authenticating...!";
     clientSocket.send(JSON.stringify({type: 'auth'}));
     console.log("Message sent: " + message);
    //  document.getElementById("messages").innerHTML += "<p>You: " + message + "</p>";
 }