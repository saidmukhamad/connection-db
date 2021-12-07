const nodemailer = require("nodemailer");


const transport = nodemailer.createTransport(
    {
        host: 'smtp.yandex.ru',
        port: 587,
        secure: false,
        auth: {
            user: 'saidmukhamad@yandex.ru',
            pass: 'WhatDoesTheFoxSay108'
        }
    },
    {
    
    }
)

const mailer = message => {
    transport.sendMail(message, (err, info) => {
        if(err) return console.log(err);

    })
}

var send = exports.send  = (req) => {
    const message = {
        from: "saidmukhamad@yandex.ru",
        to: req.email,
        subject: "WELCOME TO STUDIO",
        text: '',
        html: `

        
        <h1>Поздравляем, ${req.name}, вы теперь часть студии!</h1>

        Данные вашей учетной записи:

        login: ${req.email}
        password:${req.password}
        
        Пожалуйста потвердите регистрацию: <a href = "http://localhost:3001/approve/">Подтвердить</a>
        
        `
    }

    mailer(message);
}