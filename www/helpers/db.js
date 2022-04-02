const mysql = require('mysql');


//Database connection details
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'username',
	password: 'password',
	database: 'db_sosm',
	multipleStatements: true
})

module.exports = connection;
