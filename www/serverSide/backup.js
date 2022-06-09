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

const tableList = [
	'systems',
	'technologies',
	'interfaces',
	'networks',
	'SIMap',
	'SINMap',
	'TIMap',
	'quantities',
	'interfaceIssues',
	'issuesToSystemsMap',
	'classes',
	'systemClassMap',
	'tags',
	'dataExchanges',
	'organisation',
	'OMap',
	'OSMap',
	'SMap'
];

exports.run = (req,res) => {
	debug(1, `backup.js debug level: ${debugLevel}`);


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

}


var getTableInserts = async (req,res) => {

	for (var i = 0; i < tableList.length; i++){


		const result = await executeQuery(`SELECT * FROM ${tableList[i]};`);
		if (result.length > 0){

			outputText += `-- Data for table '${tableList[i]}'\n`
			outputText += `LOCK TABLES \`${tableList[i]}\` WRITE;\n`
			outputText += `/*!40000 ALTER TABLE \`${tableList[i]}\` DISABLE KEYS */;\n`
			outputText += `INSERT INTO \`${tableList[i]}\` VALUES `;

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
		} else {

			outputText += `-- Table '${tableList[i]}' contains no data.\n\n`
		}

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
