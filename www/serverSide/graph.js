const { format } = require('./db');
const sql = require('./db');
const Subsystem = require('./Subsystem');

let debugOn = false;
debugOn = true;


//Debug function local to the methods in this file
function debug(msg){
	if (debugOn){
		console.log(msg);
	}
}

exports.switch = (req,res) => {
    //debug(req.body);
	debug('graph.js req.body.type: ' + req.body.type)

    var queryString = [];

	//const subsystem = new Subsystem();




    //******************************** Graph ****************************************
    //Gets the nodes for the graph


	//Get all the subsystems requested by the user
	queryString[0] = sql.format(`SELECT id_subsystem, name, image, tags FROM subsystems`);
	var includedTags = [];
	var excludedTags = [];

	debug(2 * Boolean(req.body.includedFilterTag) + Boolean(req.body.excludedFilterTag))

	switch (2 * Boolean(req.body.includedFilterTag) + Boolean(req.body.excludedFilterTag)){
		case 3:
			//Both included and excluded tags have been provided
			includedTags = req.body.includedFilterTag.split(',');
			excludedTags = req.body.excludedFilterTag.split(',');
			queryString[0] += sql.format(` WHERE (`);
			includedTags.forEach((element) => {
				queryString[0] += sql.format(`tags LIKE ? OR `, ['%' + element + '%']);
			})
			queryString[0] = queryString[0].substring(0, queryString[0].length - 4);
			queryString[0] += ') AND NOT (';
			excludedTags.forEach((element) => {
				queryString[0] += sql.format(`tags LIKE ? OR `, ['%' + element + '%']);
			})
			queryString[0] = queryString[0].substring(0, queryString[0].length - 4);
			queryString[0] += ');';
			break;
		case 2:
			//Only included tags have been provided
			includedTags = req.body.includedFilterTag.split(',');
			queryString[0] += sql.format(` WHERE`);
			includedTags.forEach((element) => {
				queryString[0] += sql.format(` tags LIKE ? OR`, ['%' + element + '%']);
			})
			queryString[0] = queryString[0].substring(0, queryString[0].length - 3);
			break;
		case 1:
			//Only excluded tags have been provided
			excludedTags = req.body.excludedFilterTag.split(',');
			queryString[0] += sql.format(` WHERE`);
			excludedTags.forEach((element) => {
				queryString[0] += sql.format(` tags NOT LIKE ? AND`, ['%' + element + '%']);
			})
			queryString[0] = queryString[0].substring(0, queryString[0].length - 3);
			break;
		case 0:
			//No tags have been provided
			queryString[0] += ';'
		default:
	}

	
	//Produce the query to get the quantitiy of subsystems
	queryString[1] = sql.format(`SELECT * FROM quantities ORDER BY id_subsystem;`);

	var subsystemsArr = [];
	var subsystemsIdArr = [];
	var quantities = [];
	var interfacesArr = [];
	var SIIdArr = [];
	var networksArr = [];
	var statsObj = {};

	Promise.all([
	executeQuery(queryString[0]), //Subsystem table
	executeQuery(queryString[1]), //Quantities table
	])
		.then((result) => {
			//Create a new subsystem object for each row of the subsystems table, remove those subsystem objects
			//which are not available the current year and get the list of subsystem interfaces from the database

			//Loop through the subsystems table, creating a new Subsystem object for each row
			result[0].forEach(element => {

				//Loop through and build the quantity/years object for each subsystem
				quantities = [];

				for (var i = 0; i < result[1].length; i++ ){
					if (result[1][i].id_subsystem == element.id_subsystem){
						quantities.push({
							year: result[1][i].year, 
							quantity: result[1][i].quantity,
						});
					}
				}
				//debug('quantities for: ' + element.name)
				//debug(quantities)

				//Create a new subsystem object in the subsystemsArr
				subsystemsArr.push(new Subsystem(element, quantities, req.body.showInterfaces))
			});

			//debug(subsystemsArr[1].qtyYears);

			//Prune the subsystemsArr for any subsystems which do not exist in the given year
			for (var i = 0; i < subsystemsArr.length; i++){

				//debug(`i: ${i}, subsystemsArr[i].name: ${subsystemsArr[i].name}`);
				//debug(subsystemsArr[i].qtyYears);
				
				//Check if the subsystem exists in the current year
				if (subsystemsArr[i].presentInYear(req.body.year)){
					//Store id_subsystem for the next query
					subsystemsIdArr.push(subsystemsArr[i].id_subsystem);
				} else {
					//Remove the object from the array
					debug('Removing ' + subsystemsArr[i].name)
					subsystemsArr.splice(i,1);
					i--;
				}
			}

			//Check if there are no subsystems to display
			if (subsystemsIdArr.length == 0){
				debug('subsystemsIdArr is 0')
				return new Promise((resolve,reject) => {
					reject({msg: 'There are no subsystems available for the given year, given filter terms.'})
				})
			} else {
				//Get only the subsystem interfaces which belong to subsystems which are available in the current year
				return executeQuery(sql.format(`
					SELECT * FROM interfaces;
					SELECT SIMap.id_SIMap, SIMap.id_subsystem, interfaces.id_interface, interfaces.name, interfaces.image, SIMap.isProposed
					FROM SIMap 
					LEFT JOIN interfaces ON interfaces.id_interface = SIMap.id_interface
					WHERE SIMap.id_subsystem IN (?)
					ORDER BY SIMap.id_subsystem;`, [subsystemsIdArr]))
			}

		})
		.then((result) => {
			//Create an interfaces table for capturing the quantity of interfaces available and 
			//add each subsystem interface to the respective subsystem and fetch their associated networks.

			//Loop through the interfaces table, creating a new Interface object for each row
			interfacesArr = [];

			result[0].forEach((element) => {
				interfacesArr.push({
					id_interface: element.id_interface,
					name: element.name,
					quantity: 0,
					subsystems: []
				})
			})

			//Loop through the subsystem interfaces table and add the interfaces to the respective subsystem
			//Additionally, add the quanitity of subsystems available in this year to interfacesArr
			result[1].forEach((element) => {
				//debug(element);

				//For next query, track the SI's which are used in this year
				SIIdArr.push(element.id_SIMap);

				for (var i = 0; i < subsystemsArr.length; i++){
					if (subsystemsArr[i].id_subsystem == element.id_subsystem){
						//Add the subsystems interface
						subsystemsArr[i].interfaces.push({
							id_SIMap: element.id_SIMap,
							id_interface: element.id_interface,
							name: element.name,
							image: element.image,
							isProposed: element.isProposed,
							networks: [],
							issues: [],
						})

						//Update interfacesArr total quantity, as well as an array to track which subsystems the interface is installed within
						for (var j = 0; j < interfacesArr.length; j++){
							if (interfacesArr[j].id_interface == element.id_interface){
								//found the matching generic interface
								interfacesArr[j].quantity += subsystemsArr[i].qtySubsystemsThisYear;
								interfacesArr[j].subsystems.push(element.id_subsystem)
								break;
							}
						}
					}
				}
			})

			//Prune interfacesArr for any interfaces which are not available in the current year
			for (var i = 0; i < interfacesArr.length; i++){
				
				if (interfacesArr[i].quantity == 0 ){
					//Remove the interface object from the array
					interfacesArr.splice(i,1);
					i--;
				}
			}

			//debug(interfacesArr)

			//Return the networks associated with the subsystem interfaces
			return executeQuery(sql.format(`
				SELECT SINMap.id_SIMap, SINMap.id_network, networks.name, networks.image
				FROM SINMap
				LEFT JOIN networks
				ON SINMap.id_network = networks.id_network;`, [SIIdArr]))
		})
		.then((result) => {

			//Add the network to the subsystem interface

			//debug(result)


			//Loop through SIN records, assigning them to every SI, if they match
			result.forEach((element) => {

				//Track if the network is used in this year
				var flag = false;

				//Loop through every subsystem
				for (var i=0; i < subsystemsArr.length; i++){

					//Loop through every SI
					for (var j=0; j < subsystemsArr[i].interfaces.length; j++){
						//Setup a SIN object for the SI
						//subsystemsArr[i].interfaces[j].networks = [];

						//Assign the network to the SI
						if (subsystemsArr[i].interfaces[j].id_SIMap == element.id_SIMap){
							//debug('Assigning network to SI: ' + element.id_SIMap)
							subsystemsArr[i].interfaces[j].networks.push({
								id_network: element.id_network,
								//name: element.name,
								//image: element.image,
							})
							flag = true;
						}
					}
				}

				//If the network is used, add to networkArr so the node can be created							//Dumb: SIN records contain multiple versions of the same network. But works
				if (flag){
					networksArr.push({
						id_network: element.id_network,
						name: element.name,
						image: element.image,
					})
				}

			})

			//Return the issues associated with Subsystem Interfaces
			return Promise.all([
				executeQuery(sql.format(`
				SELECT subsystems.id_subsystem, issues.*
				FROM issues
				LEFT JOIN SIMap
				ON SIMap.id_SIMap = issues.id_type
				LEFT JOIN subsystems
				ON SIMap.id_subsystem = subsystems.id_subsystem
				WHERE id_type IN (?) AND type = 'SubsystemInterface';`, [SIIdArr])), //SubsystemInterface issues
				executeQuery(sql.format(`SELECT * FROM interfaces;
				
				`,[])), //Quantities table
				])


			return executeQuery(sql.format(`
			SELECT subsystems.id_subsystem, issues.*
			FROM issues
			LEFT JOIN SIMap
			ON SIMap.id_SIMap = issues.id_type
			LEFT JOIN subsystems
			ON SIMap.id_subsystem = subsystems.id_subsystem
			WHERE id_type IN (?) AND type = 'SubsystemInterface';`, [SIIdArr]))
		})
		.then((result) => {	//Handle SubsystemInterface issues

			//debug(result);

			


			//Go through each subsystem
			subsystemsArr.forEach((subsystemElement) => {
				//Go through the subsystem's interfaces
				subsystemElement.interfaces.forEach((interfaceElement) => {
					//Go through Subsystem Interface issues
					result[0].forEach((issueElement) => {
						if (issueElement.id_subsystem == subsystemElement.id_subsystem){
												
							if (issueElement.id_type == interfaceElement.id_SIMap){
								//Issue is a match to this subsystem interface
								interfaceElement.issues.push(
									{
										severity: issueElement.severity,
										name: issueElement.name
									})
							}
						}
					})

					//Go through Interface issues
				})
			})


			//Save each issue to statsObj
			statsObj.issues = {}
			statsObj.issues.subsystemInterfaces = [];
			
			result[0].forEach((element) => {
				statsObj.issues.subsystemInterfaces.push(element.id_issue)
			})



	//*************************************** Response to client *******************************************************/
			var responseArr = []

			//Produce the network nodes																		//Need to look more closely how thi works
			networksArr.forEach((element) => {
				responseArr.push({
					group: 'nodes',
					data: {
						id: 'node_n_' + element.id_network,
						id_network: element.id_network,
						nodeType: 'Network',
						name: element.name,
						filename: './images/' + element.image,
					},
					classes: 'network'
				})
			})

			
			//Produce the subsystem nodes and edges (links)
			subsystemsArr.forEach((element) => {
				responseArr = responseArr.concat(element.getCyObject());
			})

			//Build an array of stats to assist with other info
			statsObj.interfaceCounts = interfacesArr;

			debug("responsing to client");
			

			//Respond to the client
			res.send([responseArr,statsObj])
		})
		.catch((err) => {
			console.log(err)
			if (err.msg == 'No subsystems'){
				res.json({data: {}});
			} else {
				res.json({err: 'There was an error executing the query'})
			}
		});
}


var executeQuery = (queryString) => new Promise((resolve,reject) => {
	//Submit the query to the database
	queryString = queryString.trim();
	let re = /\n\s\s+/gi;
	queryString = queryString.replace(re,'\n\t')
	debug('Query:  ' + queryString);
	sql.query(queryString, (err,res) => {
		if (err) { 
            reject(err);
        }
		resolve(res);
	})    
}) 
