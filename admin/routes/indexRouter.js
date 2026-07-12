const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");
const auth = require("../middleware/auth");

//get sms balance
router.get('/sms-balance', indexController.getSmsBalance);


//Payment Webhook
router.post('/webhook', indexController.paymentWebhook);
module.exports = router;