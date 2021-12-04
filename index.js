const express = require('express');

const app = express();

const bd = require('./connection/connection.js')
app.set('view engine', 'ejs')

const PORT = 3001



app.get ('/start', (req,res) => {
    state = 'Select * from Students'

    
    let promise = bd.sqlReq(state);
    promise.then(function(columns){
        columns.forEach( (column, index) => {
            console.log(Object.getOwnPropertyNames(column))
             // console.log(column)
         });
        res.render(__dirname+'/pages/index', {
             columns: columns
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


app.listen (PORT, () => console.log(`server runnning on http://localhost:${PORT}/start`))