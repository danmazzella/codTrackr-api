// NPM Modules
const nodemailer = require('nodemailer');

// Utils

// Config
const EnvConfig = require('../config/config.environment');

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: EnvConfig.email.username,
    pass: EnvConfig.email.password,
  },
});

const message = {
  from: 'themazzellas@gmail.com', // Sender address
  to: 'danmazzella@gmail.com', // List of recipients
};

module.exports = {
  postEmail: (postInfo) => {
    const emailObj = message;
    emailObj.subject = postInfo.subject;
    emailObj.text = postInfo.text;

    transport.sendMail(emailObj, (err, info) => {
      if (err) {
        return err;
      }

      return info;
    });
  },
};