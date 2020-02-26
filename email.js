const nodemailer = require('nodemailer');
const fs = require('fs')

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'rahmatisni2@gmail.com',
        pass: 'B1716FFW0'
    }
});

let privateKey = fs.readFileSync('./private.pem', 'utf8');

const mailOptions = {
    from: 'rahmatisni2@gmail.com',
    to: 'rahmatisni@gmail.com',
    subject: 'Sending Email using Nodejs',
    html: privateKey
};

transporter.sendMail(mailOptions, (err, info) => {
    if (err) throw err;
    console.log('Email sent: ' + info.response);
});
