const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    pool: true,
    host: "smtp.example.com",
    port: 465,
    secure: true, // use TLS
    auth: {
      user: "username",
      pass: "password"
    }
  });

async function sendMail(jsonMessage) {
    if(jsonMessage.recipient.email){
        var mailOptions = {
            from: 'smtp@example.com',
            to: jsonMessage.recipient.email,
            subject: 'Your Vaccination Certificate',
            text: 'Get it here https://divoc.xiv.in/'
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        });
    }
  }

module.exports = {
    sendMail
  };

