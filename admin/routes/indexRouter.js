const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");
const auth = require("../middleware/auth");

//get sms balance
router.get('/sms-balance', indexController.getSmsBalance);


//paystack
router.post('/webhook', indexController.paystack);
module.exports = router;