const mysql = require('mysql');


//Database connection details
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'sosmUser',
	password: 'dnek384!djrbdod836wj',
	database: 'db_sosm',
	multipleStatements: true
})

module.exports = connection;
