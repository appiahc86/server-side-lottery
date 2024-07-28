const express = require("express");
const router = express.Router();

const transactionsController = require("../../controllers/transactions/transactionsController");
const auth = require("../../middleware/auth");


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

//View Deposits
router.get('/view-deposits', auth,transactionsController.viewDeposits);

//View Withdrawals
router.get('/view-withdrawals', auth,transactionsController.viewWithdrawals);


//Search by reference number
router.post('/search-single', auth, transactionsController.searchSingle);



module.exports = router;