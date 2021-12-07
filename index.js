const express = require('express');
const bodyParser = require('body-parser')

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
        state = 'Select * from Students'
        state1 = 'Select * from Directions'

        stateTest = [state, state1, state,state,state,state,state,state,state,state,state,state,state,state,state,state,state];

        let tables = bd.request(stateTest);


        tables.then(table => {
            res.render(__dirname + '/pages/index', {
                table: table
            })
        })
        // tables.forEach(columns => {
        //     console.log(columns)
        // });

        // answer.forEach((out) => {console.log(out)})
        
        // let promise = bd.sqlReq(state);
        // promise.then(function(columns){
        //     columns.forEach( (column, index) => {
        //         console.log(Object.getOwnPropertyNames(column))
        //          // console.log(column)
        //      });
        //     res.render(__dirname+'/pages/index', {
        //          columns: columns
        //      })
        // })
      
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