const db = require('./db-adapter');
const { format } = db;

let debugOn = false;
debugOn = true;

function debug(msg){
	if (debugOn){
		console.log(msg);
	}
}

exports.run = (req,res) => {
    debug(req.body);

    var queryString = [];
    
    //Build the queries
    queryString.push('SELECT * FROM subsystems ORDER BY name;');
    queryString.push('SELECT * FROM interfaces ORDER BY name;');
    queryString.push('SELECT * FROM features;');
    queryString.push('SELECT networks.*, features.name AS featureName FROM networks LEFT JOIN features ON networks.id_feature = features.id_feature;');
    queryString.push('SELECT subsystems.name AS subsystemName, interfaces.name AS interfaceName, isProposed FROM SIMap, subsystems, interfaces WHERE subsystems.id_subsystem = SIMap.id_subsystem AND interfaces.id_interface = SIMap.id_interface;');
    queryString.push('SELECT id_SIMap, id_network FROM SINMap;');
    queryString.push('SELECT * FROM graphSettings;');
    queryString.push('SELECT subsystems.name, quantities.year, quantities.quantity FROM quantities LEFT JOIN subsystems ON quantities.id_subsystem = subsystems.id_subsystem;');
    




    Promise.all([
    executeQuery(queryString[0]), 
    executeQuery(queryString[1]), 
    executeQuery(queryString[2]), 
    executeQuery(queryString[3]),
    executeQuery(queryString[4]),
    executeQuery(queryString[5]),
    executeQuery(queryString[6]),
    executeQuery(queryString[7]),
    
    ])
        .then((result) => {
            
            var responseText = '';
            //subsystems table
            var table = result[0]
            table.forEach((element) => {
                responseText += `INSERT INTO subsystems (name, image, description, tags) VALUES ('${element.name}','${element.image}','${element.description}', '${element.tags}');\r\n`
            })

            //Interfaces
            table = result[1]
            table.forEach((element) => {
                responseText += `INSERT INTO interfaces (name, image, description, features) VALUES ('${element.name}','${element.image}','${element.description}','${element.features}');\r\n`
            })

            //Features
            table = result[2]
            table.forEach((element) => {
                responseText += `INSERT INTO features (name, description) VALUES ('${element.name}','${element.description}');\r\n`
            })

            //Networks
            table = result[3]
            table.forEach((element) => {
                responseText += `INSERT INTO networks (name, image, description, id_feature) VALUES ('${element.name}','${element.image}','${element.description}',(SELECT id_feature FROM features WHERE name = '${element.featureName}'));\r\n`
            })

            //subsystemInterfaceMap                                                                                                                                          ///Fix this when the same interface is used in the same subsystem
            table = result[4]
            table.forEach((element) => {
                responseText += `INSERT INTO SIMap (id_subsystem, id_interface, isProposed) VALUES ((SELECT id_subsystem FROM subsystems WHERE name = '${element.subsystemName}'),(SELECT id_interface FROM interfaces WHERE name = '${element.interfaceName}'), '${element.isProposed}');\r\n`
            })
            
            //SINMap
            table = result[5]
            table.forEach((element) => {
                responseText += `INSERT INTO SINMap (id_SIMap, id_network) VALUES ('${element.id_SIMap}','${element.id_network}');\r\n`
            })

            //graphSettings
            table = result[6]
            table.forEach((element) => {
                responseText += `INSERT INTO graphSettings (keyName, value) VALUES ('${element.keyName}','${element.value}');\r\n`
            })

			//graphSettings
			table = result[7]
			table.forEach((element) => {
				responseText += `INSERT INTO quantities (id_subsystem, year, quantity) VALUES ((SELECT id_subsystem FROM subsystems WHERE name = '${element.name}'),${element.year},${element.quantity});\r\n`
			})

            res.type('text/plain')
            res.send(responseText)
        })
        .catch((err) => {
            console.log(err)
            res.json({err: 'There was an error executing the query (backup.txt)'})
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
