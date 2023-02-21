const {updateBalanceTrigger} = require("./transactionTrigger");
const { winnersTrigger } = require("./winnersTrigger");
const { testProcedure } = require("./procedure");


const triggers =  [
    updateBalanceTrigger, winnersTrigger,
    // testProcedure
]

const runTriggers = async () => {

    for (const trigger of triggers) {
        await trigger();
    }
}

module.exports = runTriggers;