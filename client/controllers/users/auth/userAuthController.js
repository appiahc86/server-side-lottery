const db = require("../../../../config/db");
const bcrypt = require("bcryptjs");
const config = require("../../../../config/config");
const jwt = require("jsonwebtoken");
const { generateRandomNumber, getBankCode } = require("../../../../functions");
const axios = require("axios");
const  logger = require("../../../../winston");
const moment = require("moment");

const notVerifiedError = 'Sorry, this is not a valid momo number or not registered on this network';

const userAuthController = {

    //......................Verify phone number...........................
    verify: async (req, res) => {
        const {phoneNumber, network, password } = req.body;
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;


        try {

            // validation
            if (phoneNumber.toString().length  !== 9 )return res.status(400).send("Please check phone number");

            if (!password || !password.match(regex)) return res.status(400).send("Password does not meet requirements");

            //Check if user already exists
            const user = await db("users").where("phone", phoneNumber)
                .select('id','phone').limit(1);

            if (user.length) return res.status(400).send("Sorry, this number already exists")



            //Verify Phone number
            let bankCode = getBankCode(network);
            await axios.get(
                `https://api.paystack.co/bank/resolve`,
                {
                    params: {
                        account_number: '0'+phoneNumber,
                        bank_code: bankCode,
                    },
                    headers: { 'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`}
                }
            ).then(response => {
                if (response.data.status !== true) return res.status(400).send(notVerifiedError)
            }).catch(e => {
                throw new Error(notVerifiedError)
            })

            if (process.env.NODE_ENV !== 'production') return res.status(200).send({message: 202020})


            //generate verification code
            const verificationCode = generateRandomNumber();


    //................Send sms to phone number.............
            const smsApiKey = config.SMS_API_KEY;

            //11 Characters maximum
            const sender = config.SMS_SENDER;

            //message to send to recipient
            const sms = `Your Verification code is: ${verificationCode}`;

            //International format (233) or (+233)
            const recipient= '233'+phoneNumber;


            const url = `https://sms.textcus.com/api/send?apikey=${smsApiKey}&destination=${recipient}&source=${sender}&dlr=1&type=0&message=${sms}`;

            axios.get(url).then(response=>{
                if(response.data.status.toString() === '0000') return res.status(200).send({message: verificationCode})
                 return res.status(400).send("Failed to send verification code. Please contact Admin");
            })

                .catch((err) => {
                    logger.error(err)
                    return res.status(400).send("Failed to send verification code. Please contact Admin");
                })


        }catch (e) {
            if (e.message === notVerifiedError) return  res.status(400).send(notVerifiedError);
            logger.error('client, auth userAuthController verify');
            logger.error(e)
            return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block
    }, // ./Verify


    //..............Register a new user........................
    create: async (req, res) => {
        const {phoneNumber, password, network } = req.body;

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

        try {

            // validation
            if (phoneNumber.toString().length  !== 9 )return res.status(400).send("Please check phone number");

            if (!password || !password.match(regex)) return res.status(400).send("Password does not meet requirements");


            //Hash password
            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(password, salt);
            if (!hash) {
                logger.info("password hash was not successful");
                return res.status(400).send("Sorry something went wrong");
            }
            const specialCode = generateRandomNumber();

            //Save to db
           const user = await db("users").insert({
                phone: phoneNumber,
                password: hash,
                specialCode,
                network,
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
            });

           //Add first deposit promo. this will not be active until first deposit is > 5
           await db('userPromos').insert({
               promoId: 1,
               userId: user[0],
               amount: 10
           })

           const token = jwt.sign({ id: user[0], specialCode: specialCode }, config.JWT_SECRET);
            res.status(201).send({token: token});


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Sorry, this number already exists');
            logger.error('client, userAuthController create');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");

        } // ./Catch block


    }, // ./Register


    //......................Login...........................
    login: async (req, res) => {
        const {phoneNumber, password} = req.body;

        try {
            //Validation
            if (phoneNumber.toString().length  < 9) return res.status(400).send("Please check phone number");
            if (!password.trim()) return res.status(400).send("Please provide a password");


            //find user in db
            const user = await db("users").where("phone", phoneNumber);
                // .select('id','firstName', 'lastName', 'phone', 'balance', 'specialCode')



            //If user does not exist
            if (!user.length) return res.status(400).send("Sorry, this user does not exist")

            //Compare passwords
            const isMatched = await bcrypt.compareSync(password, user[0].password);

            //If passwords do not match
            if (!isMatched) return res.status(400).send("Sorry, you entered a wrong password.")


            //if user is not mark as active (account suspended)
            if (!user[0].isActive) return res.status(400).send("Sorry, this account is suspended. Please contact client");

            //Generate JWT token
            const token = jwt.sign({ id: user[0].id, specialCode: user[0].specialCode }, config.JWT_SECRET);

            res.status(200).send({
                token,
                user: {
                  firstName: user[0].firstName, lastName: user[0].lastName, phone: user[0].phone,
                    network: user[0].network, balance: user[0].balance
                }
            })

        }catch (e) {
            logger.error('client, userAuthController login');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block
    }, // ./Login



        //...............Request password reset code....................
    requestPasswordResetCode: async (req, res) => {
        const { phoneNumber } = req.body;
        try {

            const user = await db('users').where({phone: phoneNumber}).limit(1);
            if (!user.length) return res.status(400).send("Sorry this number was not found");


            const code = generateRandomNumber();

            //update password reset code in db
            await db('users').where({phone: phoneNumber})
                .update({passwordResetCode: code})

            if (process.env.NODE_ENV !== 'production') return res.status(200).end()

            //...........................Send sms to phone number.....................
            const smsApiKey = config.SMS_API_KEY;

            //11 Characters maximum
            const sender = config.SMS_SENDER;

            //message to send to recipient
            const sms = `Your password reset code is: ${code}`;

            //International format (233) or (+233)
            const recipient= '233'+phoneNumber;

            const url = `https://sms.textcus.com/api/send?apikey=${smsApiKey}&destination=${recipient}&source=${sender}&dlr=1&type=0&message=${sms}`;

            axios.get(url).then(response=> {
                if(response.data.status.toString() === '0000') return res.status(200).end();
                return res.status(400).send("Failed to send password reset code. Please contact Admin");
            })

                .catch((err) => {
                    logger.error(err)
                    return res.status(400).send("Failed to send password reset code. Please contact Admin");
                })

        }catch (e) {
            logger.error('client, userAuthController requestPasswordResetCode');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },



        //............. Reset Password...........................
    resetPassword: async (req, res) => {
        const { phoneNumber, password, passwordResetCode, validateRequestCode } = req.body;
        try {

            if (!passwordResetCode) res.status(400).send("Please provide the reset code");
            const query = await db("users").where({phone: phoneNumber}).limit(1);
             if (!query.length) res.status(400).send("Sorry, this user was not found");
             if (query[0].passwordResetCode.toString() !== passwordResetCode.toString()) return res.status(400).send("Sorry, you entered a wrong code. Please check you phone");


            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
            // validation

            if (validateRequestCode !== "9#45$!")return res.status(400).send("Origin could not be verified");

            if (phoneNumber.toString().length  !== 9 )return res.status(400).send("Please check phone number");

            if (!password || !password.match(regex)) return res.status(400).send("Password does not meet requirements");

            const user = await db("users").where({phone: phoneNumber}).limit(1);
            if (!user.length) return res.status(400).send("Sorry, user was not found");

            //Hash password
            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(password, salt);
            if (!hash) {
                logger.info("password hash was not successful");
                return res.status(400).send("Sorry something went wrong Please try again later");
            }

            const specialCode = generateRandomNumber();

            //Update password in db
            await db('users').where({id: user[0].id})
                .update({password: hash, specialCode: specialCode, passwordResetCode: ''});

            res.status(200).end();

        }catch (e) {
            logger.error('client, userAuthController resetPassword');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    }

}

module.exports = userAuthController;