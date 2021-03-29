"use strict";

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
    let { username, password } = req.body;

    if (await User.authenticate(username, password)) {
        let token = jwt.sign({ username }, SECRET_KEY);
        User.updatLoginTimestamp(username);
        return res.json({ token });
    } else {
        throw new UnauthorizedError("Invalid user/password");
    }
})


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (res, req, next) {
    let { username, password, first_name, last_name, phone } = req.body;

    try {
        User.register(username, password, first_name, last_name, phone);
        let token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    } catch(e) {
        return next(e)
    }
})

module.exports = router;