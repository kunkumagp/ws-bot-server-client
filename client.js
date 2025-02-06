// Replace with your WebSocket server URL
const clientSocket = new WebSocket("ws://localhost:8080");

clientSocket.onopen = function(event) {
    console.log("WebSocket connection established.");
//  document.getElementById("messages").innerHTML += "<p>Connected to server.</p>";
};

clientSocket.onmessage = function(event) {

    let eventDataObject = JSON.parse(event.data);

    console.log('event : ', eventDataObject);

    if(eventDataObject.msg_type == "authorize"){
        setInitData(JSON.parse(event.data));
    }

    if(eventDataObject.msg_type == "proposal"){
        console.log("Proposal is getting ready for to open a trade... please wait.");
    }
    

//  console.log(JSON.parse(event.data));
    // 
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

function botStart() {
    const message = "Bot starting...";
    console.log("Message sent: " + message);

    let dataObj = {
        type: 'start', 
        params:{
            initianAccountBalance: initianAccountBalance,
            amountPutForTrading: amountPutForTrading,
            stake: stake,
            updatedAccountBalance: updatedAccountBalance,
            netProfit: netProfit,
            market: market
        }
    };

    clientSocket.send(JSON.stringify(dataObj));
}

function setInitData(data) {
    console.log(data);

    if(data.msg_type == "authorize"){

        authenticateButton.innerHTML = "Authenticated. Ready to trade.";
        authenticateButton.disabled = true;


        initianAccountBalance = Number(data.authorize.balance);
        setAccountInfo("initialAccountBalance", `$ ${initianAccountBalance}`);

        amountPutForTrading = Number((initianAccountBalance * (amountPercentage / 100)).toFixed(2));
        setAccountInfo("amountPutForTrading", `$ ${amountPutForTrading}`);
        stake = Number(amountPutForTrading);

        updatedAccountBalance = Number(initianAccountBalance);

        setAccountInfo("updatedAccountBalance", `$ ${updatedAccountBalance}`);
        setAccountInfo("netProfit", `$ ${netProfit}`);

    }
}