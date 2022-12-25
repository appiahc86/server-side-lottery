const db = require("../../config/db");
const { stakeFunction } = require("../../functions/index");

const lotteryController = {

    stake: async (req, res) => {

        try {
            // validation
            if (!req.body.amountToStake || req.amountToStake < 1) return res.status(400).send("Amount should be at least GHS 1");
            if (req.body.selectedNumbers.length < 2) return res.status(400).send("Please Select at least two numbers");

            const payable = stakeFunction(req.body.selectedNumbers.length, req.body.amountToStake );

            const userId = "-1"
            const ticketId = Date.now().toString() + userId;
            const query = await db("tickets").insert({
                userId: 1,
                ticketId,
                numbers: JSON.stringify(req.body.selectedNumbers),
                day: new Date().getDay(),
                amount: payable
            })

            res.status(200).
            send({message:
                    `Your Stake GHS${payable} Was Successful ${req.body.selectedNumbers} ticketId: ${ticketId} ${new Date()}`
            });
        }catch (e) {
                console.log(e);
                return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block


    } // ./Stake


}

module.exports = lotteryController;