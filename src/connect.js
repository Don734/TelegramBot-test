const mysql = require('mysql2');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'tgbot_db',
    password: 'root'
})

conn.connect(err => {
    if (err) {
        console.log('Ошибка: ' + err.message);
    } else {
        console.log('Вы подключены к базе!');
    }
})

module.exports = conn;