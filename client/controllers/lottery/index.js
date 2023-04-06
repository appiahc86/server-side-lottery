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

            //If game is closed by admin
            if (!settings[0].gameStatus) return res.status(400).send("Sorry, game closed");


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


            //calculate payable
            const payable = stakeFunction(req.body.selectedNumbers.length, req.body.amountToStake);

            //if payable is less than 1
            if (payable < 1) return res.status(400).send("Minimum amount should be 1");


          //Check if user has promo
            let bonus = 0;
            if (req.body.promo){
                let query = await db('userPromos').where({id: req.body.promo}).select('amount').limit(1);
                bonus = query[0] ? parseFloat(query[0].amount) : 0;
            }


            //user's balance
            const balance = parseFloat(req.user.balance);

            //If bonus plus balance is less than payable
            if ((balance + bonus) < payable) return res.status(400).send("Your balance is not sufficient");



            let ticketId = null;
            let bonusLeft = 0; //bonus left after deduction. will be sent as response payload

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



                if (bonus >= payable){ // If bonus is greater than or equal to payable

                    // Pay with bonus
                    await trx('userPromos').where('id', req.body.promo)
                        .decrement('amount', payable)
                    bonusLeft = bonus - payable;

                }else if (bonus > 0 && bonus < payable){ //if bonus > 0 and less than payable

                    //Pay with bonus and user's balance
                    await trx('userPromos').where('id', req.body.promo)
                        .update({amount: 0})
                    const amountToDeduct = payable - bonus;
                    await trx('users').where('id', req.user.id)
                        .decrement("balance", amountToDeduct)
                    req.user.balance = parseFloat(req.user.balance) - amountToDeduct;

                }else { //if No bonus

                    //Pay witn user's account balance
                    await trx("users").where("id", req.user.id)
                        .decrement("balance", payable)
                    req.user.balance = parseFloat(req.user.balance) - payable;

                }

                //insert into transaction logs table
                // await trx("transactionLogs").insert({
                //     userId: req.user.id,
                //     type: "stake",
                //     amount: payable,
                //     oldBalance: req.user.balance,
                //     newBalance: parseFloat( req.user.balance) - payable,
                //     date: moment().format("YYYY-MM-DD"),
                //     createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
                // })

            }) // ./end of db transaction


            res.status(201).send({bonusLeft, balance: req.user.balance});

            // Send real time to client users
            if (currentHour < 19 ){
                req.io.to('admin-users').emit('current-tickets', {
                    id: ticketId,
                    user: req.user.phone,
                    numbers: JSON.stringify(req.body.selectedNumbers),
                    amount: req.body.amountToStake,
                    payable,
                    createdAt: moment()
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