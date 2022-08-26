const mysql = require('mysql2');


//Database connection details
var connection = mysql.createConnection({
	host: 'localhost',
	user: process.env.SOSM_USER,
	password: process.env.SOSM_PASS,
	database: process.env.SOSM_DB,
	multipleStatements: true
});

connection.connect(function(error){
  if ( error )
  {
    console.log(error);
  }
});

connection.query('select * from networks', function(error,results,fields){
  if ( error ) throw error;
  console.log("good connection");
});

module.exports = connection;
