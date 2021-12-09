const express = require('express');
const bodyParser = require('body-parser')



// я скачал sha256.js для хэширования паролей.
const app = express();

const bd = require('./connection/connection.js')
const mail = require('./sendEmail/email.js')



app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}));

const PORT = 3001



app.use (express.static(__dirname + '/pages/startPages'))

var test = exports.test  = (variable) => {
    console.log(variable);
}

app.post ('/', (req,res) => {
    console.log(req.body)
    
})

app.get ('/approve', (req,res) => {
    res.render (__dirname + '/pages/startPages/regPage/thanks.ejs')
})

app.get('/', (req,res) => res.render(__dirname + '/pages/startPages/startPage/startpage') )

app.get('/reg', (req,res) => res.render(__dirname + '/pages/startpages/regPage/regPage.ejs'))

app.post('/reg', (req,res) => {mail.send(req.body);  res.redirect('http://localhost:3001/')})

app.get('/log', (req,res) => res.render(__dirname + '/pages/startPages/logPage/loginPage'))

app.get ('/start', (req,res) => {
    state = `
	select NumGr, COUNT( DISTINCT Students.NumSt) AS StudentsCount from Students, Balls
    where Students.NumSt = Balls.NumSt and Balls.Ball >= 3
    group by NumGr
    having COUNT(Balls.Ball) >= 0
    `
    state1 = `
	select Name from Disciplines, Uplans, Balls
	where Disciplines.NumDisc = Uplans.NumDisc and Uplans.IdDisc = Balls.IdDisc
	group by Name`
 
    state2 = `
    select Students.NumGr, COUNT( DISTINCT Students.NumSt ) AS StudentsCount from Students, Balls
	where Students.NumSt = Balls.NumSt and Balls.Ball >= 3
	group by Students.NumGr
	having COUNT(Balls.Ball) > 1
    `

    state3 = `
    select FIO from Students, Balls
	where Students.NumSt = Balls.NumSt and Balls.Ball >= 3
    `
    stateTest = [state, state1,state2, state3];

    let tables = bd.request(stateTest);


    tables.then(table => {
        res.render(__dirname + '/pages/index', {
            table: table
        })
    })
    
}) 



app.get('/HEH', (req,res) => {
    state = 'Select * from Uplans'
    let promise = bd.sqlReq(state);
    promise.then(function(columns){
        
        res.render(__dirname+'/pages/heh', {
             columns: columns
         })
    })
})


app.listen (PORT, () => console.log(`server runnning on http://localhost:${PORT}/`))