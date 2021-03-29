"use strict";
const db = require('../db');
const bcrypt = require('bcrypt');
const { NotFoundError } = require('../expressError');

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */


  static async register({ username, password, first_name, last_name, phone }) {
    //===============================
    //why jest -i
    //why is this an async operation?
    const encryptPw = await bcrypt.hash(password, 12);
    const result = await db.query(`
      INSERT INTO users
      (username, password, first_name, last_name, phone, join_at)
      VALUES ($1, $2, $3, $4, $5, LOCALTIMESTAMP)
      RETURNING username, password, first_name, last_name, phone
    `, [username, encryptPw, first_name, last_name, phone]);
    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(`
      SELECT password FROM users WHERE username = $1
    `, [username]);
    const encryptPw = result.rows[0].password;
    const valid = await bcrypt.compare(password, encryptPw);
    return valid;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(`
      UPDATE users SET last_login_at = CURRENT_TIMESTAMP
      WHERE username = $2
    `, [now, username]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(`
      SELECT username, first_name, last_name
      FROM users
    `);
    return result.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(`
      SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1
    `, [username]);
    if(result.rows.length === 0){
      throw new NotFoundError('User not found');
    }
    return result.rows[0]
  }

  /** Return messages from this user.
   *
   * [{id, to_username, body, sent_at, read_at}... ]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(`
      SELECT id, to_username, body, sent_at, read_at 
      FROM messages
      WHERE from_username = $1
    `, [username]);
    return result.rows
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_username is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(`
      SELECT id, from_username, body, sent_at, read_at 
      FROM messages
      WHERE to_username = $1
    `, [username]);
    return result.rows
  }
}


module.exports = User;
