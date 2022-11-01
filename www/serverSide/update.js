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
	debug(1, `update.js debug level: ${debugLevel} req.body.type: ${req.body.type}`);
	debug(7,req.body);
	debug(1, Date.now())


	var queryString = '';
	var performQueryAtEnd = true;


	switch (req.body.type){
		//Update parameters (for systems initially)
		case 'UpdateParams':
			switch (req.body.paramType){
				case 'system':
				case 'subsystem':
					//Delete all existing values
					queryString += sql.format(`DELETE FROM params WHERE id_system = ?;`, [req.body.id_system])

					//Create all the insert statements
					req.body.params.forEach((param) => { queryString += sql.format(`INSERT INTO params (id_paramDefinition, value, id_system) VALUES (?,?,?);`, [param.id_paramDefinition, param.value, req.body.id_system]) })
					break;
				case 'interface':
					//Delete all existing values
					queryString += sql.format(`DELETE FROM params WHERE id_interface = ?;`, [req.body.id_interface])
				
					//Create all the insert statements
					req.body.params.forEach((param) => { queryString += sql.format(`INSERT INTO params (id_paramDefinition, value, id_interface) VALUES (?,?,?);`, [param.id_paramDefinition, param.value, req.body.id_interface]) })
					break;
				case 'link':
					//Delete all existing values
					queryString += sql.format(`DELETE FROM params WHERE id_link = ?;`, [req.body.id_link])

					//Create all the insert statements
					req.body.params.forEach((param) => { queryString += sql.format(`INSERT INTO params (id_paramDefinition, value, id_link) VALUES (?,?,?);`, [param.id_paramDefinition, param.value, req.body.id_link]) })
					break;
				case 'technology':
					//Delete all existing values
					queryString += sql.format(`DELETE FROM params WHERE id_technology = ?;`, [req.body.id_technology])

					//Create all the insert statements
					req.body.params.forEach((param) => { queryString += sql.format(`INSERT INTO params (id_paramDefinition, value, id_technology) VALUES (?,?,?);`, [param.id_paramDefinition, param.value, req.body.id_technology]) })
					break;
			}


			







			break;
 		



		//Clone system
		case 'CloneSystem':
			//Clone the system
			performQueryAtEnd = false;
			var new_id_system = 0


			queryString += sql.format(`
				SET @id_system = ?;

				SET @name = CONCAT((SELECT name FROM systems WHERE id_system = @id_system), '_clone');
				
				INSERT INTO systems (name, id_family, version, image, category, isSubsystem, distributedSubsystem, description, reference, updateTime)
					SELECT @name, id_family, version, image, category, isSubsystem, distributedSubsystem, description, reference, UNIX_TIMESTAMP()
					FROM systems
				WHERE id_system = @id_system;
				SET @new_id_system = last_insert_id();`, req.body.id_system)

			//Clone the quantities
			queryString += sql.format(`
				INSERT INTO quantities (id_system, year, quantity)
					SELECT @new_id_system, year, quantity
					FROM quantities
				WHERE id_system = @id_system;`)

			//Clone the interfaces
			/*
			queryString += sql.format(`
				INSERT INTO InterfaceToSystemMap (id_system, id_interface, isProposed, name, description, category)
					SELECT @new_id_system, id_interface, isProposed, name, description, category
					FROM InterfaceToSystemMap
				WHERE id_system = @id_system;`)
			*/
			
			//Clone the tags
			queryString += sql.format(`
				INSERT INTO tags (id_system, tag)
					SELECT @new_id_system, tag
					FROM tags
				WHERE id_system = @id_system;`)
			
			//Clone the interfaces and links
			sql.execute(queryString)
			.then((result) => {
				//Save the clones id_system value
				new_id_system = result[2].insertId

				//Get all the id_ISMap entries associated with the original id_system
				queryString = sql.format(`
					SELECT InterfaceToSystemMap.*, SystemInterfaceToLinkMap.id_SILMap, SystemInterfaceToLinkMap.id_ISMap, SystemInterfaceToLinkMap.id_link, SystemInterfaceToLinkMap.category AS SILMapCategory
					FROM InterfaceToSystemMap 
					LEFT JOIN SystemInterfaceToLinkMap
					ON SystemInterfaceToLinkMap.id_ISMap = InterfaceToSystemMap.id_ISMap
					WHERE id_system = ?;`, [req.body.id_system])
				return sql.execute(queryString)
			}).then((result) => {
				//For each interface allocated to the original system, create a new instance with the same details
				queryString = ''
				var current_id_ISMap = 0;
				result.forEach((row) => {
					if (row.id_ISMap != current_id_ISMap){
						//Next interface
						queryString += sql.format(`INSERT INTO InterfaceToSystemMap (id_system, id_interface, isProposed, name, description, category) 
							VALUES (?,?,?,?,?,?);`, [new_id_system, row.id_interface, row.isProposed, row.name, row.description, row.category])
						queryString += sql.format(`SET @new_id_ISMap = last_insert_id();`)
						current_id_ISMap = row.id_ISMap
					}

					//Add the links
					if (row.id_SILMap != null){
						queryString += sql.format(`INSERT INTO SystemInterfaceToLinkMap (id_ISMap, id_link, category) VALUES (@new_id_ISMap,?,?);`,[row.id_link, row.SILMapCategory])
					}
				})

				return sql.execute(queryString)
			}).then((result) => {
				debug(5,result)
				res.json({insertId: new_id_system})
			}).catch((err) => {
				debug(5,err)
				res.json(err)
			})
			

			
			

			//For each id_ISMap entry, create a copy in InterfaceToSystemMap, linked to the clone's id_system
			
			
			/*



			queryString += sql.format(`
				INSERT INTO SystemInterfaceToLinkMap (id_ISMap, id_link, category)
					SELECT SystemInterfaceToLinkMap.id_ISMap, SystemInterfaceToLinkMap.id_link, SystemInterfaceToLinkMap.category 
					FROM InterfaceToSystemMap
					LEFT JOIN SystemInterfaceToLinkMap
					ON InterfaceToSystemMap.id_ISMap = SystemInterfaceToLinkMap.id_ISMap
					WHERE InterfaceToSystemMap.id_system = @new_id_system;
			`)
			*/




			break;
		
		
		//Simple Deletes
		case 'DeleteOrganisation':	queryString += sql.format(`DELETE FROM organisation WHERE id_organisation = ?;`, req.body.id_organisation);	break;
		case 'DeleteSystem': queryString += sql.format(`DELETE FROM systems WHERE id_system = ?;`, req.body.id_system); break;
		case 'DeleteInterfaceFromSystem': queryString += sql.format(`DELETE FROM InterfaceToSystemMap WHERE id_ISMap = ?`,[req.body.id_ISMap]); break;
		case 'DeleteInterface': queryString += sql.format(`DELETE FROM interfaces WHERE id_interface = ?`,[req.body.id_interface]); break;			//Something weird here, TIMap FK not configured to cascade, yet delete is working for both interfaces and TIMap.
		case 'DeleteSystemFromOrganisation': queryString += sql.format(`DELETE FROM OSMap WHERE id_OSMap = ?;`, req.body.id_OSMap);	break;
		case 'DeleteTechnology': queryString += sql.format(`DELETE FROM technologies WHERE id_technology = ?`,[req.body.id_technology]); break;
		case 'DeleteLink': queryString += sql.format(`DELETE FROM links WHERE id_link = ?`,[req.body.id_link]); break;
		case 'DeleteNetworkFromInterface': queryString += sql.format(`DELETE FROM SystemInterfaceToLinkMap WHERE id_SILMap = ?`,[req.body.id_SILMap]); break;
		case 'DeleteInterfaceIssue': queryString += sql.format(`DELETE FROM interfaceIssues WHERE id_interfaceIssue = ?`,[req.body.id_interfaceIssue]); break;
		case 'DeleteFamily': queryString += sql.format(`DELETE FROM families WHERE id_family = ?`,[req.body.id_family]); break;
		case 'DeleteTechCategory': queryString += sql.format(`DELETE FROM technologyCategories WHERE id_techCategory = ?`,[req.body.id_techCategory]); break;
		case 'DeleteParamGroup': queryString += sql.format(`DELETE FROM paramGroups WHERE id_paramGroup = ?`,[req.body.id_paramGroup]); break;
		case 'DeleteParamDefinition': queryString += sql.format(`DELETE FROM paramDefinitions WHERE id_paramDefinition = ?`,[req.body.id_paramDefinition]); break;
		
		case 'DeleteDataExchange':
			if (req.body.id_dataExchange > 0) { //Update existing system
				//Update system details
				queryString += sql.format(`DELETE FROM dataExchanges WHERE id_dataExchange = ?;`, [req.body.id_dataExchange]);
			}
			break;		

		//Simple Mappings
		case 'AssignInterfaceToSystem':	queryString += sql.format(`INSERT INTO InterfaceToSystemMap (id_interface, id_system) VALUES (?,?);`,[req.body.id_interface, req.body.id_system]); break;		
		case 'AssignSystemToOrg': queryString += sql.format(`INSERT INTO OSMap (id_organisation, id_system) VALUES (?,?);`, [req.body.id_organisation, req.body.id_system]);	break;

		//Delete & Re-add Mappings (Should be a better way to do this)
		case 'UpdateChildSystemAssignments':
			queryString += sql.format('DELETE FROM SMap WHERE parent = ?;', req.body.id_system);
			if (req.body.id_system_arr){
				req.body.id_system_arr.forEach((element) => {
					queryString += sql.format('INSERT INTO SMap (parent, child) VALUES (?,?);', [req.body.id_system, element]);
				})				
			}
			break;
		case 'UpdateInterfaceTechnologyAssignments':
			queryString += sql.format('DELETE FROM TIMap WHERE id_interface = ?;', req.body.id_interface);
			req.body.id_technology_arr.forEach((element) => {
				queryString += sql.format('INSERT INTO TIMap (id_interface, id_technology) VALUES (?,?);', [req.body.id_interface, element]);
			})
			break;
		case 'QtyYears':
			queryString += sql.format('DELETE FROM quantities WHERE id_system = ?;', [req.body.id_system]);
			queryString += sql.format(`INSERT INTO quantities (id_system, year, quantity) VALUES `);
			req.body.years.forEach((element) => {
				queryString += sql.format(`(?,?,?),`, [req.body.id_system, element.year, element.quantity]);
			})
			queryString = queryString.substring(0,queryString.length-1) + ';';
			
			break;
		case 'UpdateSystemsAssociatedwithIssues':
			queryString += sql.format(`SET @id_interfaceIssue = ?;`, req.body.id_interfaceIssue)
			queryString += sql.format(`DELETE FROM issuesToSystemsMap WHERE id_interfaceIssue = @id_interfaceIssue;`);
			if (req.body.affectedSystems){
				req.body.affectedSystems.forEach((element) => {
					//Add each affected system to issuesToSystemsMap
					queryString += sql.format(`INSERT INTO issuesToSystemsMap (id_interfaceIssue, id_system) VALUES (@id_interfaceIssue,?);`, element);
				})
			}
			break;

		//Simple Updates / Insertions
		case 'UpdateExport':
			var exportObject = JSON.stringify(req.body.exportObject)
			if (req.body.id_export){
				queryString += sql.format(`UPDATE exports SET name = ?, exportFormat = ?, exportObject = ? WHERE exports.id_export = ?;`,[req.body.name, req.body.exportFormat, exportObject, req.body.id_export]);
			} else {
				queryString += sql.format(`INSERT INTO exports (name,exportFormat,exportObject) VALUES (?,?,?);`,[req.body.name, req.body.exportFormat, exportObject]);
			}
			break;
		case 'UpdateParamGroup':
			if (req.body.id_paramGroup){
				queryString += sql.format(`UPDATE paramGroups SET name = ? WHERE paramGroups.id_paramGroup = ?;`,[req.body.name, req.body.id_paramGroup]);
			} else {
				queryString += sql.format(`INSERT INTO paramGroups (name) VALUES (?);`,[req.body.name]);
			}
			break;
		case 'UpdateParamDefinition':
			if (req.body.id_paramDefinition){
				queryString += sql.format(`UPDATE paramDefinitions SET 
					name = ?, 
					paramType = ?,
					options = ?,
					applicableToSystem = ?, 
					applicableToSubsystem = ?, 
					applicableToInterface = ?,
					applicableToLink = ?, 
					applicableToTechnology = ? 
					WHERE paramDefinitions.id_paramDefinition = ?;`,[req.body.name, req.body.paramType, req.body.options, req.body.applicableToSystem, req.body.applicableToSubsystem, req.body.applicableToInterface, req.body.applicableToLink, req.body.applicableToTechnology, req.body.id_paramDefinition]);
			} else {
				queryString += sql.format(`INSERT INTO paramDefinitions (name, paramType, options, id_paramGroup, applicableToSystem, applicableToSubsystem, applicableToInterface, applicableToLink, applicableToTechnology) VALUES (?,?,?,?,?,?,?,?,?);`,
					[req.body.name, req.body.paramType, req.body.options, req.body.id_paramGroup, req.body.applicableToSystem, req.body.applicableToSubsystem, req.body.applicableToInterface, req.body.applicableToLink, req.body.applicableToTechnology]);
			}
			break;


		case 'UpdateTechCategory':
			if (req.body.id_techCategory){
				queryString += sql.format(`UPDATE technologyCategories SET name = ?, color = ? WHERE technologyCategories.id_techCategory = ?;`,[req.body.name, req.body.color, req.body.id_techCategory]);
			} else {
				queryString += sql.format(`INSERT INTO technologyCategories (name, color) VALUES (?,?);`,[req.body.name, req.body.color]);
			}
			break;
		case 'UpdateCimMap':
			queryString += sql.format(`DELETE FROM cimMap WHERE id_system = ?;`,[req.body.id_system]);
			queryString += sql.format(`INSERT INTO cimMap (id_system, cimName, updateTime) VALUES (?,?,?);`,[req.body.id_system, req.body.cimName, Date.now()]);
			break;
		case 'UpdateInterfaceToSystemMap':
			//queryString += sql.format(`UPDATE InterfaceToSystemMap SET isProposed = ?, name = ?, description = ? WHERE InterfaceToSystemMap.id_ISMap = ?;`,[req.body.isProposed, req.body.name, req.body.description, req.body.id_ISMap]);
			queryString += sql.format(`UPDATE InterfaceToSystemMap SET name = ?, description = ?, category = ?, isProposed = ? WHERE InterfaceToSystemMap.id_ISMap = ?;`,[req.body.name, req.body.description, req.body.category, req.body.isProposed, req.body.id_ISMap]);
			break;
		case 'UpdateImage':
			if (req.body.id_system){ //Update the image associated with a system
				queryString = sql.format(`UPDATE systems SET image = ? WHERE id_system = ?;`, [req.body.image, req.body.id_system]);
			}
			if (req.body.id_interface){ //Update the image associated with a system
				queryString = sql.format(`UPDATE interfaces SET image = ? WHERE id_interface = ?;`, [req.body.image, req.body.id_interface]);
			}
			if (req.body.id_link){ //Update the image associated with a system
				queryString = sql.format(`UPDATE links SET image = ? WHERE id_link = ?;`, [req.body.image, req.body.id_link]);
			}
			break;
		case 'UpdateInterface':
			if (req.body.id_interface){
				queryString += sql.format(`UPDATE interfaces SET name = ?, description = ?, updateTime = ? WHERE interfaces.id_interface = ?;`,[req.body.name, req.body.description, Date.now(), req.body.id_interface]);
			} else {
				queryString += sql.format(`INSERT INTO interfaces (name, description, image, updateTime) VALUES (?,?,"tba.svg",?);`,[req.body.name, req.body.description, Date.now()]);
			}
			break;
		case 'UpdateFamily':
				if (req.body.id_family) {
					queryString += sql.format(`UPDATE families SET name = ?, description = ? WHERE id_family = ?;`, [req.body.name, req.body.description, req.body.id_family]);
				} else {
					queryString += sql.format(`INSERT INTO families (name, description) VALUES (?,?);`, [req.body.name, req.body.description]);
				}
			break;
		case 'UpdateSystem':
			//Manage tag list
			var tagArr = req.body.tags.split(',');
			debug(1, tagArr)
				
			if (req.body.id_system) { //Update existing system
				//Update system details
				queryString += sql.format(`UPDATE systems SET name = ?, image = ?, description = ?, reference = ?, category = ?, updateTime = ?, version = ?, id_family = ? WHERE id_system = ?;`, 
					[req.body.name, req.body.image, req.body.description, req.body.reference, req.body.category, Date.now(), req.body.version, req.body.id_family, req.body.id_system]);
	
				//Delete existing tags
				queryString += sql.format(`DELETE FROM tags WHERE id_system = ?;`, req.body.id_system)
	
				//Add new tags
				tagArr.forEach((element) => {
					element = element.trim()
					queryString += sql.format(`INSERT INTO tags (id_system, tag) VALUES (?,?);`, [req.body.id_system, element])
				})
	
			} else { //Add new system
				
				queryString += sql.format(`INSERT INTO systems (name, image, description, reference, category, updateTime, isSubsystem, version, id_family) VALUES (?,?,?,?,?,?,0,?,?,?);`, 
					[req.body.name, req.body.image, req.body.description, req.body.reference, req.body.category, Date.now(), req.body.version, req.body.id_family]);
				queryString += sql.format(`SET @insertID = LAST_INSERT_ID();`)
	
				//Add new tags
				tagArr.forEach((element) => {
					queryString += sql.format(`INSERT INTO tags (id_system, tag) VALUES (@insertID,?);`, element)
				})

				queryString += sql.format(`SELECT @insertID AS insertId;`)
			}
			break;
		case 'UpdateLink':
			if (req.body.id_link){
				queryString += queryString = sql.format(`UPDATE links SET updateTime = ?, name = ?, designation = ?, description = ?, id_technology = ?, category = ? WHERE id_link = ?;`, [Date.now(), req.body.name, req.body.designation, req.body.description, req.body.id_technology, req.body.category, req.body.id_link])
			} else {
				queryString += sql.format(`INSERT INTO links (updateTime, name, designation, description, id_technology, category, image) VALUES (?,?,?,?,?,?,'tba.svg')`, [Date.now(), req.body.name, req.body.designation, req.body.description, req.body.id_technology, req.body.category])
			}
			break;
		case 'UpdateTechnology':
				if (req.body.id_technology) {
					queryString += sql.format(`UPDATE technologies SET name = ?, id_techCategory = ?, description = ? WHERE id_technology = ?;`, [req.body.name, req.body.id_techCategory, req.body.description, req.body.id_technology]);
				} else {
					queryString += sql.format(`INSERT INTO technologies (name, id_techCategory, description) VALUES (?,?,?);`, [req.body.name, req.body.id_techCategory, req.body.description]);
				}
			break;
		case 'AssignLinksToSystemInterface': //Assigns a network to a System Interface
			
			//Delete existing records
			queryString += sql.format(`DELETE FROM SystemInterfaceToLinkMap WHERE id_ISMap = ?;`, req.body.id_ISMap);

			if (req.body.primaryLinks){
				req.body.primaryLinks.forEach((element) => {
					queryString += sql.format(`INSERT INTO SystemInterfaceToLinkMap (id_ISMap, id_link, isPrimary) VALUES (?,?,TRUE);`,[req.body.id_ISMap, element]);
				})
			}

			if (req.body.alternateLinks){
				req.body.alternateLinks.forEach((element) => {
					queryString += sql.format(`INSERT INTO SystemInterfaceToLinkMap (id_ISMap, id_link, isPrimary) VALUES (?,?,FALSE);`,[req.body.id_ISMap, element]);
				})
			}
			break;
		case 'UpdateInterfaceIssue':
			if (req.body.id_interfaceIssue) {
				queryString += sql.format(`UPDATE interfaceIssues SET name = ?, severity = ?, issue = ?, resolution = ?, updateTime = ?  WHERE id_interfaceIssue = ?;`, [req.body.name, req.body.severity, req.body.issue, req.body.resolution, Date.now(), req.body.id_interfaceIssue]);
			} else {
				queryString += sql.format(`INSERT INTO interfaceIssues (id_interface, name, severity, issue, resolution, updateTime) VALUES (?,?,?,?,?,?);`, [req.body.id_interface, req.body.name, req.body.severity, req.body.issue, req.body.resolution, Date.now()]);
			}
			break;
		case 'UpdateSubsystem':
		
				if (req.body.id_system) { //Update existing subsystem
					//Update system details
					queryString += sql.format(`UPDATE systems SET name = ?, image = ?, description = ?,  isSubsystem = 1, distributedSubsystem = ?, updateTime = ?  WHERE id_system = ?;`, [req.body.name, req.body.image, req.body.description, req.body.distributedSubsystem,Date.now(), req.body.id_system]);
	
				} else { //Add new system
		
					queryString += sql.format(`INSERT INTO systems (name, image, description, updateTime, distributedSubsystem, isSubsystem) VALUES (?,?,?,?,?,1);`, [req.body.name, req.body.image, req.body.description, Date.now(), req.body.distributedSubsystem]);
					//queryString += sql.format(`SET @insertID = LAST_INSERT_ID();`)
					//queryString += sql.format(`SELECT @insertID AS insertId;`)
				}
				break;

		//Not yet organised:
		case 'Organisation':
			if (!(typeof req.body.id_organisation  === 'undefined')){ //Existing entry
				queryString += sql.format(`UPDATE organisation SET name = ? WHERE id_organisation = ?;`, [req.body.name, req.body.id_organisation]);
			} else { //New entry
				queryString = sql.format('START TRANSACTION;')
				queryString += sql.format(`INSERT INTO organisation (name) VALUES (?);`, req.body.name);
				queryString += sql.format(`INSERT INTO OMap (parent,child) VALUES (?, LAST_INSERT_ID());`, req.body.parent);
				queryString += sql.format('COMMIT;')
			}
			break;
		case 'DataExchange':
			if (req.body.id_dataExchange > 0) { //Update existing system
				//Update system details
				queryString += sql.format(`UPDATE dataExchanges SET name = ?, description = ? WHERE id_dataExchange = ?;`, [req.body.name, req.body.description, req.body.id_dataExchange]);
			} else {
				//Add new system
				queryString += sql.format(`INSERT INTO dataExchanges (name, description) VALUES (?,?);`, [req.body.name, req.body.description]);
			}
			break;
		case 'UpdateOrgSystemMap':
			queryString += sql.format(`UPDATE OSMap SET quantity = ? WHERE id_OSMap = ?`, [req.body.quantity, req.body.id_OSMap])
		break;


		
		default:
	}





	//Check if transaction works, probably change on delete action for relevant FKs
	if (req.body.type == 'Interface'){
		
		queryString = sql.format('START TRANSACTION;');
		if (req.body.id_interface > 0) {
			//Update existing interface
			queryString += sql.format(`SET @id_interface:=?;`, req.body.id_interface)
			queryString += sql.format(`UPDATE interfaces SET name = ?, image = ?, description = ? WHERE id_interface = @id_interface;`, [req.body.name, req.body.image, req.body.description ])
			
			//Delete all existing mapped technologies
			queryString += sql.format(`DELETE FROM TIMap WHERE id_interface = ?;`, [req.body.id_interface])
		} else {
			//Add new interface
			queryString += sql.format(`INSERT INTO interfaces (name, image, description) VALUES (?,?,?);`, [req.body.name, req.body.image, req.body.description])
			queryString += sql.format(`SET @id_interface:=LAST_INSERT_ID();`)
		}

		//Add new mapped technologies
		if (req.body.technologies){
			req.body.technologies.forEach((element) => {
				queryString += sql.format(`INSERT INTO TIMap (id_interface, id_technology) VALUES (@id_interface,?);`, [element])
			})
		}

		queryString += sql.format('COMMIT;');
	}

	//Delete an interface from the database
	//Check if transaction works, probably change on delete action for relevant FKs
	if (req.body.type == 'DeleteInterface'){
		queryString = sql.format('START TRANSACTION;');
		queryString += sql.format(`DELETE FROM TIMap WHERE id_interface = ?;`, [req.body.id_interface])
		queryString += sql.format(`DELETE FROM interfaces WHERE id_interface = ?;`,[req.body.id_interface]);
		queryString += sql.format('COMMIT;');
	}





	//******************************** Quantities ****************************************




	//******************************** Issues ****************************************
	//Check if transaction works, probably change on delete action for relevant FKs
	if (req.body.type == 'Issue2'){
	   
		queryString = sql.format(`START TRANSACTION;`);

		if (req.body.id_interfaceIssue > 0){
			//Is an update
			queryString += sql.format(`UPDATE interfaceIssues SET name = ?, severity = ?, issue = ?, resolution = ? WHERE id_interfaceIssue = ?;`, [req.body.name, req.body.severity, req.body.issue, 
				req.body.resolution, req.body.id_interfaceIssue]);
				queryString += sql.format(`SET @interfaceIssue:=?;`, req.body.id_interfaceIssue)
			} else {
			//Is a new record
			queryString += sql.format(`INSERT INTO interfaceIssues (id_interface, name, severity, issue, resolution) VALUES (?,?,?,?,?);`, [req.body.id_interface, req.body.name, req.body.severity, req.body.issue, 
				req.body.resolution]);
			queryString += sql.format(`SET @interfaceIssue:=LAST_INSERT_ID();`)
		}

		//Mapping of issues to systems
		//MOVED
		queryString += sql.format(`DELETE FROM issuesToSystemsMap WHERE id_interfaceIssue = @interfaceIssue;`);
		debug(1, req.body);
		if (req.body.affectedSystems){
		
			req.body.affectedSystems.forEach((element) => {
				//Add each affected system to issuesToSystemsMap
				queryString += sql.format(`INSERT INTO issuesToSystemsMap (id_interfaceIssue, id_system) VALUES (@interfaceIssue,?);`, element);
			})
		}

		queryString += sql.format('COMMIT;');
	}

	//Check if transaction works, probably change on delete action for relevant FKs
	if (req.body.type == 'DeleteIssue2'){
	   
		if (req.body.id_interfaceIssue > 0){
			queryString = sql.format(`
			START TRANSACTION;
			SET @id_interfaceIssue:=?;
			DELETE FROM issuesToSystemsMap WHERE id_interfaceIssue = @id_interfaceIssue;
			DELETE FROM interfaceIssues WHERE id_interfaceIssue = @id_interfaceIssue;
			COMMIT;`, req.body.id_interfaceIssue);
		}
	}

	debug(2,queryString)

	if (performQueryAtEnd){
		debug(1, 'Executing QUERY')
		sql.execute(queryString).then((result) => {
			//Cleanup some results (remove unnecessary artefacts)
			switch (req.body.type){
				case 'Interface':
				case 'Organisation':
					res.json(result[1]) 
				break;
				case 'DeleteInterface':
				case 'CloneSystem':
					res.json(result[2]) 
				break;
				case 'DeleteOrganisation':
					res.json(result) 
				break;
				case 'UpdateSystem':
					res.json(result[0])
				break;
				default:
					res.json(result) 
			}
		})
		.catch((err) => {
			debug(1,err);
			switch (err.code){
				case 'ER_ROW_IS_REFERENCED_2':
					res.json({msg: 'Cannot delete as there are dependencies elsewhere on this entry' })
				break;
				default:
				if (debugLevel == 7){
					res.json({msg: 'There was an unknown error executing the query (update.json)', err: err})
				} else {
					res.json({msg: 'There was an unknown error executing the query (update.json)'})
				}
			}
		})		
	}
}