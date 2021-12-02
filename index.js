const express = require('express');

const app = express();

const bd = require('./connection')
app.set('view engine', 'ejs')

const PORT = 3001

// app.get ('/start', (req,res) => {
//     res.render( './pages/index.ejs')
// })

// in start

app.get ('/start', (req,res) => {

    let columns = bd.connect();
    console.log(columns)
    res.render(__dirname + '/pages/index', {
         columns: columns
    })
}) 




app.listen (PORT, () => console.log(`server runnning on http://localhost:${PORT}/start`))