"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");


describe("User routes Test", function () {
    let token = null;

    beforeEach(async function () {
        await db.query("DELETE FROM messages");
        await db.query("DELETE FROM users");

        let u1 = await User.register({
            username: "test1",
            password: "password",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+14155550000",
        });

        token = jwt.sign({ username: u1.username }, SECRET_KEY);
    });

    /** POST /auth/register => token  */

    describe("GET users/", function () {
        test("get all users", async function () {
            let response = await request(app)
                .get("/users")
                .send({
                    _token: token,
                });

            expect(response.body.users[0]).toEqual({
                username: "test1",
                first_name: "Test1",
                last_name: "Testy1",
            });
        });
    });

    /** POST /auth/login => token  */

    describe("POST /auth/login", function () {
        test("can login", async function () {
            let response = await request(app)
                .post("/auth/login")
                .send({ username: "test1", password: "password" });

            let token = response.body.token;
            expect(jwt.decode(token)).toEqual({
                username: "test1",
                iat: expect.any(Number)
            });
        });

        test("won't login w/wrong password", async function () {
            let response = await request(app)
                .post("/auth/login")
                .send({ username: "test1", password: "WRONG" });
            expect(response.statusCode).toEqual(400);
        });

        test("won't login w/wrong password", async function () {
            let response = await request(app)
                .post("/auth/login")
                .send({ username: "not-user", password: "password" });
            expect(response.statusCode).toEqual(400);
        });
    });
});

afterAll(async function () {
    await db.end();
});