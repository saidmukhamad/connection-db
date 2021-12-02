var Request = require('tedious').Request;
var connect = require('./connection.js');

var request = new Request ("SELECT * FROM Students", function(err){
    if(err){
        console.log(err)
        console.log("DUDE")
    }
    
})

connect.ConnectToDb(request);




