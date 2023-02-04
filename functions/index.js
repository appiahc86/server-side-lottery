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


const convertNetwork = (newtwork) => {
    let type = '';
    switch (newtwork) {
        case 'airtelTigo': type = 'ATL'
        break;
        case 'vodafone': type =  'VOD'
        break;
        default: type =  'MTN'
            break;
    }

    return type;
}

module.exports = {
    stakeFunction, generateRandomNumber, calculateWinnings, convertNetwork
}