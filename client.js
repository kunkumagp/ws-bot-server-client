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

    if(eventDataObject.msg_type == "authorize"){
        setInitData(eventDataObject);
    }

    if(eventDataObject.msg_type == "proposal"){
        console.log("Proposal is getting ready for to open a trade... please wait.");
    }

    if(eventDataObject.msg_type == "trade_open"){
        setResultNotification(eventDataObject.data.lastTradeDetails, 'create');
    }

    if(eventDataObject.msg_type == "tick_counter"){
        setTickCountDown(eventDataObject.data.tick_count, eventDataObject.data.length);
    }

    if(eventDataObject.msg_type == "flash_message"){
        setFlashNotification(eventDataObject.data.message, eventDataObject.data.time);
    }


    if(eventDataObject.msg_type == "trade_closed"){
        setResultNotification(eventDataObject.data.lastTradeDetails, 'update');
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

    if(!isBotRunning){
        scriptButton.innerHTML = "Click to stop Bot";
        const message = "Bot starting...";
        console.log("Message sent: " + message);
    
        let dataObj = {
            type: 'start', 
            params:{
                market: market
            }
        };
        isBotRunning = true;
    
        clientSocket.send(JSON.stringify(dataObj));
    } else {
        scriptButton.innerHTML = "Start Bot";
        const message = "Bot stoped";
        console.log("Message sent: " + message);
        let dataObj = {
            type: 'stop'
        };
        isBotRunning = false;

        clientSocket.send(JSON.stringify(dataObj));
    }


    
}

function setInitData(data) {
    if(data.msg_type == "authorize"){
        console.log('data: ',data);

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

function setResultNotification(lastTradeDetails, type){

    const marketObj = marketArray.find((item) => item.value === lastTradeDetails.market);
    let newClassName = null;
    let status = null;

    if (type == 'update') {
        let profit = lastTradeDetails.profit;
        const element = document.getElementById(lastTradeDetails.id);

        if(element){
            if (profit >= 0) {
                newClassName = "green";
                status = "WIN";
            } else if (profit < 0) {
                newClassName = "red";
                status = "LOSS";
            }
    
            const profitElement = document.getElementById(lastTradeDetails.id + "-profit");
            const statusElement = document.getElementById(lastTradeDetails.id + "-status");
    
            if (profitElement) {
                const spanElement = profitElement.querySelector("span"); // Select the <span> inside the parent element
                if (spanElement) {
                    spanElement.className = newClassName; // Set the class
                    spanElement.innerHTML = profit; // Set the inner HTML
                } else {
                    console.log("No <span> element found inside the parent element.");
                }
            } else {
                console.log("Parent element not found.");
            }
    
            if (statusElement) {
                const spanElement = statusElement.querySelector("span"); // Select the <span> inside the parent element
                if (spanElement) {
                    spanElement.className = newClassName; // Set the class
                    spanElement.innerHTML = status; // Set the inner HTML
                } else {
                    console.log("No <span> element found inside the parent element.");
                }
            } else {
                console.log("Parent element not found.");
            }
        } else {
            if(lastTradeDetails.profit > 0){
                newClassName = "green";
                status = "WIN";
            } else if(lastTradeDetails.profit < 0){
                newClassName = "red";
                status = "LOSS";
            }
            $(".result-notification").prepend(`<span class="stake-info" id="${lastTradeDetails.id}"><span class="detailt"><span>Contract ID : </span><span class="contract-info">${lastTradeDetails.id}</span></span><span class="detailt"><span>Market : </span><span class="contract-info">${marketObj.name}</span></span><span class="detailt"><span>Type : </span><span class="contract-info">${lastTradeDetails.type}</span></span><span class="detailt"><span>Stake : </span><span class="contract-info">${lastTradeDetails.stake}</span></span><span class="detailt"><span>Profit / Loss Amount : </span><span class="contract-info" id="${lastTradeDetails.id}-profit"><span class="${newClassName}">${lastTradeDetails.profit}</span></span></span><span class="detailt"><span>Status : </span><span class="contract-info" id="${lastTradeDetails.id}-status"><span class="${newClassName}">${status}</span></span></span></span>`);
        
        }
        
    } else {
        $(".result-notification").prepend(`<span class="stake-info" id="${lastTradeDetails.id}"><span class="detailt"><span>Contract ID : </span><span class="contract-info">${lastTradeDetails.id}</span></span><span class="detailt"><span>Market : </span><span class="contract-info">${marketObj.name}</span></span><span class="detailt"><span>Type : </span><span class="contract-info">${lastTradeDetails.type}</span></span><span class="detailt"><span>Stake : </span><span class="contract-info">${lastTradeDetails.stake}</span></span><span class="detailt"><span>Profit / Loss Amount : </span><span class="contract-info" id="${lastTradeDetails.id}-profit"><span class="">-</span></span></span><span class="detailt"><span>Status : </span><span class="contract-info" id="${lastTradeDetails.id}-status"><span class="">-</span></span></span></span>`);
    }


}

function setTickCountDown(tickCount, tick) {
    if (tickCount > tick) {
        setFlashNotification(`Trade will close in <span class="number">${tickCount - tick}</span> tick.`,0);
    } else if (tickCount == tick) {
        setFlashNotification(``, 0);
    }
}

function setFlashNotification(message, timeInSeconds) {
    if(isBotRunning){
        $(".flash-notification").html(message);
        if (timeInSeconds > 0) {
            setTimeout(() => {
                $(".flash-notification").html("");
            }, timeInSeconds * 1000);
        }
    }
}