const mysql = require('mysql2');


//Database connection details

const connection = mysql.createConnection({
	host: process.env.DB_HOST || 'localhost',
	port: Number(process.env.DB_PORT || 3306),
	user: process.env.DB_USER || 'sosmUser',
	password: process.env.DB_PASS || 'dnRk384!djrLdo}836w:',
	database: process.env.DB_NAME || 'db_sosm',
	multipleStatements: true
})

module.exports = connection;


// Database test


/*
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'sosmUser',
  password : 'dnRk384!djrLdo}836w:',
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
