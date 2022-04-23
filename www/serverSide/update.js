const { format } = require('./db');
const sql = require('./db');

let debugOn = false;
debugOn = true;

//Subsystem controller
function debug(msg){
	if (debugOn){
		console.log(msg);
	}
}

exports.switch = (req,res) => {
    debug(req.body);

    var queryString;


	//******************************** Subsystem ****************************************
	if (req.body.type == 'Subsystem'){
		if (req.body.id_subsystem > 0) {
			//Update existing feature
			queryString = sql.format(`UPDATE subsystems SET name = ?, image = ?, description = ?, tags = ?, reference = ? WHERE id_subsystem = ?;`, [req.body.name, req.body.image, req.body.description,
				req.body.tags, req.body.reference, req.body.id_subsystem]);
		} else {
			//Add new feature
			queryString = sql.format(`INSERT INTO subsystems (name, image, description, tags, reference) VALUES (?,?,?,?,?);`, [req.body.name, req.body.image, req.body.description, req.body.tags, req.body.reference]);
		}
	}

    //******************************** Interface ****************************************
    if (req.body.type == 'Interface'){
        if (req.body.id_interface > 0) {
            debug('Req body: ' + req.body.features)
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

    //******************************** Subsystem Interface ****************************************
    //Assigns an interface to a subsystem
    if (req.body.type == 'InterfaceToSubsystem'){
        queryString = sql.format(`INSERT INTO SIMap (id_interface, id_subsystem) VALUES (?,?);`,[req.body.id_interface, req.body.id_subsystem]);        
    } 

	//Delete an interface from a subsystem
	if (req.body.type == 'DeleteInterfaceFromSubsystem'){
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

	//Assigns a network to a Subsystem Interface
	//For mappingModal_addButton()
	if (req.body.type == 'NetworkToSubsystemInterface'){
		queryString = sql.format(`INSERT INTO SINMap (id_SIMap, id_network) VALUES (?,?);`,[req.body.id_SIMap, req.body.id_network]);        
	}

	//Delete a network from a subsystem interface
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
        queryString = sql.format('DELETE FROM quantities WHERE id_subsystem = ?;', [req.body.id_subsystem]);
        req.body.years.forEach((element) => {
			queryString += sql.format(`INSERT INTO quantities (id_subsystem, year, quantity) VALUES (?,?,?);`, [req.body.id_subsystem, element.year, element.quantity]);
		})
	}


	//******************************** Settings ****************************************
	if (req.body.type == 'Settings'){
		queryString = 'TRUNCATE TABLE graphSettings;';
		req.body.settings.forEach((element) => {
			queryString += sql.format(`INSERT INTO graphSettings (keyName, value) VALUES (?,?);`, [element.keyName, element.value]);
		})
        
    }


    //******************************** Issues ****************************************
	if (req.body.type == 'Issue'){
        switch (req.body.subtype){
            case 'SubsystemInterface':
                if (req.body.id_issue > 0){
                    //Is an update
                    queryString = sql.format(`UPDATE issues SET type = 'SubsystemInterface', id_type = ?, name = ?, severity = ?, issue = ?, resolution = ?  WHERE id_issue = ?;`, [req.body.id_SIMap, req.body.name, req.body.severity, req.body.issue, 
                        req.body.resolution, req.body.id_issue]);
                } else {
                    //Is a new record
                    queryString = sql.format(`INSERT INTO issues (type, id_type, name, severity, issue, resolution) VALUES ('SubsystemInterface', ?,?,?,?,?);`, [req.body.id_SIMap, req.body.name, req.body.severity, req.body.issue, 
                        req.body.resolution]);
                }
            break;
            case 'Interface':

            break;
            default:
                    debug('req.body.type of ' + req.body.subtype + ' was unknown in update.json for expected type of Issue')
        }
    }

    debug(queryString);
    execute;

    var execute = executeQuery(queryString)
        .then((result) => { 
            res.json(result) 
        })
        .catch((err) => {
            console.log(err)
            if (debugOn){
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