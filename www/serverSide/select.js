const { format } = require('./db');
const sql = require('./db');
const path = require('path');
const fs = require('fs');


let debugLevel = 8;

//Debug function local to the methods in this file
function debug(level, msg){
	if (debugLevel >= level){
		console.log(msg);
	}
}

exports.switch = (req,res) => {
	debug(1, `select.js debug level: ${debugLevel} req.body.type: ${req.body.type}`);
	debug(5, req.body)

	var queryString = '';
	var includedTags = []
	var excludedTags = [];
	if (!(typeof req.body.includedFilterTag === 'undefined')) {includedTags = req.body.includedFilterTag }
	if (!(typeof req.body.excludedFilterTag === 'undefined')) {excludedTags = req.body.excludedFilterTag }

/*

SELECT *
FROM paramDefinitions
WHERE applicableToSystem IS TRUE
ORDER BY id_paramGroup;
*/


	switch (req.body.type){
		case 'ParamsForSystem':
			queryString += sql.format(`
			SELECT paramGroups.name AS groupName, paramDefinitions.name AS paramName, paramDefinitions.*, params2.value, params2.id_param, params2.id_system
			FROM paramDefinitions
			LEFT JOIN paramGroups
			ON paramGroups.id_paramGroup = paramDefinitions.id_paramGroup
			LEFT JOIN (SELECT * FROM params WHERE params.id_system = ?) AS params2
			ON  params2.id_paramDefinition = paramDefinitions.id_paramDefinition
			WHERE applicableToSystem IS TRUE 
			ORDER BY groupName, paramName;`, [req.body.id_system])
			break;
		case 'SystemsAssignedToOrgDetail': //TBC
			debug(1, 'In SystemsAssignedToOrgDetail. Not sure if this is valuable') 
			queryString += sql.format('SELECT * FROM OSMap WHERE id_OSMap = ?;', req.body.id_OSMap)
			break;
		case 'SingleCim':
			queryString += sql.format('SELECT * FROM cimMap WHERE cimMap.id_system = ?;', req.body.id_system)
			break;
		case 'AllParamGroups':
			queryString += sql.format('SELECT * FROM paramGroups;')
			break;
		case 'ParamDefinitionsWithinGroup':
			queryString += sql.format('SELECT * FROM paramDefinitions WHERE id_paramGroup = ?;', req.body.id_paramGroup)
			break;
		case 'SingleParamDefinition':
			queryString += sql.format('SELECT * FROM paramDefinitions WHERE id_paramDefinition = ?;', req.body.id_paramDefinition)
			break;
			
		case 'AllTechCategories':
			queryString += sql.format('SELECT * FROM technologyCategories;')
			break;
		case 'SingleTechCategory':
			queryString += sql.format('SELECT * FROM technologyCategories WHERE id_techCategory = ?;', req.body.id_techCategory)
			break;
		case 'AllPocs':
			queryString += sql.format('SELECT * FROM poc;')
			break;
		case 'SinglePoc':
			queryString += sql.format('SELECT * FROM poc WHERE id_poc = ?;', req.body.id_poc)
			break;
		case 'AllParties':
			queryString += sql.format('SELECT * FROM parties;')
			break;
		case 'SingleParty':
			queryString += sql.format('SELECT * FROM parties WHERE id_party = ?;', req.body.id_party)
			break;
		case 'AllFamilies':
			queryString += sql.format('SELECT * FROM families;')
			break;
		case 'SingleFamily':
			queryString += sql.format('SELECT * FROM families WHERE id_family = ?;', req.body.id_family)
			break;
		case 'PrimarySystems': //Those systems which are not children of other systems
			debug(1, 'PrimarySystems is depricated')
		case 'AllSystems': //Get all systems (which are not subsystems), ordered by name			
			queryString += sql.format(`
				SELECT * 
				FROM systems 
				WHERE systems.isSubsystem = false 
				ORDER BY name, version;`);
			break;
		case 'System':
			debug(1, `Req.body.type of type 'System' called. Update to 'SingleSystem'`)
		case 'SingleSystem': //Get the details associated with a specific system (without tags)
			queryString += sql.format(`
				SELECT * 
				FROM systems 
				WHERE id_system = ?;`,[req.body.id_system])
			break;
		case 'SingleSystem_WithTags': //Get the details associated with a specific system (with tags, in order)
			queryString += sql.format(`SELECT * FROM systems WHERE id_system = ?;`,[req.body.id_system])
			queryString += sql.format(`SELECT * FROM tags WHERE id_system = ? ORDER BY tag;`,[req.body.id_system])
			break;		
		case 'AllSubsystems': //Get all subsystems (unique). No concept of depth.
			queryString += sql.format(`
				SELECT * 
				FROM systems 
				WHERE systems.isSubsystem = true 
				ORDER BY name;`)
			break;
		case 'SystemChildren': //Get immediate children of a specific system.
			queryString += sql.format(`
				SELECT * 
				FROM SMap 
				LEFT JOIN systems 
				ON SMap.parent = systems.id_system 
				WHERE systems.id_system = ?;`, req.body.id_system)
			break;
		case 'AllSystemChildren': //Get all children of a specific system (includes depth, root of depth = 0 at provided id_system, root not returned)
			queryString += sql.format(`
				WITH RECURSIVE cte (depth, topSystem, id_system) AS
				(
					SELECT 0, systems.id_system, systems.id_system FROM systems WHERE systems.id_system = ?
					UNION ALL
					SELECT cte.depth + 1, cte.topSystem, SMap.child FROM cte LEFT JOIN SMap ON cte.id_system = SMap.parent
					WHERE SMap.parent IS NOT NULL
				)
				SELECT cte.depth, cte.topSystem, systems.* FROM cte LEFT JOIN systems ON cte.id_system = systems.id_system WHERE depth > 0;`, req.body.id_system)
			break;
		case 'images': //Get the list of images located in the image folder
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
		case 'SingleInterface': //Get the details of a specific interface
			queryString += sql.format(`
				SELECT * 
				FROM interfaces 
				WHERE id_interface = ?`,[req.body.id_interface])
			break;
		case 'SystemInterfaces'://Get the list of all interfaces attached to a supplied id_system
			queryString += sql.format(`
				SELECT InterfaceToSystemMap.id_ISMap AS id_ISMap, InterfaceToSystemMap.id_interface, interfaces.name, interfaces.image, InterfaceToSystemMap.name AS SIName, InterfaceToSystemMap.description, InterfaceToSystemMap.isProposed
				FROM InterfaceToSystemMap
				LEFT JOIN interfaces
				ON InterfaceToSystemMap.id_interface = interfaces.id_interface
				WHERE InterfaceToSystemMap.id_system = ?;`,[req.body.id_system])
			break;
		case 'SpecificSystemInterface'://Get the list of all interfaces attached to a supplied id_system
			queryString += sql.format(`SELECT * FROM InterfaceToSystemMap WHERE InterfaceToSystemMap.id_ISMap = ?;`,[req.body.id_ISMap])
			break;
		case 'AllTechnologies': //Get all technologies in alphabertical order
			queryString += sql.format(`SELECT * FROM technologies ORDER BY name;`)
			queryString += sql.format(`SELECT * FROM technologyCategories ORDER BY name;`)
			break;
		case 'SingleTechnology': //Get all record details for a given technology
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
		case 'QtyYears': //Return all qty per year mappings for a given system
			queryString += sql.format(`SELECT *
				FROM quantities
				WHERE quantities.id_system = ?
				ORDER BY quantities.year;`, [req.body.id_system])
			break;
		case 'AllLinks': //Get all existing links and their associated technology, ordered by name
			queryString += sql.format(`SELECT links.*, technologies.name AS technologyName 
				FROM links 
				LEFT JOIN technologies 
				ON links.id_technology = technologies.id_technology 
				ORDER BY links.name;`)
		break;
		case 'Link': //Get the details for a provided link
			queryString += sql.format(`
				SELECT links.*, technologies.name AS technologyName 
				FROM links 
				LEFT JOIN technologies 
				ON links.id_technology = technologies.id_technology 
				WHERE links.id_link = ?`,[req.body.id_link])
			break;
		case 'SpecificSystemInterfaceAndLinks': //Multiple purposes: 
		//(1) Get all details associated with a specific system interface. 
		//(2) Get all links which are compatible with the given system interface.
		//(3) Get all links which are allocated to the system interface as a primary link
		//(3) Get all links which are allocated to the system interface as an alternate link
		//(4) Get all links which are allocated to the system interface as an incapable link
			queryString += sql.format(`SELECT * FROM InterfaceToSystemMap WHERE InterfaceToSystemMap.id_ISMap = ?;`,[req.body.id_ISMap])
			queryString += sql.format(`
				SELECT *
				FROM links
				WHERE id_technology IN	
					(SELECT id_technology
					FROM InterfaceToSystemMap
					LEFT JOIN interfaces
					ON InterfaceToSystemMap.id_interface = interfaces.id_interface
					LEFT JOIN TIMap
					ON interfaces.id_interface = TIMap.id_interface
					WHERE id_ISMap = ?)
				ORDER BY name;`, req.body.id_ISMap)
	
			queryString += sql.format(`SELECT SystemInterfaceToLinkMap.*, links.name FROM SystemInterfaceToLinkMap LEFT JOIN links ON SystemInterfaceToLinkMap.id_link = links.id_link WHERE SystemInterfaceToLinkMap.id_ISMap = ? AND (SystemInterfaceToLinkMap.isPrimary = TRUE OR SystemInterfaceToLinkMap.isPrimary IS NULL);`, [req.body.id_ISMap])
			queryString += sql.format(`SELECT SystemInterfaceToLinkMap.*, links.name FROM SystemInterfaceToLinkMap LEFT JOIN links ON SystemInterfaceToLinkMap.id_link = links.id_link WHERE SystemInterfaceToLinkMap.id_ISMap = ? AND SystemInterfaceToLinkMap.isPrimary = FALSE;`, [req.body.id_ISMap])
			break;
		case 'AllInterfaceIssues': //Get all issues associated with a specific interface
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
		case 'SpecificInterfaceIssue': //Get the details associated with a specific interface issue
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
		case 'TagList': //Return the full list of tags which have been allocated to systems
			queryString = sql.format(`
				SELECT tag 
				FROM tags 
				GROUP BY tag 
				ORDER BY tag;`)
			break;
		case 'SystemsAssignedToOrg':
			queryString = sql.format(`
				SELECT * FROM OSMap
				LEFT JOIN systems
				ON systems.id_system = OSMap.id_system
				WHERE OSMap.id_organisation = ?;`, [req.body.id_organisation])
			break;
		case 'CimExport':
			
			queryString = sql.format(`
				SELECT systems.id_system, families.name AS familyName, systems.name AS systemName, systems.version, cimMap.cimName, quantities.year, quantities.quantity
				FROM systems
				LEFT JOIN families
				ON families.id_family = systems.id_family
				LEFT JOIN cimMap
				ON cimMap.id_system = systems.id_system
				LEFT JOIN quantities
				ON quantities.id_system = systems.id_system;`)
			break;
		case 'Pocs':
			queryString = sql.format(`
				SELECT systems.id_system, systems.name AS systemName, systems.version, poc.id_poc, poc.name AS pocName, poc.email
				FROM systems
				LEFT JOIN poc
				ON systems.id_poc = poc.id_poc
				WHERE systems.id_poc IS NOT NULL
				ORDER BY poc.name ASC;
				SELECT systems.id_system, systems.name AS systemName, systems.version
				FROM systems
				WHERE systems.id_poc IS NULL;`)
			break;
		case '':

		break;
		case '':

		break;
		case '':

		break;
	}



	//Get all data exchanges
	if (req.body.type == 'DataExchange'){
		queryString = sql.format(`SELECT * FROM dataExchanges ORDER BY name;`)
	}

	//Get a list of systems which implement a particular interface
	//For: updateIssuesModal()
	if (req.body.type == 'SystemsWithSpecificInterface'){
		debug(1, '************************************************* Select.json SystemsWithSpecificInterface was called. Value to be determined.')
		queryString = sql.format(`
		SELECT systems.id_system, systems.name
		FROM systems
		LEFT JOIN InterfaceToSystemMap
		ON systems.id_system = InterfaceToSystemMap.id_system
		LEFT JOIN interfaces
		ON InterfaceToSystemMap.id_interface = interfaces.id_interface
		WHERE interfaces.id_interface = ?
		GROUP BY id_system;`, req.body.id_interface)
	}

	//
	if (req.body.type == 'SystemInterface'){ 
		//Build the query
		debug(1, '************************************************* Select.json SystemInterface was called. Value to be determined.')
		queryString = sql.format(`
			SELECT systems.id_system, systems.name AS systemName, systems.image AS systemImage, InterfaceToSystemMap.id_ISMap, InterfaceToSystemMap.isProposed, InterfaceToSystemMap.description,
				interfaces.id_interface, interfaces.name AS interfaceName, interfaces.image AS interfaceImage 
			FROM systems
			INNER JOIN InterfaceToSystemMap ON systems.id_system = InterfaceToSystemMap.id_system
			INNER JOIN interfaces ON InterfaceToSystemMap.id_interface = interfaces.id_interface
			WHERE InterfaceToSystemMap.id_ISMap = ?;`,[req.body.id_ISMap])

	}


	if (req.body.type == 'Organisation'){

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

	if (queryString == ''){ 
		//res.json({msg: 'There was an error executing the query (select.json)', err: 'No queryString was developed.'}) 
	} else {

		debug(5,'Query:  ' + queryString);

		sql.execute(queryString).then((result) => {
			switch (req.body.type){						//Should be able to remove this section by looking at the returned result array length
				case 'SystemsAssignedToOrgDetail':
				case 'SpecificSystemInterface':
				case 'SingleInterface':
				case 'SingleSystem':
				case 'Link':
				case 'SingleTechnology':
				case 'System':
				case 'SystemInterface':
				case 'SingleFamily':
				case 'SingleParty':
				case 'SinglePoc':
				case 'SingleCim':
				case 'SingleTechCategory':
				case 'SingleParamDefinition':
					if (result[0] !== undefined){
						res.json(result[0])
					} else {
						res.json([])
					}
					
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
