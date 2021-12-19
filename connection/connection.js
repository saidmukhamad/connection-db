

const sql = require('mssql')

  
const config = {
  user: "HEHEH",
  password: "1",
  database: "Studio",
  server: 'DESKTOP-5PENVSL',
  pool: {
    max: 50,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

var sqlReq = exports.sqlReq  = function (req = 'SELECT * FROM MovieWorker') {
    return new Promise (function (resolve, reject) {
        sql.on('error', err => {
          console.log(err)
        })
        
        sql.connect(config).then(pool => {
         
            return pool.request().query(req)

        }).then(result => {
            resolve(result.recordset);
        }).catch(err => {
            console.log(err)
            resolve(err);
        });
    })

}

var request = exports.request = function (req) {
  return new Promise (function (resolve, reject) {
    let output = [];

    let testa = req.length - 1;
    console.log(testa)
  
    req.forEach ( (state, index) => {
      let promise = sqlReq(state);
  
      promise.then(function (columns) {
        output[index] = columns;
  
        if (testa == index) {
          resolve(output)
        }
        
      })

    })

  })

}


var checkConnection = exports.checkConnection = (login, password, roleId) => {
  return new Promise ((resolve,reject) => {
    var checkRequest = [`Select * from StudioWorker where (login = '${login}') and (password = '${password}') and (state = 'true') and (roleId = '${roleId}')`]
    let check = request(checkRequest)
    check.then((answer) => {
      console.log(answer, 'check')
     if (answer[0][0] == undefined) {
         resolve(false);
       } else {
         resolve(true);
       }
   })
  }) 

}


let login = 'saidmukhamad'
let password = 'aecb38da263d797ac748423906da24fae9da9ec444b6db4bee0de024319fe018';
let roleId = 1;




let answer = (checkConnection(login,password,roleId))
answer.then(ans => {
  console.log(ans)
})