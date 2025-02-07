// Replace with your WebSocket server URL
const clientSocket = new WebSocket("ws://localhost:8080");

clientSocket.onopen = function(event) {
    console.log("WebSocket connection established.");
//  document.getElementById("messages").innerHTML += "<p>Connected to server.</p>";
};

clientSocket.onmessage = function(event) {

    let eventDataObject = JSON.parse(event.data);

    // console.log('event : ', eventDataObject);

    if(eventDataObject.msg_type == "authorize"){
        setInitData(eventDataObject);
    }

    if(eventDataObject.msg_type == "proposal"){
        console.log("Proposal is getting ready for to open a trade... please wait.");
    }

    if(eventDataObject.msg_type == "trade_open"){
        // console.log("eventDataObject: ", eventDataObject);
        setResultNotification(eventDataObject.data.lastTradeDetails);
    }

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
    let dataObj = {
        type: 'auth', 
        params:{
            apiToken: apiToken
        }
    };

    const message = "Authenticating...!";
    clientSocket.send(JSON.stringify(dataObj));
    console.log("Message sent: " + message);
//  document.getElementById("messages").innerHTML += "<p>You: " + message + "</p>";
}

function botStart() {
    const message = "Bot starting...";
    console.log("Message sent: " + message);

    let dataObj = {
        type: 'start', 
        params:{
            market: market
        }
    };

    clientSocket.send(JSON.stringify(dataObj));
}

function setInitData(data) {
    if(data.msg_type == "authorize"){
        console.log(data);

        authenticateButton.innerHTML = "Authenticated. Ready to trade.";
        authenticateButton.disabled = true;

        let initianAccountBalance = Number(data.data.initianAccountBalance);
        setAccountInfo("initialAccountBalance", `$ ${initianAccountBalance}`);

        let amountPutForTrading = Number((data.data.initianAccountBalance * (data.data.amountPercentage / 100)).toFixed(2));
        setAccountInfo("amountPutForTrading", `$ ${amountPutForTrading}`);
        stake = Number(data.data.amountPutForTrading);

        let updatedAccountBalance = Number(data.data.initianAccountBalance);

        setAccountInfo("updatedAccountBalance", `$ ${updatedAccountBalance}`);
        setAccountInfo("netProfit", `$ 0`);

    }
}

function setResultNotification(lastTradeDetails){

    console.log('lastTradeDetails: ', lastTradeDetails);

}