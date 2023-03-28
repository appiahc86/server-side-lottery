const db = require("../../../../config/db");
const bcrypt = require("bcryptjs");
const config = require("../../../../config/config");
const jwt = require("jsonwebtoken");
const { generateRandomNumber } = require("../../../../functions");
const logger = require("../../../../winston");


const userAuthController = {


    //..............Register a new user........................
    create: async (req, res) => {
        const { phoneNumber, displayName, password } = req.body;

        const regex = /^(?=.{6,})(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])/

        try {

            // validation
            if (phoneNumber.toString().length  !== 9 )return res.status(400).send("Please check phone number");

            if (!password || !password.match(regex)) return res.status(400).send("Minimum password length should be 6 and contains at least 1 special character");

            if (!displayName || displayName.length < 3)return res.status(400).send("Display name should be at least 3 characters");

            //Hash password
            let salt = await bcrypt.genSaltSync(10);
            let hash = await bcrypt.hashSync(password, salt);
            if (!hash) {
                logger.info("password hash was not successful");
                return res.status(400).send("Sorry something went wrong");
            }
            const specialCode = generateRandomNumber();

            //Save to db
            await db("adminUsers").insert({
                phone: phoneNumber,
                password: hash,
                specialCode,
                displayName,
                createdAt: new Date()
            });

            res.status(201).end();


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Sorry, this number already exists');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");

        } // ./Catch block


    }, // ./Register


    //......................Login...........................
    login: async (req, res) => {
        const { phoneNumber, password } = req.body;


        try {
            //Validation
            if (phoneNumber.toString().length  < 9) return res.status(400).send("Please check phone number");
            if (!password.trim()) return res.status(400).send("Please provide a password");


            //find user in db
            const user = await db("adminUsers").where("phone", phoneNumber);

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
                    displayName: user[0].displayName, phone: user[0].phone,
                }
            })

        }catch (e) {
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block
    }, // ./Login



    //............. Change Password...........................
    changePassword: async (req, res) => {
        const { currentPassword, password } = req.body;

        try {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])(?!.*\s).{8,}$/

            //Validation
            if (!password.match(regex)) return res.status(400).send("Password does not meet requirements");

            //Query for user in db
            const query = await db('adminUsers').where('id', req.user.id);

            //If user not found
            if (!query.length) return res.status(400).send("Sorry, this user was not found");

            //Compare passwords
            const isMatched = await bcrypt.compareSync(currentPassword, query[0].password);

            //If passwords do not match
            if (!isMatched) return res.status(400).send("Sorry, current password is incorrect.")

            //Hash Password
            let salt = await bcrypt.genSaltSync(10);
            let hash = await bcrypt.hashSync(password, salt);
            if (!hash) {
                logger.info("password hash was not successful");
                return res.status(400).send("Sorry something went wrong");
            }

            const specialCode = generateRandomNumber();

            //Update password in db
            await db('adminUsers').where({id: query[0].id})
                .update({password: hash, specialCode: specialCode });

            res.status(200).end();

        }catch (e) {
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    }

}

module.exports = userAuthController;