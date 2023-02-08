const db = require("../../../config/db");
const { stakeFunction } = require("../../../functions");
const logger = require("../../../winston");

const lotteryController = {

    stake: async (req, res) => {

        try {
                               //.............Game status..............

            //if the time is >= 7pm Close the game;
            const today = new Date();
            if (today.getHours() > 18) return res.status(400).send("Sorry, game is closed. Please check back tommorow");

            const gameStatus = await db('gameStatus').where('id', 1).limit(1);

            if (!gameStatus[0].open) return res.status(400).send("Sorry, game is closed by admin");


                                        // ..........validation..............
            if (!req.body.amountToStake || req.amountToStake < 1) return res.status(400).send("Amount should be at least GHS 1");
            if (req.body.selectedNumbers.length < 2) return res.status(400).send("Please Select at least two numbers");

            let testDuplicates = [];
            for (const number of req.body.selectedNumbers){
                if (typeof number !== "number") return res.status(400).send("You data is invalid");
                if (number < 1 || number > 90) return res.status(400).send("number should be from 1 to 90");
                if (testDuplicates.includes(number)) return res.status(400).send("You cannot select same number twice");
                testDuplicates.push(number);
            }


            const payable = stakeFunction(req.body.selectedNumbers.length, req.body.amountToStake );

            if (parseFloat(req.user.balance) < parseFloat(payable)) return res.status(400).send("Your balance is not sufficient");
            if (payable < 1) return res.status(400).send("Minimum amount should be 1");

            await db.transaction(async trx => {
                //Insert into tickets table
                await trx("tickets").insert({
                    userId: req.user.id,
                    numbers: JSON.stringify(req.body.selectedNumbers),
                    amount: payable,
                    ticketDate: new Date(),
                    createdAt: new Date()
                })

                //Deduct Amount from user's account balance
                await trx("users").where("id", req.user.id)
                    .decrement("balance", parseFloat(payable))

            })

            res.status(201).end();


        }catch (e) {
                logger.error(e);
                return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block


    } // ./Stake


}

module.exports = lotteryController;