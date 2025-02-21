const express = require('express');
const webSocket = require("ws");

let ws = new webSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

const server = new webSocket.Server({ port: 8080 });

let socket = null;

let isTradeRunning = false, automation = false;
let tradeType = "even";

let tradeProposal = null;

// let netProfit = 0;
let tickCount = 1;

let varObject = {
    initianAccountBalance: 0,
    amountPutForTrading: 0,
    amountPercentage: 0.1,
    updatedAccountBalance: 0,
    stake: 0.35,
    market: null,
    totalTradeCount: 0,
    lastTradeDetails: {
        id: null,
        type: null,
        market: null,
        stake: null,
        profit: null
    }
};


server.on("connection", (sc) => {
    console.log("Client connected.");

    socket = sc;

    sc.on("message", (message) => {
        let res = JSON.parse(message);

        if (res.type === 'auth') {
            getAuthentication(res.params);
        }

        if (res.type === 'start') {
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

    if(wsResponse.msg_type == "authorize"){
        setInitData(wsResponse);
        socket.send(JSON.stringify({msg_type: 'authorize',data: varObject}));
    }

    if(wsResponse.msg_type == "proposal"){
        tradeProposal = wsResponse;
        if(!isTradeRunning){
            makeTheTrade();
        }
    }

    if(wsResponse.msg_type == "buy"){

        if ( wsResponse.buy == undefined || wsResponse.buy.contract_id == undefined) {
            // placeTrade();
        } else {
            isTradeRunning = true;
            openTradeDataProcess(wsResponse);
        }

        automation = true;
        socket.send(JSON.stringify({msg_type: 'trade_open',data: varObject}));

        // setTimeout(() => {
        //     fetchTradeDetails(lastTradeId);
        // }, 500);

    }

    if (wsResponse.msg_type === "proposal_open_contract") {
        console.log('wsResponse: ', wsResponse);

    }

    
};






const getAuthentication = (data) => {
    // setFlashNotification("Authenticating....", 0);
    console.log("Authenticating....");
    ws.send(JSON.stringify({ authorize: data.apiToken }));
};


const botStart = (data) => {
    if (!isTradeRunning) {
        varObject.market = data.market
        placeTrade();
    }
};

function setInitData(data) {
    // console.log(data);

    if(data.msg_type == "authorize"){

        varObject.initianAccountBalance = Number(data.authorize.balance);

        varObject.amountPutForTrading = Number((varObject.initianAccountBalance * (varObject.amountPercentage / 100)).toFixed(2));
        varObject.stake = Number(varObject.amountPutForTrading);

        varObject.updatedAccountBalance = Number(varObject.initianAccountBalance);
    }
}


const placeTrade = (result = null) => {
    let tradeState = null;
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

        varObject.stake = Number(varObject.stake);
        varObject.stake < 0.35 ? (varObject.stake = 0.35) : (varObject.stake = varObject.stake);

        tickCount = getRandomNumber(5, 8);

        const tradeRequest = {
            proposal: 1,
            amount: varObject.stake.toFixed(2),
            basis: "stake",
            contract_type: tradeState, // Use 'DIGITEVEN' for even and 'DIGITODD' for odd
            currency: "USD",
            duration: tickCount,
            duration_unit: "t",
            symbol: varObject.market,
        };

        // Send the trade request to the WebSocket
        ws.send(JSON.stringify(tradeRequest));
    }
};

const makeTheTrade = () => {
    if ( tradeProposal.proposal == undefined || tradeProposal.proposal.id == undefined) {
        isTradeRunning = false;
        // webSocketConnectionStart();
        console.log('Connection has colsed.');
    } else {
        buyRequest = {
            buy: tradeProposal.proposal.id,
            price: tradeProposal.proposal.ask_price,
        };
        ws.send(JSON.stringify(buyRequest));
    }
};

const openTradeDataProcess = (data) => {
    varObject.lastTradeDetails.id = data.buy.contract_id;
    varObject.totalTradeCount = varObject.totalTradeCount + 1;

    const shortcodeArray = data.buy.shortcode.split("_");

    if (shortcodeArray[0] == "DIGITEVEN") {
        varObject.lastTradeDetails.type = "Even";
    } else if (shortcodeArray[0] ==  "DIGITODD") {
        varObject.lastTradeDetails.type = "Odd";
    }

    varObject.lastTradeDetails.market = shortcodeArray[1] + "_" + shortcodeArray[2];
    varObject.lastTradeDetails.stake = Number(data.buy.buy_price);

};




function getRandomNumber(min, max) {
    if (min > max) {
        throw new Error("Min value must be less than or equal to Max value");
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const fetchTradeDetails = (contractId) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open.");
        return;
    }

    const contractDetailsRequest = {
        proposal_open_contract: 1,
        contract_id: contractId,
    };

    ws.send(JSON.stringify(contractDetailsRequest));
};