"use strict";
// email
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'rahmatisni2@gmail.com',
        pass: 'B1716FFW0'
    }
});
const express = require('express')
const app = express()
const port = 3000
const jwt = require("jsonwebtoken")
const fs = require('fs')
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet')
app.use(helmet())

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));


// Parse JSON bodies (as sent by API clients)

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'datalake',
  password: 'b1716ffw0',
  port: 5432,
})

const pg = require('pg');
const cs = 'postgres://postgres:b1716ffw0@localhost:5432/customer';
let client = new pg.Client(cs);
let z = client.connect()

//log record
// morgan.format('myformat', '[:date[clf]] ":method :url" :status :res[content-length] - :response-time ms');
// app.use(morgan('myformat', { stream: accessLogStream }))

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'logdatariwayat.css'), { flags: 'a' })
morgan.token('date', function() {
    var p = new Date().toString().replace(/[A-Z]{3}\+/,'+').split(/ /);
    return( p[2]+'/'+p[1]+'/'+p[3]+':'+p[4]+' '+p[5] );
});

app.use(morgan('combined', { stream: accessLogStream }))

//application
app.post('/history', isAuthorized, (req, res) => {
    console.log(req.body)
    var no_kartu = JSON.stringify(req.body.user_etoll_number)
    
    var card_num = no_kartu.replace('"','').replace('"','');
    let sql = "SELECT * FROM datalake01 where no_kartu = '"+card_num+"'"
    pool.query(sql, (err, results) => {
        if(err) console.log('Error Connection');
        if (results.rows == 0)
        {
            res.json({
                status: + true,
                message: "kartu belum terdaftar"
            })

        }
        else{
            res.json({
                status: + true,
                message: results.rows
        })}
    })
})


app.post('/register', isAuthorized, (req, res) => {
    console.log(req.body)
    var no_kartu = JSON.stringify(req.body.user_etoll_number)
    var id_cust = JSON.stringify(req.body.user_id)
    var nama_cust = JSON.stringify(req.body.user_id)
    var email = JSON.stringify(req.body.user_email)
    var no_handphone = JSON.stringify(req.body.user_handphone_number)
    var birthdate = JSON.stringify(req.body.user_birthday)
    var adress = JSON.stringify(req.body.user_address)
    var latitude = JSON.stringify(req.body.user_adress_lat)
    var longitude = JSON.stringify(req.body.user_address_long)

    var no_kartu1 = no_kartu.replace('"','').replace('"','');
    var id_cust1 = id_cust.replace('"','').replace('"','');
    var nama_cust1 = nama_cust.replace('"','').replace('"','');
    var email1 = email.replace('"','').replace('"','');
    var no_handphone1 = no_handphone.replace('"','').replace('"','');
    var birthdate1 = birthdate.replace('"','').replace('"','');
    var adress1 = adress.replace('"','').replace('"','');
    // var latitude1 = latitude.replace('"','').replace('"','');
    // var longitude1 = longitude.replace('"','').replace('"','');

    let sql3 = "select no_kartu from customers where no_kartu = '"+no_kartu1+"'"
    client.query(sql3, (err, results) => {
        if(err) console.log('Error Connection');
        if (results.rowCount == 0)
        {
            let sql2 = "INSERT INTO customers (adress, birthdate, email, id_cust, no_handphone, no_kartu, nama_cust) VALUES ('"+adress1+"', '"+birthdate1+"', '"+email1+"','"+id_cust1+"','"+no_handphone1+"','"+no_kartu1+"','"+nama_cust1+"')"
            client.query(sql2, (err, results) => {
                if(err) console.log('Error Connection');
                res.json({
                    status: + true,
                    message: "success"
                })                
            })
        }
        else
        {
            res.json({
                status: + false,
                message: "error"
            })                  
        }
    })
})

// generate token
app.get('/jwt', (req, res) => {
    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    let token = jwt.sign({ "body": "stuff" }, privateKey, { algorithm: 'HS256'});
    res.send("email send to admin");
    const mailOptions = {
        from: 'rahmatisni2@gmail.com',
        to: 'rahmatisni@gmail.com',
        subject: 'Sending Email using Nodejs',
        html: token
    };
    
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) throw err;
        console.log('Email sent: ' + info.response);
    });   
})

function isAuthorized(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        // retrieve the authorization header and parse out the
        // JWT using the split function
        let token = req.headers.authorization.split(" ")[1];
        
        let privateKey = fs.readFileSync('./private.pem', 'utf8');
        // Here we validate that the JSON Web Token is valid and has been 
        // created using the same private pass phrase
        jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
            
            // if there has been an error...
            if (err) {  
                // shut them out!
                res.status(500).json({ message: "Not Authorized" });
                return;
            }
            // if the JWT is valid, allow them to hit
            // the intended endpoint
            return next();
        });
    } else {
        // No authorization header exists on the incoming
        // request, return not authorized
        res.status(500).json({ message: "Not Authorized" });
        return;
    }
}

app.listen(port, 
    () => console.log(`Simple Express app listening on port ${port}!`))

