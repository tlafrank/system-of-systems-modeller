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

exports.switch = async (req,res) => {
	debug(1, `select.js debug level: ${debugLevel} req.body.type: ${req.body.type}`);
	debug(5, req.body)

	var queryString = '';
	var includedTags = []
	var excludedTags = [];

	//Tracks whether the result should assume that a result length of 1 should have the outer array stripped (to only return the single containing object)
	var stripArr = true

	//Track whether query execution is handled within the switch (for more advanced queries & processing)
	var executeQueryAtEnd = true

	if (!(typeof req.body.includedFilterTag === 'undefined')) {includedTags = req.body.includedFilterTag }
	if (!(typeof req.body.excludedFilterTag === 'undefined')) {excludedTags = req.body.excludedFilterTag }



	switch (req.body.type){
		case 'paramsSortedForSystems':
			stripArr = false
			queryString += sql.format(`
				SELECT paramGroups.id_paramGroup, paramGroups.name AS paramGroupName, paramDefinitions.id_paramDefinition, paramDefinitions.name AS paramDefinitionName, params.id_param, params.value, systems.id_system, systems.name AS systemName
				FROM paramGroups
				LEFT JOIN paramDefinitions
				ON paramGroups.id_paramGroup = paramDefinitions.id_paramDefinition
				LEFT JOIN params
				ON params.id_paramDefinition = paramDefinitions.id_paramDefinition
				LEFT JOIN systems
				ON systems.id_system = params.id_system
				WHERE params.id_system IS NOT NULL AND params.value IS NOT NULL AND params.value <> '' AND systems.isSubsystem = FALSE AND systems.id_system IN (?)
				ORDER BY paramGroups.name, paramDefinitions.name, params.value, systems.name;`, [req.body.id_system_arr])
			break;
		case 'SmartSystemWideParamQuery':
			executeQueryAtEnd = false

			//const paramNameArr = req.body.paramArr
			var paramNameArr = ['CoDE ID']
			if (req.body.paramNameArr){ paramNameArr = req.body.paramNameArr }

			var defaultValue = 'TBC'
			if (req.body.defaultValue){ defaultValue = req.body.defaultValue }

			if (!req.body.id_system_arr){ req.body.id_system_arr = [18,19,20,21] }

			var resultArr = []
			var paramResultArr = []
			var primaryInterfaceIndex = 0

			//Define the various queryStrings required
			const systemParamQueryString = `
				SELECT systems.name AS systemName, params.value, paramDefinitions.name AS paramName, systems.updateTime
				FROM systems
				LEFT JOIN params
				ON params.id_system = systems.id_system
				LEFT JOIN paramDefinitions
				ON paramDefinitions.id_paramDefinition = params.id_paramDefinition
				
				WHERE systems.id_system = ? AND paramDefinitions.name IN (?);`

			const subsystemQueryString = `
				SELECT 'subsystem' AS type, systems.id_system, systems.name, SMap.id_SMap, systems.updateTime
				FROM SMap 
				LEFT JOIN systems 
				ON SMap.child = systems.id_system 
				WHERE SMap.parent = ?;`

			const interfaceQueryString = `
				SELECT 'interface' AS type, InterfaceToSystemMap.id_ISMap AS id_ISMap, InterfaceToSystemMap.id_interface, interfaces.name, interfaces.image, InterfaceToSystemMap.name AS SIName, InterfaceToSystemMap.description, InterfaceToSystemMap.isProposed
				FROM InterfaceToSystemMap
				LEFT JOIN interfaces
				ON InterfaceToSystemMap.id_interface = interfaces.id_interface
				WHERE InterfaceToSystemMap.id_system = ?;`
		
			const interfaceParamQueryString = `
				SELECT interfaces.name AS interfaceName, params.value, paramDefinitions.name AS paramName, interfaces.updateTime
				FROM interfaces
				LEFT JOIN params
				ON params.id_interface = interfaces.id_interface
				LEFT JOIN paramDefinitions
				ON paramDefinitions.id_paramDefinition = params.id_paramDefinition
				WHERE interfaces.id_interface = ? AND paramDefinitions.name IN (?);`

			const linkQueryString = `
				SELECT 'link' AS type, links.name, links.id_link, SystemInterfaceToLinkMap.id_ISMap
				FROM SystemInterfaceToLinkMap 
				LEFT JOIN links
				ON links.id_link = SystemInterfaceToLinkMap.id_link
				WHERE id_ISMap = ?;`

			const linkParamQueryString = `
				SELECT links.name AS linkName, params.value, paramDefinitions.name AS paramName
				FROM links
				LEFT JOIN params
				ON params.id_link = links.id_link
				LEFT JOIN paramDefinitions
				ON paramDefinitions.id_paramDefinition = params.id_paramDefinition
				WHERE links.id_link = ? AND paramDefinitions.name IN (?);
			`

			//Get the systems for this result
			queryString += sql.format(`
				SELECT 'system' AS type, systems.*, families.name AS familyName 
				FROM systems 
				LEFT JOIN families
				ON families.id_family = systems.id_family
				WHERE id_system IN (?);`, [req.body.id_system_arr])

			sql.execute(queryString).then(async (result) => {
				//Iterate through each system, get the required parameters and carry out subsequent queries

				var primarySystemIndex = 0

				debug(5,'Commencing system for loop')
				for (var i = 0; i < result.length; i++){
					//Process each system row
					await getParamsForEachRow(result[i], resultArr, systemParamQueryString, [result[i].id_system, paramNameArr], paramNameArr, defaultValue)
					primarySystemIndex = resultArr.length - 1

					//Get subsystems assigned to the last system
					await sql.execute(sql.format(subsystemQueryString, [resultArr[primarySystemIndex].id_system])).then(async (result2) => {
						debug(5,'Commencing subsystem for loop for system ' + resultArr[primarySystemIndex].name)

						for (var j=0; j< result2.length; j++){
							await getParamsForEachRow(result2[j], resultArr, systemParamQueryString, [result2[j].id_system, paramNameArr], paramNameArr, defaultValue)
						}

						debug(5, 'end of subsystem for loop')
					})

					//Get interfaces assigned to the last system
					await sql.execute(sql.format(interfaceQueryString, [resultArr[primarySystemIndex].id_system])).then(async (result3) => {
						debug(5,'Commencing system interface for loop for system ' + resultArr[primarySystemIndex].name)
						for (var k = 0; k < result3.length; k++){
							//Process each interface row
							await getParamsForEachRow(result3[k], resultArr, interfaceParamQueryString, [result3[k].id_interface, paramNameArr], paramNameArr, defaultValue)
							primaryInterfaceIndex = resultArr.length - 1
							//Get links assigned to the last interface
							await sql.execute(sql.format(linkQueryString, result3[k].id_ISMap)).then(async (result4) => {
								debug(5,'Commencing fetching links associated with interface ' + resultArr[primaryInterfaceIndex].name + ' aboard system ' + resultArr[primarySystemIndex].name)
								
								for (var l = 0; l < result4.length; l++){
									debug(5, 'row link id is ' + result4[l].id_link)
									await getParamsForEachRow(result4[l], resultArr, linkParamQueryString, [result4[l].id_link, paramNameArr], paramNameArr, defaultValue)
								}
							})
						}
						debug(5, 'end of system interface for loop')
					})

					debug(5, 'restarting loop')
				}

				debug(5, 'just exited outer for loop')

			}).then(async (result) => {
				//prepare the next query to get all the system interfaces assigned to the system

				debug(1, 'returning result')
				res.json(resultArr)
			}).catch((err) => {
				debug(3,err);
				if (debugLevel == 7){
					res.json({msg: 'There was an error executing the query (select.json)', err: err})
				} else {
					res.json({msg: 'There was an error executing the query (select.json)'})
				}
			});

			break;
		case 'AllExports':
			queryString += sql.format(`SELECT exports.id_export, exports.name, exports.exportFormat FROM exports;`)
			stripArr = false
			break;
		case 'SingleExport':
			queryString += sql.format(`SELECT * FROM exports WHERE id_export = ?;`, [req.body.id_export])
			break;
		case 'SystemSubsystemsWithMathchingParam':
			queryString += sql.format(`
			SELECT systems.name AS systemName, subsystems.id_system AS id_subsystem, subsystems.name AS subsystemName, param2.value
			FROM systems
			LEFT JOIN SMap
			ON systems.id_system = SMap.parent
			LEFT JOIN systems AS subsystems
			ON subsystems.id_system = SMap.child
			LEFT JOIN (
					SELECT params.id_system, params.value
					FROM paramDefinitions
					LEFT JOIN params
					ON paramDefinitions.id_paramDefinition = params.id_paramDefinition
					WHERE paramDefinitions.name = ?
				) AS param2
			ON param2.id_system = subsystems.id_system
			WHERE systems.id_system = ? AND param2.value LIKE ?;`, [req.body.paramName, req.body.id_system, req.body.value])
			stripArr = false
			break;
		case 'Params':
			queryString += sql.format(`
				SELECT paramGroups.name AS groupName, paramDefinitions.name AS paramName, paramDefinitions.*, params2.value, params2.id_param
				FROM paramDefinitions
				LEFT JOIN paramGroups
				ON paramGroups.id_paramGroup = paramDefinitions.id_paramGroup\n`)


			switch (req.body.paramType){
				case 'system':
					queryString += sql.format(`
						LEFT JOIN (SELECT * FROM params WHERE params.id_system = ?) AS params2
						ON params2.id_paramDefinition = paramDefinitions.id_paramDefinition\n
						WHERE applicableToSystem IS TRUE\n`, [req.body.id_system])
					break;
				case 'subsystem':
					queryString += sql.format(`
						LEFT JOIN (SELECT * FROM params WHERE params.id_system = ?) AS params2
						ON params2.id_paramDefinition = paramDefinitions.id_paramDefinition\n
						WHERE applicableToSubsystem IS TRUE\n`, [req.body.id_system])
					break;
				case 'interface':
					queryString += sql.format(`
						LEFT JOIN (SELECT * FROM params WHERE params.id_interface = ?) AS params2
						ON params2.id_paramDefinition = paramDefinitions.id_paramDefinition\n
						WHERE applicableToInterface IS TRUE\n`, [req.body.id_interface])
					break;
				case 'link':
					queryString += sql.format(`
						LEFT JOIN (SELECT * FROM params WHERE params.id_link = ?) AS params2
						ON params2.id_paramDefinition = paramDefinitions.id_paramDefinition\n
						WHERE applicableToLink IS TRUE\n`, [req.body.id_link])
					break;
				case 'technology':
					queryString += sql.format(`
					LEFT JOIN (SELECT * FROM params WHERE params.id_technology = ?) AS params2
					ON params2.id_paramDefinition = paramDefinitions.id_paramDefinition\n
					WHERE applicableToTechnology IS TRUE\n`, [req.body.id_technology])
					break;

			}
			queryString += sql.format(`ORDER BY groupName, paramName;`)
			stripArr = false
			break;
		case 'SingleParamValueForSystem':
			queryString += sql.format(`
				SELECT params.value
				FROM params
				LEFT JOIN paramDefinitions
				ON paramDefinitions.id_paramDefinition = params.id_paramDefinition
				WHERE params.id_system = ? AND paramDefinitions.name = ?;
			`, [req.body.id_system, req.body.paramName])
			
			break;
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
			stripArr = false
			break;
		case 'SystemsAssignedToOrgDetail': //TBC
			debug(1, 'In SystemsAssignedToOrgDetail. Not sure if this is valuable') 
			queryString += sql.format('SELECT * FROM OSMap WHERE id_OSMap = ?;', req.body.id_OSMap)
			stripArr = false
			break;
		case 'SingleCim':
			queryString += sql.format('SELECT * FROM cimMap WHERE cimMap.id_system = ?;', req.body.id_system)
			stripArr = false
			break;
		case 'AllParamGroups':
			queryString += sql.format('SELECT * FROM paramGroups;')
			stripArr = false
			break;
		case 'SingleParamGroup':
			queryString += sql.format('SELECT * FROM paramGroups WHERE id_paramGroup = ?;', [req.body.id_paramGroup])
			break;
		case 'ParamDefinitionsWithinGroup':
			queryString += sql.format('SELECT * FROM paramDefinitions WHERE id_paramGroup = ?;', req.body.id_paramGroup)
			stripArr = false
			break;
		case 'SingleParamDefinition':
			queryString += sql.format('SELECT * FROM paramDefinitions WHERE id_paramDefinition = ?;', req.body.id_paramDefinition)
			break;
		case 'AllTechCategories':
			queryString += sql.format('SELECT * FROM technologyCategories ORDER BY name;')
			stripArr = false
			break;
		case 'SingleTechCategory':
			queryString += sql.format('SELECT * FROM technologyCategories WHERE id_techCategory = ?;', req.body.id_techCategory)
			break;
		case 'AllFamilies':
			queryString += sql.format('SELECT * FROM families;')
			stripArr = false
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
			stripArr = false
			break;
		case 'AllSystems_FromArray': //Get all systems (which are not subsystems) whose id exists in id_system_arr, ordered by name
			queryString += sql.format(`
				SELECT * 
				FROM systems 
				WHERE systems.isSubsystem = false AND systems.id_system IN (?)
				ORDER BY name, version;`, [req.body.id_system_arr]);
			stripArr = false
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
			stripArr = false
			break;
		case 'SystemChildren': //Get immediate children of a specific system.
			queryString += sql.format(`
				SELECT * 
				FROM SMap 
				LEFT JOIN systems 
				ON SMap.parent = systems.id_system 
				WHERE systems.id_system = ?;`, req.body.id_system)
				stripArr = false
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
			stripArr = false
			break;
		case 'images': //Get the list of images located in the image folder
			executeQueryAtEnd = false

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
		case 'AllInterfaces': //Get all interfaces
			queryString += sql.format(`SELECT * FROM interfaces ORDER BY name;`);
			stripArr = false
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
			stripArr = false
			break;
		case 'SpecificSystemInterface'://Get a specifies system interface
			queryString += sql.format(`SELECT * FROM InterfaceToSystemMap WHERE InterfaceToSystemMap.id_ISMap = ?;`,[req.body.id_ISMap])
			break;
		case 'AllTechnologies': //Get all technologies in alphabertical order
			queryString += sql.format(`SELECT * FROM technologies ORDER BY name;`)
			stripArr = false
			break;
		case 'SingleTechnology': //Get all record details for a given technology
			queryString += sql.format(`SELECT * FROM technologies WHERE id_technology = ?;`, req.body.id_technology)
			stripArr = true
			break;
		case 'AssignedTechnologies'://Get all technologies implemented by a given interface
			queryString += sql.format(`SELECT * 
				FROM technologies
				LEFT JOIN TIMap
				ON TIMap.id_technology = technologies.id_technology
				WHERE TIMap.id_interface = ?
				ORDER BY name;`, req.body.id_interface)
			stripArr = false
			break;
		case 'QtyYears': //Return all qty per year mappings for a given system
			queryString += sql.format(`SELECT *
				FROM quantities
				WHERE quantities.id_system = ?
				ORDER BY quantities.year;`, [req.body.id_system])
			stripArr = false
			break;
		case 'AllLinks': //Get all existing links and their associated technology, ordered by name
			queryString += sql.format(`SELECT links.*, technologies.name AS technologyName 
				FROM links 
				LEFT JOIN technologies 
				ON links.id_technology = technologies.id_technology 
				ORDER BY links.name;`)
			stripArr = false
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
		case 'LinksForSpecificSystemInterface':
			queryString += sql.format(`
				SELECT * 
				FROM SystemInterfaceToLinkMap 
				LEFT JOIN links
				ON links.id_link = SystemInterfaceToLinkMap.id_link
				WHERE id_ISMap = ?;`,[req.body.id_ISMap])

				stripArr = false
			break;
		case 'AllInterfaceIssues': //Get all issues associated with a specific interface
			queryString += sql.format(`
				SELECT interfaceIssues.*
				FROM interfaceIssues
				LEFT JOIN interfaces
				ON interfaceIssues.id_interface = interfaces.id_interface
				WHERE interfaces.id_interface = ?;`, req.body.id_interface);
			stripArr = false
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
			stripArr = false
			break;
		case 'SystemsAssignedToOrg':
			queryString = sql.format(`
				SELECT * FROM OSMap
				LEFT JOIN systems
				ON systems.id_system = OSMap.id_system
				WHERE OSMap.id_organisation = ?;`, [req.body.id_organisation])
			stripArr = false
			break;
		case '':

		break;
		case '':

		break;
		case 'Organisation':
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
		break;
		case 'SystemsWithSpecificInterface':
			//Used by interface issues
			queryString += sql.format(`
				SELECT systems.id_system, systems.name
				FROM systems
				LEFT JOIN InterfaceToSystemMap
				ON systems.id_system = InterfaceToSystemMap.id_system
				LEFT JOIN interfaces
				ON InterfaceToSystemMap.id_interface = interfaces.id_interface
				WHERE interfaces.id_interface = ?
				GROUP BY id_system;`, req.body.id_interface)
				stripArr=false
		break;
		case 'SystemInterface':
			queryString = sql.format(`
				SELECT systems.id_system, systems.name AS systemName, systems.image AS systemImage, InterfaceToSystemMap.id_ISMap, InterfaceToSystemMap.isProposed, InterfaceToSystemMap.description,
					interfaces.id_interface, interfaces.name AS interfaceName, interfaces.image AS interfaceImage 
				FROM systems
				INNER JOIN InterfaceToSystemMap ON systems.id_system = InterfaceToSystemMap.id_system
				INNER JOIN interfaces ON InterfaceToSystemMap.id_interface = interfaces.id_interface
				WHERE InterfaceToSystemMap.id_ISMap = ?;`,[req.body.id_ISMap])
		break;
	}

	

	if (executeQueryAtEnd){

		if (queryString == ''){ 
			res.json({msg: 'There was an error executing the query (select.json)', err: 'No queryString was developed.'}) 
		} else {

			debug(5,'Query:  ' + queryString);

			sql.execute(queryString).then((result) => {
				debug(5, result)
				if (result.length == 1 && stripArr == true){
					debug(3, 'Array has a length of 1, returning contents')
					if (result[0] !== undefined){
						res.json(result[0])
					} else {
						res.json([])
					}
				} else {
					debug(3, 'In result switch')
					switch (req.body.type){						//Should be able to remove this section by looking at the returned result array length
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
						case 'SingleParamValueForSystem':
							if (result.length == 0){
								res.json({value: null})
							} else {
								res.json(result)	
							}
							break;
						default:
							res.json(result) 
					}								
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
}



/**
 * @desc
 * 
 * @param {*} sourceNameArr 
 * @param {*} defaultValue 
 * @param {*} resultSet 
 */

 function findValuesFromArr(sourceNameArr, defaultValue, resultSet){
	//debug(5, resultSet)
	var resultArr = []

	for (var i = 0; i < sourceNameArr.length; i++){
		//Place the default value initially
		resultArr.push(defaultValue)

		resultSet.forEach((row) => {
			if (row.paramName == sourceNameArr[i]){
				if (row.value != ''){ resultArr[i] = row.value }
			}
		})
	}

	return resultArr
}

/**
 * @desc Conducts a query to fetch the request parameters from the server and helps to return those values in a new array, in the equivalent index
 * 
 * @param {*} row The row from the last query to perform operations on
 * @param {*} resultArr The array which captures the end result
 * @param {*} unformattedQueryString An unformatted text string of the query to execute, including ? wildcards for population within this function
 * @param {*} queryStringParamArr The parameters for the queryString
 * @param {*} paramNameArr The array of parameter names to query the database for
 * @param {*} defaultValue The default value to return if the parameter is not defined for this query
 */
async function getParamsForEachRow(row, resultArr, unformattedQueryString, queryStringParamArr, paramNameArr, defaultValue){

	//Save the row to the result array
	resultArr.push(row)

	//Get the values of the requested parameters associated with this row
	var queryString = sql.format(unformattedQueryString,queryStringParamArr)
	await sql.execute(queryString).then((result) => {
		//Search the returned parameters and capture the values in the same order as the provided parameter name array
		resultArr[resultArr.length-1].paramsArr = findValuesFromArr(paramNameArr, defaultValue, result)
	})
}