const express = require("express");
const router = express.Router();

const userTransactions = require("../../../controllers/users/transactions");
const auth = require("../../../middleware/auth");

//Get user's transactions
router.get('/', auth, userTransactions.index);

//Withdraw
router.post("/withdraw", auth, userTransactions.withdrawal);

//Get account balance
router.get("/balance", auth, userTransactions.getAccountBalance);

module.exports = router;