var Connection = require('tedious').Connection;


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
    

    connection.on('connect', function(err) {  
        if(err) {
            console.log(err);
            
        } else {
            console.log("Connected");
            
            if (requestS != 1) {
            const response = Execute(requestS);
            console.log(response)
        }

        }              
    
    }); 

    connection.connect()

    function Execute(requestS) {
        
        connection.execSql(requestS);

        var counter = 1;
        response = {};

        requestS.on('row', function(columns){
            response[counter] = {};
            columns.forEach(function(column){
                response[counter][column.metadata.colName] = column.value
            });
            counter+=1;
        });
        console.log('check', response)
        return response;
    };

    }

     

