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
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Deposit Money into account
    deposit: async (req, res) => {
        const { amount, network } = req.body;

        try {

            //Check if Deposits are disabled by admin
            const settings = await db('settings').where('id', 1);
            if (!!settings[0].deposits === false) return res.status(400).send(`Sorry Deposits have been disabled by admin`);


            //Validation
            if (amount < 1) return res.status(400).send("Minimum amount should be 1");
            if (amount > 2000) return res.status(400).send("Maximum amount should be 2,000");

            const data = {
             amount: parseFloat(amount) * 100,
                email: config.PAYMENT_EMAIL,
                currency: "GHS",
                mobile_money: {
                phone : "0551234987",
                // phone : "0"+req.user.phone, //TODO enable this in production
                provider : convertNetwork(network)
            }
            }

            await db.transaction(async trx => {


            const response = await    axios.post("https://api.paystack.co/charge",
                JSON.stringify(data),
                {
                    headers: {
                        'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            // if (response.data.data.status === "pay_offline" || response.data.data.status === "send_otp") {
            if (response.data.status === true) {

                await trx('transactions').insert({
                    userId: req.user.id,
                    referenceNumber: response.data.data.reference,
                    transactionType: 'deposit',
                    amount: parseFloat(amount),
                    network,
                    status: 'pending',
                    transactionDate: moment().format("YYYY-MM-DD"),
                    createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
                })

                //insert into transaction logs table
                await trx("transactionLogs").insert({
                    userId: req.user.id,
                    type: "deposit",
                    amount: parseFloat(amount),
                    oldBalance: req.user.balance,
                    newBalance: parseFloat( req.user.balance) + parseFloat(amount),
                    date: moment().format("YYYY-MM-DD"),
                    createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
                })

                return res.status(200).send({
                    reference: response.data.data.reference,
                    network: network,
                    display_text: 'Continue payment on your phone'
                    // display_text:  response.data.data.display_text  Todo Enable this in production
                });

            }
            else {
                logger.info(response.data);
                return res.status(400).send("Sorry deposit request was refused");
            }

            })


        }catch (e) {
            logger.error(e.message);
            if (e.response){
                return res.status(400).send(e.response.data.message);
            }
            return res.status(400).send("Sorry your deposit request was not successful");
        }

    },

    //Withdraw Money
    withdrawal: async (req, res) => {
        const { amount, network} = req.body;
        if (parseFloat(req.user.balance) < parseFloat(amount)) return res.status(400).send('Sorry! your balance is not sufficient');

        if (amount < 1) return res.status(400).send("Minimum amount should be 1");
        if (amount > 2000) return res.status(400).send("Maximum amount should be 2,000");

        if (network !== req.user.network) return res.status(400).send(`Please select ${req.user.network} as network`);

        try {

            //Check if withdrawals are disabled by admin
            const settings = await db('settings').where('id', 1);
            if (!!settings[0].withdrawals === false) return res.status(400).send(`Sorry withdrawals have been disabled by admin`);

                let bankCode = getBankCode(network);

                const transferRecipientData = {
                    type: "mobile_money",
                    account_number: '0'+req.user.phone,
                    bank_code: bankCode,
                    currency: "GHS",
                };

      //.................Verify Account number........................
                await axios.get(
                    `https://api.paystack.co/bank/resolve`,
                    {
                        params: {
                            account_number: '0'+req.user.phone,
                            bank_code: bankCode,
                        },
                        headers: { 'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`}
                    }
                ).then(response => {
                    if (response.data.status !== true) return res.status(400).send(errorMessage)
                    if (response.data.status === true && response.data.data.account_number.toString() === '0'+req.user.phone){
                        transferRecipientData.name = response.data.data.account_name;
                    }else return res.status(400).send(errorMessage)
                }).catch(e => {
                    logger.info(e.response);
                    logger.error(e);
                    throw new Error(errorMessage)
                })

      //....................Create transfer Recipient code if not exist in database........................

                if(!req.user.recipientCode){
                    const response = await    axios.post("https://api.paystack.co/transferrecipient",
                        JSON.stringify(transferRecipientData),
                        {
                            headers: {
                                'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    )
                    if (response.status === 201){
                        await db('users').where('id', req.user.id)
                            .update({recipientCode: response.data.data.recipient_code})
                        req.user.recipientCode = response.data.data.recipient_code;
                    }else return res.status(400).send(" Failed to create transfer recipient. Please contact admin")
                }//.create recipient code/



                //reference number for withdrawal
                const withdrawalReference = generateReferenceNumber(new Date()) + req.user.id;

                const initiateTransferData = {
                    source: "balance",
                    amount: parseFloat(amount) * 100,
                    reference: withdrawalReference,
                    recipient:   req.user.recipientCode
                }

     //...............................Initiate a transfer............................................
                const response = await    axios.post("https://api.paystack.co/transfer",
                    JSON.stringify(initiateTransferData),
                    {
                        headers: {
                            'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                )


                if(response.status === 200){

                    await db.transaction(async trx => {

                        //deduct amount from users account
                        await trx('users').where({id: req.user.id})
                            .decrement('balance', parseFloat(amount))

                        //save to transactions table
                        await trx('transactions').insert({
                            referenceNumber: initiateTransferData.reference,
                            userId: req.user.id,
                            transactionType: 'withdrawal',
                            amount: parseFloat(amount),
                            network,
                            transactionDate: moment().format("YYYY-MM-DD"),
                            createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
                        })

                        //insert into transaction logs table
                        await trx("transactionLogs").insert({
                            userId: req.user.id,
                            type: "withdrawal",
                            amount: parseFloat(amount),
                            oldBalance: req.user.balance,
                            newBalance: parseFloat( req.user.balance) - parseFloat(amount),
                            date: moment().format("YYYY-MM-DD"),
                            createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
                        })


                })// ./transaction
                    return res.status(200).send({balance: (parseFloat(req.user.balance) - parseFloat(amount))});
                }else {
                    logger.info(response.data)
                    return res.status(400).send("Sorry, withdrawal request was not successful. Please contact admin ")
                }


        }catch (e) {
            if (e.response){
                return res.status(400).send(e.response.data.message);
            }
            logger.error(e)
            return res.status(400).send("Sorry your request was not successful");
        }
    },


    //Submit Otp
    submitOtp: async (req, res) => {
        const { otp, reference } = req.body;
        return res.end();

        try {

            const response = await axios.post("https://api.paystack.co/charge/submit_otp",
                JSON.stringify({otp, reference}),
                {
                    headers: {
                        'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            )


        }catch (e) {
            logger.error(e.message);
            res.end();
        }
    },


    //Verify Payment
    verifyPayment: async (req, res) => {
        const { reference } = req.body;

        try {

            const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                    }
                }
                )

            if (response.data.data.status === "success"){
                await db("transactions").where('referenceNumber', reference)
                    .update({status: 'successful'})
            }

            const user = await db('users').where('id', req.user.id);
            return res.status(200).send({balance: user[0].balance});

        }catch (e) {
            logger.error(e.message);
             res.end();
        }
    },


    //Get Account Balance
    getAccountBalance: (req, res) => {
        return res.status(200).send({balance: req.user.balance});
    }
}

module.exports = userTransactions;