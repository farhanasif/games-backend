require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const mysql = require('mysql');


mysql.Promise = global.Promise;

const userRoutes = require('./api/routes/user');
const gamesRoutes = require('./api/routes/game');
const leaderboardRoutes = require('./api/routes/leaderboard');

app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Routes
app.use('/users', userRoutes);
app.use('/games', gamesRoutes);
app.use('/leaderboard', leaderboardRoutes);


app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message
    })
})

module.exports = app;