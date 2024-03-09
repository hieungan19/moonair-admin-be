const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
// new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, resetPass) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.resetPass = resetPass;
    this.from = process.env.EMAIL_FROM;
  }

  createTransportFunction() {
    const transporter = nodemailer.createTransport({
      port: 465,
      secure: true,
      logger: true,
      tls: {
        rejectUnauthorized: true,
      },
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    return transporter;
  }
  async send(template, subject) {
    //send the actual email
    //1. Render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        resetPass: this.resetPass,
        subject,
      },
    );
    //2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, {}),
      // html:,
    };

    //3. Create a transport and send email
    await this.createTransportFunction().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
  async sendForgotPasswordUrl() {
    await this.send(
      'passwordReset',
      'Your reset password (valid for only 10 min)',
    );
  }
};
