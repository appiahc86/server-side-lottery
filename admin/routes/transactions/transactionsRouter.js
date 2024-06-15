const express = require("express");
const router = express.Router();

const transactionsController = require("../../controllers/transactions/transactionsController");
const auth = require("../../middleware/auth");

//Get Transactions
router.get('/', auth,transactionsController.index);

//Get Withdrawals
router.get('/withdrawals', auth,transactionsController.withdrawals);

//Approve Withdrawal
router.post('/withdrawals/approve', auth,transactionsController.approveWithdrawal);

//Decline Withdrawal
router.post('/withdrawals/decline', auth,transactionsController.declineWithdrawal);

//Number Lookup
router.post('/deposit/lookup', auth,transactionsController.lookup);

//Deposit
router.post('/deposit', auth, transactionsController.deposit);

//Search by reference number
router.post('/search-single', auth, transactionsController.searchSingle);



module.exports = router;