"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config");
const {BadRequestError} = require("../expressError");

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
    let { username, password } = req.body;
    if (await User.authenticate(username, password)) {
        let token = jwt.sign({ username }, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({ token });
    } else {
        throw new BadRequestError("Invalid user/password");
    }
});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
    let { username, password, first_name, last_name, phone } = req.body;
    console.log(process.env)
    try {
        await User.register({username, password, first_name, last_name, phone})
        
        let token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    } catch(e) {
        return next(e)
    }
});

module.exports = router;