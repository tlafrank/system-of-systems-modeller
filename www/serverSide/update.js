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


	switch (req.body.type){
		//Clone system
		case 'CloneSystem':
			//Clone the system

			queryString += sql.format(`
				SET @id_system = ?;
				SET @name = CONCAT((SELECT name FROM systems WHERE id_system = @id_system), '_clone');
				SELECT @name;
				
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
			queryString += sql.format(`
				INSERT INTO SIMap (id_system, id_interface, isProposed, name, description, category)
					SELECT @new_id_system, id_interface, isProposed, name, description, category
					FROM SIMap
				WHERE id_system = @id_system;`)
			
			//Clone the links


			break;
		
		
		//Simple Deletes
		case 'DeleteOrganisation':	queryString += sql.format(`DELETE FROM organisation WHERE id_organisation = ?;`, req.body.id_organisation);	break;
		case 'DeleteSystem': queryString += sql.format(`DELETE FROM systems WHERE id_system = ?;`, req.body.id_system); break;
		case 'DeleteInterfaceFromSystem': queryString += sql.format(`DELETE FROM SIMap WHERE id_SIMap = ?`,[req.body.id_SIMap]); break;
		case 'DeleteInterface': queryString += sql.format(`DELETE FROM interfaces WHERE id_interface = ?`,[req.body.id_interface]); break;			//Something weird here, TIMap FK not configured to cascade, yet delete is working for both interfaces and TIMap.
		case 'DeleteSystemFromOrganisation': queryString += sql.format(`DELETE FROM OSMap WHERE id_OSMap = ?;`, req.body.id_OSMap);	break;
		case 'DeleteTechnology': queryString += sql.format(`DELETE FROM technologies WHERE id_technology = ?`,[req.body.id_technology]); break;
		case 'DeleteLink': queryString += sql.format(`DELETE FROM networks WHERE id_network = ?`,[req.body.id_network]); break;
		case 'DeleteNetworkFromInterface': queryString += sql.format(`DELETE FROM SINMap WHERE id_SINMap = ?`,[req.body.id_SINMap]); break;
		case 'DeleteInterfaceIssue': queryString += sql.format(`DELETE FROM interfaceIssues WHERE id_interfaceIssue = ?`,[req.body.id_interfaceIssue]); break;
		case 'DeleteFamily': queryString += sql.format(`DELETE FROM families WHERE id_family = ?`,[req.body.id_family]); break;
		case 'DeleteParty': queryString += sql.format(`DELETE FROM parties WHERE id_party = ?`,[req.body.id_party]); break;
		case 'DeletePoc': queryString += sql.format(`DELETE FROM poc WHERE id_poc = ?`,[req.body.id_poc]); break;
		case 'DeleteDataExchange':
			if (req.body.id_dataExchange > 0) { //Update existing system
				//Update system details
				queryString += sql.format(`DELETE FROM dataExchanges WHERE id_dataExchange = ?;`, [req.body.id_dataExchange]);
			}
			break;		

		//Simple Mappings
		case 'AssignInterfaceToSystem':	queryString += sql.format(`INSERT INTO SIMap (id_interface, id_system) VALUES (?,?);`,[req.body.id_interface, req.body.id_system]); break;		
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
		case 'UpdateCimMap':
			queryString += sql.format(`DELETE FROM cimMap WHERE id_system = ?;`,[req.body.id_system]);
			queryString += sql.format(`INSERT INTO cimMap (id_system, cimName, updateTime) VALUES (?,?,?);`,[req.body.id_system, req.body.cimName, Date.now()]);
			break;
		case 'UpdatePoc':
			if (req.body.id_poc){
				queryString += sql.format(`UPDATE poc SET name = ?, email = ?, updateTime = ? WHERE poc.id_poc = ?;`,[req.body.name, req.body.description, Date.now(), req.body.id_poc]);
			} else {
				queryString += sql.format(`INSERT INTO poc (name, email, updateTime) VALUES (?,?,?);`,[req.body.name, req.body.email, Date.now()]);
			}
			break;
		case 'UpdateParty':
			if (req.body.id_party){
				queryString += sql.format(`UPDATE parties SET name = ?, description = ?, updateTime = ? WHERE parties.id_party = ?;`,[req.body.name, req.body.description, Date.now(), req.body.id_party]);
			} else {
				queryString += sql.format(`INSERT INTO parties (name, description, updateTime) VALUES (?,?,?);`,[req.body.name, req.body.description, Date.now()]);
			}
			break;
		case 'UpdateSIMap':
			//queryString += sql.format(`UPDATE SIMap SET isProposed = ?, name = ?, description = ? WHERE SIMap.id_SIMap = ?;`,[req.body.isProposed, req.body.name, req.body.description, req.body.id_SIMap]);
			queryString += sql.format(`UPDATE SIMap SET name = ?, description = ?, category = ?, isProposed = ? WHERE SIMap.id_SIMap = ?;`,[req.body.name, req.body.description, req.body.category, req.body.isProposed, req.body.id_SIMap]);
			break;
		case 'UpdateImage':
			if (req.body.id_system){ //Update the image associated with a system
				queryString = sql.format(`UPDATE systems SET image = ? WHERE id_system = ?;`, [req.body.image, req.body.id_system]);
			}
			if (req.body.id_interface){ //Update the image associated with a system
				queryString = sql.format(`UPDATE interfaces SET image = ? WHERE id_interface = ?;`, [req.body.image, req.body.id_interface]);
			}
			if (req.body.id_network){ //Update the image associated with a system
				queryString = sql.format(`UPDATE networks SET image = ? WHERE id_network = ?;`, [req.body.image, req.body.id_network]);
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
				queryString += sql.format(`UPDATE systems SET name = ?, image = ?, description = ?, reference = ?, category = ?, updateTime = ?, version = ?, id_family = ?, id_poc = ? WHERE id_system = ?;`, 
					[req.body.name, req.body.image, req.body.description, req.body.reference, req.body.category, Date.now(), req.body.version, req.body.id_family, req.body.id_poc, req.body.id_system]);
	
				//Delete existing tags
				queryString += sql.format(`DELETE FROM tags WHERE id_system = ?;`, req.body.id_system)
	
				//Add new tags
				tagArr.forEach((element) => {
					queryString += sql.format(`INSERT INTO tags (id_system, tag) VALUES (?,?);`, [req.body.id_system, element])
				})
	
			} else { //Add new system
				
				queryString += sql.format(`INSERT INTO systems (name, image, description, reference, category, updateTime, isSubsystem, version, id_family, id_poc) VALUES (?,?,?,?,?,?,0,?,?,?);`, 
					[req.body.name, req.body.image, req.body.description, req.body.reference, req.body.category, Date.now(), req.body.version, req.body.id_family, req.body.id_poc]);
				queryString += sql.format(`SET @insertID = LAST_INSERT_ID();`)
	
				//Add new tags
				tagArr.forEach((element) => {
					queryString += sql.format(`INSERT INTO tags (id_system, tag) VALUES (@insertID,?);`, element)
				})

				queryString += sql.format(`SELECT @insertID AS insertId;`)
			}
			break;
		case 'UpdateLink':
			if (req.body.id_network){
				queryString += queryString = sql.format(`UPDATE networks SET name = ?, designation = ?, description = ?, id_technology = ?, category = ? WHERE id_network = ?;`, [req.body.name, req.body.designation, req.body.description, req.body.id_technology, req.body.category, req.body.id_network])
			} else {
				queryString += sql.format(`INSERT INTO networks (name, designation, description, id_technology, category, image) VALUES (?,?,?,?,?,'tba.svg')`, [req.body.name, req.body.designation, req.body.description, req.body.id_technology, req.body.category])
			}
			break;
		case 'UpdateTechnology':
				if (req.body.id_technology) {
					queryString += sql.format(`UPDATE technologies SET name = ?, category = ?, description = ? WHERE id_technology = ?;`, [req.body.name, req.body.category, req.body.description, req.body.id_technology]);
				} else {
					queryString += sql.format(`INSERT INTO technologies (name, category, description) VALUES (?,?,?);`, [req.body.name, req.body.category, req.body.description]);
				}
			break;
		case 'AssignLinksToSystemInterface': //Assigns a network to a System Interface
			
			//Delete existing records
			queryString += sql.format(`DELETE FROM SINMap WHERE id_SIMap = ?;`, req.body.id_SIMap);

			if (req.body.primaryLinks){
				req.body.primaryLinks.forEach((element) => {
					queryString += sql.format(`INSERT INTO SINMap (id_SIMap, id_network, category) VALUES (?,?,'primary');`,[req.body.id_SIMap, element]);
				})
			}

			if (req.body.alternateLinks){
				req.body.alternateLinks.forEach((element) => {
					queryString += sql.format(`INSERT INTO SINMap (id_SIMap, id_network, category) VALUES (?,?,'alternate');`,[req.body.id_SIMap, element]);
				})
			}

			if (req.body.incapableLinks){
				req.body.incapableLinks.forEach((element) => {
					queryString += sql.format(`INSERT INTO SINMap (id_SIMap, id_network, category) VALUES (?,?,'incapable');`,[req.body.id_SIMap, element]);
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









	debug(2,queryString);
	execute;

	var execute = executeQuery(queryString)
		.then((result) => {
			//Cleanup some results (remove unnecessary artefacts)
			switch (req.body.type){
				case 'Interface':
				case 'Organisation':
					res.json(result[1]) 
				break;
				case 'DeleteInterface':
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


		});
}


var executeQuery = (queryString) => new Promise((resolve,reject) => {
	//Submit the query to the database
	sql.query(queryString, (err,res) => {
		if (err) { 
			reject(err) 
		}
		resolve(res);
	})    
}) 