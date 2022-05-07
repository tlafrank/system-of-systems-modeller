const { format } = require('./db');
const sql = require('./db');

let debugLevel = 2;

var outputText = '';

//Debug function local to the methods in this file
function debug(level, msg){
	if (debugLevel >= level){
        console.log(msg);
    }
}

const tableList = ['systems','subsystems','SIMap','SINMap','features','interfaces','interfaceIssues','issues','networks','parties','SSMap','quantities','dataExchanges'];

exports.run = (req,res) => {
	debug(1, `select.js debug level: ${debugLevel}`);


    outputText = `USE db_sosm;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;\n\n`

	getTableInserts(req,res);



	//Build the queries
	/*
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
*/
}


var getTableInserts = async (req,res) => {

	for (var i = 0; i < tableList.length; i++){
		outputText += `-- Data for table '${tableList[i]}'\n`
		outputText += `LOCK TABLES \`${tableList[i]}\` WRITE;\n`
		outputText += `/*!40000 ALTER TABLE \`${tableList[i]}\` DISABLE KEYS */;\n`
		outputText += `INSERT INTO \`${tableList[i]}\` VALUES `;

		const result = await executeQuery(`SELECT * FROM ${tableList[i]};`);
		for (var j = 0; j<result.length; j++){
			outputText += `(`;
			for (const property in result[j]) {
				switch (typeof result[j][property]){
					case 'number':
						outputText += `${result[j][property]},`;
					break;
					case 'string':
						outputText += JSON.stringify(`${result[j][property]}`) + ',';
					break;
					case 'object':
						if (result[j][property] === null){
							outputText += `NULL,`
							break;
						}
						
					default:
						debug(2,`Default case shouldn't be reached due to typeof ${typeof result[j][property]} for ${result[j][property]}`)
				}

			}
			outputText = `${outputText.substring(0, outputText.length - 1)}),`;			
			
		}
		outputText = outputText.substring(0, outputText.length - 1) + ';\n';
		outputText += `/*!40000 ALTER TABLE \`${tableList[i]}\` ENABLE KEYS */;\n`
		outputText += `UNLOCK TABLES;\n\n`;	

	}


	outputText += `
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
`

	res.type('text/plain')
	res.send(outputText)
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
