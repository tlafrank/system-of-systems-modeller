const { format, query } = require('./db');
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
		case 'Systems_WithOrganisation': //Gets all the systems which are assigned to the organisational nodes provided in id_organisation_arr
			var arrString = req.body.id_organisation_arr.toString()
			queryString += sql.format(`
				SELECT systems.id_system, systems.name AS systemName, systems.image, systems.category, OSMap.quantity, OSMap.id_OSMap, organisation.id_organisation, organisation.name AS orgName
				FROM OSMap
				LEFT JOIN systems
				ON OSMap.id_system = systems.id_system
				LEFT JOIN organisation
				ON organisation.id_organisation = OSMap.id_organisation
				WHERE OSMap.id_organisation IN (${arrString});`)
			break;
		case 'Systems': //Gets the details of the specific system if id_system was provided. Otherwise, gets the list of systems which exist in the provided year, and which considers the included and excluded tags
			if(req.body.id_system){
				queryString += sql.format(`SELECT 1;`)
				queryString += sql.format(`SELECT * FROM systems WHERE id_system = ?;`, req.body.id_system)
			} else {
				queryString += sql.format(`SET @inputYear = ?;`, req.body.year)
				queryString += sql.format(`
					SELECT a.id_system, name, image, a.quantity, category, version
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
			}
			break;
		case 'Interfaces': //Gets all system interfaces associated with the the systems provided in id_system_arr
			queryString += sql.format(`
				SELECT * 
				FROM InterfaceToSystemMap 
				LEFT JOIN interfaces 
				ON InterfaceToSystemMap.id_interface = interfaces.id_interface 
				WHERE InterfaceToSystemMap.id_system IN (?) 
				ORDER BY interfaces.id_interface;`,[req.body.id_system_arr])

			break;
		case 'Links': //Gets all links associated with the system interfaces provided in id_ISMap_arr
			queryString += sql.format(`
				SELECT links.*, SystemInterfaceToLinkMap.id_SILMap, SystemInterfaceToLinkMap.id_ISMap, SystemInterfaceToLinkMap.isPrimary, technologyCategories.name as technologyCategoryName, technologyCategories.color as technologyCategoryColor, InterfaceToSystemMap.id_system
				FROM SystemInterfaceToLinkMap
				LEFT JOIN InterfaceToSystemMap 
				ON InterfaceToSystemMap.id_ISMap = SystemInterfaceToLinkMap.id_ISMap 
				LEFT JOIN links 
				ON links.id_link = SystemInterfaceToLinkMap.id_link
				LEFT JOIN technologies
				ON technologies.id_technology = links.id_technology
				LEFT JOIN technologyCategories
				ON technologies.id_techCategory = technologyCategories.id_techCategory
				WHERE InterfaceToSystemMap.id_ISMap IN (?)`,[req.body.id_ISMap_arr])
			break;
		case 'Subsystems': // Returns the system provided at id_system_arr and their children, by depth
			
			//Might break things, as this returns the system (add a 'WHERE cte.depth > 0' to the last statement)
			queryString += sql.format(`WITH RECURSIVE cte (id_SMap, depth, topSystem, immediateParent, id_system) AS
				(
					SELECT 0, 0, systems.id_system, 0, systems.id_system FROM systems WHERE systems.id_system IN (?)
					UNION ALL
					SELECT SMap.id_SMap, cte.depth + 1, cte.topSystem, SMap.parent, SMap.child FROM cte LEFT JOIN SMap ON cte.id_system = SMap.parent
					WHERE SMap.parent IS NOT NULL
				)
				SELECT cte.id_SMap, cte.depth, cte.topSystem, cte.immediateParent, systems.* FROM cte LEFT JOIN systems ON cte.id_system = systems.id_system`,[req.body.id_system_arr])
			if(req.body.startDepth){
				queryString += sql.format(` WHERE depth >= ?;`,[req.body.startDepth])
			} else {
				queryString += `;`
			}

			//Immediate children only
			// queryString += sql.format(`
			// 	SELECT * 
			// 	FROM SMap 
			// 	LEFT JOIN systems 
			// 	ON systems.id_system = SMap.child 
			// 	WHERE SMap.parent IN (${arrString});`)

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
		case 'ChildrenSystems_WithOrganisation': //Gets the immediate children
		//Needs to be recursive to get subsystems to a particular depth?
			queryString += sql.format(`
				SELECT SMap.id_SMap, OSMap.id_OSMap, OSMap.id_organisation, SMap.parent, systems.id_system, systems.name, systems.image, systems.category
				FROM OSMap
				LEFT JOIN SMap
				ON SMap.parent = OSMap.id_system
				LEFT JOIN systems
				ON systems.id_system = SMap.child
				WHERE OSMap.id_system IN (?) AND OSMap.id_organisation IN (?);`,[req.body.id_system_arr,req.body.id_organisation_arr])

			break;
		case 'AllDistributedSubsystems': //Gets all unique distributed subsystems
			queryString += sql.format(`SELECT * FROM systems WHERE systems.distributedSubsystem = TRUE;`);
			break;
		case 'InterfaceQuantitiesInYear': //Get all interfaces (and their quantities) which are present in systems for a given year
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
				LEFT JOIN InterfaceToSystemMap
				ON systemsResult.id_system = InterfaceToSystemMap.id_system
				LEFT JOIN interfaces
				ON InterfaceToSystemMap.id_interface = interfaces.id_interface
				WHERE InterfaceToSystemMap.id_ISMap IS NOT NULL
				GROUP BY id_interface
				ORDER BY interfaces.id_interface;`)
			break;
		case 'Issues': //Get all issues associated with the interfaces for a given year
			queryString = sql.format(`
			SET @inputYear = ?;
			SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

			DROP TABLE IF EXISTS systemsResult, t2, t3;

			#Get the systems present in the provided year
			CREATE TEMPORARY TABLE systemsResult AS
				SELECT DISTINCT a.id_system, name, image, a.quantity, version 
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
				(SELECT DISTINCT InterfaceToSystemMap.id_interface
				FROM systemsResult
				LEFT JOIN InterfaceToSystemMap
				ON systemsResult.id_system = InterfaceToSystemMap.id_system);

			SELECT DISTINCT t2.id_interface, t2.interfaceName, t2.id_interfaceIssue, t2.issueName, t2.issue, t2.resolution, t2.severity, systemsResult.id_system, systemsResult.name as systemName, systemsResult.version as systemVersion, systemsResult.quantity
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
				SELECT interfaces.id_interface, a.id_system, systems.name AS systemName, systems.image AS systemImage, version AS systemVersion,  a.quantity AS qtySystems,  interfaces.name AS interfaceName, COUNT(InterfaceToSystemMap.id_ISMap) AS qtyEachSystem
				FROM (SELECT * FROM quantities WHERE year <= @inputYear) AS a
				LEFT JOIN (SELECT * FROM quantities WHERE year <= @inputYear) AS b
				ON a.id_system = b.id_system AND a.year < b.year
				LEFT JOIN systems
				ON a.id_system = systems.id_system
				LEFT JOIN InterfaceToSystemMap
				ON systems.id_system = InterfaceToSystemMap.id_system
				LEFT JOIN interfaces
				ON interfaces.id_interface = InterfaceToSystemMap.id_interface
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
		case 'SystemToSubsystems': //Gets the links between systems and their subsystems, for the systems provided at id_system_arr
			queryString += sql.format(`
				SELECT *
				FROM SMap
				LEFT JOIN systems AS a
				ON SMap.child = a.id_system
				WHERE SMap.parent IN (?) AND a.distributedSubsystem = TRUE;`,[req.body.id_system_arr])
			break;
		case 'DistributedSubsystemAssociations': //Get the associations between subsystems
			queryString += sql.format(`
				SELECT SMap.* 
				FROM systems AS a
				LEFT JOIN SMap
				ON SMap.parent = a.id_system
				LEFT JOIN systems AS b
				ON SMap.child = b.id_system
				WHERE a.distributedSubsystem = TRUE AND b.distributedSubsystem = TRUE;
				`)

			break;
		case 'LinksForAssociatedSystems': //Draw links between systems which do not have a distributed subsystem attached

		queryString += sql.format(`
			SELECT systems_a.id_system AS source, systems_a.name, systems_b.id_system AS destination, systems_b.name, links.id_link, links.name, technologyCategories.name AS technologyCategory, links.category AS linkCategory
			FROM systems AS systems_a
			LEFT JOIN InterfaceToSystemMap AS InterfaceToSystemMap_a ON systems_a.id_system = InterfaceToSystemMap_a.id_system
			LEFT JOIN SystemInterfaceToLinkMap AS SystemInterfaceToLinkMap_a ON SystemInterfaceToLinkMap_a.id_ISMap = InterfaceToSystemMap_a.id_ISMap
			LEFT JOIN SystemInterfaceToLinkMap AS SystemInterfaceToLinkMap_b ON SystemInterfaceToLinkMap_b.id_link = SystemInterfaceToLinkMap_a.id_link
			LEFT JOIN links ON SystemInterfaceToLinkMap_a.id_link = links.id_link
			LEFT JOIN technologies ON links.id_technology = technologies.id_technology
			LEFT JOIN technologyCategories ON technologies.id_techCategory = technologyCategories.id_techCategory
			LEFT JOIN InterfaceToSystemMap AS InterfaceToSystemMap_b ON SystemInterfaceToLinkMap_b.id_ISMap = InterfaceToSystemMap_b.id_ISMap
			LEFT JOIN systems AS systems_b ON systems_b.id_system = InterfaceToSystemMap_b.id_system
			WHERE systems_a.id_system IN (?) AND systems_a.id_system != systems_b.id_system;`,[req.body['id_system_arr!']])




		//The following works, but AMap wasn't well implemented
		/*
			queryString += sql.format(`
				SELECT AMap.id_AMap, AMap.source, c.name , AMap.destination, d.name, links.id_link, links.name, technologies.category AS technologyCategory, SystemInterfaceToLinkMap.category AS linkCategory
				FROM AMap
				LEFT JOIN InterfaceToSystemMap ON InterfaceToSystemMap.id_system = AMap.source
				LEFT JOIN SystemInterfaceToLinkMap ON SystemInterfaceToLinkMap.id_ISMap = InterfaceToSystemMap.id_ISMap
				LEFT JOIN links ON links.id_link = SystemInterfaceToLinkMap.id_link
				LEFT JOIN technologies ON technologies.id_technology = links.id_technology
				LEFT JOIN SystemInterfaceToLinkMap AS a ON a.id_link = links.id_link
				LEFT JOIN InterfaceToSystemMap AS b ON b.id_ISMap = a.id_ISMap
				LEFT JOIN systems AS c ON c.id_system = AMap.source
				LEFT JOIN systems AS d ON d.id_system = AMap.destination
				WHERE
					AMap.source IN (?)
					AND b.id_system = AMap.destination
				;
				`,[req.body['id_system_arr!']])


					*/
			break;
		case 'AllSystems': //Regardless of years
			queryString += sql.format(`
				SELECT * FROM systems WHERE systems.isSubsystem = FALSE;`)


			break;
	}

	// sql.execute('SELECT * FROM systems;')
	// 	.then((result) => {
	// 		debug(1,'** Promise resolved', result)
	// 	})


	//executeQuery(queryString).then((result) => { 
	debug(7, 'Query:  ' + queryString);
	sql.execute(queryString)
		.then((result) => {
			//res.json(result);
			switch (req.body.type){
				case 'Compound':
				case 'Systems':	
					res.json(result[1]);
				break;
				case 'QuantityOfInterfacesPerSystem':
					res.json(result[2])
					break;
				case 'InterfaceQuantitiesInYear':
					res.json(result[4]);
					break;	
				case 'Issues':
					res.json(result[6]);
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