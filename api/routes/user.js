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



router.get('/testing', (req, res, next) => {
    res.status(200).json({
        status: 200,
        message: "Success!"
    });
});

router.post('/signup', (req, res, next) => {
    const user = req.body;
    const userPhone = req.body.phone;

    if(!userPhone) {
        return res.status(200).json({
            status: 401,
            message: "OOPS! Phone Number is missing!."
        })
    } else {

        console.log(userPhone);

        var phone = userPhone.split('0')[1];

        phone = phone.length == 10 ? "+880"+ phone : null;

        if (phone) {
            
            console.log(phone);

            const query = "select phone from users where phone = '"+ phone +"'";
    
            con.query(query, (err, result) => {
                console.log(result[0])
               if(!result[0]) {
                   console.log(phone)
                    bcrypt.hash(user.password, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            })
                        } else {
                            //const verificationCode = randomstring.generate();
                            const values = [user.fullName, phone, hash, user.game_id, 2];
        
                            var sql = "INSERT INTO users (full_name, phone, password, game_id, role) VALUES (?)";
        
                            con.query(sql, [values], function (err, result) {
                                if (err) throw err;
                                return res.status(200).json({
                                    status: 'success',
                                    message: "User created successfully",
                                    data: result
                                  });
                                });
                        }
                    });
                } else {
                    return res.status(409).json({
                        status: 'Error',
                        message: "Sorry! this user already exists.",
                        data: result
                    });
                }
            });
        } else {
            return res.status(409).json({
                status: 'Error',
                message: "Phone Number Error",
            });
        }
    }
});


router.post('/login', (req, res, next) => {
    const user = req.body;
    const userPhone = req.body.phone;

    if(!user) {
        return res.status(200).json({
            status: 401,
            message: "OOPS! Something is wrong."
        })
    }

    var phone = userPhone.split('0')[1];
    
    phone = phone.length == 10 ? "+880"+ phone : null;
    
    const query = "select id,full_name, phone, password, game_id, role from users where phone = '"+ phone +"'";

    console.log(query)

    con.query(query, (err, result) => {

        console.log(result);

       if(result[0]) {
        //    console.log(user.email)
           bcrypt.compare(user.password, result[0].password, (err, ans) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    })
                }

                if (ans) {
                    const token = jwt.sign({
                        exp: Math.floor(Date.now().valueOf() / 1000) + (60 * 60 * 24),
                        phone: result[0].phone,
                        userId: result[0].id
                    }, process.env.SECRET);
                    return res.status(200).json({
                        message: 'Auth Success',
                        token: token
                    });
                } else {
                    return res.status(401).json({
                        message: 'Auth failed'
                    })
                }
            });
        }else{
            res.status(500).json({
                error: err
            });
        }
    });
});

// router.post('/userDetails', checkAuth, (req, res, next) => {
//     console.log(req.userData);

//     const email = req.userData.email;
//     if(!req.userData) {
//         return res.status(200).json({
//             status: 401,
//             message: "OOPS! Something is wrong."
//         })
//     }
//     const query = "select id,fullname,role,email,password from users where email = '"+ req.userData.email +"'";

//     con.query(query, (err, result) => {
//         console.log(result)
//             if (result) {
//                 res.status(200).json(result);
//             } else {
//                 res.status(404).json({
//                     message: 'No user found!'
//                 });
//             }

//         })
// });

router.get('/logout',checkAuth, (req, res, next) => {
    const token = jwt.sign({
        exp: "",
        phone: "",
        userId:""
      });

    console.log(token)

        return res.status(200).json({
            message: "User logout successfully!"
        })
})

module.exports = router;