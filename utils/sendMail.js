const nodemailer = require("nodemailer");

const sendMail = async (options) => {

    console.log(options,"this is email")
    const transporter = nodemailer.createTransport({
        
        service: 'gmail',
                    auth: {
                        user: process.env.SMPT_MAIL,
                        pass: process.env.SMPT_PASSWORD
                    },
    });
    
    const mailOptions = {
        from:process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;