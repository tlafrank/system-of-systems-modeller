function getExportQueryObject(){
	
	return  testExportObject

}



/** 
 * @desc Used to export data from SOSM, based on the instructions in the exports table
 *  
*/
async function exportSosmData(definition){
	debug(5, 'In exportSosmData()')

	var fileDetails = {
		filetype: 'xlsx',
		defaultFilename: 'sosm',
	}
	var exportObject
	var outputArr = []
	var supportingData = {}

	//Get and parse the query from the server
	if (definition === undefined){
		//Use the test export object
		exportObject = getExportQueryObject()

	} else {
		//Get the export object from the server
		var temp = await executeQuery({type: 'SingleExport', id_export: definition.id_export})
		exportObject = temp.exportObject
	}
	
	for (var i = 0; i < exportObject.length; i++){
		await prepareServerApproach(outputArr, exportObject[i], supportingData)
	}

	//Produce output file
	debug(5, 'outputArr', outputArr)

	debug(5,`Outputting ${fileDetails.filetype} file`)

	var workbook = XLSX.utils.book_new()
	var worksheet = XLSX.utils.aoa_to_sheet(outputArr)

	XLSX.utils.book_append_sheet(workbook,worksheet, "SOSM")
	XLSX.writeFile(workbook, `${fileDetails.defaultFilename}.${fileDetails.filetype}`, {bookType: fileDetails.filetype})
}




/** 
 * @desc Produces the row for the output file
 * 
 * @param {*} outputArr 
 * @param {*} instruction 
 * @param {*} fileDetails 
 * @returns 
 */
async function prepareServerApproach(outputArr, instruction, supportingData){
	debug(2, 'in prepareServerApproach()')
	debug(5, {instruction: instruction})
	debug(5,{supportingData: supportingData})
	
	let queryResult = [null]

	//Check if there should be a database query
	if (instruction.type){
		//debug(5, 'there is a query for this instruction')
		var postData = {type: instruction.type}

		instruction.postData.forEach((element) => {
			//debug(5, element)
			switch (element.source){
				case 'constant':
					//debug(5, 'element.value is', element.value)
					postData[element.name] = element.value
					break;
				case 'definition':
					postData[element.name] = 10
					break;
				case 'selectedNode':
				case 'currentFocus': //Gets the required value from the node which has focus
					postData[element.name] = selectedNode[element.selectedNodeName]
					break;
				case 'sosmObject':
					postData[element.name] = sosm[element.sosmObjectName]
					break;
				case 'previousResult':
					postData[element.name] = supportingData[element.columnName]
					break;
			}
		})

		if (instruction.wrapResultInArray){
			queryResult = [await executeQuery(postData)]
		} else {
			queryResult = await executeQuery(postData)
		}
		

		//Add data from the previous query to queryResult
	}

	await processRow(outputArr, queryResult, instruction, supportingData)
}


/**
 * @desc 
 * 
 * 
 * @param {*} outputArr 
 * @param {*} queryResult 
 * @param {*} instruction 
 */
async function processRow(outputArr, queryResult, instruction, supportingData){
	//Commence processing
	debug(2, 'In processRow()'), 
	debug(5, {outputArr: outputArr.toString()})
	debug(5, {queryResult: queryResult})
	debug(5, {instruction: instruction})
	
	//Initilise outputArr, if not already
	if (outputArr.length == 0){outputArr.push([])}

	let index = 0

	//Loop through the queryresult, performing the action described by each instruction on each row
	for (var i = 0; i < queryResult.length; i++ ){
		debug(5, 'in query loop')

		//Loop through each instruction
		for (var j = 0; j < instruction.row.length; j++ ){
			//debug(5,'Processing instruction', instruction.row[j], 'for', queryResult[i])
			//debug(5, 'Index is ' + index)
			
			//Handle indexes (extends the length of the last array in outputArr if an index is specified)
			if (instruction.row[j].index){
				index = instruction.row[j].index
				while (outputArr[outputArr.length - 1].length < index){outputArr[outputArr.length - 1].push('')}
			} else {
				//index = outputArr[outputArr.length - 1].length - 1
			}

			//Carry out the instruction
			switch (instruction.row[j].action){
				case 'constant':
					outputArr[outputArr.length - 1][index] = instruction.row[j].value
					break;
				case 'addFixedRow':
					//Reset outputArr[outputArr.length - 1]
					index = 0
					instruction.row[j].values.forEach((value) => {
						outputArr[outputArr.length - 1].push(value)
					})
					break;
				case 'basicQuery':
					var value = ''
					if(queryResult[i][instruction.row[j].columnName] === undefined || queryResult[i][instruction.row[j].columnName] === null){
						value = instruction.row[j].default
					} else {
						value = queryResult[i][instruction.row[j].columnName]
					}
				
					//Handle indexes here
					outputArr[outputArr.length - 1][index] = value
					break;
				case 'formattedQuery':
					var formatArr = []
					instruction.row[j].columnNames.forEach((column) => {
						formatArr.push(queryResult[i][column])
					})
					outputArr[outputArr.length - 1][index] = buildFormattedString(instruction.row[j].format, formatArr)
					break;
				case 'multipleResultWithSubquery':

					//Prepare object to store data from the current query in
					instruction.row[j].toNextQueryResult.forEach((columnName) => {
						//Determine what to pass to the server for the next query, or those values which need to be added to the next row (via the queryResult)
						supportingData[columnName] = queryResult[i][columnName]
						
					})

					await prepareServerApproach(outputArr, instruction.row[j], supportingData)
					
					break;
				case 'ifMatch':
					if (queryResult[i][instruction.row[j].column.name] === instruction.row[j].column.valueToMatch){
						if (queryResult[i][instruction.row[j].columnNameOfValue] === null){
							outputArr[outputArr.length - 1][index] = instruction.row[j].default
						} else {
							outputArr[outputArr.length - 1][index] = queryResult[i][instruction.row[j].columnNameOfValue]
						}
					}
					break;
				case 'currentIndextoSupportingDataObject':
					supportingData[instruction.row[j].name] = outputArr[outputArr.length - 1][instruction.row[j].index]
					break;
				case 'fromSupportingDataObject':
					outputArr[outputArr.length - 1][instruction.row[j].index] = supportingData[instruction.row[j].name]
					break;
				case 'pushRow':
					outputArr.push([])
					index = 0
					break;
				case 'ifCellMatches':

					if (queryResult[i][instruction.row[j].columnName] == instruction.row[j].matches){
						debug(5, 'Matched in ifCellMatches with ' + instruction.row[j].matches)
						await processRow(outputArr, [queryResult[i]], instruction.row[j].instructions, supportingData)
					}
					break;
				case 'paramResult':
					outputArr[outputArr.length - 1][instruction.row[j].index] = queryResult[i].paramsArr[instruction.row[j].paramIndex]
					
					break;
				case 'time':
					var date

					if (queryResult[i][instruction.row[j].columnName] == null){
						date = 'Not Recorded'
					} else {
						date = new Date(queryResult[i][instruction.row[j].columnName]).toLocaleString()
					}

					outputArr[outputArr.length - 1][instruction.row[j].index] = date
					break;
					
			}
		}
	}
}

async function executeQuery(postData){
	debug(5, `Getting '${postData.type}' from the server (select.json):`)
	
	return await $.post('select.json', postData, (result) => {
		debug(3, postData, result);

		if (result.msg){
			//An error was passed
			//definition.message = {info: 'failure', msg: `There was an error. Check the console.`};
			//definition.continue = false;
		} else {
			return result
		}
	})
}