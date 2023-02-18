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
const calculateWinnings = (chosenNumbers, amount) => {

    if (chosenNumbers === 2) return amount * 200  //This is for 2 sure

    if (chosenNumbers === 3) return amount * 2000;  //if 3 numbers won
    if (chosenNumbers === 4) return amount * 5500;  //if 4 numbers won
    if (chosenNumbers === 5) return amount * 40000;  //if 5 numbers won

    return 0;
}

//get bank code by network
const getBankCode = (newtwork) => {
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


const convertNetwork = (newtwork) => {
    let type = '';
    switch (newtwork) {
        case 'airtelTigo': type = 'tgo'
            break;
        case 'vodafone': type =  'vod'
            break;
        default: type =  'mtn'
            break;
    }

    return type;
}


//Generate reference number for withdrawals
const generateReferenceNumber = (date) => {
    let year = new Date(date).getFullYear();
    let month = new Date(date).getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let day = new Date(date).getDate();
    day = day < 10 ? `0${day}` : day;
    let hour = new Date(date).getHours();
    hour = hour < 10 ? `0${hour}` : hour;
    let minutes = new Date(date).getMinutes();
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    let seconds = new Date(date).getSeconds();
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    let milliseconds = new Date(date).getMilliseconds();
    milliseconds = milliseconds < 10 ? `0${milliseconds}` : milliseconds;

    return `${year}${month}${day}${hour}${minutes}${seconds}${milliseconds}wtd`;
}



module.exports = {
    stakeFunction, generateRandomNumber, calculateWinnings, getBankCode,
    convertNetwork, generateReferenceNumber
}