const {updateBalanceTrigger} = require("./transactionTrigger");


const triggers =  [
    updateBalanceTrigger
]

const runTriggers = async () => {

    for (const trigger of triggers) {
        await trigger();
    }
}

module.exports = runTriggers;