require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
const path = require('path');
let ejs = require('ejs');

const checkAuth = require('../middleware/check-auth');

var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  });

  con.connect((err) => {
    if (err){
        console.log(err);
    }
    console.log("Connected!");
  });



router.get('/all-score', (req, res, next) => {
    
    var sql = "SELECT * FROM leaderboard";
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
    })
});

router.get('/test-leaderboard-data', (req, res, next) => {
    
    var sql = "SELECT users.full_name, leaderboard.* FROM leaderboard INNER JOIN users ON leaderboard.user_id = users.id WHERE score =(SELECT MAX(score) FROM leaderboard) GROUP BY user_id LIMIT 10";

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
    })
});

router.get('/', (req, res, next) => {
    
    var sql = "SELECT leaderboard.*, users.full_name FROM leaderboard INNER JOIN users ON leaderboard.user_id = users.id ORDER BY score DESC LIMIT 10";
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.render("leaderboard.ejs", {leaders: result})
    })
});

router.post('/:gameid/:userid/:score', (req, res, next) => {
    
    const gameid = req.params.gameid? req.params.gameid : 1;
    const userid = req.params.userid? req.params.userid : null;
    const score = req.params.score;

    if (score) {

        const values = [gameid, userid, score];

        var sql = "INSERT INTO leaderboard (game_id, user_id, score) VALUES (?)";
        
        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            return res.status(200).json({
                status: 'success',
                message: "Game Data created successfully",
                createdP: result
                });
            });

    } else {

        return res.status(404).json({
            status: 'Error',
            message: "Score Below Benchmark",
        });
    }

});

module.exports = router;