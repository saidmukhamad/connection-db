
const sql = require('mssql')
  
const config = {
  user: "HEHEH",
  password: "1",
  database: "Session",
  server: 'DESKTOP-5PENVSL',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

exports.sqlReq  = function (req = 'SELECT * FROM Students') {
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
        });
    })

}

