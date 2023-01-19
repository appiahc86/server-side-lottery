// calculates amount payable during stake
const stakeFunction = (selectedNumbers, amount) => {
    const determiner = selectedNumbers - 1;
    const permTotal = (selectedNumbers * determiner) * amount;
    return permTotal / 2;
}

//Generate random 6 digits
const generateRandomNumber = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

//calculate winnings
const calculateWinnings = (totalNumbers, amount) => {
    return totalNumbers * amount;
}

module.exports = {
    stakeFunction, generateRandomNumber, calculateWinnings
}