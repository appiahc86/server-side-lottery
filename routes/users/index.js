const express = require("express");
const router = express.Router();

const usersController = require("../../controllers/users/index");

//Register new user
router.post("/register", usersController.create);

//Verify Phone number
router.post('/verify', usersController.verify);


module.exports = router;