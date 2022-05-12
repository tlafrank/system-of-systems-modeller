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
	debug(1, `update.js debug level: ${debugLevel} req.body.type: ${req.body.type}`);
	debug(7,req.body);

	var queryString;

	debug(1, typeof req.body.subsystems)

	if (req.body.type == 'MapSubsystemsToSystems'){

		//Manage subsystem to system map
		queryString = sql.format('START TRANSACTION;')

		//Delete existing maps
		queryString += sql.format(`DELETE FROM SSMap WHERE id_system = ?;`, req.body.id_system)

		debug(1, req.body)

		//Add new maps
		if(req.body.subsystems){
			debug(1,'exists')
			req.body.subsystems.forEach((element) => {
				queryString += sql.format(`INSERT INTO SSMap (id_system, id_subsystem) VALUES (?,?);`, [req.body.id_system, element])
			})
		}
		

		queryString += sql.format('COMMIT;')
	}

	if (req.body.type == 'Subsystems'){

		if (req.body.id_subsystem > 0) { //Update existing system
			//Update system details
			queryString = sql.format(`UPDATE subsystems SET name = ?, description = ? WHERE id_subsystem = ?;`, [req.body.name, req.body.description, req.body.id_subsystem]);
		} else {
			//Add new system
			queryString = sql.format(`INSERT INTO subsystems (name, description) VALUES (?,?);`, [req.body.name, req.body.description]);
		}
	}

	if (req.body.type == 'DeleteSubsystems'){
		queryString = sql.format(`DELETE FROM subsystems WHERE id_subsystem = ?;`, [req.body.id_subsystem]);
	}

	if (req.body.type == 'DataExchange'){
		
		if (req.body.id_dataExchange > 0) { //Update existing system
			//Update system details
			queryString = sql.format(`UPDATE dataExchanges SET name = ?, description = ? WHERE id_dataExchange = ?;`, [req.body.name, req.body.description, req.body.id_dataExchange]);
		} else {
			//Add new system
			queryString = sql.format(`INSERT INTO dataExchanges (name, description) VALUES (?,?);`, [req.body.name, req.body.description]);
		}
	}

	
	if (req.body.type == 'DeleteDataExchange'){
		
		if (req.body.id_dataExchange > 0) { //Update existing system
			//Update system details
			queryString = sql.format(`DELETE FROM dataExchanges WHERE id_dataExchange = ?;`, [req.body.id_dataExchange]);
		}
	}

	//******************************** System ****************************************
	if (req.body.type == 'System'){
		//Manage tag list
		var tagArr = req.body.tags.split(',');
		
		queryString = sql.format('START TRANSACTION;')
		if (req.body.id_system > 0) { //Update existing system
			//Update system details
			queryString += sql.format(`UPDATE systems SET name = ?, image = ?, description = ?, reference = ? WHERE id_system = ?;`, [req.body.name, req.body.image, req.body.description,
				req.body.reference, req.body.id_system]);

			//Delete existing tags
			queryString += sql.format(`DELETE FROM tags WHERE id_system = ?;`, req.body.id_system)

			//Add new tags
			tagArr.forEach((element) => {
				queryString += sql.format(`INSERT INTO tags (id_system, tag) VALUES (?,?);`, [req.body.id_system, element])
			})

		} else {
			//Add new system
			queryString += sql.format(`INSERT INTO systems (name, image, description, reference) VALUES (?,?,?,?);`, [req.body.name, req.body.image, req.body.description, req.body.reference]);
			queryString += sql.format(`SET @insertID = LAST_INSERT_ID();`)

			//Add new tags
			tagArr.forEach((element) => {
				queryString += sql.format(`INSERT INTO tags (id_system, tag) VALUES (@insertID,?);`, element)
			})
		}
		queryString += sql.format('COMMIT;')

	}

	if (req.body.type == 'DeleteSystem'){
		
		queryString = sql.format('START TRANSACTION;')

		//Delete existing qty to year mappings
		queryString += sql.format(`DELETE FROM quantities WHERE id_system = ?;`, req.body.id_system)

		//Delete existing years
		queryString += sql.format(`DELETE FROM tags WHERE id_system = ?;`, req.body.id_system)

		//Delete systems
		queryString += sql.format(`DELETE FROM systems WHERE id_system = ?;`, req.body.id_system);

		queryString += sql.format('COMMIT;')

	}

	//******************************** Interface ****************************************
	if (req.body.type == 'Interface'){
		
		queryString = sql.format('START TRANSACTION;');
		if (req.body.id_interface > 0) {
			//Update existing interface
			queryString += sql.format(`SET @id_interface:=?;`,req.body.id_interface)
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
	if (req.body.type == 'DeleteInterface'){
		queryString = sql.format('START TRANSACTION;');
		queryString += sql.format(`DELETE FROM TIMap WHERE id_interface = ?;`, [req.body.id_interface])
		queryString += sql.format(`DELETE FROM interfaces WHERE id_interface = ?;`,[req.body.id_interface]);
		queryString += sql.format('COMMIT;');
	}

	//******************************** System Interface ****************************************
	//Assigns an interface to a system
	if (req.body.type == 'InterfaceToSystem'){
		queryString = sql.format(`INSERT INTO SIMap (id_interface, id_system) VALUES (?,?);`,[req.body.id_interface, req.body.id_system]);        
	} 

	//Delete an interface from a system
	if (req.body.type == 'DeleteInterfaceFromSystem'){
		queryString = sql.format(`DELETE FROM SIMap WHERE id_SIMap = ?`,[req.body.id_SIMap]);
	}


	//Update a SI details
	if (req.body.type == 'UpdateSIMap'){
		queryString = sql.format(`UPDATE SIMap SET isProposed = ?, description = ? WHERE SIMap.id_SIMap = ?;`,[req.body.isProposed, req.body.description, req.body.id_SIMap]);        
	} 



	//******************************** Network ****************************************
	if (req.body.type == 'Network'){
		if (req.body.id_network > 0) {
			//Update existing feature
			queryString = queryString = sql.format(`UPDATE networks SET name = ?, designation = ?, image = ?, description = ?, id_technology = ? WHERE id_network = ?;`, [req.body.name, req.body.designation, req.body.image, req.body.description, req.body.id_technology, req.body.id_network])
		} else {
			//Add new feature
			queryString = sql.format(`INSERT INTO networks (name, designation, image, description, id_technology) VALUES (?,?,?,?)`, [req.body.name, req.body.designation, req.body.image, req.body.description, req.body.id_technology])
		}
	}

	//Assigns a network to a System Interface
	if (req.body.type == 'AssignNetworksToSystemInterface'){
		queryString = sql.format(`START TRANSACTION;`)

		//Delete existing records
		queryString += sql.format(`DELETE FROM SINMap WHERE id_SIMap = ?;`,[req.body.id_SIMap]);

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

		queryString += sql.format(`COMMIT;`)
	}


	//Delete a network 
	if (req.body.type == 'DeleteNetwork'){
		queryString = sql.format(`DELETE FROM networks WHERE id_network = ?`,[req.body.id_network]);
	}	

	//Delete a network from a system interface
	if (req.body.type == 'DeleteNetworkFromInterface'){
		queryString = sql.format(`DELETE FROM SINMap WHERE id_SINMap = ?`,[req.body.id_SINMap]);
	}	

	//******************************** Technologies ****************************************
	if (req.body.type == 'Technologies'){
		if (req.body.id_technology) {
			//Update existing technology
			queryString = sql.format(`UPDATE technologies SET name = ?, description = ? WHERE id_technology = ?;`, [req.body.name, req.body.description, req.body.id_technology]);
		} else {
			//Add new technology
			queryString = sql.format(`INSERT INTO technologies (name, description) VALUES (?,?);`, [req.body.name, req.body.description]);
		}
	}

	//Delete a technology
	if (req.body.type == 'DeleteTechnologies'){
		queryString = sql.format(`DELETE FROM technologies WHERE id_technology = ?`,[req.body.id_technology]);
	}


	//******************************** Quantities ****************************************
	if (req.body.type == 'QtyYears'){
		queryString = sql.format('DELETE FROM quantities WHERE id_system = ?;', [req.body.id_system]);
		queryString += sql.format(`INSERT INTO quantities (id_system, year, quantity) VALUES `);
		req.body.years.forEach((element) => {
			queryString += sql.format(`(?,?,?),`, [req.body.id_system, element.year, element.quantity]);
		})
		queryString = queryString.substring(0,queryString.length-1) + ';';
	}


	//******************************** Settings ****************************************
	if (req.body.type == 'Settings'){
		queryString = 'TRUNCATE TABLE graphSettings;';
		req.body.settings.forEach((element) => {
			queryString += sql.format(`INSERT INTO graphSettings (keyName, value) VALUES (?,?);`, [element.keyName, element.value]);
		})
		
	}


	//******************************** Issues ****************************************
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

	if (req.body.type == 'Issue'){
		switch (req.body.subtype){
			case 'SystemInterface':
				if (req.body.id_issue > 0){
					//Is an update
					queryString = sql.format(`UPDATE issues SET type = 'SystemInterface', id_type = ?, name = ?, severity = ?, issue = ?, resolution = ?  WHERE id_issue = ?;`, [req.body.id_SIMap, req.body.name, req.body.severity, req.body.issue, 
						req.body.resolution, req.body.id_issue]);
				} else {
					//Is a new record
					queryString = sql.format(`INSERT INTO issues (type, id_type, name, severity, issue, resolution) VALUES ('SystemInterface', ?,?,?,?,?);`, [req.body.id_SIMap, req.body.name, req.body.severity, req.body.issue, 
						req.body.resolution]);
				}
			break;
			case 'Interface':

			break;
			default:
					debug(2,'req.body.type of ' + req.body.subtype + ' was unknown in update.json for expected type of Issue')
		}
	}

	debug(2,queryString);
	execute;

	var execute = executeQuery(queryString)
		.then((result) => {
			//Cleanup some results (remove unnecessary artefacts)
			switch (req.body.type){
				case 'Interface':
					result = result[1]
				break;
				case 'DeleteInterface':
					result = result[2]
				break;
				default:
			}
			res.json(result) 
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