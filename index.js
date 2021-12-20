const express = require('express');
const bodyParser = require('body-parser')
const hash = require("hash.js")



// я скачал sha256.js для хэширования паролей.
const app = express();

const bd = require('./connection/connection.js')
const mail = require('./sendEmail/email.js');
const e = require('express');
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
            console.log('Хочу посмотреть лог',log)
            if (log[index] == undefined) {
                res.redirect('http://localhost:3001/log?status=0')
            }  else if (log[index].roleId == 1) {     
                res.redirect(`http://localhost:3001/Profile?login=${log[index].login}&password=${log[index].password}&state=${log[index].state}&roleId=${log[index].roleId}`);
             } else if (log[index].roleId == 2) {
                res.redirect(`http://localhost:3001/Profile?login=${log[index].login}&password=${log[index].password}&state=${log[index].state}&roleId=${log[index].roleId}`)
             } else if (log[index].roleId == 3) {
                res.redirect(`http://localhost:3001/Profile?login=${log[index].login}&password=${log[index].password}&state=${log[index].state}&roleId=${log[index].roleId}`)
             } 
            }

        )
        

    })
})


app.get('/Profile', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`Select idWorker, name, surname, patronymic, FORMAT(birthdate, 'dd.MM.yyyy') AS 'birthdate', phone, email, login, roleId from StudioWorker where login = '${req.query.login}'`];
                    state = bd.request(state);

                    state.then(table => {
                        if (session[3] == 1) {
                            res.render(__dirname + '/pages/Profile/Profile.ejs', {
                                table: table,
                                session: session
                            })
                        } else  if (session[3] == 2) {
                            res.render(__dirname + '/pages/DirectorViews/Profile/Profile.ejs', {
                                table: table,
                                session: session
                            })
                        } else  if (session[3] == 3) {
                            res.render(__dirname + '/pages/Profile/Profile.ejs', {
                                table: table,
                                session: session
                            })
                        }
                      
                    })
                }

        })
    }
})

app.get('/ProfileEdit', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`Select idWorker, name, surname, patronymic, FORMAT(birthdate, 'dd.MM.yyyy') AS 'birthdate', phone, email, login, roleId from StudioWorker where login = '${req.query.login}'`];
                    state = bd.request(state);

                    state.then(table => {
                        res.render(__dirname + '/pages/Profile/ProfileEdit.ejs', {
                            table: table,
                            session: session
                        })
                    })
                }

        })
    }
})

app.post('/ProfileEdit', (req, res) => {
    if (req.body == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {               
        let check = bd.checkConnection(req.body.login, req.body.password, req.body.roleId);
        let session = [req.body.login, req.body.password, req.body.state, req.body.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {

                    console.log(req.body)
                    state = [`Update StudioWorker set name = '${req.body.name}', surname= '${req.body.surname}', patronymic = '${req.body.patronymic}', phone = '${req.body.phone}',  birthdate = '${req.body.birthdate}', email = '${req.body.email}' where idWorker = ${req.body.idWorker}`];
                    console.log(state)
                    let tables = bd.request(state);

                    tables.then(() => {
                        res.redirect(`http://localhost:3001/Profile?login=${req.body.login}&password=${req.body.password}&state=${req.body.state}&roleId=${req.body.roleId}`)
                    })
                    
                
                }

        })
    }
})



// Страницы которые видит админ при входе

app.get('/MainAdmin', (req,res) => {
    res.render(__dirname + '/pages/Admin.ejs')
})


// АДМИН

app.get('/MovieAdmin', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    } else {
        console.log(req.query, 'ВЫВОД ЗАПРОСА ЕЩЁ РАЗ')

    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);

    check.then(answer => {

        if (answer == false) {res.redirect('http://localhost:3001/log')}
        state = [`SELECT idMovie, title, length, genre, FORMAT(date, 'dd.MM.yyyy') AS 'release' FROM Movie where state = 1`];

        let tables = bd.request(state);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId, req.query.sort];

        tables.then(table => {

            res.render(__dirname + '/pages/AdminViews/MovieAdmin/MovieAdmin', {
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
                    state = [`	SELECT idMovie, title, length, genre, status, FORMAT(date, 'dd.MM.yyyy') AS 'release'  FROM Movie where idMovie = ${req.query.idMovie}`, 
                            `exec WatchScenario ${req.query.idMovie}`,
                             `Select StudioWorker.IdWorker, StudioWorker.name, StudioWorker.surname from StudioWorker
                            Join MovieWorker on MovieWorker.IdWorker = StudioWorker.IdWorker
                            Join Movie on MovieWorker.idMovie = Movie.IdMovie
                            Where (Movie.IdMovie = ${req.query.idMovie}) and (Movie.state != 0) and (StudioWorker.state != 0) and (StudioWorker.roleId = 2)`];

                    let tables = bd.request(state);


                    tables.then(table => {
                        res.render(__dirname + '/pages/AdminViews/MovieAdmin/MovieAbout.ejs', {
                            table: table,
                            session: session
                        })
                    })
                
                }

        })
    }
})

app.get('/MovieEdit', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {               
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    state = [`	SELECT idMovie, title, length, genre, status, FORMAT(date, 'dd.MM.yyyy') AS 'release'  FROM Movie where idMovie = ${req.query.idMovie}`, 
                            `exec WatchScenario ${req.query.idMovie}`];

                    let tables = bd.request(state);


                    tables.then(table => {
                        res.render(__dirname + '/pages/AdminViews/MovieAdmin/MovieEdit.ejs', {
                            table: table,
                            session: session
                        })
                    })
                
                }

        })
    }
})


app.post('/MovieEdit', (req, res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else
    if (req.body == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {              
   
        let check = bd.checkConnection(req.body.login, req.body.password, req.body.roleId);
        let session = [req.body.login, req.body.password, req.body.state, req.body.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {

                    console.log(req.body)
                    state = [`Update Movie set title = '${req.body.title}', length = ${req.body.length}, status = '${req.body.status}', date = '${req.body.date}', genre = '${req.body.genre}' where IdMovie = ${req.body.idMovie}`];
                    console.log(state)
                    let tables = bd.request(state);

                    tables.then(() => {
                        res.redirect(`http://localhost:3001/MovieAbout?login=${req.body.login}&password=${req.body.password}&state=${req.body.state}&roleId=${req.body.roleId}&idMovie=${req.body.idMovie}`)
                    })
                    
                
                }

        })
    }
})


app.get('/ScenarioEdit', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {               
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`Select idScenario, title, author, text from Scenario where idScenario = ${req.query.idScenario} `];

                    let tables = bd.request(state);
                    

                    tables.then(table => {
                        console.log(table)
                        res.render(__dirname + '/pages/AdminViews/ScenarioAdmin/ScenarioEdit.ejs', {
                            table: table,
                            session: session
                        })
                    })
                
                }

        })
    }
})



app.post('/ScenarioEdit', (req, res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else
    if (req.body == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {               
        let check = bd.checkConnection(req.body.login, req.body.password, req.body.roleId);
        let session = [req.body.login, req.body.password, req.body.state, req.body.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {

                    console.log(req.body)
                    state = [`Update Scenario set title = '${req.body.title}', author = '${req.body.author}', text = '${req.body.text}' where idScenario = ${req.body.idScenario}`];

                    let tables = bd.request(state);

                    tables.then(() => {
                        res.redirect(`http://localhost:3001/ScenarioAbout?login=${req.body.login}&password=${req.body.password}&state=${req.body.state}&roleId=${req.body.roleId}&idScenario=${req.body.idScenario}`)
                    })
                    
                
                }

        })
    }
})





// Добавление фильма

app.get('/MovieAdd', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
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
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    } else {
    console.log(req.body); 
    let state = [`exec addMovie '${req.body.title}','${req.body.length}', '${req.body.genre}', '${req.body.status}',
    '${req.body.date}'`]
    bd.request(state)
    res.redirect(`${req.body.page}`)
}})

app.get('/ScenarioToMovie', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = ['Select idScenario, title, author from Scenario '];
                    state = bd.request(state);
                    state.then((table)=>{
                        res.render(__dirname +'/pages/AdminViews/ScenarioAdmin/ScenarioToMovie', {
                            table: table,
                            session: session,
                            idMovie: req.query.idMovie
                        })
                    })
                }

        })
    }
})



app.post('/ScenarioToMovie', (req, res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else
    if (req.body == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {               
        let check = bd.checkConnection(req.body.login, req.body.password, req.body.roleId);
        let session = [req.body.login, req.body.password, req.body.state, req.body.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {

                    state = [`exec AddScenarioToMovie ${req.body.idMovie}, ${req.body.idScenario}`];

                    let tables = bd.request(state);

                    tables.then(() => {
                        res.redirect(`http://localhost:3001/MovieAbout?login=${req.body.login}&password=${req.body.password}&state=${req.body.status}&roleId=${req.body.roleId}&idMovie=${req.body.idMovie}`)
                    })
                    
                
                }

        })
    }
})


app.get('/DeleteScenarioFromMovie', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    } else {
        console.log(req.query)
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];


        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`exec deleteScenarioFromMovie ${req.query.idMovie}, ${req.query.idScenario}`];
                    state = bd.request(state);
                    let page = `/MovieAbout?login=${session[0]}&password=${session[1]}&state=${session[2]}&roleId=${session[3]}&idMovie=${req.query.idMovie}`


                    res.redirect(`${page}`)
                }

        })
    }

})

app.get('/AddToArchive', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`Update Movie set state = 0 where idMovie = ${req.query.idMovie}`]
                    state = bd.request(state);

                   
                    res.redirect(`http://localhost:3001/MovieAdmin?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
                    
            
                }

        })
    }
})


app.get('/RemoveFromArchive', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`Update Movie set state = 1 where idMovie = ${req.query.idMovie}`]
                    state = bd.request(state);

                   
                    res.redirect(`http://localhost:3001/MovieAdmin?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
                    
            
                }

        })
    }
})

// Чтение сценария

app.get('/ScenarioRead', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`exec WatchScenario ${req.query.idMovie} `];
                    state = bd.request(state);

                    state.then(table => {
                        res.render(__dirname + '/pages/AdminViews/ScenarioAdmin/ScenarioRead.ejs', {
                            session: session,
                            table: table,
                            idMovie: req.query.idMovie,
                            idScenario: req.query.idScenario
                        })
                    })
                }

        })
    }
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
    } else if ((req.query.roleId !=  '1')) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else {
    console.log(req.query)
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
    check.then(answer => {
        console.log(answer, 'вывожу ответ')
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                state = ['SELECT IdWorker, name, surname, phone, roleId, state FROM StudioWorker order by state DESC'];


                let tables = bd.request(state);


                tables.then(table => {
                    res.render(__dirname + '/pages/AdminViews/WorkersAdmin/WorkersAdmin.ejs', {
                        table: table,
                        session: session
                    })
                })
            }

        })
    }
})


app.post('/WorkersAdmin', (req,res) => {
    console.log(req.body, 'ПРОВЕРОЧКА')
    console.log(req.body.roleId[0],'TEST', req.body.roleId[1])
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.body.roleId[1] !=  '1')) {
        res.redirect(`http://localhost:3001/Profile?login=${req.body.login}&password=${req.body.password}&state=${req.body.state}&roleId=${req.body.roleId[1]}`);
    }  else {
    console.log(req.body)
    let check = bd.checkConnection(req.body.login, req.body.password, req.body.roleId[1]);
    let session = [req.body.login, req.body.password, req.body.state, req.body.roleId[1]];
    check.then(answer => {
        console.log(answer, 'вывожу ответ')
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                state = [`SELECT IdWorker, name, surname, phone, roleId, state FROM StudioWorker where roleId = ${req.body.roleId[0]}  order by idWorker ASC`];


                let tables = bd.request(state);


                tables.then(table => {
                    console.log(table)
                    res.render(__dirname + '/pages/AdminViews/WorkersAdmin/WorkersAdmin.ejs', {
                        table: table,
                        session: session
                    })
                })
            }

        })
    }
})


app.get('/WorkersMovie', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);

    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
        state = [`Select StudioWorker.IdWorker, StudioWorker.name, Movie.title from StudioWorker
        Join MovieWorker on MovieWorker.IdWorker = StudioWorker.IdWorker
        Join Movie on MovieWorker.idMovie = Movie.IdMovie
        Where (StudioWorker.IdWorker = ${req.query.idWorker}) and (Movie.state != 0)`];
   
        let tables = bd.request(state);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId, req.query.sort];

        tables.then(table => {

            res.render(__dirname + '/pages/AdminViews/WorkersAdmin/WorkerMovie', {
                table: table,
                session: session
            })
        })
    })
}
})



app.get('/WorkersMovie', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);

    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
        state = [`Select StudioWorker.IdWorker, StudioWorker.name, Movie.title from StudioWorker
        Join MovieWorker on MovieWorker.IdWorker = StudioWorker.IdWorker
        Join Movie on MovieWorker.idMovie = Movie.IdMovie
        Where (StudioWorker.IdWorker = ${req.query.idWorker}) and (Movie.state != 0)`];
   
        let tables = bd.request(state);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId, req.query.sort];

        tables.then(table => {

            res.render(__dirname + '/pages/AdminViews/WorkersAdmin/WorkersMovie', {
                table: table,
                session: session,
                idMovie: req.query.idMovie 
            })
        })
    })
}
})



app.get('/MovieWorkers', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);

    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
        state = [`Select StudioWorker.IdWorker, StudioWorker.name, StudioWorker.surname, Movie.title, Movie.idMovie from StudioWorker
        Join MovieWorker on MovieWorker.IdWorker = StudioWorker.IdWorker
        Join Movie on MovieWorker.idMovie = Movie.IdMovie
        Where (Movie.IdMovie = ${req.query.idMovie}) and (Movie.state != 0) and (StudioWorker.roleId = 3)`];
   
        let tables = bd.request(state);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId, req.query.sort];

        tables.then(table => {

            res.render(__dirname + '/pages/AdminViews/MovieAdmin/MovieWorker', {
                table: table,
                session: session,
                idMovie: req.query.idMovie 
            })
        })
    })
}
})



app.get('/WorkerToMovie', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`(Select idWorker, name, surname from StudioWorker where state = 1 and roleId = 3) except (Select StudioWorker.IdWorker, StudioWorker.name, StudioWorker.surname from StudioWorker
                    Join MovieWorker on MovieWorker.IdWorker = StudioWorker.IdWorker
                    Join Movie on MovieWorker.idMovie = Movie.IdMovie
                    Where (Movie.IdMovie = ${req.query.idMovie}) and (Movie.state != 0))`];
                    state = bd.request(state);
                    state.then((table)=>{
                        res.render(__dirname +'/pages/AdminViews/MovieAdmin/WorkerToMovie', {
                            table: table,
                            session: session,
                            idMovie: req.query.idMovie
                        })
                    })
                }

        })
    }
})




app.post('/WorkerToMovie', (req, res) => {
    console.log(req.body)
    if (req.body == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {               
        let check = bd.checkConnection(req.body.login, req.body.password, req.body.roleId);
        let session = [req.body.login, req.body.password, req.body.state, req.body.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let array;
                    if  (typeof req.body.idWorker == "string") {
                        console.log('Происходит ту')
                        array = new Array(req.body.idWorker);
                    } else {
                        console.log('Происходит тут + прОВЕРКА')
                        array = req.body.idWorker;
                        console.log(req.body)
                    }

                    array.forEach( idWork => {
                        state = [`exec AddWorkerInMovie ${req.body.idMovie}, ${idWork}`];

                        let tables = bd.request(state);
    
                    })
                   
                    
                    res.redirect(`http://localhost:3001/MovieWorkers?login=${req.body.login}&password=${req.body.password}&state=${req.body.status}&roleId=${req.body.roleId}&idMovie=${req.body.idMovie}`)
                  
                    
                
                }

        })
    }
})


app.get('/DirectorToMovie', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`(Select idWorker, name, surname from StudioWorker where state = 1 and roleId = 2) except (Select StudioWorker.IdWorker, StudioWorker.name, StudioWorker.surname from StudioWorker
                    Join MovieWorker on MovieWorker.IdWorker = StudioWorker.IdWorker
                    Join Movie on MovieWorker.idMovie = Movie.IdMovie
                    Where (Movie.IdMovie = ${req.query.idMovie}) and (Movie.state != 0))`];
                    state = bd.request(state);
                    state.then((table)=>{
                        res.render(__dirname +'/pages/AdminViews/MovieAdmin/DirectorToMovie', {
                            table: table,
                            session: session,
                            idMovie: req.query.idMovie
                        })
                    })
                }

        })
    }
})


app.post('/DirectorToMovie', (req, res) => {
    console.log(req.body)
    if (req.body == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {               
        let check = bd.checkConnection(req.body.login, req.body.password, req.body.roleId);
        let session = [req.body.login, req.body.password, req.body.state, req.body.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                   
                
            
                        state = [`exec AddWorkerInMovie ${req.body.idMovie}, ${req.body.idWorker}`];

                        let tables = bd.request(state);
    
                   
                    
                    res.redirect(`http://localhost:3001/MovieAbout?login=${req.body.login}&password=${req.body.password}&state=${req.body.status}&roleId=${req.body.roleId}&idMovie=${req.body.idMovie}`)
                  
                    
                
                }

        })
    }
})

app.get('/DeleteDirectorFromMovie', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    } else {
        console.log(req.query)
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];


        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    console.log(req.query)
                    let state = [`exec DeleteWorkerFromMovie ${req.query.idMovie}, ${req.query.idWorker}`];
                    state = bd.request(state);
                    let page = `/MovieAbout?login=${session[0]}&password=${session[1]}&state=${session[2]}&roleId=${session[3]}&idMovie=${req.query.idMovie}`


                    res.redirect(`${page}`)
                }

        })
    }

})


app.get('/DeleteWorkerFromMovie', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1') && (req.query.roleId !=  '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    } else {
        console.log(req.query)
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];


        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    console.log(req.query)
                    let state = [`exec DeleteWorkerFromMovie ${req.query.idMovie}, ${req.query.idWorker}`];
                    state = bd.request(state);
                    let page = `/MovieWorkers?login=${session[0]}&password=${session[1]}&state=${session[2]}&roleId=${session[3]}&idMovie=${req.query.idMovie}`


                    res.redirect(`${page}`)
                }

        })
    }

})



app.get('/Deactivate', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`Update StudioWorker set state = 0 where idWorker = ${req.query.idWorker}`]
                    state = bd.request(state);

                    state.then( ()=>{
                        res.redirect(`http://localhost:3001/WorkersAdmin?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    
                       })
                }

        })
    }
})


app.get('/Activate', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`Update StudioWorker set state = 1 where idWorker = ${req.query.idWorker}`]
                    state = bd.request(state);

                   state.then( ()=>{
                    res.redirect(`http://localhost:3001/WorkersAdmin?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);

                   })
                    
            
                }

        })
    }
})


app.get('/WorkersProfile', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    console.log(req.query)
                    let state = [`Select idWorker, name, surname, patronymic, FORMAT(birthdate, 'dd.MM.yyyy') AS 'birthdate', phone, email, login, roleId from StudioWorker where idWorker = '${req.query.idWorker}'`];
                    state = bd.request(state);

                    state.then(table => {
                        console.log(table)
                        res.render(__dirname + '/pages/AdminViews/WorkersAdmin/WorkersProfile.ejs', {
                            table: table,
                            session: session
                        })
                    })
                }

        })
    }
})

app.get('/WorkersEdit', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    console.log(req.query)
                    let state = [`Select idWorker, name, surname, patronymic, FORMAT(birthdate, 'dd.MM.yyyy') AS 'birthdate', phone, email, login, roleId from StudioWorker where idWorker = '${req.query.idWorker}'`];
                    state = bd.request(state);

                    state.then(table => {
                        console.log(table)
                        res.render(__dirname + '/pages/AdminViews/WorkersAdmin/WorkersEdit.ejs', {
                            table: table,
                            session: session
                        })
                    })
                }

        })
    }
})

app.post('/WorkersEdit', (req, res) => {
    if (req.body == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {               
        let check = bd.checkConnection(req.body.login, req.body.password, req.body.roleId);
        let session = [req.body.login, req.body.password, req.body.state, req.body.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {

                    console.log(req.body)
                    state = [`Update StudioWorker set name = '${req.body.name}', surname= '${req.body.surname}', patronymic = '${req.body.patronymic}', phone = '${req.body.phone}',  birthdate = '${req.body.birthdate}', email = '${req.body.email}', roleId =${req.body.ROLEID} where idWorker = ${req.body.idWorker}`];
                    console.log(state)
                    let tables = bd.request(state);

                    tables.then(() => {
                        res.redirect(`http://localhost:3001/WorkersAdmin?login=${req.body.login}&password=${req.body.password}&state=${req.body.state}&roleId=${req.body.roleId}`)
                    })
                    
                
                }

        })
    }
})


// Просмотр всех сценариев (Для админа и режиссёра)

app.get('/ScenarioAdmin', (req,res) => {

    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1' && '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                state = ['SELECT idScenario, title, author from Scenario'];


                let tables = bd.request(state);


                tables.then(table => {
                    console.log(table)
                    res.render(__dirname + '/pages/AdminViews/ScenarioAdmin/ScenarioAdmin.ejs', {
                        table: table,
                        session: session
                    })
                })
            }

        })
    }
})


app.get('/ScenarioAbout', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    let state = [`Select idScenario, title, author, text from Scenario where idScenario = ${req.query.idScenario} `];
                    state = bd.request(state);

                    state.then(table => {
                        res.render(__dirname + '/pages/AdminViews/ScenarioAdmin/ScenarioAbout.ejs', {
                            session: session,
                            table: table
                            
                        })
                    })
                }

        })
    }
})



// Добавить сценарий

app.get('/ScenarioAdd', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
        let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
        let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
        check.then(answer => {
            if (answer == false) {res.redirect('http://localhost:3001/log')}
                else {
                    res.render(__dirname + '/pages/ScenarioPages/ScenarioAdmin/ScenarioAdd.ejs', {
                        session: session
                    })
                }

        })
    }

})

app.post('/ScenarioAdd', (req,res) => {
    console.log(req.body); 
    let state = [` exec addScenario '${req.body.author}','${req.body.title}', '${req.body.text}'`]
    bd.request(state)
    

    res.redirect(`${req.body.page}`);
})










// Запросы

app.get('/RequestsAdmin', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1' && '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                state = [`	Select Request.IdMovie, Request.IdWorker ,Request.IdRequest,  Movie.title, StudioWorker.name, FORMAT(Request.date, 'dd.MM.yyyy') AS 'date', Request.status from Movie
                Join Request on Request.idMovie = Movie.IdMovie
                Join StudioWorker  on StudioWorker.IdWorker = Request.IdWorker Order by status ASC`];


                let tables = bd.request(state);


                tables.then(table => {
                    res.render(__dirname + '/pages/AdminViews/Request/RequestAdmin.ejs', {
                        table: table,
                        session: session
                    })
                })
            }

        })
    }
})


app.get('/AcceptRequest', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                console.log(req.query)

                let state = [`exec CommitRequest ${req.query.idRequest}, ${req.query.idMovie}, ${req.query.idWorker}`];

                state = bd.request(state);

                let page = `/RequestsAdmin?login=${session[0]}&password=${session[1]}&state=${session[2]}&roleId=${session[3]}`

                state.then(table => {
                    res.redirect(page);
                })
            }

        })
    }
})

app.get('/DeclineRequest', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                console.log(req.query)

                let state = [`Update Request set status = 0 where idRequest = ${req.query.idRequest}`];

                state = bd.request(state);

                let page = `/RequestsAdmin?login=${session[0]}&password=${session[1]}&state=${session[2]}&roleId=${session[3]}`

                state.then(table => {
                    res.redirect(page);
                })
            }

        })
    }
})






// Архив 

app.get('/ArchiveAdmin', (req,res) => {
    if (req.query == undefined) {
        res.redirect('http://localhost:3001/log')
    } else if ((req.query.roleId !=  '1' && '2' )) {
        res.redirect(`http://localhost:3001/Profile?login=${req.query.login}&password=${req.query.password}&state=${req.query.state}&roleId=${req.query.roleId}`);
    }  else {
    let check = bd.checkConnection(req.query.login, req.query.password, req.query.roleId);
    let session = [req.query.login, req.query.password, req.query.state, req.query.roleId];
    check.then(answer => {
        if (answer == false) {res.redirect('http://localhost:3001/log')}
            else {
                state = [`SELECT idMovie, title, length, genre, FORMAT(date, 'dd.MM.yyyy') AS 'release' FROM Movie where state = 0`];


                state = bd.request(state);

                
                state.then(table => {
                    console.log(table)
                    res.render(__dirname + '/pages/AdminViews/Archive/ArchiveAdmin.ejs', {
                        table: table,
                        session: session
                    })
                })
            }

        })
    }
})



// РЕЖИССЁР





// АКТЁР






app.listen (PORT, () => console.log(`server runnning on http://localhost:${PORT}/`))