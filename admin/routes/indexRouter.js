const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");

//get sms balance
router.get('/sms-balance', indexController.getSmsBalance);

//paystack
router.post('/paystack-webhook/', indexController.paystack);
module.exports = router;