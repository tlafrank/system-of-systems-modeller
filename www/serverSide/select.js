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
	debug(1, `select.js debug level: ${debugLevel} req.body.type: ${req.body.type}`);

	var queryString;

	//Get all subsystems
	if (req.body.type == 'Subsystems'){
		queryString = sql.format(`SELECT * FROM subsystems ORDER BY name;`)
	}

	//Get the mapping of subsystems to systems
	if (req.body.type == 'SubsystemMap'){
		queryString = sql.format(`SELECT * FROM SSMap WHERE id_system = ?;`, req.body.id_system)
	}

	//Get all data exchanges
	if (req.body.type == 'DataExchange'){
		queryString = sql.format(`SELECT * FROM dataExchanges ORDER BY name;`)
	}

	//Get all unique tags
	if (req.body.type == 'TagList'){
		//Build the query
		queryString = sql.format(`SELECT tag FROM tags GROUP BY tag ORDER BY tag;`)
	}	

	//******************************** System ****************************************

	//Get all systems, or a specific one
	if (req.body.type == 'System'){
		//Build the query
		if (req.body.id_system){ //id_system has been provided
			//Get system details
			queryString = sql.format(`SELECT * FROM systems WHERE id_system = ?;`,[req.body.id_system])			
		} else { //No id_system provided
			queryString = sql.format(`SELECT * FROM systems ORDER BY name;`)
		}
	}

	//Get a specific system without tags																							//Copy of 'System'
	if (req.body.type == 'SystemNoTags'){
		debug(1, '************************************************* Select.json SystemNoTags was called and is redundant.')
		//Build the query
		if (req.body.id_system){ //id_system has been provided
			//Get system details
			//queryString = sql.format(`SELECT * FROM systems WHERE id_system = ?;`,[req.body.id_system])
		}
	}



	//Get a list of systems which implement a particular interface
	//For: updateIssuesModal()
	if (req.body.type == 'SystemsWithSpecificInterface'){
		queryString = sql.format(`
		SELECT systems.id_system, systems.name
		FROM systems
		LEFT JOIN SIMap
		ON systems.id_system = SIMap.id_system
		LEFT JOIN interfaces
		ON SIMap.id_interface = interfaces.id_interface
		WHERE interfaces.id_interface = ?
		GROUP BY id_system;`, req.body.id_interface)
	}

	//******************************** Technologies ****************************************

	//Get all technologies in alphabertical order
	if (req.body.type == 'Technologies'){
		//Build the query
		queryString = sql.format(`SELECT * FROM technologies ORDER BY name;`)
	}


	//Get all technologies implemented by a given interface
	if (req.body.type == 'AssignedTechnologies'){
		//Build the query
		queryString = sql.format(`SELECT * 
		FROM technologies
		LEFT JOIN TIMap
		ON TIMap.id_technology = technologies.id_technology
		WHERE TIMap.id_interface = ?
		ORDER BY name;`, req.body.id_interface)
	}

	
	if (req.body.type == 'CompatibleFeatures'){																	//CFD
		//Build the query
		queryString = sql.format(`SELECT interfaces.features AS features
		FROM SIMap
		LEFT JOIN interfaces
		ON SIMap.id_interface = interfaces.id_interface
		WHERE id_SIMap = ?;`, [req.body.id_SIMap])
	}

	//******************************** Interfaces ****************************************



	//Get all interfaces, or a specific one
	if (req.body.type == 'Interface'){
		//Build the query
		queryString = sql.format(`SELECT * FROM interfaces`)
		if (req.body.id_interface) { queryString += sql.format(' WHERE id_interface = ?',[req.body.id_interface])}
		queryString += ' ORDER BY name;';
	}

	//
	if (req.body.type == 'SystemInterface'){ 
		//Build the query
		debug(1, '************************************************* Select.json SystemInterface was called. Value to be determined.')
		queryString = sql.format(`
			SELECT systems.id_system, systems.name AS systemName, systems.image AS systemImage, SIMap.id_SIMap, SIMap.isProposed, SIMap.description,
				interfaces.id_interface, interfaces.name AS interfaceName, interfaces.image AS interfaceImage, interfaces.features
			FROM systems
			INNER JOIN SIMap ON systems.id_system = SIMap.id_system
			INNER JOIN interfaces ON SIMap.id_interface = interfaces.id_interface
			WHERE SIMap.id_SIMap = ?;`,[req.body.id_SIMap])

	}

	//Get the list of all interfaces attached to a supplied id_system
	if (req.body.type == 'SystemInterfaces'){ 
		//Build the query
		queryString = sql.format(`
			SELECT SIMap.id_SIMap AS id_SIMap, SIMap.id_interface, interfaces.name, interfaces.image
			FROM SIMap
			LEFT JOIN interfaces
			ON SIMap.id_interface = interfaces.id_interface
			WHERE SIMap.id_system = ?;`,[req.body.id_system])
	}

	//******************************** Network ****************************************

	//Get all networks, or a specific one
	if (req.body.type == 'Network'){
		if (req.body.id_network) { 
			queryString = sql.format('SELECT networks.*, technologies.name AS technologyName FROM networks LEFT JOIN technologies ON networks.id_technology = technologies.id_technology WHERE networks.id_network = ?',[req.body.id_network])
		} else { //No id_network provided
			queryString = sql.format(`SELECT networks.*, technologies.name AS technologyName FROM networks LEFT JOIN technologies ON networks.id_technology = technologies.id_technology ORDER BY networks.name;`)
		}
	}

	//Returns the list of networks which are matched to the technologies implemented by a given system interface (id_SIMap)
	if (req.body.type == 'CompatibleNetworks'){
		queryString = sql.format(`
		SELECT *
		FROM networks
		WHERE id_technology IN	
			(SELECT id_technology
			FROM SIMap
			LEFT JOIN interfaces
			ON SIMap.id_interface = interfaces.id_interface
			LEFT JOIN TIMap
			ON interfaces.id_interface = TIMap.id_interface
			WHERE id_SIMap = ?);`, [req.body.id_SIMap])

		queryString += sql.format(`SELECT SINMap.*, networks.name FROM SINMap LEFT JOIN networks ON SINMap.id_network = networks.id_network WHERE SINMap.id_SIMap = ? AND (category='primary' OR category IS NULL);`, [req.body.id_SIMap])
		queryString += sql.format(`SELECT SINMap.*, networks.name FROM SINMap LEFT JOIN networks ON SINMap.id_network = networks.id_network WHERE SINMap.id_SIMap = ? AND category='alternate';`, [req.body.id_SIMap])
		queryString += sql.format(`SELECT SINMap.*, networks.name FROM SINMap LEFT JOIN networks ON SINMap.id_network = networks.id_network WHERE SINMap.id_SIMap = ? AND category='incapable';`, [req.body.id_SIMap])
	}

	//Returns networks which are already assigned to the System Interface
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


	if (req.body.type == 'InterfaceIssues'){
		queryString = sql.format(`SET @id_interface = ?;`, req.body.id_interface)

		if (req.body.id_interfaceIssue == 0){
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


	}

	if (req.body.type == 'BasicIssues'){
		//Build the query
		switch (req.body.subtype){
			case 'SystemInterface':
				queryString = sql.format(`SELECT * FROM issues WHERE type = 'SystemInterface' AND id_type = ?;`, [req.body.id_SIMap])
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
			case 'SystemInterface':
				queryString = sql.format(`SELECT issues.*, interfaces.image AS interfaceImage, interfaces.name AS interfaceName, systems.name AS systemName, systems.image AS systemImage, systems.id_system
				FROM issues
				LEFT JOIN SIMap
				ON issues.id_type = SIMap.id_SIMap
				LEFT JOIN interfaces
				ON SIMap.id_interface = interfaces.id_interface
				LEFT JOIN systems
				ON SIMap.id_system = systems.id_system
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
			case 'SystemInterface':
				queryString = sql.format(`SELECT interfaces.image AS interfaceImage, interfaces.name AS interfaceName, systems.name AS systemName, systems.image AS systemImage, systems.id_system
				FROM SIMap
				LEFT JOIN systems
				ON SIMap.id_system = systems.id_system
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
			case 'SystemInterface':
				queryString = sql.format(`SELECT systems.name AS systemName, issues.severity, interfaces.name AS interfaceName, issues.name AS issueName, issues.issue, issues.resolution, interfaces.description, issues.id_issue, systems.id_system, SIMap.id_SIMap
				FROM issues
				LEFT JOIN SIMap
				ON issues.id_type = SIMap.id_SIMap
				LEFT JOIN interfaces
				ON SIMap.id_interface = interfaces.id_interface
				LEFT JOIN systems
				ON SIMap.id_system = systems.id_system
				WHERE issues.type = 'SystemInterface' AND id_issue IN (?)
				ORDER BY systems.name;`, [req.body.id_issueArr])
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
		queryString = sql.format(`SELECT interfaces.image AS interfaceImage, interfaces.name AS interfaceName, systems.name AS systemName, systems.image AS systemImage, systems.id_system
		FROM SIMap
		LEFT JOIN systems
		ON SIMap.id_system = systems.id_system
		LEFT JOIN interfaces
		ON SIMap.id_interface = interfaces.id_interface
		WHERE id_SIMap = ?;`, [req.body.id_SIMap])

	}

	if (req.body.type == 'QtyYears'){
		//Build the query
		queryString = sql.format(`SELECT *
		FROM quantities
		WHERE quantities.id_system = ?
		ORDER BY quantities.year;`, [req.body.id_system])
	}

	if (!queryString){ res.json({msg: 'There was an error executing the query (select.json)', err: 'No queryString was developed.'}) }

	queryString = queryString.trim();
	let re = /\n\s\s+/gi;
	queryString = queryString.replace(re,'\n\t')

	debug(2,'Query:  ' + queryString);
	execute;

	var execute = executeQuery(queryString)

		.then((result) => { 
			res.json(result) 
		})
		.catch((err) => {
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
	sql.query(queryString, (err,res) => {
		if (err) { 
			reject(err);
		}
		resolve(res);
	})    
}) 
