const express = require("express");
const router = express.Router();

const userTransactions = require("../../../controllers/users/transactions");
const auth = require("../../../middleware/auth");

//Get user's transactions
router.get('/', auth, userTransactions.index);

//Deposit
router.post("/deposit", auth, userTransactions.deposit);
//Withdraw
router.post("/withdraw", auth, userTransactions.withdrawal);

//Confirm Payment
router.post("/verify", auth, userTransactions.verifyPayment);

//Submit Otp
router.post("/submit_otp", auth, userTransactions.submitOtp);

//Get account balance
router.get("/balance", auth, userTransactions.getAccountBalance);

module.exports = router;