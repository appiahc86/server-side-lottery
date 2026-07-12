const db = require("../../../../config/db");
const bcrypt = require("bcryptjs");
const config = require("../../../../config/config");
const jwt = require("jsonwebtoken");
const { generateRandomNumber, getBankCode} = require("../../../../functions");
const axios = require("axios");
const  logger = require("../../../../winston");
const moment = require("moment");
const CryptoJS = require("crypto-js");

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

            if (user.length) return res.status(400).send("Sorry, this user already exists")

            //Name on Mobile money number
            let accountName = "";


            //momo number verification
            await axios.get(
                `https://api.bulkclix.com/api/v1/kyc-api/msisdNameQuery`,
                {
                    params: {

                        phone_number: '0'+phoneNumber,
                    },
                    headers: {
                        'x-api-key': `${config.PAYMENT_API_KEY}`
                    }
                }
            ).then(response => {
                accountName = response?.data?.data?.name || ""; //Set account name
            }).catch(e => {
                throw new Error(notVerifiedError)
            })






            if (process.env.NODE_ENV !== 'production') {
                // Encrypt Verification Code
                const ciphertext = CryptoJS.AES.encrypt('202020', 'secretKey@').toString();
                return res.status(200).send({verificationCode: ciphertext, accountName})
            }


            //generate verification code
            const verificationCode = generateRandomNumber();


    //................Send sms to phone number.............
            const host = 'api.smsonlinegh.com';
            const endPoint = `http://${host}/v5/message/sms/send`;

            const recipient= '0'+phoneNumber;

            const msgData = {
                text: `Your Verification code is: ${verificationCode}`,
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
                if(response.status === 200) {
                    // Encrypt Verification Code
                    const ciphertext = CryptoJS.AES.encrypt(`${verificationCode}`, 'secretKey@').toString();
                    return res.status(200).send({verificationCode: ciphertext, accountName})
                }
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
        const {phoneNumber, accountName, password, network } = req.body;

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
                name: accountName,
                password: hash,
                specialCode,
                network
            });



           const token = jwt.sign({ id: user[0], specialCode: specialCode }, config.JWT_SECRET);
            res.status(201).send({token: token});

        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Sorry, this user already exists');
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
            if (!user.length) return res.status(400).send("Sorry, username or password is invalid")

            //Compare passwords
            const isMatched = await bcrypt.compareSync(password, user[0].password);

            //If passwords do not match
            if (!isMatched) return res.status(400).send("Sorry, username or password is invalid")


            //if user is not mark as active (account suspended)
            if (!user[0].isActive) return res.status(400).send("Sorry, this account is suspended. Please contact Admin");

            //Generate JWT token
            const token = jwt.sign({ id: user[0].id, specialCode: user[0].specialCode }, config.JWT_SECRET);

            res.status(200).send({
                token,
                user: {
                  name: user[0].name, phone: user[0].phone,
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

            if (process.env.NODE_ENV !== 'production') return res.status(200).end();

            //...........................Send sms to phone number.....................


            const host = 'api.smsonlinegh.com';
            const endPoint = `http://${host}/v5/message/sms/send`;

            const recipient= '0'+phoneNumber;

            const msgData = {
                text: `Your password reset code is: ${code}`,
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
            ).then(response=> {
                if(response.status === 200) {
                    return res.status(200).end();
                }

                return res.status(400).send("Failed to send password reset code. Please contact Admin");
            })

                .catch((err) => {
                    logger.error(err)
                    return res.status(400).send("Failed to send verification code. Please contact Admin");
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