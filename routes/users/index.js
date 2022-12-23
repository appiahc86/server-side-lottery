const express = require("express");
const router = express.Router();

const usersController = require("../../controllers/users/index");

//Register new user
router.post("/register", usersController.create);


module.exports = router;