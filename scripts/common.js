const accounts = [
    { name: "KunkumaGP", value: "lkUxtOopvUhCpIX" },
    { name: "KUNKUMAGP Real", value: "Y71P0GIOxz3YYvr" },
    { name: "Kunkuma Trading", value: "hJfU1x5xpoSTwHe" },
    { name: "W H K G Prasanna 85", value: "iVOpdm24hBhw3JI" },
];
const accountSelectElement = document.getElementById("account_select");

accounts.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value; // Set the value
    option.textContent = item.name; // Set the display text
    accountSelectElement.appendChild(option); // Append to the <select>
});


const marketArray = [
    { value: "R_10", name: "Volatility 10 Index" },
    { value: "R_25", name: "Volatility 25 Index" },
    { value: "R_50", name: "Volatility 50 Index" },
    { value: "R_75", name: "Volatility 75 Index" },
    { value: "R_100", name: "Volatility 100 Index" },
];

const marketSelectElement = document.getElementById("market");

marketArray.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value; // Set the value
    option.textContent = item.name; // Set the display text
    marketSelectElement.appendChild(option); // Append to the <select>
});


const authenticateButton = document.getElementById("authenticateButton");
const scriptRun = document.getElementById("scriptRun");


// let initianAccountBalance = 0;
// let amountPutForTrading = 0;
// let amountPercentage = 0.1;
// let stake = 0.35;
// let updatedAccountBalance = 0;
// let netProfit = 0;

accountSelectElement.value = 'lkUxtOopvUhCpIX';

let apiToken = accountSelectElement.value;
let market = marketSelectElement.value;


accountSelectElement.addEventListener("change", () => {
    apiToken = accountSelectElement.value;
});


function setAccountInfo(elementId, message) {
    document.getElementById(elementId).innerHTML = message;
}