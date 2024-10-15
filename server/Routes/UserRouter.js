const express = require("express");
const { createUsers, logginuser, getUsers, allUsers } = require("../crud/crud");
const { protect } = require("../Auth/protect");

const router = express();

router.route("/").post(createUsers).get(protect,allUsers);
router.post("/loggin",logginuser)
router.route("/");

module.exports = router;
