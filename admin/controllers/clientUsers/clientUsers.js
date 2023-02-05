const db = require("../../../config/db");

const clientUsersController  = {
    //List all users
    index: async (req, res) => {
        try{
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;


            const users = await db.raw(`SELECT SQL_CALC_FOUND_ROWS * FROM users
                                    LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`)

            const [total] = await db.raw('SELECT FOUND_ROWS() as total');
            // const totalRecords = await db('users').count('id as count');
            if (users[0].length){
                users[0].map(user => {
                    user.password = undefined;
                    user.network = undefined;
                    user.passwordResetCode = undefined;
                    user.specialCode = undefined;
                    user.createdAt = undefined;
                })
            }


            return res.status(200).send({
                data: users[0],
                page,
                pageSize,
                totalRecords: total[0].total
            });

        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Search for user
    search: async (req, res) => {
        const { phone } = req.body;
        if (phone.toString().length < 9) return res.status(400).send('You have entered wrong phone number');
        try {
            const user = await db('users').where({ phone }).limit(1);

            if (user.length){
                return res.status(200).send({...user[0], password: undefined, specialCode: undefined});
            }
            return res.status(400).send('Sorry, this user was not found');

        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    }


}

module.exports = clientUsersController;