require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var randomstring = require("randomstring");

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

router.get('/', (req, res, next) => {
    
    var sql = "SELECT * FROM bl_games";
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        const response = {
            count: result.length,
            games: result.map(doc => {
                return {
                    id: doc.id,
                    game_name: doc.game_name,
                    description: doc.description,
                    created_at: doc.created_at,
                    campaign_start_date: doc.campaign_start_date,
                    campaign_end_date: doc.campaign_end_date
                }
            })
        }
        res.status(200).json(response);
    })
});

router.post('/', (req, res, next) => {
    
    const values = [req.body.game_name, req.body.description, req.body.campaign_start_date, req.body.campaign_end_date];

    var sql = "INSERT INTO bl_games (game_name, description, campaign_start_date, campaign_end_date) VALUES (?)";
    
    con.query(sql, [values], function (err, result) {
        if (err) throw err;
        return res.status(200).json({
            status: 'success',
            message: "Game Data created successfully",
            createdP: result
          });
        });
});

module.exports = router;
