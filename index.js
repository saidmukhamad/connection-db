const express = require('express');
const bodyParser = require('body-parser')
const hash = require("hash.js")



// я скачал sha256.js для хэширования паролей.
const app = express();

const bd = require('./connection/connection.js')
const mail = require('./sendEmail/email.js')
const defaultQuery = "login='${log[index].login}'&password='${log[index].password}'&state='${log[index].password}'&roleId='${log[index].roleId}";


  

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
    parameterLimit: 10000000,
    limit: '2000mb',
    extended: true
  }));

const PORT = 3001



app.use (express.static(__dirname + '/pages/startPages'))
app.use (express.static(__dirname + '/pages'))


// Основная страница и её загрузка

app.get('/', (req,res) => res.render(__dirname + '/pages/startPages/startPage/startpage') )


// Страница регистрации

app.get('/reg', (req,res) => {
    if (req.query.status != undefined) {res.render(__dirname + '/pages/startpages/regPage/regPage.ejs', {
        status: req.query.status

    })} else {
    res.render(__dirname + '/pages/startpages/regPage/regPage.ejs', {
        status: 2
    }) }
})

app.post('/reg', (req,res) => {
    
    req.body.password = hash.sha256().update(req.body.password).digest('hex')
    console.log(req.body); 
    let state = [`exec registration '${req.body.name}','${req.body.surname}', '${req.body.patronymic}', '${req.body.date}',
    '${req.body.phone}', '${req.body.email}', '${req.body.login}',
    '${req.body.password}', ${req.body.roleId}`]

    let answer = bd.request(state);
    answer.then(ans => {
        console.log("answer here")
        if (ans != undefined) {
            res.redirect('http://localhost:3001/reg?status=0')
        } else {
            mail.send(req.body);
            res.redirect('http://localhost:3001/reg?status=1')
        }

    })
})

// Страница входа в систему

app.get('/log', (req,res) => {
    if (req.query.status != undefined) { res.render(__dirname + '/pages/startPages/logPage/loginPage', {status: req.query.status})
    } else {
        res.render(__dirname + '/pages/startPages/logPage/loginPage', {status: 2})
    }
    
})


// Непосредственно вход. нужно правильно настроить редирект исходя из роли сотрудника


app.post('/log', (req,res) => {
    state = [`exec log_in '${req.body.login}', '${hash.sha256().update(req.body.password).digest('hex')}'`];
    console.log(req.body)
    
    let tables = bd.request(state);

    tables.then(table => {
        table.forEach ( (log,index) => {
            console.log(log)
            if (log[index] == undefined) {
                res.redirect('http://localhost:3001/log?status=0')
            }  else if (log[index].roleId = 1) {     
                res.redirect(`http://localhost:3001/MovieAdmin?login=${log[index].login}&password=${log[index].password}&state=${log[index].state}&roleId=${log[index].roleId}`);
             } else if (log[index].roleId = 2) {
                res.redirect(`http://localhost:3001/MovieDirector?login=${log[index].login}&password=${log[index].password}&state=${log[index].state}&roleId=${log[index].roleId}`)
             } else if (log[index].roleId = 3) {
                res.redirect(`http://localhost:3001/MovieActor?login=${log[index].login}&password=${log[index].password}&state=${log[index].state}&roleId=${log[index].roleId}`)
             } 
            }

        )
        

    })
})



// Страницы которые видит админ при входе

app.get('/MainAdmin', (req,res) => {
    res.render(__dirname + '/pages/Admin.ejs')
})


// Админский вид на фильмы

app.get('/MovieAdmin', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);

    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
        state = ['SELECT idMovie, title, length, genre, date FROM Movie'];

        let tables = bd.request(state);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];

        tables.then(table => {

            res.render(__dirname + '/pages/AdminViews/MovieAdmin', {
                table: table,
                session: session
            })
        })
    })
}
})


// О фильме подробно

app.get('/MovieAbout', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {               
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    state = [`SELECT * FROM Movie where idMovie = ${req.query.idMovie}`];


                    let tables = bd.request(state);


                    tables.then(table => {
                        console.log(table)
                        res.render(__dirname + '/pages/AdminViews/MovieAbout.ejs', {
                            table: table,
                            session: session
                        })
                    })
                
                }

        })
    }
})



// Добавление фильма

app.get('/MovieAdd', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];

    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
        else {
            res.render(__dirname + '/pages/MoviePages/MovieAdmin/MovieAdd.ejs', {
                session: session
            })
        }
    })
    }
})


app.post('/MovieAdd', (req,res) => {
    console.log(req.body); 
    let state = [`exec addMovie '${req.body.title}','${req.body.length}', '${req.body.genre}', '${req.body.status}',
    '${req.body.date}'`]
    bd.request(state)
    // res.redirect('http://localhost:3001/MovieAdmin')
})



function sampleOfGet() {
    app.get('/MovieAdd', (req,res) => {
        if (req.query == undefined) {
            res.redirect('http://localhost:3001/log')
        } else {
            let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
            let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
            check.then(answer => {
                if (answer == false) {res.redirect('http://localhost:3001/log')}
                    else {
                
                    }
    
            })
        }
    })
}




// Просмотр всех рабочих

app.get('/WorkersAdmin', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                state = ['SELECT IdWorker, name, surname, phone, roleId, state FROM StudioWorker'];


                let tables = bd.request(state);


                tables.then(table => {
                    console.log(table)
                    res.render(__dirname + '/pages/AdminViews/WorkersAdmin.ejs', {
                        table: table,
                        session: session
                    })
                })
            }

        })
    }
})
    



// Просмотр всех сценариев (Для админа и режиссёра)

app.get('/ScenarioAdmin', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                state = ['SELECT title, author from Scenario'];


                let tables = bd.request(state);


                tables.then(table => {
                    console.log(table)
                    res.render(__dirname + '/pages/AdminViews/ScenarioAdmin.ejs', {
                        table: table,
                        session: session
                    })
                })
            }

        })
    }
})



// Добавить сценарий

app.get('/ScenarioAdd', (req,res) => res.render(__dirname + '/pages/ScenarioPages/ScenarioAdmin/ScenarioAdd.ejs'))

app.post('/ScenarioAdd', (req,res) => {
    console.log(req.body); 
    let state = [` exec addScenario '${req.body.author}','${req.body.title}', '${req.body.text}'`]
    bd.request(state)
    res.redirect('http://localhost:3001/Scenario')
})










// Запросы

app.get('/RequestsAdmin', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                state = ['SELECT * from Request'];


                let tables = bd.request(state);


                tables.then(table => {
                    console.log(table)
                    res.render(__dirname + '/pages/AdminViews/RequestAdmin.ejs', {
                        table: table,
                        session: session
                    })
                })
            }

        })
    }
})









// Архив 

app.get('/ArchiveAdmin', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                state = ['SELECT * from Movie Where state = 0'];


                let tables = bd.request(state);

                
                tables.then(table => {
                    console.log(table)
                    res.render(__dirname + '/pages/AdminViews/ArchiveAdmin.ejs', {
                        table: table,
                        session: session
                    })
                })
            }

        })
    }
})











app.listen (PORT, () => console.log(`server runnning on http://localhost:${PORT}/`))