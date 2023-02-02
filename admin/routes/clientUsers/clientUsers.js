const express = require("express");
const router = express.Router();

const clientUsersController = require("../../controllers/clientUsers/clientUsers");
const auth = require("../../middleware/auth");

//Get all users
router.get("/", auth, clientUsersController.index);

//Search for a user
router.post("/search", auth, clientUsersController.search);


module.exports = router;