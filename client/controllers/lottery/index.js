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
            let todayDrawPerformed = false;

            //check if draw is performed
            const drawNumbers = await db('machine_numbers').orderBy('id', 'desc').limit(1);
            if (drawNumbers.length > 0){
                // if today's draw is performed
                if(moment(drawNumbers[0].drawDate).format("YYYY-MM-DD") ===
                    today.format("YYYY-MM-DD") && drawNumbers[0].closed)
                    todayDrawPerformed = true;
            }


            //Close the game between 7 pm and 8pm if today's draw is not performed.
            if (currentHour >= 19 && currentHour < 20 && todayDrawPerformed === false) {
                return res.status(400).send("Sorry, game is closed. Please come back after 8pm");
            }


            //Open the game for tomorrow
            if (currentHour >= 20 || !!todayDrawPerformed){
               today = moment().add(1, 'days')
            }



            const settings = await db('settings').where('id', 1).limit(1);

            //If game is closed by admin
            if (!settings[0].gameStatus) return res.status(400).send("Sorry, game closed");


                                        // ..........validation..............
            if (!req.body.amountToStake) return res.status(400).send("Please enter amount to stake");
            if (req.body.selectedNumbers.length < 2) return res.status(400).send("Please Select at least two numbers");

            let testDuplicates = [];
            for (const number of req.body.selectedNumbers){
                if (typeof number !== "number") return res.status(400).send("Your data is invalid");
                if (number < 1 || number > 90) return res.status(400).send("number should be from 1 to 90");
                if (testDuplicates.includes(number)) return res.status(400).send("You cannot select same number twice");
                testDuplicates.push(number);
            }


            //calculate payable
            const payable = stakeFunction(req.body.selectedNumbers.length, req.body.amountToStake);
            if (!payable || payable < 1) return res.status(400).send("Payable should be at least GHS 1");

            //if payable is less than 1
            if (payable < 1) return res.status(400).send("Minimum amount should be 1");


            //user's balance
            const balance = parseFloat(req.user.balance);

            //If balance is less than payable
            if (balance < payable) return res.status(400).send("You do not have enough balance");


            let ticketId = null;

            await db.transaction(async trx => {

                const user = await trx('users').where('id', req.user.id)
                    .limit(1).forUpdate();


                //Insert into tickets table
                let newTicket = await trx("tickets").insert({
                    userId: req.user.id,
                    numbers: JSON.stringify(req.body.selectedNumbers),
                    amount: req.body.amountToStake,
                    payable: payable,
                    ticketDate: today.format("YYYY-MM-DD"),
                    created_at: moment().format("YYYY-MM-DD HH:mm:ss")
                })

                ticketId = newTicket[0];

                const newBalance = user[0].balance - payable;

                    //Debit account balance

                    await trx("users").where("id", req.user.id)
                        .update("balance", newBalance)


                    req.user.balance = newBalance;



                //insert into transaction logs table
                await trx("transaction_logs").insert({
                    userId: req.user.id,
                    type: "stake",
                    amount: payable,
                    oldBalance: user[0].balance,
                    newBalance: newBalance,
                    transaction_id: ticketId,
                    description: "Ticket Purchase",
                    created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                })

            }) // ./end of db transaction


            res.status(201).send({balance: req.user.balance});

            // Send real time to client users
            if (currentHour < 19 ){
                req.io.to('admin-users').emit('current-tickets', {
                    id: ticketId,
                    user: req.user.phone,
                    numbers: JSON.stringify(req.body.selectedNumbers),
                    amount: req.body.amountToStake,
                    payable,
                    created_at: moment()
                })
            }else{
                   req.io.to('admin-users').emit('tomorrow-tickets', {
                    id: ticketId,
                    user: req.user.phone,
                    numbers: JSON.stringify(req.body.selectedNumbers),
                    amount: req.body.amountToStake,
                    payable,
                    createdAt: moment()
                })
            }


        }catch (e) {
            logger.error('client, lottery controller stake');
                logger.error(e);
                return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block


    } // ./Stake

}

module.exports = lotteryController;