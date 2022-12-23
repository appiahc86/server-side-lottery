const db = require("../../config/db");


const userController = {

    create: async (req, res) => {
        let error = "";

        try {

            // validation
            if (req.body.phoneNumber.toString().length  < 9 ){
                error = 'Please check phone number'
                throw new Error(error);
            }
            if (req.body.password.length < 6) {
                error = 'Password cannot be less than 6 characters'
                throw new Error(error);
            }

            //Save to db
           const query =  await db("users").insert({
                phone: req.body.phoneNumber,
                password: req.body.password
            })

            res.status(201).send({message: 'success'});


        }catch (e) {

            if (e.message === error) return res.status(400).send(error);
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('This number already exist');
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");

        } // ./Catch block


    } // ./Register


}

module.exports = userController;