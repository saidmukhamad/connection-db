const express = require('express');

const app = express();

const bd = require('./connection/connection.js')
app.set('view engine', 'ejs')

const PORT = 3001


app.post ('/', (req,res) => {
    console.log(req.body)
    
})

app.get('/', (req,res) => res.render(__dirname + '/pages/first') )




    app.get ('/start', (req,res) => {
        state = 'Select * from Students'
        state1 = 'Select * from Directions'

        stateTest = [state, state1];

        let tables = bd.request(stateTest);


        tables.then(table => {
            res.render(__dirname + '/pages/index', {
                table: table
            })
        })
        // tablesW.forEach(columns => {
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