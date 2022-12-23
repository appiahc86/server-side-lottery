const express = require("express");
const router = express.Router();

const lotteryController = require("../../controllers/lottery/index");

// router.get("/", );

router.post("/stake", lotteryController.stake);



module.exports = router;