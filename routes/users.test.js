"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const Message = require("../models/message");


describe("User routes Test", function () {
    // is this the right way to save the token?
    let token = null;
    let tokenToMe = null;
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
        let u2 = await User.register({
            username: "tome",
            password: "password",
            first_name: "ToMe",
            last_name: "ToMe",
            phone: "+14155550000",
        });
        tokenToMe = jwt.sign({ username: u2.username }, SECRET_KEY);
        await Message.create({from_username: 'test1', to_username: 'tome', body: 'msg'});
    });

    /** POST /auth/register => token  */

    describe("GET users/", function () {
        test("get all users", async function () {
            let response = await request(app)
                .get("/users")
                .send({
                    _token: token,
                });
            expect(response.body).toEqual({
            users: [{
                username: "test1",
                first_name: "Test1",
                last_name: "Testy1",
            },{
                username: "tome",
                first_name: "ToMe",
                last_name: "ToMe",
            }]});
        });
        test('unsuccessful get all users', async function () {
            const response = await request(app).get('/users');
            expect(response.statusCode).toEqual(401);
        })
    });

    //GET my user info

    describe('GET my info from users/test1', () => {
        test('successful GET info', async ()=> {
            const response = await request(app).get('/users/test1')
                .send({
                    _token: token
                });
            expect(response.statusCode).toEqual(200);
            //moment.js to 
            expect(response.body).toEqual({
                user: {
                    username: 'test1', 
                    first_name: 'Test1',
                    last_name: 'Testy1',
                    phone: "+14155550000",
                    join_at: expect.any(String), 
                    last_login_at: expect.any(String)
                }
            });
            //covert join_at and last_login to Moment objects and check .ago less than 2mins
        });
        test('unsuccessful GET info', async ()=> {
            const response = await request(app).get('/users/test1');
            expect(response.statusCode).toEqual(401);
        });
    });
    describe('GET messages to me', () => {
        test('successful GET messages to', async ()=> {
            const response = await request(app).get('/users/tome/to')
                .send({
                    _token: tokenToMe
                });
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({ messages: [{
                id: expect.any(Number),
                body: 'msg',
                sent_at: expect.any(String),
                read_at: null,
                from_user: 
                {username: 'test1', first_name: 'Test1', last_name: "Testy1", phone: "+14155550000"}
            }]});
        });
        test('unsuccessful GET messages to', async ()=> {
            const response = await request(app).get('/users/tome/to');
            expect(response.statusCode).toEqual(401);
        });
    });
    describe('GET messages from me', () => {
        test('successful GET messages from', async ()=> {
            const response = await request(app).get('/users/test1/from')
                .send({
                    _token: token
                });
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({ messages: [{
                id: expect.any(Number),
                body: 'msg',
                sent_at: expect.any(String),
                read_at: null,
                to_user: 
                {username: 'tome', first_name: 'ToMe', last_name: "ToMe", phone: "+14155550000"}
            }]});
        });
        test('unsuccessful GET messages from', async ()=> {
            const response = await request(app).get('/users/test1/from');
            expect(response.statusCode).toEqual(401);
        });
        //test another user who deosn't have access 
    });
    // how to run jest coverage sequentially?
    
});

afterAll(async function () {
    await db.end();
});