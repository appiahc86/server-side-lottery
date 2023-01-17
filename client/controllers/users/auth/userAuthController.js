const db = require("../../../../config/db");
const bcrypt = require("bcryptjs");
const config = require("../../../../config/config");
const jwt = require("jsonwebtoken");
const { generateRandomNumber } = require("../../../../functions");
const axios = require("axios");


const userAuthController = {

    //Verify phone number
    verify: async (req, res) => {
        const {phoneNumber, password} = req.body;
        const regex = /^(?=.{6,})(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])/
        return res.status(200).send({message: 202020})

        try {
            // validation
            if (phoneNumber.toString().length  !== 9 )return res.status(400).send("Please check phone number");

            if (!password || !password.match(regex)) return res.status(400).send("Minimum password length should be 6 and contains at least 1 special character");

            //Check if user already exists
            const user = await db("users").where("phone", phoneNumber)
                .select('id','phone').limit(1);

            if (user.length) return res.status(400).send("Sorry, this number already exists")

            //generate verification code
            const verificationCode = generateRandomNumber();


    //................Send sms to phone number.............
            const smsApiKey = config.SMS_API_KEY;

            //11 Characters maximum
            const sender = "Nanty";

            //message to send to recipient
            const sms = `Your Nanty Verification code is: ${verificationCode}`;

            //International format (233) or (+233)
            const recipient= '233'+phoneNumber;

            //encoding sender string to UTF-8 encoding
            senderEncode= encodeURI(sender);

            const url = `https://sms.textcus.com/api/send?apikey=${smsApiKey}&destination=${recipient}&source=${sender}&dlr=1&type=0&message=${sms}`;

            axios.get(url).then(response=>{
                if(response.data.status.toString() === '0000') return res.status(200).send({message: verificationCode})
                 return res.status(400).send("Failed to send verification code. Please contact Admin");
            })

                .catch((err) => {
                    return res.status(400).send("Failed to send verification code. Please contact Admin");
                })


        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block
    }, // ./Verify


    //Register a new user
    create: async (req, res) => {
        const {phoneNumber, password, network} = req.body;

        const regex = /^(?=.{6,})(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])/

        try {

            // validation
            if (phoneNumber.toString().length  !== 9 )return res.status(400).send("Please check phone number");

            if (!password || !password.match(regex)) return res.status(400).send("Minimum password length should be 6 and contains at least 1 special character");

            //Hash password
            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(password, salt);
            if (!hash) {
                console.log("password hash was not successful");
                return res.status(400).send("Sorry something went wrong");
            }
            // const specialCode = generateRandomNumber();
            const specialCode = 202020;

            //Save to db
           const user = await db("users").insert({
                phone: phoneNumber,
                password: hash,
                specialCode,
                network,
                createdAt: new Date()
            });

           const token = jwt.sign({ id: user[0], specialCode: specialCode }, config.JWT_SECRET);
            res.status(201).send({token: token});


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Sorry, this number already exists');
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");

        } // ./Catch block


    }, // ./Register


    //Login
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
            if (!user[0].isActive) return res.status(400).send("Sorry, this account is suspended. Please contact admin");

            //Generate JWT token
            const token = jwt.sign({ id: user[0].id, specialCode: user[0].specialCode }, config.JWT_SECRET);

            res.status(200).send({
                token,
                user: {...user[0], id: undefined, password: undefined, isActive: undefined, createdAt: undefined, specialCode: undefined}
            })

        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block
    }, // ./Login
}

module.exports = userAuthController;