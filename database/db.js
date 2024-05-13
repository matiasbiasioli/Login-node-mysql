const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

connection.connect((error)=>{
    if (error){
        console.log('hay un error de coneccion' + error);
        
    } else {
        console.log('connection succes to localhost:3000');
    }
})

module.exports = connection;