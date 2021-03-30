"use strict";

/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const Message = require('../models/message');


/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    res.locals.user = payload;
    return next();
  } catch (err) {
    // error in this middleware isn't error -- continue on
    return next();
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError();
    } else {
      return next();
    }
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Requires user is user for route. */

function ensureCorrectUser(req, res, next) {
  try {
    if (!res.locals.user ||
        res.locals.user.username !== req.params.username) {
      throw new UnauthorizedError();
    } else {
      return next();
    }
  } catch (err) {
    return next(err);
  }
}


async function ensureUserConnMsg(req, res, next) {
  const msg = await Message.get(req.params.id);
  res.locals.message = msg;
  const usernames = [msg.from_user.username, msg.to_user.username];
  console.log("bat", usernames, res.locals.message)
  if (!res.locals.user ||
      ! usernames.includes(res.locals.user.username) ){
    return next(new UnauthorizedError())
  } else {
    return next();
  }
}


async function ensureMsgToUser(req, res, next) {
  const msg = await Message.get(req.params.id);
  res.locals.message = msg;
  const username = msg.to_user.username;
  if (!res.locals.user ||
      username !== res.locals.user.username) {
    return next(new UnauthorizedError())
  } else {
    return next();
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureUserConnMsg,
  ensureMsgToUser
};
