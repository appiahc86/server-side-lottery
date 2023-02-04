const db = require("../../../../config/db");
const config = require("../../../../config/config");
const axios = require('axios');
const {log} = require("winston");

const convertNetwork = (newtwork) => {
    let type = '';
    switch (newtwork) {
        case 'airtelTigo': type = 'tgo'
            break;
        case 'vodafone': type =  'vod'
            break;
        default: type =  'mtn'
            break;
    }

    return type;
}



const userTransactions  = {

    //Get user's transactions
    index: async (req, res) => {
        try {
            const data = await db("transactions").where({userId: req.user.id})
                .select('id', 'transactionType', 'amount', 'status', 'createdAt')
                .orderBy('id', 'DESC').limit(20);
            res.status(200).send(data);
        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },


    //Deposit Money into account
    deposit: async (req, res) => {
        const { amount, network } = req.body;

        try {

            if (!amount >= 1 && amount <= 9999) return res.status(400).send("Amount should be from 1 to 9999");


            const data = {
             amount: parseFloat(amount) * 100,
                email: config.PAYMENT_EMAIL,
                currency: "GHS",
                mobile_money: {
                phone : "0551234987",
                // phone: "0"+req.user.phone,
                provider : convertNetwork(network)
            }
            }

            await db.transaction(async trx => {
            //first save transaction
           const transaction =  await trx('transactions').insert({
                userId: req.user.id,
                transactionType: 'deposit',
                amount: parseFloat(amount),
                network,
                status: 'pending',
                transactionDate: new Date(),
                createdAt: new Date()
            })

            data.metadata = {
                localTransactionId: transaction[0],
                type: 'deposit'
            }


            const response = await    axios.post("https://api.paystack.co/charge",
                JSON.stringify(data),
                {
                    headers: {
                        'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (response.data.status === true) {
                await trx('transactions').where('id', transaction[0])
                    .update({referenceNumber: response.data.data.reference})
                return res.status(200).send(response.data.data.reference);
            }
            else {
                console.log(response.data);
                await trx('transactions').where('id', transaction[0]).del();
                return res.status(400).send("Sorry payment request was refused");
            }

            })


        }catch (e) {
            console.log(e.message);
            return res.status(400).send("Sorry your deposit request was not successful");
        }

    },

    //Withdraw Money
    withdraw: async (req, res) => {
        const { amount, network, transactionType} = req.body;
        if (parseFloat(req.user.balance) < parseFloat(amount)) return res.status(400).send('Sorry! your balance is not sufficient');

        if (!amount >= 1 && amount <= 9999) return res.status(400).send("Amount should be from 1 to 9999");

        try {
            await db.transaction(async trx => {

                //deduct amount from users account
                await trx('users').where({id: req.user.id})
                    .decrement('balance', amount)

                //save to transactions table
            await trx('transactions').insert({
                userId: req.user.id,
                transactionType,
                amount: parseFloat(amount),
                network,
                transactionDate: new Date(),
                createdAt: new Date()
            })

            })// ./transaction

            return res.status(200).end();

        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
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
                const localTransactionId = response.data.data.metadata.localTransactionId;
                await db("transactions").where('id', localTransactionId)
                    .update({status: 'successful'})

                const user = await db('users').where('id', req.user.id);
                return res.status(200).send({balance: user[0].balance});
            } else
                return res.status(200).send({balance: 0});

        }catch (e) {
            console.log(e.message);
             res.end();
        }
    },


    //Get Account Balance
    getAccountBalance: (req, res) => {
        return res.status(200).send({balance: req.user.balance});
    }
}

module.exports = userTransactions;