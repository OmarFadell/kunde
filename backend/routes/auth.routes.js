const express = require("express");
const router = express.Router();
const { loginUser,createUser } = require("../controllers/auth.controller");
const PERMISSIONS = require("../utils/permissions");
const authorize = require("../middleware/authorize");
const authenticate = require("../middleware/authenticate");


// POST /api/auth/login
router.post("/login", loginUser);
router.post("/register",
    authenticate,
    authorize([PERMISSIONS.CREATE_USERS])
    ,createUser);


module.exports = router;
