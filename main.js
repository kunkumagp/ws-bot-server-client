const express = require('express');
const webSocket = require("ws");
const cliProgress = require("cli-progress");

let ws = new webSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

const server = new webSocket.Server({ port: 8080 });
const martingaleMultiplier = 2.07112;

let socket = null;
let botStartStatus = false;
let botStopStatus = true;

let isTradeRunning = false, automation = false;
let tradeType = "even";

let tradeProposal = null;
let tickCount = 1;
let stopTimer = false;
let timerRef;

let varObject = {
    initianAccountBalance: 0,
    amountPutForTrading: 0,
    targetAmount: 0,
    amountPercentage: 0.1,
    targetPercentage:0.08,
    updatedAccountBalance: 0,
    stake: 0.35,
    market: null,
    totalTradeCount: 0,
    winTradeCount: 0,
    lossTradeCount: 0,
    lostCountInRow: 0,
    currentProfitAmount: 0,
    currentLossAmount: 0,
    netProfit: 0,
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

        if (res.type === 'stop') {
            console.log(11223);
            botStop();
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

ws.onmessage = async function (event) {
    wsResponse = JSON.parse(event.data);
    // console.log("wsResponse: ", wsResponse);

    if(wsResponse.msg_type == "authorize"){
        setInitData(wsResponse);
        socket.send(JSON.stringify({msg_type: 'authorize',data: varObject}));
    }

    if(wsResponse.msg_type == "proposal"){
        tradeProposal = wsResponse;
        if(!isTradeRunning && botStartStatus){
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

        setTimeout(() => {
            fetchTradeDetails(varObject.lastTradeDetails.id);
        }, 500);
        socket.send(JSON.stringify({msg_type: 'trade_open',data: varObject}));

    }

    if (wsResponse.msg_type === "proposal_open_contract") {
        if (wsResponse.proposal_open_contract.contract_id === varObject.lastTradeDetails.id) {
            const contract = wsResponse.proposal_open_contract;

            if (contract.is_sold){

                const profit = contract.profit;
                const result = profit > 0 ? "Win" : "Loss";

                // setInfo(contract, profit);
                stakeChange(result);
                varObject.lastTradeDetails.profit = profit;

                updateReturnDataObject(profit);

                console.log('------------------');
                if(profit > 0){
                    console.log(`\x1b[32mWin\x1b[0m | \x1b[33mProfit:\x1b[0m \x1b[32m${profit}\x1b[0m`);
                } else {
                    console.log(`\x1b[31mLoss\x1b[0m | \x1b[33mProfit:\x1b[0m \x1b[31m${profit}\x1b[0m`);
                    // console.log(`${result} | Profit: ${profit} `);
                }
                console.log('------------------');

                if (varObject.currentLossAmount < 0) {
                    if(varObject.lostCountInRow >= 2){
                        // let newTime = (getRandomNumber(1, 2) * 60000 );
                        // let newTime = (getRandomNumber(10, 20) * 1000);
                        let newTime = (getRandomNumber(1, 3) * 1000);
                        setTimer(newTime);
                        setTimeout(() => {
                            isTradeRunning = false;
                            placeTrade();
                        }, newTime);
                    } else {
                        isTradeRunning = false;
                        placeTrade();
                    }
                } else {
                    if (varObject.currentProfitAmount >= varObject.targetAmount) {
                        // let newTime = (getRandomNumber(2, 3) * 60000 );
                        let newTime = (getRandomNumber(1, 3) * 1000 );
                        setTimer(newTime);
                        setTimeout(() => {
                            isTradeRunning = false;
                            botRestart();
                        }, newTime);
                    } else {
                        isTradeRunning = false;
                        placeTrade();
                    }

                }
                socket.send(JSON.stringify({msg_type: 'trade_closed',data: varObject}));
            } else {

                let expiryInSeconds = getSecondsRemaining(contract.date_expiry);
                if(expiryInSeconds > 0){
                    showProgressBar(expiryInSeconds, 'This trade will closed in ');
                
                    await showProgressBar(expiryInSeconds, 'This trade will closed in ');
    
                    setTimeout(() => {
                        fetchTradeDetails(varObject.lastTradeDetails.id);
                    }, 1000);
                }
                
            }
           
        }
    }

    // if (wsResponse.msg_type === "proposal_open_contract") {
    //     // console.log('wsResponse: ', wsResponse);

        

    //     if (wsResponse.proposal_open_contract.contract_id === varObject.lastTradeDetails.id) {
    //         const contract = wsResponse.proposal_open_contract;

    //     //     showProgressBar(contract.tick_stream.length);

    //     // setTimeout(() => {
            
    //     // }, contract.tick_stream.length);

    //         if (contract.is_sold){
    //             const profit = contract.profit;
    //             const result = profit > 0 ? "Win" : "Loss";

    //             // setInfo(contract, profit);
    //             stakeChange(result);
    //             varObject.lastTradeDetails.profit = profit;

    //             updateReturnDataObject(profit);

    //             console.log('profit: ', profit);
    //             console.log('result: ', result);
    //             console.log('------------------');

    //             if (varObject.currentLossAmount < 0) {
    //                 if(varObject.lostCountInRow >= 2){
    //                     // let newTime = (getRandomNumber(1, 2) * 60000 );
    //                     // let newTime = (getRandomNumber(10, 20) * 1000);
    //                     let newTime = (getRandomNumber(1, 3) * 1000);
    //                     setTimer(newTime);
    //                     setTimeout(() => {
    //                         isTradeRunning = false;
    //                         placeTrade();
    //                     }, newTime);
    //                 } else {
    //                     isTradeRunning = false;
    //                     placeTrade();
    //                 }
    //             } else {
    //                 if (varObject.currentProfitAmount >= varObject.targetAmount) {
    //                     // let newTime = (getRandomNumber(2, 3) * 60000 );
    //                     let newTime = (getRandomNumber(1, 3) * 1000 );
    //                     setTimer(newTime);
    //                     setTimeout(() => {
    //                         isTradeRunning = false;
    //                         botRestart();
    //                     }, newTime);
    //                 } else {
    //                     isTradeRunning = false;
    //                     placeTrade();
    //                 }

    //             }
    //             socket.send(JSON.stringify({msg_type: 'trade_closed',data: varObject}));


    //         } else {
                
    //             setTimeout(() => {
    //                 socket.send(JSON.stringify({msg_type: 'tick_counter',data: {tick_count: contract.tick_count, length: contract.tick_stream.length}}));
    //                 fetchTradeDetails(varObject.lastTradeDetails.id);
    //             }, 1000);
    //         }
    //     }

    // }

    
};






const getAuthentication = (data) => {
    // setFlashNotification("Authenticating....", 0);
    console.log("Authenticating....");
    ws.send(JSON.stringify({ authorize: data.apiToken }));
};


const botStart = (data) => {
    botStartStatus = true;
    botStopStatus = false;
    if (!isTradeRunning && botStartStatus) {
        varObject.market = data.market
        placeTrade();
    }
};

const botRestart = () => {
    if (!isTradeRunning && botStartStatus) {
        placeTrade();
    }
};

const botStop = () => {
    botStartStatus = false;
    botStopStatus = true;
    isTradeRunning = false;

    stopTimer = true;
    clearInterval(timerRef);

    socket.send(JSON.stringify({msg_type: 'flash_message',data: {message: ``, time: 0}}));
};

function setInitData(data) {
    // console.log(data);

    if(data.msg_type == "authorize"){

        varObject.initianAccountBalance = Number(data.authorize.balance);

        varObject.targetAmount =  Number((varObject.initianAccountBalance * (varObject.targetPercentage / 100)).toFixed(2));

        varObject.amountPutForTrading = Number((varObject.initianAccountBalance * (varObject.amountPercentage / 100)).toFixed(2));
        varObject.stake = Number(varObject.amountPutForTrading);

        varObject.updatedAccountBalance = Number(varObject.initianAccountBalance);
    }
}


function setTimer(time) {
    if (!botStopStatus) {
        let timeleft = time / 1000; // Convert milliseconds to seconds
        
        if (!isTradeRunning && botStartStatus) {
            timeleft = 0;
            stopTimer = true;
            socket.send(JSON.stringify({ msg_type: 'flash_message', data: { message: ``, time: 0 } }));
        }
        
        clearInterval(timerRef); // Clear any existing timer before starting a new one
        
        timerRef = setInterval(function () {
            if (timeleft <= 0 || stopTimer) {
                clearInterval(timerRef);
                socket.send(JSON.stringify({ msg_type: 'flash_message', data: { message: ``, time: 0 } }));
            } else {
                let formattedTime = formatTime(timeleft);
                socket.send(JSON.stringify({ msg_type: 'flash_message', data: { message: `Bot will run again in <span class="number">${formattedTime}</span>.`, time: 0 } }));
            }
            timeleft -= 1;
        }, 1000);
    }
}


const placeTrade = (result = null) => {
    let tradeState = null;
    if (!isTradeRunning && botStartStatus) {
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

// Helper function to format time (hide hours & minutes if they are 0)
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let timeString = "";

    if (hours > 0) timeString += `${hours} h `;
    if (minutes > 0) timeString += `${minutes} m `;
    if (secs > 0 || timeString === "") timeString += `${secs} s`;

    return timeString.trim();
}



const stakeChange = (status) => {
    if (status == "Loss") {
        varObject.stake = varObject.stake * martingaleMultiplier;
    } else if (status == "Win") {
        varObject.stake = varObject.amountPutForTrading;
    }
};

const updateReturnDataObject = (lastTradeProfitValue) => {

    varObject.totalTradeCount = varObject.totalTradeCount + 1;
    varObject.updatedAccountBalance = varObject.updatedAccountBalance + lastTradeProfitValue;
    varObject.netProfit = varObject.updatedAccountBalance - varObject.initianAccountBalance;

    if(lastTradeProfitValue > 0){
      
        varObject.winTradeCount = varObject.winTradeCount + 1;
        varObject.lostCountInRow = 0;
        varObject.currentProfitAmount = varObject.currentProfitAmount + lastTradeProfitValue ;
        varObject.currentLossAmount = 0 ;
        
    } else if(lastTradeProfitValue < 0){
       
        varObject.lossTradeCount = varObject.lossTradeCount + 1;
        varObject.lostCountInRow = varObject.lostCountInRow + 1;

        varObject.currentLossAmount = varObject.currentLossAmount + lastTradeProfitValue ;

    }




    // {
    //     "initianAccountBalance": 533.01,
    //     "amountPutForTrading": 0.53,
    //     "targetAmount": 0.43,
    //     "amountPercentage": 0.1,
    //     "targetPercentage": 0.08,
    //     "updatedAccountBalance": 533.01,
    //     "stake": 0.53,
    //     "market": null,
    //     "totalTradeCount": 0,
    //     "winTradeCount": 0,
    //     "lossTradeCount": 0,
    //     "lostCountInRow": 0,
    //     "currentProfitAmount": 0,
    //     "currentLossAmount": 0,
    //     "netProfit": 0,
    //     "lastTradeDetails": {
    //         "id": null,
    //         "type": null,
    //         "market": null,
    //         "stake": null,
    //         "profit": null
    //     }
    // }



};

const showProgressBar = (seconds, message) => {
    return new Promise((resolve) => {
      const bar = new cliProgress.SingleBar(
        {
          format: `⏳ ${message} [{bar}] {percentage}% | ETA: {eta}s`,
          hideCursor: true,
          clearOnComplete: true,
        },
        cliProgress.Presets.shades_classic
      );
  
      bar.start(seconds, 0);
  
      let counter = 0;
      const interval = setInterval(() => {
        counter++;
        bar.update(counter);
  
        if (counter >= seconds) {
          clearInterval(interval);
          bar.stop();
          resolve();
        }
      }, 1000);
    });
  };

  function getSecondsRemaining(expiryTimestamp) {
    const currentTimestamp = Math.floor(Date.now() / 1000); // Get current time in seconds
    return expiryTimestamp - currentTimestamp;
}