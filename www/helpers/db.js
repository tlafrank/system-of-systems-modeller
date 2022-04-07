const mysql = require('mysql2');


//Database connection details
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'sosmUser',
	password: 'dnek384!djrbdod836wj',
	database: 'db_sosm',
	multipleStatements: true
})

module.exports = connection;

/*
Database test

var mysql      = require('mysql2');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'sosmUser',
  password : 'dnek384!djrbdod836wj',
  database : 'db_sosm'
});
 
connection.connect();
 
connection.query('SELECT 1 + 1 AS solution;', function (error, results, fields) {
  if (error) {
	  throw error;
	} else {

	console.log('The solution is: ', results[0].solution);
	};
});
 
connection.end();
*/