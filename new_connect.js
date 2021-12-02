var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var counter = 0;
var response = {};

var config = {  
    server: 'DESKTOP-5PENVSL',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'HEHEH', //update me
            password: '1'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: false,
        database: 'Session'  //update me
    }
}; 

function createConnection () {
    
}

var connection = new Connection(config);  

// connection.on('connect', function(err) {  
//     if(err) {
//         console.log(err)
//         console.log('HAHA) LOH)')
//     } else {
//         console.log("Connected");        
//       const answer = executeSql() ;
//       console.log(answer)
//       return answer;
        
//     }
          

// });  

connection.on('connect', function(err){
    if(err) {
        console.log(err)
    }
})
connection.connect();
const answer = executeSql() ;

function executeSql (){
        
        
    var request = new Request ("SELECT * FROM Students", function(err){
        if(err){
            console.log(err)
            console.log("LOH))")
        }
        
    })

    connection.execSql(request)
    
    request.on('row', function(columns){
        response[counter] = {};
        columns.forEach(function(column){
            response[counter][column.metadata.colName] = column.value
        })
        counter+=1;
    })

    console.log(`conter = ${counter}`)
    return response
}



