const {withdrawalTrigger} = require('./withdrawalTrigger');
const { winnersTrigger } = require("./winnersTrigger");
const {depositTrigger} = require("./depositTrigger");


const triggers =  [
    withdrawalTrigger, depositTrigger, winnersTrigger
]

const runTriggers = async () => {

    for (const trigger of triggers) {
        await trigger();
    }
}

module.exports = runTriggers;