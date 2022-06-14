var sosm

async function commonGraph(definition){
	debug(1, 'In commonGraph with definition', definition)


	$('#nodeDetailsTable').empty();
	$('#pageTitle').text(`SOS Model ${parseInt(localStorage.getItem('activeYear'))}`)


	
	for(var i = 0; i < graph[definition.graph].iterations.length; i++){

		const postData = {}

		graph[definition.graph].iterations[i].beforeServerInstructions.forEach((element) => {
			switch (element.action){
				case 'resetSosmObject':
					sosm = {
						nodes: {
							systems: [],
							interfaces: [],
							links: [],
							edges: [],
							test: [],
						},
						display: {
							interfaces: false,
							primaryLinks: false,
							alternateLinks: false,
							compoundSystems: false,
						},
						stats: {},
					}
					if(localStorage.getItem('positions') !== null){
						sosm.positions = JSON.parse(localStorage.getItem('positions'))
					}
					break;
				case 'toServer_fromLocalStorage_int':
					postData[element.columnName] = parseInt(localStorage.getItem(element.sourceName))
					break;
				case 'toServer_fromLocalStorage_arr':
					var arr = JSON.parse(localStorage.getItem(element.sourceName))
					if (arr.length > 0){postData[element.columnName] = arr}
					break;
				case 'setSosmDisplay_fromLocalStorage':
					if (localStorage.getItem(element.sourceName) == 1){ sosm.display[element.sosmDisplayName] = true }
					break;
				case 'toServer_fromSosmObject':
					postData[element.columnName] = sosm[element.sosmName]
				break;
				case 'toServer_fromDefinition':
					postData[element.columnName] = definition[element.definitionName]
				break;

				case 'toServer_fromObject':
					postData[element.columnName] = true;
				break;
				case '':
				break;

				case '':
				break;
				case '':
				break;

				case '':
				break;
				case 'debug':
					debug(1, 'Debug:', element.message)
					break;
				default:
					debug(1, `Made it to commonGraph() beforeServerInstructions switch default with ${element.action}. Element:`, element)
			}
		})

		if (graph[definition.graph].iterations[i].url){ var url = graph[definition.graph].iterations[i].url} else { var url = 'graph'}
		if (typeof graph[definition.graph].iterations[i].queryType !== 'undefined'){
			var result;
			postData.type = graph[definition.graph].iterations[i].queryType
			debug(1, `Getting '${postData.type}' from the server (${url}.json):`)
			await $.post(`${url}.json`, postData, (result2) => {
				debug(2, postData, result2);

				if (result2.msg){
					//An error was passed
					
				} else {
					result = result2
				}
			})
		}
		


		graph[definition.graph].iterations[i].afterServerInstructions.forEach((element) => {
			switch (element.action){
				case 'buildGraphObject_nodes': //Prepare and add nodes to the graph
					if (checkConditions(element.conditions)){
						result.forEach((node) => {
							var tempNode = {}
							tempNode.group = 'nodes'
							tempNode.data = {}
							tempNode.classes = ''
							element.fields.forEach((field) => {
								var str = '';
								if(typeof field.format !== 'undefined'){
									field.format.forEach((format) => {
										if (node[format.columnName] !== null){	
											if (format.leadingText){
												str += format.leadingText
											}
											if (format.columnName){
												str += node[format.columnName]
											}
										}
									})									
								} else {
									switch(field.nodeName){
										case 'lineColor': //Handle node border colours
											str = 'grey'
											if (typeof node[field.columnName] !== 'undefined' && node[field.columnName] != null ){
												str = categories[field.constantName].find(x => x.value == node[field.columnName]).color
											}											
											break;
										default:
									}									
								}
								tempNode.data[field.nodeName] = str;
							})
							
							//Handle classes
							if (element.classes){
								element.classes.forEach((className) => {
									tempNode.classes += className + ' ';
								})
							}
							//Handle existing position
							if (element.position){
								if(sosm.positions.find(x => x.id == tempNode.data.id)){
									tempNode.position = sosm.positions.find(x => x.id == tempNode.data.id).position
								}
							}
							sosm.nodes[element.sosmNodeName].push(tempNode)
						})						
					}

					break;
				case 'buildGraphObject_edges':
					//debug(1, 'Checking', element.conditions)
					if (checkConditions(element.conditions)){
						//debug(1, 'executing')
						result.forEach((edge) => { //Iterate through each edge in the result
							var tempEdge = {};
							tempEdge.group = 'edges';
							tempEdge.data = {};
							
							element.fields.forEach((field) => { //Handle the build of each property required for the cy graph
								var str = '';
								field.format.forEach((format) => {
									if (edge[format.columnName] !== null){
										if (format.leadingText){
											str += format.leadingText
										}
										if (format.columnName){
											str += edge[format.columnName]
										}
									}
								})
								//debug(1, edge)
								tempEdge.data[field.nodeName] = str;
							})
							
							//Line colours
							tempEdge.data.lineColor = 'black'
							if (typeof edge.technologyCategory !== 'undefined'){
								tempEdge.data.lineColor = categories.technology.find(x => x.value == edge.technologyCategory).color
							}
							
							//Handle classes
							if (element.classes){
								element.classes.forEach((className) => {
									tempEdge.classes += className + ' ';
								})
							}

							sosm.nodes[element.sosmNodeName].push(tempEdge);
						})
					}



					break;


				case 'buildGraphObject_links':

//Handle link category
switch (element2.linkCategory){
	case 'primary':
		break;
	case 'alternate':
	case 'incapable':			//Shouldnt be returned, precautionary
	default:
		tempNode.classes += ' dashed';					
}

//Handle classes
if(element.designation){
	tempNode.data.name = element.designation
	if(element.designation.substring(1,2) == 'J'){
		tempNode.classes += ' class3';
	}
}
										
					
					break;
				case 'buildGraphObject_parents':
					result.forEach((element2) => {
			
						//Elements
						var tempNode = {}
						tempNode.group = 'nodes'
						tempNode.classes = 'subordinateSystem small'
						tempNode.data = {
							id: 'node_p_' + element2.parent,
							idNo: element2.id_SMap,
							id_system: element2.id_system,
							id_SMap: element2.id_SMap,
							nodeType: 'System',
							name: element2.name,
							filename: './images/' + element2.image,
						}
						sosm.nodes.interfaces.push(tempNode)

						//Edges
						tempNode = {}
						tempNode.group = 'edges'
						tempNode.data = {
							id: 'edge_c_p_' + element2.id_SMap,
							idNo: element2.id_SMap,
							source: 'node_s_' + element2.child,
							target: 'node_p_' + element2.parent,
							lineColor: 'black'
						}
						sosm.nodes.edges.push(tempNode)
						
					})	

					break;
				case 'getDataFromSosmObject': //Get all the system ID's which are represented in sosm.nodes.systems
					sosm[element.sosmName] = []
					sosm.nodes[element.sosmNodesName].forEach((node) => {
						sosm[element.sosmName].push(node.data[element.dataId])
					})
					//debug(1,'getSystemIds', sosm[element.sosmName])
					break;
				case 'getDataFromResult': //Get all the system ID's which are represented in sosm.nodes.systems
					sosm[element.sosmName] = []
					result.forEach((node) => {
						if(!sosm[element.sosmName].includes(node[element.columnName])){
							sosm[element.sosmName].push(node[element.columnName])
						}
						
					})
					//debug(1,'getSystemIds', sosm[element.sosmName])
					break;
				case 'getComplexDataFromResult'://Improve before reusing (for multiple defs)
					sosm[element.sosmName] = []
					result.forEach((node) => {
						var res = {}
						res[element.columnName1] = node[element.columnName1]
						res[element.columnName2] = node[element.columnName2]
						sosm[element.sosmName].push(res)
					})
					//debug(1,'getSystemIds', sosm[element.sosmName])

					break;
				case 'buildSummaryObject_interfaces':
					debug(1, 'In buildSummaryObject_interfaces')
					sosm.stats.interfaces = [];
					var lastInterfaceId = 0;
					for (var i = 0; i < result.length; i++){
						debug(1, result[i])
						if (result[i].id_interface > lastInterfaceId){//First occurrance of a new interface
							lastInterfaceId = result[i].id_interface

							//Add to the stats object
							var tempObj = {
								id_interface: lastInterfaceId, 
								name: result[i].interfaceName,
								systemsCount: 1,
								totalInterfaces: result[i].qtySystems * result[i].qtyEachSystem,
								systems: [{
									id_system: result[i].id_system,
									name: result[i].systemName
								}]
							}
							sosm.stats.interfaces.push(tempObj)
						} else { //Additional occurrances of the same interface
							sosm.stats.interfaces[sosm.stats.interfaces.length - 1].systemsCount ++;
							sosm.stats.interfaces[sosm.stats.interfaces.length - 1].totalInterfaces += result[i].qtySystems * result[i].qtyEachSystem;
							sosm.stats.interfaces[sosm.stats.interfaces.length - 1].systems.push({id_system: result[i].id_system, name: result[i].systemName})
						}
					}


					break;
				case 'buildIssuesObject':
					sosm.issues = []
					var interfaceId = 0;
					var issueId = 0;
					var issuesTracker = 0;
					var issueId = 0;
					var j = -1;

					

					//Reorganise the data to make table loading easier
					for (var i = 0; i < result.length; i++){
						if (result[i].id_interface > interfaceId){ //New interface entry
							interfaceId = result[i].id_interface

							sosm.issues.push({ 
								id_interface: result[i].id_interface, 
								name: result[i].interfaceName, 
								issues: [] })
						
							//Reset counters
							issueId = 0;
							issuesTracker = -1;
							j++;
						}

						if(result[i].id_interfaceIssue > issueId){ //Add new issue to interface
							issueId = result[i].id_interfaceIssue;

							sosm.issues[j].issues.push({
								id_interfaceIssue: result[i].id_interfaceIssue,
								id_interface: result[i].id_interface,
								name: result[i].issueName,
								issue: result[i].issue,
								resolution: result[i].resolution,
								severity: result[i].severity,
								systems: [],
								quantityAffected: 0
							})

							//Reset counters
							issuesTracker++;
						}

						if (result[i].id_system != null){ //No issues recorded against this interface
							sosm.issues[j].issues[issuesTracker].systems.push({id_system: result[i].id_system, name: result[i].systemName})
							if (result[i].quantity > 0){
								sosm.issues[j].issues[issuesTracker].quantityAffected += parseInt(result[i].quantity)	
							}			
						}
					}

					break;
				case 'buildInterfaceChartObject':
					if(typeof sosm.charts === 'undefined'){ sosm.charts = {} }
					if(typeof sosm.charts.labels === 'undefined'){ sosm.charts.labels = [] }
					if(typeof sosm.charts.interfaces === 'undefined'){ sosm.charts.interfaces = [] }
				
					sosm.charts.interfaces.push({x: definition.year})
					sosm.charts.interfacesSeen = []
					sosm.charts.labels.push(definition.year)

					result.forEach((element) => {
						sosm.charts.interfaces[sosm.charts.interfaces.length-1][element.name] = element.interfaceQty;
						if(!sosm.charts.interfacesSeen.includes(element.id_interface)){sosm.charts.interfacesSeen.push(element.id_interface);}
					})

					break;
				case 'buildInterfaceChartObject_2':
					var colorIndex = 0;
					if (typeof sosm.charts.datasets === 'undefined'){ sosm.charts.datasets = []};
					result.forEach((element) => {
						if (sosm.charts.interfacesSeen.includes(element.id_interface)){
							sosm.charts.datasets.push({
								label: element.name,
								data: sosm.charts.interfaces,
								borderColor: getColor(colorIndex),
								parsing: { yAxisKey: element.name }
							})	
							colorIndex++;					
						}
					})




				/*



								*/
				break;
case '':
break;
case '':
break;
case '':
break;
case '':
break;
				case 'debug':
					debug(1, 'Debug:', element.message)
					break;			
				default:
					debug(1, `Made it to commonGraph() afterServerInstructions switch default with ${element.action}. Element:`, element)
			}
		})
	}
	
	debug(1, 'SOSM', sosm)


	//Build the graph visualisation
	if(!definition.headless){
		//Setup the graph 
		cy = cytoscape({
			container: $("#cy"),
			style: cyStyle,
			wheelSensitivity: localStorage.getItem('zoomSensitivity') //Required for scroll wheel on laptop to work. Reason unknown.
		})

		//Add all components
		cy.add(sosm.nodes.systems);
		cy.add(sosm.nodes.interfaces);
		cy.add(sosm.nodes.links);
		cy.add(sosm.nodes.edges);

		//Draw the graph

		cy.layout(cyLayout()).run();
		

		selectedNode = new Node();

		//Event: Node in graph selected
		cy.on('tap', 'node', (evt) => { 
			debug(1, evt.target._private.data)
			nodeSelected(evt.target); 
		})

		//Event: Node is dropped in graph/
		//position info is undefined in the event for some reason, was hoping to use this to store position information in localStorage
		cy.on('free', 'node', (evt) => { 
			//debug(1, evt)
			//debug(1,evt.target._private.position)
			//debug(1,evt.target._private.data.nodeType)
			
			if(localStorage.getItem('snapToGrid') == 1){ //Snap to grid (setting to be configured later)
				evt.target._private.position.x = Math.round(evt.target._private.position.x/200) * 200
				evt.target._private.position.y = Math.round(evt.target._private.position.y/200) * 200
			}

			if(localStorage.getItem('graphLayoutName') == 'preset'){ //Only set positions if set to preset
				debug(1,`${evt.target._private.data.id} is free, position will be logged`)

				//Create the object if it doesnt already exist
				if(typeof sosm.positions === 'undefined'){
					sosm.positions = [];
				}

				//Store dropped position
				var index = -1;
				if(sosm.positions.find(x => x.id == evt.target._private.data.id)){ //Position already reported, change existing object
					//debug(1, 'Already exists, updating');
					index = sosm.positions.findIndex(x => x.id == evt.target._private.data.id);
					sosm.positions[index].position = evt.target._private.position;

				} else { //Doesnt exist
					//debug(1, `Doesn't exist, creating`)
					sosm.positions.push({
						nodeType: evt.target._private.data.nodeType,
						id: evt.target._private.data.id,
						position: evt.target._private.position,
					})
				}
				savePositions()
				//debug(1, 'sosm posn:', sosm.positions)				
			}
		})

		//Event: Edge in graph selected
		cy.on('tap', 'edge', (evt) => { 
			//debug(1, evt.target)
			edgeSelected(evt.target); 
		})
	}
}






function checkConditions(conditions){
	var execute = false;
	//if ((typeof element.displayIf === 'undefined') || (sosm.display[element.displayIf])){
	conditions.forEach((condition) => {
		switch (condition.type){
			case 'alwaysRun':
				execute = true;
				break;
			case 'checkLocalStorage':
				if(parseInt(localStorage.getItem(condition.localStorageName)) === 1){ execute = true }
				break;
			case '!checkLocalStorage':
				if(parseInt(localStorage.getItem(condition.localStorageName)) === 0){ execute = true }
				break;
			default:
				debug(1, `Switch default. Shouldn't make it here in checkConditions()`);
		}
	})
	//debug(1, 'checkConditions() result is ' + execute)
	return execute
}


//Depricated
function newCyX(){
	


	//Pruning
	if (localStorage.getItem('pruneEdgeLinks') == 1){
		sosmNetworkStats.forEach((element) => {
			if (element.qtyConnections == 1){
				for (var i = 0; i<sosmNetworkData.length; i++){
					
					if (sosmNetworkData[i].id_network == element.id_network){
						
						//Remove the element from the array
						debug(1, 'removing', element)
						sosmNetworkData.splice(i,1);
						i--;
						
					}
				}	
			}
		})		
	}
}