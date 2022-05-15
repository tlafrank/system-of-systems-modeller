const { format } = require('./db');
const sql = require('./db');


let debugLevel = 3;

//Debug function local to the methods in this file
function debug(level, msg){
	if (debugLevel >= level){
		console.log(msg);
	}
}

exports.switch = (req,res) => {
	debug(1, `chart.js debug level: ${debugLevel} req.body.type: ${req.body.type}`);

	var queryString;

	if (req.body.type == 'InterfaceQuantitiesInYear'){
		//Build the query
		queryString = sql.format(`
		SET @year = ?;
		SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

		DROP TABLE IF EXISTS systemsResult, SIResult, SINResult;

		#Get the systems present in the provided year
		CREATE TEMPORARY TABLE systemsResult AS
			SELECT DISTINCT a.id_system, name, image, a.quantity 
			FROM (SELECT * FROM quantities WHERE year <= @year) AS a
			LEFT JOIN (SELECT * FROM quantities WHERE year <= @year) AS b
			ON a.id_system = b.id_system AND a.year < b.year
			LEFT JOIN systems
			ON a.id_system = systems.id_system`, [req.body.year])


			includedTags = JSON.parse(req.body.includedFilterTag);
			excludedTags = JSON.parse(req.body.excludedFilterTag);		
		
			//Handle included and excluded tags
			switch (2 * (includedTags.length>0) + 1 * (excludedTags.length>0)){
				case 3:
					//Both included and excluded tags have been provided
					queryString += sql.format(`
					LEFT JOIN tags
					ON tags.id_system = a.id_system
					WHERE b.year IS NULL AND a.quantity > 0 AND tags.tag IN (?) AND a.id_system NOT IN (SELECT DISTINCT id_system FROM tags WHERE tag IN (?));`, [includedTags, excludedTags]);
					break;
				case 2:
					//Only included tags have been provided
					queryString += sql.format(`
					LEFT JOIN tags
					ON tags.id_system = a.id_system
					WHERE b.year IS NULL AND a.quantity > 0 AND tags.tag IN (?);`, [includedTags]);
					break;
				case 1:
					//Only excluded tags have been provided
					queryString += sql.format(`
					WHERE b.year IS NULL AND a.quantity > 0 AND a.id_system NOT IN (SELECT DISTINCT id_system FROM tags WHERE tag IN (?));`, [excludedTags]);
					break;
				case 0:
					//No tags have been provided
					queryString += sql.format(`
					WHERE b.id_system IS NULL AND a.quantity != 0;`)
				default:
			}

		queryString += sql.format(`
		SELECT systemsResult.quantity, interfaces.name, interfaces.id_interface, SUM(systemsResult.quantity) AS interfaceQty
		FROM systemsResult
		LEFT JOIN SIMap
		ON systemsResult.id_system = SIMap.id_system
		LEFT JOIN interfaces
		ON SIMap.id_interface = interfaces.id_interface
		WHERE SIMap.id_SIMap IS NOT NULL
		GROUP BY id_interface
		ORDER BY interfaces.id_interface;`)












	}

	if (!queryString){ res.json({msg: 'There was an error executing the query (select.json)', err: 'No queryString was developed.'}) }

	queryString = queryString.trim();
	let re = /\n\s\s+/gi;
	queryString = queryString.replace(re,'\n\t')

	debug(2,'Query:  ' + queryString);
	execute;

	var execute = executeQuery(queryString)

		.then((result) => {
			switch (req.body.type){
				case 'InterfaceQuantitiesInYear':
					res.json(result[4])
				break;
				default:
					res.json(result) 
			}

			
		})
		.catch((err) => {
			debug(3,err);
			if (debugLevel == 7){
				res.json({msg: 'There was an error executing the query (select.json)', err: err})
			} else {
				res.json({msg: 'There was an error executing the query (select.json)'})
			}
		});
}


var executeQuery = (queryString) => new Promise((resolve,reject) => {
	//Submit the query to the database
	sql.query(queryString, (err,res) => {
		if (err) { 
			reject(err);
		}
		resolve(res);
	})    
}) 
