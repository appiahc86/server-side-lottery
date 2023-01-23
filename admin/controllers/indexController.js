const axios = require("axios");
const config = require("../../config/config");

const indexController = {
    getSmsBalance: async (req, res) => {
        try {
            axios.get(`https://sms.textcus.com/api/balance?apikey=${config.SMS_API_KEY}`)
                .then(response => {
                    if (response.data.status.toString() === '0000'){
                       return res.status(200).send(response.data.balance)
                    }
                    return res.status(400).end();
                })
                .catch(e => {
                    console.log(e)
                    res.status(400).end()
                })
        }catch (e) {
            console.log(e);
            res.status(400).end();
        }
    },




}



module.exports = indexController;