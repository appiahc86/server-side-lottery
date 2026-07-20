const db = require("../../../../config/db");
const config = require("../../../../config/config");
const axios = require('axios');
const logger = require("../../../../winston");
const { getBankCode, convertNetwork, generateReferenceNumber } = require("../../../../functions/index");
const moment = require("moment");
const {formatNumber} = require("../../../../functions");
const CryptoJS = require("crypto-js");
let errorMessage = 'Sorry, this is not a valid momo number or not registered on this network';



const userTransactions  = {

    //Get user's transactions
    index: async (req, res) => {
        try {
            const data = await db("transactions")
                .where({userId: req.user.id})
                .select('id', 'transactionType', 'amount', 'referenceNumber',
                    'status', 'created_at')
                .orderBy('id', 'DESC').limit(40);
            res.status(200).send({data, balance: req.user.balance});
        }catch (e) {
            logger.error('client, transactions controller index');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },


    //Deposit money
    deposit: async (req, res) => {

        const { amount } = req.body;
        const chargePercentage = config.PAYMENT_CHARGE_PERCENTAGE;
        const trx = await db.transaction();
        try {

            // Validation
            if (amount < 1) return res.status(400).send("Minimum amount should be 1");
            if (amount > 30000) return res.status(400).send("Maximum amount should be 30,000");

            const referenceNumber = generateReferenceNumber() + `${req.user.id}`;

            const charges = (parseFloat(chargePercentage) / 100 * parseFloat(amount)).toFixed(2);
            const amountMinusCharges =  parseFloat(amount) - charges; //Send to to payment API


            //Check if Deposits are disabled by admin
            const settings = await db('settings').where('id', 1);
            if (!!settings[0].deposits === false)
                return res.status(400).send(`Sorry Deposits have been disabled by admin`);


            //Save to DB
             await trx('transactions')
                .insert({
                    referenceNumber: referenceNumber,
                    extReferenceNumber: referenceNumber, // will update if api responds
                    userId: req.user.id,
                    transactionType: "deposit",
                    amount: parseFloat(amount),
                    chargesAmount: charges,
                    amountAfterCharges: parseFloat(amount) + parseFloat(charges),
                    created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                })


            const response = await  axios.post(
                'https://api.bulkclix.com/api/v1/payment-api/momopay',

                    {
                        amount: amountMinusCharges, //Payment api will add its charge before sending prompt to user
                        phone_number: '0' + req.user.phone,
                        network: req.user.network.toUpperCase(),
                        transaction_id: referenceNumber,
                        callback_url: config.CALLBACK_URL,
                        reference:"Nanty Lotto"
                    }
                ,
                {
                    headers: {
                        'x-api-key': `${config.PAYMENT_API_KEY}`
                    }
                }
            )

            if (response.status === 200) {  //if api returns 200 status
                await trx("transactions")
                    .where("referenceNumber", referenceNumber)
                    .update({extReferenceNumber: response?.data?.data?.ext_transaction_id})

                await trx.commit();

                res.status(200).send({referenceNumber: referenceNumber});


            }else {  //If error occurs
                await trx.rollback();
                return res.status(400).send("Sorry, An Error Occurred. Please Try Again Later");
            }




        }
        catch (e) {
            await trx.rollback();
            logger.error(e);
            logger.error('client, transactions controller deposit');
            logger.error(e.message)
            return res.status(400)
                .send("Sorry your request was not successful. Please try again later");
        }

    },


    //Verify Payment
    verify: async (req, res) => {
        try {
            const referenceNumber = req.body.referenceNumber;
            if (!referenceNumber) return res.status(400).send("Missing reference number");

            //Query Transactions Table
            const query = await db("transactions")
                .where('referenceNumber', referenceNumber)
                .limit(1);

            if (!query.length) return res.status(400).send("No data found!");

            return res.status(200).send({status: query[0].status, balance: req.user.balance});

        }catch (e) {
            logger.error(e);
            logger.error('client, transactions controller Verify');
            logger.error(e.message)
            return res.status(400)
                .send("Sorry your request was not successful. Please try again later");
        }
    },


    //Withdraw Money Request
    withdrawal: async (req, res) => {
        const { amount, network} = req.body;

        // Validation
        if (parseFloat(req.user.balance) < parseFloat(amount)) return res.status(400).send('Sorry! your balance is not sufficient');
        if (amount < 1) return res.status(400).send("Minimum amount should be 1");
        if (amount > 30000) return res.status(400).send("Maximum amount should be 30,000");
        if (network !== req.user.network) return res.status(400).send(`Please select ${req.user.network} as network`);

        try {
            //Check if withdrawals are disabled by admin
            const settings = await db('settings').where('id', 1);
            if (!!settings[0].withdrawals === false)
                return res.status(400).send(`Sorry withdrawals have been disabled by admin`);


            //Check if user already has pending transaction
            const pendingRequest = await db("transactions")
                .where("userId", req.user.id)
                .andWhere('status', "pending")
                .andWhere('transactionType', "withdrawal")
                .limit(1);


            if (pendingRequest.length > 0) {
                return res.status(400)
                    .send("Sorry, you already have a pending request. Please try again later.");
            }


                //reference number for withdrawal
                const referenceNumber = generateReferenceNumber(moment()) + req.user.id;


            await db.transaction(async trx => {

                //Lock user row for update
                const user = await trx("users").where('id', req.user.id)
                    .limit(1).forUpdate();

                //save to transactions table
                await trx('transactions').insert({
                    referenceNumber,
                    extReferenceNumber: referenceNumber,
                    userId: user[0].id,
                    transactionType: 'withdrawal',
                    amount: parseFloat(amount),
                    chargesAmount: 0,
                    amountAfterCharges: parseFloat(amount),
                    created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                })

                //Deduct amount from user's account balance
                await trx('users').where('id', user[0].id).update({
                    balance: parseFloat(user[0].balance) - parseFloat(amount)
                })


                 res.status(200).send({balance: parseFloat(user[0].balance) - parseFloat(amount)});

            }) //End of transaction


            //................Send sms to phone number.............
            const host = 'api.smsonlinegh.com';
            const endPoint = `http://${host}/v5/message/sms/send`;

            const recipient= config.SMS_NUMBER;

            const msgData = {
                text: `Withdrawal request from 0${req.user.phone}. Amount: GHS ${formatNumber(amount)}`,
                type: 0,    // GSM default
                sender: config.SMS_SENDER,
                destinations: [recipient]
            };



            axios.post(endPoint,
                msgData,
                {
                    headers: {
                        'Host': `${host}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': config.SMS_API_KEY
                    }
                }
            ).then(response=>{
                if(response.status !== 200) {
                    logger.error('client, transactions controller withdrawal');
                    return logger.error('Withdrawal SMS failed');
                }
            }).catch((err) => {
                    logger.error(err)
                })


        }catch (e) {
            logger.error(e);
            logger.error('client, transactions controller withdrawal');
            logger.error(e.message)
            return res.status(400).send("Sorry your request was not successful");
        }
    },


    //Get Account Balance
    getAccountBalance: (req, res) => {
        return res.status(200).send({balance: req.user.balance});
    }
}

module.exports = userTransactions;