const express = require("express");
const router = express.Router();

const imageController = require("../../controllers/images/index");

router.get("/", imageController.index);


module.exports = router;