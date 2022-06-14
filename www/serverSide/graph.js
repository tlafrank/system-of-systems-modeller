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

	var queryString = '';

	var includedTags = []
	var excludedTags = [];

	if (!(typeof req.body.includedFilterTag === 'undefined')) {includedTags = req.body.includedFilterTag }
	if (!(typeof req.body.excludedFilterTag === 'undefined')) {excludedTags = req.body.excludedFilterTag }


	switch (req.body.type){
		case 'Systems_WithOrganisation':
			var arrString = req.body.id_organisation_arr.toString()
			queryString += sql.format(`
			SELECT systems.id_system, systems.name AS systemName, systems.image, systems.category, OSMap.quantity, OSMap.id_OSMap, organisation.id_organisation, organisation.name AS orgName
			FROM OSMap
			LEFT JOIN systems
			ON OSMap.id_system = systems.id_system
			LEFT JOIN organisation
			ON organisation.id_organisation = OSMap.id_organisation
			WHERE OSMap.id_organisation IN (${arrString});`)

			//Handle included and excluded tags
			/*
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
			*/

			break;
		case 'Systems':
			queryString += sql.format(`SET @inputYear = ?;`, req.body.year)
			queryString += sql.format(`
				SELECT a.id_system, name, image, a.quantity, category
				FROM (SELECT * FROM quantities WHERE year <= @inputYear) AS a
				LEFT JOIN (SELECT * FROM quantities WHERE year <= @inputYear) AS b
				ON a.id_system = b.id_system AND a.year < b.year
				LEFT JOIN systems
				ON a.id_system = systems.id_system `);

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

			break;
		case 'Compound':
			queryString += sql.format(`
			SET @depthCount = 10;
			WITH RECURSIVE cte AS
				(SELECT DISTINCT a.id_SMap, a.parent, a.child, 0 AS depth FROM systems
				LEFT JOIN SMap AS a
				ON systems.id_system = a.parent
				WHERE systems.id_system NOT IN (SELECT child FROM SMap)
				UNION ALL
				SELECT b.id_SMap, b.parent, b.child, cte.depth + 1 FROM cte, SMap AS b WHERE b.parent = cte.child AND (depth IS NULL OR depth < @depthCount))
			SELECT * FROM systems 
			LEFT JOIN cte 
			ON systems.id_system = cte.child;`)

			break;
		case 'Normal':
			queryString += sql.format(`
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
				(SELECT SIMap.id_system, SINMap.id_SINMap, SINMap.id_SIMap, SINMap.category AS linkCategory, networks.*, technologies.category AS technologyCategory
					FROM SIMap
					LEFT JOIN SINMap
					ON SIMap.id_SIMap = SINMap.id_SIMap
					LEFT JOIN networks
					ON networks.id_network = SINMap.id_network
					LEFT JOIN technologies
					ON technologies.id_technology = networks.id_technology
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
			GROUP BY SINResult.id_network);`);

			break;
		case 'Interfaces':
			var arrString = req.body.id_system_arr.toString()
			queryString += sql.format(`SELECT * FROM SIMap LEFT JOIN interfaces ON SIMap.id_interface = interfaces.id_interface WHERE SIMap.id_system IN (${arrString}) ORDER BY interfaces.id_interface;`)

			break;
		case 'Links':
			var arrString = req.body.id_SIMap_arr.toString()
			queryString += sql.format(`
				SELECT networks.*, SINMap.id_SINMap, SINMap.id_SIMap, SINMap.category AS linkCategory, technologies.category as technologyCategory, SIMap.id_system
				FROM SINMap
				LEFT JOIN SIMap 
				ON SIMap.id_SIMap = SINMap.id_SIMap 
				LEFT JOIN networks 
				ON networks.id_network = SINMap.id_network
				LEFT JOIN technologies
				ON technologies.id_technology = networks.id_technology
				WHERE SIMap.id_SIMap IN (${arrString}) AND SINMap.category != 'incapable';`)
			break;
		case 'ChildrenSystems':
			var arrString = req.body.id_system_arr.toString()

			queryString += sql.format(`SELECT * FROM SMap LEFT JOIN systems ON systems.id_system = SMap.child WHERE SMap.parent IN (${arrString});`)

			/*
			Doesn't get all results for some reason
			queryString += sql.format(`
				WITH RECURSIVE cte AS
					(SELECT a.id_SMap, a.parent, a.child, 1 as depth FROM SMap AS a WHERE a.parent IN (${arrString})
					UNION ALL
					SELECT b.id_SMap, b.parent, b.child, cte.depth + 1 FROM cte, SMap AS b WHERE b.parent = cte.child AND cte.depth < 10
					LIMIT 20)
				SELECT * FROM cte LEFT JOIN systems ON cte.child = systems.id_system;`)
			*/
			break;
		case 'ChildrenSystems_WithOrganisation':
			var arrString_sys = req.body.id_system_arr.toString()
			var arrString_org = req.body.id_organisation_arr.toString()

			queryString += sql.format(`
				SELECT SMap.id_SMap, OSMap.id_OSMap, OSMap.id_organisation, SMap.parent, systems.id_system, systems.name, systems.image, systems.category
				FROM OSMap
				LEFT JOIN SMap
				ON SMap.parent = OSMap.id_system
				LEFT JOIN systems
				ON systems.id_system = SMap.child
				WHERE OSMap.id_system IN (${arrString_sys}) AND OSMap.id_organisation IN (${arrString_org});`)

			break;
		case 'AllDistributedSubsystems':
			queryString += sql.format(`SELECT DISTINCT systems.* FROM SMap LEFT JOIN systems ON systems.id_system = SMap.child WHERE systems.distributedSubsystem = true;`)
			break;
		case 'ParentsOfChildren':
			var arrString = req.body.id_children_arr.toString()
			queryString += sql.format(`SELECT * 
			FROM SMap 
			LEFT JOIN systems 
			ON systems.id_system = SMap.parent
			WHERE SMap.child IN (${arrString});`)
			break;
		case 'ParentsOfChildren2':
			
			queryString += sql.format(`
				WITH RECURSIVE cte (parent, child, depth) AS
				(
					SELECT a.parent, a.child, 0 FROM SMap AS a LEFT JOIN systems ON systems.id_system = a.child WHERE isSubsystem = TRUE
					UNION ALL
					SELECT cte.child, b.child, depth + 1 FROM cte LEFT JOIN SMap AS b ON b.parent = cte.child WHERE b.child IS NOT NULL
					LIMIT 100
				)
				SELECT cte.parent, a.name AS parentName, a.image AS parentImage, cte.child, b.name AS childName, b.image AS childImage, cte.depth
				FROM cte
				LEFT JOIN systems AS a
				ON a.id_system = cte.parent
				LEFT JOIN systems AS b
				ON b.id_system = cte.child
				WHERE b.distributedSubsystem IS TRUE AND `)

				if(req.body.deepSubsystems) {
					queryString += sql.format(`depth > 0;`)
				} else {
					queryString += sql.format(`depth = 0;`)
				}

			break;
		case 'InterfaceQuantitiesInYear':
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
			break;
		case 'Issues':
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
			ORDER BY t2.id_interface, t2.id_interfaceIssue, systemName;`)

			break;
		case 'QuantityOfInterfacesPerSystem':
			queryString += sql.format(`
			SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
			SET @inputYear = ?;
			SELECT interfaces.id_interface, a.id_system, systems.name AS systemName, systems.image AS systemImage, a.quantity AS qtySystems,  interfaces.name AS interfaceName, COUNT(SIMap.id_SIMap) AS qtyEachSystem
			FROM (SELECT * FROM quantities WHERE year <= @inputYear) AS a
			LEFT JOIN (SELECT * FROM quantities WHERE year <= @inputYear) AS b
			ON a.id_system = b.id_system AND a.year < b.year
			LEFT JOIN systems
			ON a.id_system = systems.id_system
			LEFT JOIN SIMap
			ON systems.id_system = SIMap.id_system
			LEFT JOIN interfaces
			ON interfaces.id_interface = SIMap.id_interface
			WHERE b.id_system IS NULL AND a.quantity != 0 AND systems.id_system IN (${req.body.id_system_arr}) AND interfaces.id_interface IS NOT NULL
			GROUP BY interfaces.id_interface, systems.id_system
			ORDER BY interfaces.id_interface, systemName;`, req.body.year)

		break;
		case 'GetAllOrganisationalNodesBelow': //Returns the id_organisations of the seed node (id_organisation) and all nodes below.
			queryString += sql.format(`
			WITH RECURSIVE cte (orgNode) AS
			(
				SELECT CAST(? AS SIGNED) AS test
				UNION ALL
				SELECT OMap.child FROM cte LEFT JOIN OMap on OMap.parent = cte.orgNode WHERE OMap.child IS NOT NULL
				LIMIT 500
			)
			SELECT organisation.*, OMap.parent FROM cte LEFT JOIN organisation ON cte.orgNode = organisation.id_organisation LEFT JOIN OMap ON OMap.child = organisation.id_organisation;`, [req.body.id_organisation])
			break;
	}





	executeQuery(queryString).then((result) => { 
		//res.json(result);
		switch (req.body.type){
			case 'Compound':
			case 'Systems':	
				res.json(result[1]);
			break;
			case 'QuantityOfInterfacesPerSystem':
				res.json(result[2])
				break;
			case 'Issues':
				res.json(result[6]);
			case 'InterfaceQuantitiesInYear':
				res.json(result[4]);
				break;
			case 'Normal':
				res.json([result[4], result[6], result[8], result[9], result[10]]) 
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


/*
Backup before organisation integration

		case 'Systems':
			queryString += sql.format(`SET @inputYear = ?;`, req.body.year)
			queryString += sql.format(`
				SELECT a.id_system, name, image, a.quantity
				FROM (SELECT * FROM quantities WHERE year <= @inputYear) AS a
				LEFT JOIN (SELECT * FROM quantities WHERE year <= @inputYear) AS b
				ON a.id_system = b.id_system AND a.year < b.year
				LEFT JOIN systems
				ON a.id_system = systems.id_system `);

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

			break;
*/