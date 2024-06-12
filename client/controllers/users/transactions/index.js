const db = require("../../../../config/db");
const config = require("../../../../config/config");
const axios = require('axios');
const logger = require("../../../../winston");
const { getBankCode, convertNetwork, generateReferenceNumber } = require("../../../../functions/index");
const moment = require("moment");
let errorMessage = 'Sorry, this is not a valid momo number or not registered on this network';


const userTransactions  = {

    //Get user's transactions
    index: async (req, res) => {
        try {
            const data = await db("transactions").where({userId: req.user.id})
                .select('id', 'transactionType', 'amount', 'referenceNumber',
                    'status', 'createdAt')
                .orderBy('id', 'DESC').limit(20);
            res.status(200).send(data);
        }catch (e) {
            logger.error('client, transactions controller index');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },


    //Withdraw Money Request
    withdrawal: async (req, res) => {
        const { amount, network} = req.body;

        if (parseFloat(req.user.balance) < parseFloat(amount)) return res.status(400).send('Sorry! your balance is not sufficient');

        if (amount < 1) return res.status(400).send("Minimum amount should be 1");
        if (amount > 30000) return res.status(400).send("Maximum amount should be 30,000");

        if (network !== req.user.network) return res.status(400).send(`Please select ${req.user.network} as network`);

        try {

            //Check if withdrawals are disabled by client
            const settings = await db('settings').where('id', 1);
            if (!!settings[0].withdrawals === false)
                return res.status(400).send(`Sorry withdrawals have been disabled by admin`);


            //Check if user already has pending transaction
            const pendingRequest = await db("transactions")
                .where("userId", req.user.id)
                .andWhere('status', "pending").limit(1);

            if (pendingRequest.length > 0) {
                return res.status(400)
                    .send("Sorry, you already have a pending request. Please try again later.");
            }


                //reference number for withdrawal
                const referenceNumber = generateReferenceNumber(moment()) + req.user.id;

                        //save to transactions table
                        await db('transactions').insert({
                            referenceNumber,
                            userId: req.user.id,
                            transactionType: 'withdrawal',
                            amount: parseFloat(amount),
                            // network,
                            transactionDate: moment().format("YYYY-MM-DD"),
                            createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
                        })

                    res.status(200).end();

                        //TODO Prompt admin by SMS

                    //Set first deposit bonus to 0
                    await db('userPromos').where('promoId', 1)
                        .andWhere('userId', req.user.id)
                        .update({amount: 0});


        }catch (e) {
            if (e.response){
                return res.status(400).send(e.response.data.message);
            }
            logger.error('client, transactions controller withdrawal');
            logger.error(e)
            return res.status(400).send("Sorry your request was not successful");
        }
    },


    //Get Account Balance
    getAccountBalance: (req, res) => {
        return res.status(200).send({balance: req.user.balance});
    }
}

module.exports = userTransactions;