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
						stats: {}
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

				case '':
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
				case 'buildGraphObject_system': //Prepare and add system data to the graph
					if ((typeof element.displayIf === 'undefined') || (sosm.display[element.displayIf])){
						result.forEach((node) => {	
							var tempNode = {}
							tempNode.group = 'nodes'
							tempNode.data = {}
							tempNode.classes = ''
							element.fields.forEach((field) => {
								var str = '';
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
								tempNode.data[field.nodeName] = str;
							})
							
							//Handle classes
							if (element.classes){
								element.classes.forEach((className) => {
									tempNode.classes += className + ' ';
								})
							}
							sosm.nodes[element.sosmNodeName].push(tempNode)
						})						
					}

					break;
				case 'buildGraphObject_interfaces':

					if(sosm.display.interfaces){//Show Interface nodes
						result.forEach((element2) => {
							//Elements
							var tempNode = {}
							tempNode.group = 'nodes'
							tempNode.data = {
								id: 'node_si_' + element2.id_SIMap,
								idNo: element2.id_SIMap,
								id_system: element2.id_system,
								id_SIMap: element2.id_SIMap,
								nodeType: 'SystemInterface',
								name: element2.name,
								filename: './images/' + element2.image,
							}
							sosm.nodes.interfaces.push(tempNode)

							//Edges
							tempNode = {}
							tempNode.group = 'edges'
							tempNode.data = {
								id: 'edge_s_si_' + element2.id_SIMap,
								idNo: element2.id_SIMap,
								source: 'node_s_' + element2.id_system,
								target: 'node_si_' + element2.id_SIMap,
								lineColor: 'black'
							}
							sosm.nodes.edges.push(tempNode)
						})
					}

					break;
				case 'buildGraphObject_links':
					result.forEach((element2) => {
						//debug(1, sosm.display.primaryLinks, sosm.display.alternateLinks,element2.linkCategory == 'primary',element2.linkCategory == 'alternate')
						if((sosm.display.primaryLinks && element2.linkCategory == 'primary') || (sosm.display.alternateLinks && element2.linkCategory == 'alternate')){	
							//debug(1, element2.linkCategory)
							//Link nodes
							var tempNode = {}
							tempNode.group = 'nodes'
							tempNode.data = {
								id: 'node_n_' + element2.id_network,
								id_network: element2.id_network,
								nodeType: 'Link',
								name: element2.name,
								filename: './images/' + element2.image,
							}
							tempNode.classes = 'network'
							sosm.nodes.links.push(tempNode)


							//Link edges
							tempNode = {}
							tempNode.group = 'edges'
							tempNode.data = {
								idNo: element2.id_network,
								id_network: element2.id_network,
								target: 'node_n_' + element2.id_network,
								//name: element.designation,
							}

							if(sosm.display.interfaces){//Show Interface nodes
								tempNode.data.id = 'edge_si_' + element2.id_SIMap + '_n_' + element2.id_network
								tempNode.data.source = 'node_si_' + element2.id_SIMap
							} else { //No interface nodes
								tempNode.data.id = 'edge_s_' + element2.id_SIMap + '_n_' + element2.id_network
								tempNode.data.source = 'node_s_' + element2.id_system
							}
				
							//Handle colours
							tempNode.data.lineColor = 'black'
							if (element2.technologyCategory !== null){
								tempNode.data.lineColor = technologyCategory.find(x => x.value === element2.technologyCategory).color
							}
				
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
				
							
							sosm.nodes.edges.push(tempNode)
						}						
					})

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


/*



*/
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
		cy.on('tap', 'node', (evt) => { nodeSelected(evt.target); })

		//Event: Node is dropped in graph/
		//position info is undefined in the event for some reason, was hoping to use this to store position information in localStorage
		//cy.on('free', 'node', (evt) => { debug(1, evt); })

		//Event: Node in graph selected
		cy.on('tap', 'edge', (evt) => { edgeSelected(evt.target); })
	}
}



//To copy & remove


// sosmSystemData = result[0];
// sosmSystemInterfaceData = result[1];
// sosmNetworkData = result[2];
// sosmStats = result[3];
// sosmNetworkStats = result[4];
// sosmQuantities = result[5];


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

