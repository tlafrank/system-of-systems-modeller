const { format } = require('./db');
const sql = require('./db');

let debugLevel = 7;

//Debug function local to the methods in this file
function debug(level, msg){
	if (debugLevel >= level){
        console.log(msg);
    }
}

exports.switch = (req,res) => {
	debug(1, `graph.js debug level: ${debugLevel} req.body.type: ${req.body.type}`);
	debug(1, req.body)

	var includedTags = []
	var excludedTags = [];
	if (!(typeof req.body.includedFilterTag === 'undefined')) {includedTags = req.body.includedFilterTag }
	if (!(typeof req.body.excludedFilterTag === 'undefined')) {excludedTags = req.body.excludedFilterTag }

    var queryString = sql.format(`
	SET @inputYear = ?;
	SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

	DROP TABLE IF EXISTS systemsResult, SIResult, SINResult;
	
	CREATE TEMPORARY TABLE systemsResult AS
		(SELECT DISTINCT a.id_system, name, image, a.quantity
		FROM (SELECT * FROM quantities WHERE year <= @inputYear) AS a
		LEFT JOIN (SELECT * FROM quantities WHERE year <= @inputYear) AS b
		ON a.id_system = b.id_system AND a.year < b.year
		LEFT JOIN systems
		ON a.id_system = systems.id_system `,req.body.year);



	//Handle included and excluded tags
	switch (2 * (includedTags.length>0) + 1 * (excludedTags.length>0)){
		case 3:
			//Both included and excluded tags have been provided
			queryString += sql.format(`
			LEFT JOIN tags
			ON tags.id_system = a.id_system
			WHERE b.year IS NULL AND a.quantity > 0 AND tags.tag IN (?) AND a.id_system NOT IN (SELECT DISTINCT id_system FROM tags WHERE tag IN (?))`, [includedTags, excludedTags]);
			break;
		case 2:
			//Only included tags have been provided
			queryString += sql.format(`
			LEFT JOIN tags
			ON tags.id_system = a.id_system
			WHERE b.year IS NULL AND a.quantity > 0 AND tags.tag IN (?)`, [includedTags]);
			break;
		case 1:
			//Only excluded tags have been provided
			queryString += sql.format(`
			WHERE b.year IS NULL AND a.quantity > 0 AND a.id_system NOT IN (SELECT DISTINCT id_system FROM tags WHERE tag IN (?))`, [excludedTags]);
			break;
		case 0:
			//No tags have been provided
			queryString += sql.format(`
			WHERE b.id_system IS NULL AND a.quantity != 0`)
		default:
	}

	queryString += sql.format(`
	);
	SELECT * FROM systemsResult;
	
	#Get each system's interface
	CREATE TEMPORARY TABLE SIResult AS
		(SELECT SIMap.id_SIMap, SIMap.id_system, interfaces.*
		FROM interfaces
		LEFT JOIN SIMap
		ON interfaces.id_interface = SIMap.id_interface
		WHERE SIMap.id_system IN (SELECT id_system FROM systemsResult));
	SELECT * FROM SIResult;
	
	#Get the networks associated with each system's interfaces
	CREATE TEMPORARY TABLE SINResult AS
		(SELECT SIMap.id_system, SINMap.id_SINMap, SINMap.id_SIMap, networks.*
		FROM SIMap
		LEFT JOIN SINMap
		ON SIMap.id_SIMap = SINMap.id_SIMap
		LEFT JOIN networks
		ON networks.id_network = SINMap.id_network
		WHERE SINMap.id_SIMap IN (SELECT id_SIMap FROM SIResult));
	SELECT * FROM SINResult;
	
	#Statistics
	SELECT SIResult.id_interface, SIResult.id_system, SIResult.name AS interfaceName, systemsResult.name AS systemName, systemsResult.quantity, COUNT(id_interface) AS interfaceQtyPerIndividualSystem, (systemsResult.quantity * COUNT(id_interface)) AS interfaceTotalAcrossEachSystemInYear
	FROM SIResult
	LEFT JOIN systemsResult
	ON systemsResult.id_system = SIResult.id_system
	GROUP BY id_interface, SIResult.id_system
	ORDER BY id_interface;

	#Networks and the quantity of their connections
	(SELECT SINResult.id_network, networks.*, COUNT(SINResult.id_network) AS qtyConnections
	FROM SINResult
	LEFT JOIN networks
	ON SINResult.id_network = networks.id_network
	GROUP BY SINResult.id_network);

	`);

	executeQuery(queryString).then((result) => { 
		//res.json(result);
		res.json([result[4], result[6], result[8], result[9], result[10]]) 
	}).catch((err) => {
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
	queryString = queryString.trim();
	let re = /\n\s\s+/gi;
	queryString = queryString.replace(re,'\n\t')
	debug(7, 'Query:  ' + queryString);
	sql.query(queryString, (err,res) => {
		if (err) { 
			reject(err);
		}
		resolve(res);
	})    
}) 
