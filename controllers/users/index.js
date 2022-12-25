const db = require("../../config/db");
const bcrypt = require("bcrypt");


const userController = {

    //Verify phone number
    verify: async (req, res) => {
        const {phoneNumber, password} = req.body;
        const regex = /^(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/g;

        try {
            // validation
            if (phoneNumber.toString().length  < 9 )return res.status(400).send("Please check phone number");

            if (password.length < 6 || !password.match(regex)) {
                return res.status(400).send("Password length cannot be less than 6 and should contain at least one special character");
            }

            //Check if user already exists
            const user = await db("users").where("phone", phoneNumber)
                .select('id','phone').limit(1);

            if (user.length) return res.status(400).send("Sorry, this number already exists")

            const verificationCode = 202020;

            //Send sms to phone number
            res.status(200).send({message: verificationCode});


        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        } // ./Catch block
    }, // ./Verify


    //Register a new user
    create: async (req, res) => {
        const {phoneNumber, password} = req.body;

        const regex = /^(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/g;

        try {

            // validation
            if (phoneNumber.toString().length  < 9 )return res.status(400).send("Please check phone number");

            if (password.length < 6 || !password.match(regex)) {
                return res.status(400).send("Password length cannot be less than 6 and should contain at least one special character");
            }

            //Hash password
            const hash = await bcrypt.hash('password', 10);
            if (!hash) {
                console.log("password hash was not successful");
                return res.status(400).send("Sorry something went wrong");
            }

            //Save to db
            await db("users").insert({
                phone: phoneNumber,
                password: hash
            });

            res.status(201).send({message: 'success'});


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Sorry, this number already exists');
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");

        } // ./Catch block


    }, // ./Register


}

module.exports = userController;