const express = require('express');
const bodyParser = require('body-parser')
const hash = require("hash.js")



// я скачал sha256.js для хэширования паролей.
const app = express();

const bd = require('./connection/connection.js')
const mail = require('./sendEmail/email.js')



app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
    parameterLimit: 10000000,
    limit: '2000mb',
    extended: true
  }));

const PORT = 3001



app.use (express.static(__dirname + '/pages/startPages'))
app.use (express.static(__dirname + '/pages'))

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

app.post('/reg', (req,res) => {
    mail.send(req.body);
    req.body.password = hash.sha256().update(req.body.password).digest('hex')
    console.log(req.body); 
    let state = [`exec registration '${req.body.name}','${req.body.surname}', '${req.body.patronymic}', '${req.body.date}',
    '${req.body.phone}', '${req.body.email}', '${req.body.login}',
    '${req.body.password}', ${req.body.roleId}`]
    bd.request(state)
    res.redirect('http://localhost:3001/')
})

app.get('/Movie', (req,res) => {
    state = ['SELECT * FROM Movie'];


    let tables = bd.request(state);


    tables.then(table => {
        res.render(__dirname + '/pages/MoviePages/MovieView.ejs', {
            table: table
        })
    })
})

app.get('/MovieAdd', (req,res) => res.render(__dirname + '/pages/MoviePages/MovieAdmin/MovieAdd.ejs'))

app.post('/MovieAdd', (req,res) => {
    console.log(req.body); 
    let state = [`exec addMovie '${req.body.title}','${req.body.length}', '${req.body.genre}', '${req.body.status}',
    '${req.body.date}'`]
    bd.request(state)
    res.redirect('http://localhost:3001/Movie')
})



app.get('/Scenario', (req,res) => {
    state = ['SELECT * FROM Scenario'];


    let tables = bd.request(state);


    tables.then(table => {
        res.render(__dirname + '/pages/ScenarioPages/ScenarioView.ejs', {
            table: table
        })
    })
})

app.get('/ScenarioAdd', (req,res) => res.render(__dirname + '/pages/ScenarioPages/ScenarioAdmin/ScenarioAdd.ejs'))

app.post('/ScenarioAdd', (req,res) => {
    console.log(req.body); 
    let state = [`exec addScenario '${req.body.author}','${req.body.title}', '${req.body.text}'`]
    bd.request(state)
    res.redirect('http://localhost:3001/Scenario')
})




app.get('/log', (req,res) => res.render(__dirname + '/pages/startPages/logPage/loginPage'))

app.get ('/start', (req,res) => {
    state = [];

    stateArray = [state];

    let tables = bd.request(stateArray);


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