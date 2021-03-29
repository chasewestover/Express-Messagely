"use strict";

const Router = require("express").Router;
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth.js")
const router = new Router();
const User = require('../models/user')


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {
    let result = await User.all();
    return res.json({ users: result });
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
    let result = await User.get(req.params.username);
    return res.json({ user: result });
})



/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", ensureCorrectUser, async function (req, res, next) {
    let result = await User.messagesTo(req.params.username);
    return res.json({ messages: result });
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", ensureCorrectUser, async function (req, res, next) {
    let result = await User.messagesFrom(req.params.username);
    return res.json({ messages: result });
});

module.exports = router;