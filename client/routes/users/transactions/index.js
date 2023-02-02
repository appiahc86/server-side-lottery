const express = require("express");
const router = express.Router();

const userTransactions = require("../../../controllers/users/transactions");
const auth = require("../../../middleware/auth");

//Get user's transactions
router.get('/', auth, userTransactions.index);

//Deposit
router.post("/deposit", auth, userTransactions.deposit);
//Withdraw
router.post("/withdraw", auth, userTransactions.withdraw);

//Get account balance
router.get("/balance", auth, userTransactions.getAccountBalance);

module.exports = router;