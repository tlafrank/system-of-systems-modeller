const { format } = require('./db');
const sql = require('./db');

let debugOn = false;
debugOn = true;

function debug(msg){
	if (debugOn){
		console.log(msg);
	}
}

exports.switch = (req,res) => {
    debug('Type is: ' + req.body.type);

    var queryString;

    //******************************** Subsystem ****************************************

    //Get all subsystems, or a specific one
    //For: nodeSelected()
    if (req.body.type == 'Subsystem'){
        //Build the query
        queryString = sql.format(`SELECT * FROM subsystems`)
        if (req.body.id_subsystem) { 
            queryString += sql.format(' WHERE id_subsystem = ?',[req.body.id_subsystem])
        }
        queryString += ' ORDER BY name;';
    }

    //******************************** Features ****************************************

    //Get all features in alphabertical order
    //Used to populate the add/update interface and network modals
	if (req.body.type == 'Features'){
		//Build the query
		queryString = sql.format(`SELECT * FROM features ORDER BY name;`)
	}

	if (req.body.type == 'CompatibleFeatures'){
		//Build the query
		queryString = sql.format(`SELECT interfaces.features AS features
		FROM SIMap
		LEFT JOIN interfaces
		ON SIMap.id_interface = interfaces.id_interface
		WHERE id_SIMap = ?;`, [req.body.id_SIMap])
	}

    //******************************** Interfaces ****************************************

    //For: nodeSelected()
    if (req.body.type == 'Interface'){
        //Build the query
        queryString = sql.format(`SELECT * FROM interfaces`)
        if (req.body.id_interface) { queryString += sql.format(' WHERE id_interface = ?',[req.body.id_interface])}
        queryString += ' ORDER BY name;';
    }

    //
    //For: nodeSelected(),
    if (req.body.type == 'SubsystemInterface'){ 
        //Build the query

		queryString = sql.format(`
            SELECT subsystems.id_subsystem, subsystems.name AS subsystemName, subsystems.image AS subsystemImage, SIMap.id_SIMap, SIMap.isProposed, SIMap.description,
				interfaces.id_interface, interfaces.name AS interfaceName, interfaces.image AS interfaceImage, interfaces.features
			FROM subsystems
            INNER JOIN SIMap ON subsystems.id_subsystem = SIMap.id_subsystem
            INNER JOIN interfaces ON SIMap.id_interface = interfaces.id_interface
            WHERE SIMap.id_SIMap = ?;`,[req.body.id_SIMap])

    }

	//Get the list of all interfaces attached to the subsystem
	if (req.body.type == 'SubsystemInterfaces'){ 
        //Build the query
        queryString = sql.format(`
			SELECT SIMap.id_SIMap AS id_SIMap, SIMap.id_interface, interfaces.name, interfaces.image
			FROM SIMap
			LEFT JOIN interfaces
			ON SIMap.id_interface = interfaces.id_interface
			WHERE SIMap.id_subsystem = ?;`,[req.body.id_subsystem])  //id_SIMap was node_si
    }

    //******************************** Network ****************************************

    //For: nodeSelected()
    if (req.body.type == 'Network'){
        //Build the query
        queryString = sql.format(`SELECT networks.*, features.name AS featureName FROM networks LEFT JOIN features ON networks.id_feature = features.id_feature`)
        if (req.body.id_network) { queryString += sql.format(' WHERE networks.id_network = ?',[req.body.id_network])}
        queryString += ' ORDER BY networks.name;';
    }

    //Returns the list of networks which are matched to the features implemented by the particular interface
    //From: modals.mappingModal_interface()
    if (req.body.type == 'CompatibleNetworks'){
        //Build the query
        queryString = sql.format(`SELECT * FROM networks WHERE networks.id_feature IN (?);`, [req.body.features])
    }

    //Returns networks which are already assigned to the Subsystem Interface
    //From: mappingModal_interface()
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
			case 'SubsystemInterface':
				queryString = sql.format(`SELECT * FROM issues WHERE type = 'SubsystemInterface' AND id_type = ?;`, [req.body.id_SIMap])
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

   

	if (req.body.type == 'Issue'){
        //Build the query
		//queryString = sql.format(`SELECT * FROM issues WHERE id_issue = ?;`, [req.body.id_issue])


		switch (req.body.subtype){
			case 'SubsystemInterface':
				queryString = sql.format(`SELECT issues.*, interfaces.image AS interfaceImage, interfaces.name AS interfaceName, subsystems.name AS subsystemName, subsystems.image AS subsystemImage, subsystems.id_subsystem
				FROM issues
				LEFT JOIN SIMap
				ON issues.id_type = SIMap.id_SIMap
				LEFT JOIN interfaces
				ON SIMap.id_interface = interfaces.id_interface
				LEFT JOIN subsystems
				ON SIMap.id_subsystem = subsystems.id_subsystem
				WHERE id_issue = ?;`, [req.body.id_issue])
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



	if (req.body.type == 'IssueImages'){
        //Build the query
		switch (req.body.subtype){
			case 'SubsystemInterface':
				queryString = sql.format(`SELECT interfaces.image AS interfaceImage, interfaces.name AS interfaceName, subsystems.name AS subsystemName, subsystems.image AS subsystemImage, subsystems.id_subsystem
				FROM SIMap
				LEFT JOIN subsystems
				ON SIMap.id_subsystem = subsystems.id_subsystem
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
		switch (req.body.subtype){
			case 'SubsystemInterface':
				queryString = sql.format(`SELECT subsystems.name AS subsystemName, issues.severity, interfaces.name AS interfaceName, issues.name AS issueName, issues.issue, issues.resolution, interfaces.description, issues.id_issue, subsystems.id_subsystem, SIMap.id_SIMap
				FROM issues
				LEFT JOIN SIMap
				ON issues.id_type = SIMap.id_SIMap
				LEFT JOIN interfaces
				ON SIMap.id_interface = interfaces.id_interface
				LEFT JOIN subsystems
				ON SIMap.id_subsystem = subsystems.id_subsystem
				WHERE issues.type = 'SubsystemInterface' AND id_issue IN (?)
				ORDER BY subsystems.name;`, [req.body.id_issueArr])
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

	//******************Other**************** */

    if (req.body.type == 'Party'){
        //Build the query
        queryString = sql.format(`SELECT * FROM parties`)
        //if (req.body.id_type) { queryString += sql.format(` WHERE type = '${req.body.subType}' AND id_type = ?`, [req.body.id_type])}
        queryString += ';';
    }

	if (req.body.type == 'SIImages'){
		//Build the query
		queryString = sql.format(`SELECT interfaces.image AS interfaceImage, interfaces.name AS interfaceName, subsystems.name AS subsystemName, subsystems.image AS subsystemImage, subsystems.id_subsystem
		FROM SIMap
		LEFT JOIN subsystems
		ON SIMap.id_subsystem = subsystems.id_subsystem
		LEFT JOIN interfaces
		ON SIMap.id_interface = interfaces.id_interface
		WHERE id_SIMap = ?;`, [req.body.id_SIMap])

    }

	if (req.body.type == 'QtyYears'){
        //Build the query
        queryString = sql.format(`SELECT *
		FROM quantities
		WHERE quantities.id_subsystem = ?
		ORDER BY quantities.year;`, [req.body.id_subsystem])
    }


    //******************************** Graph Settings ****************************************
    if (req.body.type == 'graphSettings'){
        //Build the query
        queryString = sql.format(`SELECT * FROM graphSettings`)
    }


    //******************************** Test ****************************************
    /*
    if (req.body.type == 'test'){
        //Build the query
        queryString = sql.format(`SELECT * FROM graphSettings`)

        console.log(subsystemsArr)
    }
    */


    queryString = queryString.trim();
	let re = /\n\s\s+/gi;
	queryString = queryString.replace(re,'\n\t')

    debug('Query:  ' + queryString);
    execute;

    var execute = executeQuery(queryString)

        .then((result) => { 
            res.json(result) 
        })
        .catch((err) => {
            if (debugOn){
                res.json({msg: 'There was an error executing the query (select.json)', err: err})
                debug(err);
            } else {
                res.json({msg: 'There was an error executing the query (select.json)'})
            }
        });
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
