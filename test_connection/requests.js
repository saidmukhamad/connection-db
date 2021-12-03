var Request = require('tedious').Request;
var connect = require('./connection.js');

var request = new Request ("SELECT * FROM Students", function(err){
    if(err){
        console.log(err)
        console.log("DUDE")
    }
    
})



exports.startRequest = function (){

    return new Promise (function(resolve, reject){
        let promise = connect.ConnectToDb(request);
        
        promise.then (function(result){
            resolve(result);
        })
    })

}
