//Invocar a Express
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto 'http://localhost:${port}/login'`);
});

//Seteamos urlencoded para capturar datos de form
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' })

//Invocamos a bcrypt para el hash de contraseñas encriptadas
const bcryptjs = require('bcryptjs');

//Setear archivos estaticos de directorio public segun express y node para poder ver tanto los estilos css como las imagenes 
app.use('/', express.static('public'));
app.use('/', express.static(__dirname + '/public'));

//ESTABLECEMOS MOTOR DE PLANTILLA EJS
app.set('view engine', 'ejs');

//variables de Session
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//Invocamos al modulo de coneccion
const connection = require('./database/db')

//RUTAS DEL NAVEGADOR
// app.get('/', (req, res) => {
//     res.render('index', { msg: 'VARIABLE DESDE NODE' });
// })
app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/register', (req, res) => {
    res.render('register');
})
//Captura de datos del formulario de registro
app.post('/register', async (req, res) => {
    const username = req.body.username;
    const name = req.body.name;
    const password = req.body.password;
    let passwordHaash = await bcryptjs.hash(password, 8);
    connection.query('INSERT INTO users set ?', { username: username, name: name, password: passwordHaash }, async (error, results) => {
        if (error) {
            console.log('hubo un error' + error);
        } else {
            res.render('register', {
                alert: true,
                title: "Bien hecho",
                text: "Datos ingresados",
                icon: "success",
                showConfirmButton: true,
                timer: 1500,
                ruta: '/'
            })
        }
    })
})
//Autenthication
app.post('/auth', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let passwordHaash = await bcryptjs.hash(password, 8);
    if (username && password) {
        connection.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
            const passwordMatch = await bcryptjs.compare(password, results[0].password);
            if (results.length == 0 || !passwordMatch) {
                res.render('login', {
                    alert: true,
                    title: "Error en el ingreso",
                    text: "usuario y/o password incorrectos",
                    icon: "error",
                    showConfirmButton: true,
                    timer: 2500,
                    ruta: '/login'
                });
                // res.send('usario y/o password incorrectos');
            } else {
                req.session.loggedin = true
                req.session.username = results[0].username;
                res.render('login', {
                    alert: true,
                    title: "Ingreso exitoso",
                    text: "Te has logeado correctamente",
                    icon: "success",
                    showConfirmButton: true,
                    timer: 1000,
                    ruta: '/'
                })
            }
        })
    } else {
        res.render('login', {
            alert: true,
            title: "Advertencia",
            text: "Ingrese usuario y password",
            icon: "warning",
            showConfirmButton: true,
            timer: 1500,
            ruta: '/login'
        })
    }
})

// Auth Pages
app.get('/', (req, res)=>{
    if(req.session.loggedin){
        res.render('index', {
            login: true,
            name: req.session.username
        })
    } else {
        res.render('index', {
            login: false,
            name: 'You have to login'
        })
    }
})
//Logout 
app.get('/logout', (req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    })
})

//ESCUCHANDO PUERTO
// app.listen(3000, (req, res) => {
//     console.log('connection Succes at http://localhost:3000/login');
// })


