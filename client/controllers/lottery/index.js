const db = require("../../../config/db");
const { stakeFunction } = require("../../../functions");

const lotteryController = {

    stake: async (req, res) => {

        try {
            // validation
            if (!req.body.amountToStake || req.amountToStake < 1) return res.status(400).send("Amount should be at least GHS 1");
            if (req.body.selectedNumbers.length < 2) return res.status(400).send("Please Select at least two numbers");


            const payable = stakeFunction(req.body.selectedNumbers.length, req.body.amountToStake );

            if (parseFloat(req.user.balance) < parseFloat(payable)) return res.status(400).send("Your balance is not sufficient");

            const userId = "-" + req.user.id
            const ticketId = Date.now().toString() + userId;

            await db.transaction(async trx => {
                //Insert into tickets table
                await trx("tickets").insert({
                    userId: req.user.id,
                    ticketId,
                    ticketDate: new Date(),
                    numbers: JSON.stringify(req.body.selectedNumbers),
                    day: new Date().getDay(),
                    amount: payable,
                    createdAt: new Date()
                })

                //Deduct Amount from user's account balance
                await trx("users").where("id", req.user.id)
                    .decrement("balance", parseFloat(payable))

            })

            res.status(201).end();


        }catch (e) {
                console.log(e);
                return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block


    } // ./Stake


}

module.exports = lotteryController;