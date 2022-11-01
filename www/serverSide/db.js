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

connection.query('select * from systems', function(error,results,fields){
	if ( error ) throw error;
	console.log("Good database connection");
});


connection.execute = (queryString) => new Promise((resolve,reject) => {
	//console.log('In db.js with querystring: ' + queryString)
	queryString = queryString.trim();
	let re = /\n\s\s+/gi;
	queryString = queryString.replace(re,'\n\t')
	connection.query(queryString, function(err,result,fields){
		
		if (err) {
			reject(err)
		}
		resolve(result)
	})
})

module.exports = connection;
