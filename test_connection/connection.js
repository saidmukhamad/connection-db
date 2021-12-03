var Connection = require('tedious').Connection;
var response = {};
var counter = 1;

var config = {  
    server: 'DESKTOP-5PENVSL',  
    authentication: {
        type: 'default',
        options: {
            userName: 'HEHEH', 
            password: '1'  
        }
    },
    options: {
        database: 'Session'  
    }
}; 



exports.ConnectToDb = function (requestS = 1) {

    var connection = new Connection(config); 
    connection.connect()
    

    return new Promise (function(resolve, reject){
        connection.on('connect', function(err) {  
            if(err) {
                reject(err);
                
            } else {
                console.log("Connected");
                
                if (requestS != 1) {
                var res = {};
                const promise = Execute(requestS);
                promise.then(function(columns){
                    resolve(columns);
                })

                console.log(res)      
                };
    
            }   
    })
               
    
    }); 


    

    function Execute(requestS) {
        
        return new Promise (function (resolve, reject){
            connection.execSql(requestS);
            requestS.on ('row', function(columns){
                resolve(columns);
            })
        })
    
        // connection.execSql(requestS);

        // requestS.on('row', function(columns){
            
        // });
        
    };






    }

     

