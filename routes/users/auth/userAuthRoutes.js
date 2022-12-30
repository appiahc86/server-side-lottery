const express = require("express");
const router = express.Router();

const userAuthController = require("../../../controllers/users/auth/userAuthController");

//Register new user
router.post("/register", userAuthController.create);

//Verify Phone number
router.post('/verify', userAuthController.verify);

//Login
router.post('/login', userAuthController.login);


module.exports = router;