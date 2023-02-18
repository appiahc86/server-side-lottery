const db = require("../../../config/db");
const logger = require("../../../winston");


const settingsIndexController = {
    //Get Settings
    index: async (req, res) => {
        try {
            const query = await db("settings").where('id', 1).limit(1);
            return res.status(200).send(query[0])
        }catch (e) {
            logger.error(e);
            return res.status(400).send("Could not fetch game status")
        }
    },


    //set game status
    setGameStatus: async (req, res)  => {
        try {
            const status = req.body.status;
            await db('settings').where('id', 1).update({gameStatus: status})
            return res.status(200).end();
        }catch (e) {
            logger.error(e);
            return res.status(400).send("Could not set game status")
        }
    },


    //set withdrawal status
    setWithdrawalStatus: async (req, res)  => {
        try {
            const status = req.body.status;
            await db('settings').where('id', 1).update({withdrawals: status})
            return res.status(200).end();
        }catch (e) {
            logger.error(e);
            return res.status(400).send("Could not set game status")
        }
    },


    //set Deposit status
    setDepositStatus: async (req, res)  => {
        try {
            const status = req.body.status;
            await db('settings').where('id', 1).update({deposits: status})
            return res.status(200).end();
        }catch (e) {
            logger.error(e);
            return res.status(400).send("Could not set game status")
        }
    },


}


module.exports = settingsIndexController;