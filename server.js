const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Email setup using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'botrobot1967@gmail.com',
        pass: '110220Ka'
    }
});

// Route to send the email with verification code
app.post('/send-verification', (req, res) => {
    const { email, code } = req.body;

    const mailOptions = {
        from: 'botrobot1967@gmail.com',
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}`
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Verification email sent');
        }
    });
});

// Server listen on port 3000
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
