const express = require('express');

const app = express();

const bd = require('./test_connection/requests')
app.set('view engine', 'ejs')

const PORT = 3001

// app.get ('/start', (req,res) => {
//     res.render( './pages/index.ejs')
// })

// in start

app.get ('/start', (req,res) => {

    let promise = bd.startRequest();
    promise.then(function(columns){
        console.log(columns)
        res.render(__dirname + '/pages/index', {
            columns: columns
        })
    })
    // console.log(columns)
    // res.render(__dirname + '/pages/index', {
    //      columns: columns
    // })
}) 




app.listen (PORT, () => console.log(`server runnning on http://localhost:${PORT}/start`))