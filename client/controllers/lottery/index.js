const db = require("../../../config/db");
const { stakeFunction } = require("../../../functions");
const logger = require("../../../winston");
const moment = require("moment");
const lotteryController = {

    stake: async (req, res) => {

        try {
                               //.............Game status..............

            let today = moment();
            let currentHour = today.hours();

            //Close the game between 7 pm and 8pm
            if (currentHour >= 19 && currentHour < 20) {
                return res.status(400).send("Sorry, game is closed. Please come back after 8pm");
            }


            //Open the game for tomorrow
            if (currentHour >= 20 ){
               today = moment().add(1, 'days')
            }



            const settings = await db('settings').where('id', 1).limit(1);

            if (!settings[0].gameStatus) return res.status(400).send("Sorry, game is closed by admin");


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


            let ticketId = null;

            await db.transaction(async trx => {
                //Insert into tickets table
                let newTicket = await trx("tickets").insert({
                    userId: req.user.id,
                    numbers: JSON.stringify(req.body.selectedNumbers),
                    amount: req.body.amountToStake,
                    payable: payable,
                    ticketDate: today.format("YYYY-MM-DD"),
                    createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
                })

                ticketId = newTicket[0];

                //Deduct Amount from user's account balance
                await trx("users").where("id", req.user.id)
                    .decrement("balance", parseFloat(payable))

                //insert into transaction logs table
                await trx("transactionLogs").insert({
                    userId: req.user.id,
                    type: "stake",
                    amount: payable,
                    oldBalance: req.user.balance,
                    newBalance: parseFloat( req.user.balance) - payable,
                    date: moment().format("YYYY-MM-DD"),
                    createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
                })
            })

            res.status(201).end();

            // Send real time to admin users
            if (currentHour < 19 ){
                req.io.to('admin-users').emit('current-tickets', {
                    id: ticketId,
                    user: req.user.phone,
                    numbers: JSON.stringify(req.body.selectedNumbers),
                    amount: req.body.amountToStake,
                    payable,
                    createdAt: moment()
                })
            }


        }catch (e) {
                logger.error(e);
                return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block


    } // ./Stake

}

module.exports = lotteryController;