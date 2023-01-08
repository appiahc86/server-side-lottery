const express = require("express");
const router = express.Router();

const clientUsersController = require("../../controllers/clientUsers/clientUsers");

//Get all users
router.get("/", clientUsersController.index);

//Search for a user
router.post("/search", clientUsersController.search);


module.exports = router;