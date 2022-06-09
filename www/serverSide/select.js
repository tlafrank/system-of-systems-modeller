const { format } = require('./db');
const sql = require('./db');
const path = require('path');
const fs = require('fs');


let debugLevel = 3;

//Debug function local to the methods in this file
function debug(level, msg){
	if (debugLevel >= level){
		console.log(msg);
	}
}

exports.switch = (req,res) => {
	debug(1, `select.js debug level: ${debugLevel} req.body.type: ${req.body.type}`);
	debug(1, req.body)

	var queryString = '';
	var includedTags = []
	var excludedTags = [];
	if (!(typeof req.body.includedFilterTag === 'undefined')) {includedTags = req.body.includedFilterTag }
	if (!(typeof req.body.excludedFilterTag === 'undefined')) {excludedTags = req.body.excludedFilterTag }


	switch (req.body.type){
		case 'SystemsAssignedToOrgDetail':
			queryString += sql.format('SELECT * FROM OSMap WHERE id_OSMap = ?;', req.body.id_OSMap)
			break;
		case 'PrimarySystems': //Those systems which are not children of other systems
			queryString += sql.format(`
			SELECT *
			FROM systems
			LEFT JOIN SMap
			ON SMap.child = systems.id_system
			WHERE SMap.child IS NULL ORDER BY name;`)
			break;
		case 'System':
		case 'SingleSystem':
			queryString += sql.format(`SELECT * FROM systems WHERE id_system = ?;`,[req.body.id_system])
			break;
		case 'SingleSystem_WithTags':
			queryString += sql.format(`SELECT * FROM systems WHERE id_system = ?;`,[req.body.id_system])
			queryString += sql.format(`SELECT * FROM tags WHERE id_system = ?;`,[req.body.id_system])
			break;		
		case 'AllSystems':
			queryString = sql.format(`SELECT * FROM systems ORDER BY name;`)
			break;
		case 'SystemChildren':
			queryString += sql.format('SELECT * FROM SMap LEFT JOIN systems ON SMap.parent = systems.id_system WHERE systems.id_system = ?;', req.body.id_system)
			break;
		case 'images':
			const directoryPath = path.join(__dirname, '../images/');
			debug(1, 'Image folder path is: ' + directoryPath);
		
			fs.readdir(directoryPath, (err,files) => {
				if (err) { 
					return;
				}
				debug(1, 'Files in directory:');
				debug(1, files);
		
				//Respond to client
				res.json(files);
			});			
			break;
		case 'AllInterfaces': //Get all interfaces, or a specific one
			queryString += sql.format(`SELECT * FROM interfaces ORDER BY name;`);
			break;
		case 'SingleInterface':
			queryString += sql.format(`SELECT * FROM interfaces WHERE id_interface = ?`,[req.body.id_interface])
			break;
		case 'SystemInterfaces'://Get the list of all interfaces attached to a supplied id_system
			queryString += sql.format(`
				SELECT SIMap.id_SIMap AS id_SIMap, SIMap.id_interface, interfaces.name, interfaces.image, SIMap.name AS SIName, SIMap.description
				FROM SIMap
				LEFT JOIN interfaces
				ON SIMap.id_interface = interfaces.id_interface
				WHERE SIMap.id_system = ?;`,[req.body.id_system])
			break;
		case 'SpecificSystemInterface'://Get the list of all interfaces attached to a supplied id_system
			queryString += sql.format(`SELECT * FROM SIMap WHERE SIMap.id_SIMap = ?;`,[req.body.id_SIMap])
			break;
		case 'AllTechnologies': //Get all technologies in alphabertical order
			queryString += sql.format(`SELECT * FROM technologies ORDER BY name;`)
			break;
		case 'SingleTechnology':
			queryString += sql.format(`SELECT * FROM technologies WHERE id_technology = ?;`, req.body.id_technology)
			break;
		case 'AssignedTechnologies'://Get all technologies implemented by a given interface
			queryString += sql.format(`SELECT * 
			FROM technologies
			LEFT JOIN TIMap
			ON TIMap.id_technology = technologies.id_technology
			WHERE TIMap.id_interface = ?
			ORDER BY name;`, req.body.id_interface)
			break;
		case 'QtyYears':
			queryString += sql.format(`SELECT *
				FROM quantities
				WHERE quantities.id_system = ?
				ORDER BY quantities.year;`, [req.body.id_system])
			break;
		case 'AllLinks':
			queryString += sql.format(`SELECT networks.*, technologies.name AS technologyName FROM networks LEFT JOIN technologies ON networks.id_technology = technologies.id_technology ORDER BY networks.name;`)
		break;
		case 'Link':
			queryString += sql.format('SELECT networks.*, technologies.name AS technologyName FROM networks LEFT JOIN technologies ON networks.id_technology = technologies.id_technology WHERE networks.id_network = ?',[req.body.id_network])
			break;
		case 'SpecificSystemInterfaceAndLinks':
			queryString += sql.format(`SELECT * FROM SIMap WHERE SIMap.id_SIMap = ?;`,[req.body.id_SIMap])
			queryString += sql.format(`
			SELECT *
			FROM networks
			WHERE id_technology IN	
				(SELECT id_technology
				FROM SIMap
				LEFT JOIN interfaces
				ON SIMap.id_interface = interfaces.id_interface
				LEFT JOIN TIMap
				ON interfaces.id_interface = TIMap.id_interface
				WHERE id_SIMap = ?);`, req.body.id_SIMap)
	
			queryString += sql.format(`SELECT SINMap.*, networks.name FROM SINMap LEFT JOIN networks ON SINMap.id_network = networks.id_network WHERE SINMap.id_SIMap = ? AND (category='primary' OR category IS NULL);`, [req.body.id_SIMap])
			queryString += sql.format(`SELECT SINMap.*, networks.name FROM SINMap LEFT JOIN networks ON SINMap.id_network = networks.id_network WHERE SINMap.id_SIMap = ? AND category='alternate';`, [req.body.id_SIMap])
			queryString += sql.format(`SELECT SINMap.*, networks.name FROM SINMap LEFT JOIN networks ON SINMap.id_network = networks.id_network WHERE SINMap.id_SIMap = ? AND category='incapable';`, [req.body.id_SIMap])

			break;
		case 'AllInterfaceIssues':
			queryString += sql.format(`
				SELECT interfaceIssues.*
				FROM interfaceIssues
				LEFT JOIN interfaces
				ON interfaceIssues.id_interface = interfaces.id_interface
				WHERE interfaces.id_interface = ?;`, req.body.id_interface);



		/*
			queryString = sql.format(`SET @id_interface = ?;`, req.body.id_interface)
	

				queryString += sql.format(`SELECT @id_interfaceIssue:= MIN(id_interfaceIssue) AS id_interfaceIssue FROM interfaceIssues WHERE  id_interface = @id_interface;`)
			} else {
				queryString += sql.format(`SELECT @id_interfaceIssue:= ? AS id_interfaceIssue;`, req.body.id_interfaceIssue)
			}
				queryString += sql.format(`
				SELECT interfaceIssues.*, interfaceIssues.name
				FROM interfaceIssues
				LEFT JOIN interfaces
				ON interfaceIssues.id_interface = interfaces.id_interface
				WHERE interfaces.id_interface = @id_interface;
				SELECT id_system, id_interfaceIssue
				FROM issuesToSystemsMap
				WHERE id_interfaceIssue = @id_interfaceIssue;`);

		
		
			
		*/

			break;
		case 'SpecificInterfaceIssue':
			queryString += sql.format(`SET @id_interfaceIssue = ?;`, req.body.id_interfaceIssue)
			queryString += sql.format(`
				SELECT interfaceIssues.*
				FROM interfaceIssues
				LEFT JOIN interfaces
				ON interfaceIssues.id_interface = interfaces.id_interface
				WHERE interfaceIssues.id_interfaceIssue = @id_interfaceIssue;
				SELECT * 
				FROM issuesToSystemsMap
				WHERE issuesToSystemsMap.id_interfaceIssue = @id_interfaceIssue`);
			

			break;
		case '':

			break;
		case '':

			break;
	}


	//Get the mapping of subsystems to systems
	if (req.body.type == 'SubsystemMap'){
		queryString = sql.format(`SELECT * FROM SSMap WHERE id_system = ?;`, req.body.id_system)
	}

	//Get all data exchanges
	if (req.body.type == 'DataExchange'){
		queryString = sql.format(`SELECT * FROM dataExchanges ORDER BY name;`)
	}

	//Get all unique tags
	if (req.body.type == 'TagList'){
		//Build the query
		queryString = sql.format(`SELECT tag FROM tags GROUP BY tag ORDER BY tag;`)
	}	

	//******************************** System ****************************************


	//Get a specific system without tags																							//Copy of 'System'
	if (req.body.type == 'SystemNoTags'){
		debug(1, '************************************************* Select.json SystemNoTags was called and is redundant.')
		//Build the query
		if (req.body.id_system){ //id_system has been provided
			//Get system details
			queryString = sql.format(`SELECT * FROM systems WHERE id_system = ?;`,[req.body.id_system])
		} else { //No id_system provided
			queryString = sql.format(`SELECT * FROM systems ORDER BY name;`)
		}
	}



	//Get a list of systems which implement a particular interface
	//For: updateIssuesModal()
	if (req.body.type == 'SystemsWithSpecificInterface'){
		queryString = sql.format(`
		SELECT systems.id_system, systems.name
		FROM systems
		LEFT JOIN SIMap
		ON systems.id_system = SIMap.id_system
		LEFT JOIN interfaces
		ON SIMap.id_interface = interfaces.id_interface
		WHERE interfaces.id_interface = ?
		GROUP BY id_system;`, req.body.id_interface)
	}

	//******************************** Technologies ****************************************






	
	if (req.body.type == 'CompatibleFeatures'){																	//CFD
		//Build the query
		queryString = sql.format(`SELECT interfaces.features AS features
		FROM SIMap
		LEFT JOIN interfaces
		ON SIMap.id_interface = interfaces.id_interface
		WHERE id_SIMap = ?;`, [req.body.id_SIMap])
	}

	//******************************** Interfaces ****************************************





	//
	if (req.body.type == 'SystemInterface'){ 
		//Build the query
		debug(1, '************************************************* Select.json SystemInterface was called. Value to be determined.')
		queryString = sql.format(`
			SELECT systems.id_system, systems.name AS systemName, systems.image AS systemImage, SIMap.id_SIMap, SIMap.isProposed, SIMap.description,
				interfaces.id_interface, interfaces.name AS interfaceName, interfaces.image AS interfaceImage 
			FROM systems
			INNER JOIN SIMap ON systems.id_system = SIMap.id_system
			INNER JOIN interfaces ON SIMap.id_interface = interfaces.id_interface
			WHERE SIMap.id_SIMap = ?;`,[req.body.id_SIMap])

	}



	//******************************** Network ****************************************



	//Returns the list of networks which are matched to the technologies implemented by a given system interface (id_SIMap)


	//Returns networks which are already assigned to the System Interface
	if (req.body.type == 'AssignedNetworks'){
		//Build the query
		queryString = sql.format(`
			SELECT * FROM SINMap
			LEFT JOIN networks
			ON SINMap.id_network = networks.id_network
			WHERE SINMap.id_SIMap = ?;`,[req.body.id_SIMap])
	}

	if (req.body.type == 'Networks'){
		//Build the query
		queryString = sql.format(`SELECT * FROM networks;`)
	}

	//******************************** Issues ****************************************



	if (req.body.type == 'BasicIssues'){
		//Build the query
		switch (req.body.subtype){
			case 'SystemInterface':
				queryString = sql.format(`SELECT * FROM issues WHERE type = 'SystemInterface' AND id_type = ?;`, [req.body.id_SIMap])
			break;
			case 'Interface':
				queryString = sql.format(`SELECT * FROM issues WHERE type = 'Interface' AND id_type = ?;`, [req.body.id_interface])
			break;
			case 'Feature':
				queryString = sql.format(`SELECT * FROM issues WHERE type = 'Feature' AND id_type = ?;`, [req.body.id_feature])
			break;
			case 'Network':
				queryString = sql.format(`SELECT * FROM issues WHERE type = 'Network' AND id_type = ?;`, [req.body.id_network])
			break;
		}

		//Need to handle all issues
	}

	if (req.body.type == 'IssueImages'){
		//Build the query
		switch (req.body.subtype){
			case 'SystemInterface':
				queryString = sql.format(`SELECT interfaces.image AS interfaceImage, interfaces.name AS interfaceName, systems.name AS systemName, systems.image AS systemImage, systems.id_system
				FROM SIMap
				LEFT JOIN systems
				ON SIMap.id_system = systems.id_system
				LEFT JOIN interfaces
				ON SIMap.id_interface = interfaces.id_interface
				WHERE id_SIMap = ?;`, [req.body.id_SIMap])
			break;
			case 'Interface':
				queryString = sql.format(`SELECT * FROM issues WHERE type = 'Interface' AND id_type = ?;`, [req.body.id_interface])
			break;
			case 'Feature':
				queryString = sql.format(`SELECT * FROM issues WHERE type = 'Feature' AND id_type = ?;`, [req.body.id_feature])
			break;
			case 'Network':
				queryString = sql.format(`SELECT * FROM issues WHERE type = 'Network' AND id_type = ?;`, [req.body.id_network])
			break;
		}
	}

	if (req.body.type == 'Issues'){
		//Build the query
		queryString = sql.format(`
		SET @inputYear = ?;
		SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

		DROP TABLE IF EXISTS systemsResult, t2, t3;

		#Get the systems present in the provided year
		CREATE TEMPORARY TABLE systemsResult AS
			SELECT DISTINCT a.id_system, name, image, a.quantity 
			FROM (SELECT * FROM quantities WHERE year <= @inputYear) AS a
			LEFT JOIN (SELECT * FROM quantities WHERE year <= @inputYear) AS b
			ON a.id_system = b.id_system AND a.year < b.year
			LEFT JOIN systems
			ON a.id_system = systems.id_system`, req.body.year);

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
		#Get the issues mapped against their impacted systems
		CREATE TEMPORARY TABLE t2 AS
			(SELECT interfaces.id_interface, interfaces.name AS interfaceName, interfaceIssues.id_interfaceIssue, interfaceIssues.name AS issueName, interfaceIssues.issue, interfaceIssues.resolution, interfaceIssues.severity,
				issuesToSystemsMap.id_system
			FROM interfaces
			LEFT JOIN interfaceIssues
			ON interfaces.id_interface = interfaceIssues.id_interface
			LEFT JOIN issuesToSystemsMap
			ON interfaceIssues.id_interfaceIssue = issuesToSystemsMap.id_interfaceIssue);

		#Get the interfaces which are represented in the systems available in this particular year
		CREATE TEMPORARY TABLE t3 AS
			(SELECT DISTINCT SIMap.id_interface
			FROM systemsResult
			LEFT JOIN SIMap
			ON systemsResult.id_system = SIMap.id_system);

		SELECT DISTINCT t2.id_interface, t2.interfaceName, t2.id_interfaceIssue, t2.issueName, t2.issue, t2.resolution, t2.severity, systemsResult.id_system, systemsResult.name as systemName, systemsResult.quantity
		FROM t3
		LEFT JOIN t2
		ON t3.id_interface = t2.id_interface
		LEFT JOIN systemsResult
		ON t2.id_system = systemsResult.id_system
		WHERE t2.id_interface IS NOT NULL
		ORDER BY t2.id_interface, t2.id_interfaceIssue;`)

		
		
	}

	//******************Other**************** */

	if (req.body.type == 'Party'){
		//Build the query
		queryString = sql.format(`SELECT * FROM parties`)
		//if (req.body.id_type) { queryString += sql.format(` WHERE type = '${req.body.subType}' AND id_type = ?`, [req.body.id_type])}
		queryString += ';';
	}

	if (req.body.type == 'SIImages'){
		//Build the query
		queryString = sql.format(`SELECT interfaces.image AS interfaceImage, interfaces.name AS interfaceName, systems.name AS systemName, systems.image AS systemImage, systems.id_system
		FROM SIMap
		LEFT JOIN systems
		ON SIMap.id_system = systems.id_system
		LEFT JOIN interfaces
		ON SIMap.id_interface = interfaces.id_interface
		WHERE id_SIMap = ?;`, [req.body.id_SIMap])

	}



	if (req.body.type == 'Organisation'){
		//Build the query

		if (typeof req.body.id_organisation === 'undefined'){
			queryString = sql.format(`SET @org = 1;`)
		} else {
			queryString = sql.format(`SET @org = ?;`, [req.body.id_organisation])
		}	

		queryString += sql.format(`
		#Nodes above
		WITH RECURSIVE cte AS
			(SELECT a.parent, a.child FROM OMap AS a WHERE a.child = @org
			UNION ALL
			SELECT b.parent, b.child FROM cte, OMap AS b WHERE cte.parent = b.child)
		SELECT organisation.* FROM cte LEFT JOIN organisation ON organisation.id_organisation = cte.parent;
			
		#This node
		SELECT * FROM organisation WHERE organisation.id_organisation = @org;

		#Nodes below
		WITH RECURSIVE cte AS
			(SELECT a.id_OMap, a.parent, a.child, 1 as depth FROM OMap AS a WHERE a.parent = @org
			UNION ALL
			SELECT b.id_OMap, b.parent, b.child, cte.depth + 1 FROM cte, OMap AS b WHERE b.parent = cte.child AND cte.depth < 1)
		SELECT organisation.* FROM cte LEFT JOIN organisation ON cte.child = organisation.id_organisation ORDER BY organisation.name;`)

	}

	if (req.body.type == 'SystemsAssignedToOrg'){
		//Build the query
		queryString = sql.format(`
		SELECT * FROM OSMap
		LEFT JOIN systems
		ON systems.id_system = OSMap.id_system
		WHERE OSMap.id_organisation = ?;`, [req.body.id_organisation])
	}


	if (queryString == ''){ 
		//res.json({msg: 'There was an error executing the query (select.json)', err: 'No queryString was developed.'}) 
	} else {
		queryString = queryString.trim();
		let re = /\n\s\s+/gi;
		queryString = queryString.replace(re,'\n\t')

		debug(2,'Query:  ' + queryString);
		execute;

		var execute = executeQuery(queryString)

		.then((result) => {
			switch (req.body.type){
				case 'SystemsAssignedToOrgDetail':
				case 'SpecificSystemInterface':
				case 'SingleInterface':
				case 'SingleSystem':
				case 'Link':
				case 'SingleTechnology':
				case 'System':
				case 'SystemInterface':
					res.json(result[0])
					break;
				case 'SpecificInterfaceIssue':
					res.json([result[1], result[2]]);
					break;
				case 'SingleSystem_WithTags':
					res.json([result[0][0], result[1]])
					break;
				case 'SpecificSystemInterfaceAndLinks':
					res.json([result[0][0], result[1], result[2], result[3], result[4]])
					break;
				case 'InterfaceQuantitiesInYear':
					res.json(result[4])
				break;
				case 'Organisation':
					//res.json(result)
					res.json([result[1],result[2],result[3]])
				break;
				case 'Issues':
					res.json(result[6])
				break;
				default:
					res.json(result) 
			}

				
		}).catch((err) => {
			debug(3,err);
			if (debugLevel == 7){
				res.json({msg: 'There was an error executing the query (select.json)', err: err})
			} else {
				res.json({msg: 'There was an error executing the query (select.json)'})
			}
		});
	}
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
