const { format } = require('./db');
const sql = require('./db');

let debugLevel = 2;

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

	if (req.body.type == 'DataExchange'){
		
		if (req.body.id_dataExchange > 0) { //Update existing system
			//Update system details
			queryString = sql.format(`UPDATE dataExchanges SET name = ?, description = ? WHERE id_dataExchange = ?;`, [req.body.name, req.body.description, req.body.id_dataExchange]);
		} else {
			//Add new system
			queryString = sql.format(`INSERT INTO dataExchanges (name, description) VALUES (?,?);`, [req.body.name, req.body.description]);
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

		//Delete existing tags
		queryString += sql.format(`DELETE FROM tags WHERE id_system = ?;`, req.body.id_system)

		//Delete systems
		queryString += sql.format(`DELETE FROM systems WHERE id_system = ?;`, req.body.id_system);

		queryString += sql.format('COMMIT;')

	}

	//******************************** Interface ****************************************
	if (req.body.type == 'Interface'){
		if (req.body.id_interface > 0) {
			debug(2,'Req body: ' + req.body.features)
			//Update existing feature
			if (req.body.features){
				queryString = queryString = sql.format(`UPDATE interfaces SET name = ?, image = ?, description = ?, features = ? WHERE id_interface = ?;`, [req.body.name, req.body.image, req.body.description, req.body.features.toString(), req.body.id_interface])
			} else {
				queryString = queryString = sql.format(`UPDATE interfaces SET name = ?, image = ?, description = ?, features = NULL WHERE id_interface = ?;`, [req.body.name, req.body.image, req.body.description, req.body.id_interface])
			}

		} else {
			//Add new feature
			queryString = sql.format(`INSERT INTO interfaces (name, image, description, features) VALUES (?,?,?,?)`, [req.body.name, req.body.image, req.body.description, req.body.features.toString()])
		}
	}

	//Delete an interface from the database
	if (req.body.type == 'InterfaceDelete'){
		queryString = sql.format(`DELETE FROM interfaces WHERE id_interface = ?`,[req.body.id_interface]);
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
			queryString = queryString = sql.format(`UPDATE networks SET name = ?, image = ?, description = ?, id_feature = ? WHERE id_network = ?;`, [req.body.name, req.body.image, req.body.description, req.body.id_feature, req.body.id_network])
		} else {
			//Add new feature
			queryString = sql.format(`INSERT INTO networks (name, image, description, id_feature) VALUES (?,?,?,?)`, [req.body.name, req.body.image, req.body.description, req.body.id_feature])
		}
	}

	//Update the feature a network is associated with
	if (req.body.type == 'NetworkFeature'){
		//Update existing feature
		queryString = queryString = sql.format(`UPDATE networks SET id_feature = ? WHERE id_network = ?;`, [req.body.id_feature, req.body.id_network])
	}

	//Assigns a network to a System Interface
	//For mappingModal_addButton()
	if (req.body.type == 'NetworkToSystemInterface'){
		queryString = sql.format(`INSERT INTO SINMap (id_SIMap, id_network) VALUES (?,?);`,[req.body.id_SIMap, req.body.id_network]);        
	}

	//Delete a network from a system interface
	if (req.body.type == 'DeleteNetworkFromInterface'){
		queryString = sql.format(`DELETE FROM SINMap WHERE id_SINMap = ?`,[req.body.id_SINMap]);
	}	

	//******************************** Feature ****************************************
	if (req.body.type == 'Feature'){
		if (req.body.id_feature) {
			//Update existing feature
			queryString = sql.format(`UPDATE features SET name = ?, description = ? WHERE id_feature = ?;`, [req.body.name, req.body.description, req.body.id_feature]);
		} else {
			//Add new feature
			queryString = sql.format(`INSERT INTO features (name, description) VALUES (?,?);`, [req.body.name, req.body.description]);
		}
	}

	//Delete a feature
	if (req.body.type == 'DeleteFeature'){
		queryString = sql.format(`DELETE FROM features WHERE id_feature = ?`,[req.body.id_feature]);
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
			res.json(result) 
		})
		.catch((err) => {
			debug(1,err);
			if (debugLevel == 7){
				res.json({msg: 'There was an error executing the query (update.json)', err: err})
			} else {
				res.json({msg: 'There was an error executing the query (update.json)'})
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