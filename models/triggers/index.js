const {updateBalanceTrigger} = require("./transactionTrigger");
const { winnersTrigger } = require("./winnersTrigger");


const triggers =  [
    updateBalanceTrigger, winnersTrigger
]

const runTriggers = async () => {

    for (const trigger of triggers) {
        await trigger();
    }
}

module.exports = runTriggers;