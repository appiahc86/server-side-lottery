const express = require("express");
const router = express.Router();

const userAuthController = require("../../../controllers/users/auth/userAuthController");
const auth = require("../../../middleware/auth");

//Register new user
// router.post("/register", userAuthController.create);

//Login
router.post('/login', userAuthController.login);

//Change password
router.post('/change-password', auth, userAuthController.changePassword);

module.exports = router;