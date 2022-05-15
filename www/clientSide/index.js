//Global variables
var debugOn = false;
debugOn = true;

var debugLevel = 4;
var cy = cytoscape();
let selectedNode; //Holds the Node object which is selected by the user
let modal; //Holds the object to provide modal setup information and the Node object being built
let graphSettings; //Holds the object to track graph settings between sessions
let sosmSystemData, sosmSystemInterfaceData, sosmNetworkData, sosmStats, sosmNetworkStats, sosmQuantities;
let issuesData = [];


const imagePath = './images/'
var hideNodes = false; //Tracks whether a click on a node should remove it from the graph

$(document).ready(function(){
	graphSettings = new GraphSettings();
	pageSwitch();
  	selectedNode = new Node();
})

//Load the appropriate main pane data
function pageSwitch(page){
	debug(1,'In pageSwitch()')

	if (!page){
		if (sessionStorage.getItem('currentPage') === null){
			page = localStorage.getItem('defaultLandingPage');
		} else {
			page = sessionStorage.getItem('currentPage');
		}
	}
	
	//await getGraphData();

	switch (page){
		case 'graph':
			sessionStorage.setItem('currentPage', 'graph');
			$('#mainPaneContainer').empty();
			//Works: $('#mainPaneContainer').append(`<div class="row"><div class="col"><div id="cy" class="px-1"></div></div></div>`);
			$('#mainPaneContainer').append(`<div class="row"><div class="col"><div id="cy" class="px-1 w-100"></div></div></div>`);
			$('#pageTitle').text(`SOS Model ${parseInt(localStorage.getItem('activeYear'))}`)
			getGraphData(newCy);
		break;
		case 'summary':
			sessionStorage.setItem('currentPage', 'summary');
			$('#mainPaneContainer').empty();
			$('#pageTitle').text(`SOS Model Summary ${parseInt(localStorage.getItem('activeYear'))}`)
			getGraphData(listSummary);
		break;
		case 'issues':
			sessionStorage.setItem('currentPage', 'issues');
			$('#mainPaneContainer').empty();
			$('#pageTitle').text(`SOS Model Issues ${parseInt(localStorage.getItem('activeYear'))}`)
			getGraphData(listIssues);
		break;
		case 'charts':
			sessionStorage.setItem('currentPage', 'charts');
			$('#mainPaneContainer').empty();
			$('#pageTitle').text(`Summary Charts`)
			//getGraphData(charts);
			charts();
	}
}

function processInterfaceStats(){
	var interfaceStats = [];

	var lastInterfaceId = 0;
	for (var i = 0; i < sosmStats.length; i++){
		if (sosmStats[i].id_interface > lastInterfaceId) { //First occurrance of a new interface
			lastInterfaceId = sosmStats[i].id_interface

			//Add to the interfaceStats
			interfaceStats.push({
				id_interface: lastInterfaceId, 
				name: sosmStats[i].interfaceName,
				totalInterfaces: sosmStats[i].quantity * sosmStats[i].interfaceQtyPerIndividualSystem,
				systemsCount: 1,
				systems: [{
					id_system: sosmStats[i].id_system,
					name: sosmStats[i].systemName
				}]
			}); 
		} else { //Additional occurrances of the same interface
			//Update statsArr
			interfaceStats[interfaceStats.length - 1].systemsCount ++;
			interfaceStats[interfaceStats.length - 1].totalInterfaces += sosmStats[i].quantity * sosmStats[i].interfaceQtyPerIndividualSystem;
			if (interfaceStats[interfaceStats.length - 1].systems[interfaceStats[interfaceStats.length - 1].systems.length - 1].id_system != sosmStats[i].id_system){
				//Different system
				interfaceStats[interfaceStats.length - 1].systems.push({id_system: sosmStats[i].id_system, name: sosmStats[i].systemName})
			}
		}
	}

	return interfaceStats;
}

function listSummary(){
	debug(1,'listSummary()')

	//Process the stats
	displayTags('#mainPaneContainer');
	
	
	var table = `<table class="table table-sm table-striped"><thead>
	<tr>
		<th scope="col">Interface Name</th>
		<th scope="col">Quantity of Interfaces</th>
		<th scope="col">Number of different system types</th>
		<th scope="col">Systems implementing the interface</th>
	</tr>
	</thead>
	<tbody>`
	
	processInterfaceStats().forEach((element) => {
		table += `<tr>
			<td scope="row"><a href="#" onclick="updateInterfaceModal(${element.id_interface});">${element.name}</a></td>
			<td class="">${element.totalInterfaces}</td>
			<td>${element.systemsCount}</td><td>`
		element.systems.forEach((element2) => {
			table += systemButton(element2.id_system, element2.name)
		})	
		table += `</td></tr>`			
	})

	table += `</tbody></table>`

	$('#mainPaneContainer').append(table);
}

async function processIssues(){
	var interfaceId = 0;
	var issueId = 0;
	var reorganisedData = [];
	var issuesTracker = 0;
	var issueId = 0;
	var j = -1;

	const postData = {
		type: 'Issues',
		year: parseInt(localStorage.getItem('activeYear')),
	}

	await $.post('select.json', postData, (result) => {
		//debug(3,'Passed to select.json: ', postData);
		//debug(3,'Result: ', result)

		//Check the result
		if (result.msg){
			//An error was passed
		} else {

			//Reorganise the data to make table loading easier
			for (var i = 0; i < result.length; i++){
				if (result[i].id_interface > interfaceId){ //New interface entry
					interfaceId = result[i].id_interface

					reorganisedData.push({ 
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

					reorganisedData[j].issues.push({
						id_interfaceIssue: result[i].id_interfaceIssue,
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

				if (result[i].id_system != null){
					reorganisedData[j].issues[issuesTracker].systems.push({id_system: result[i].id_system, name: result[i].systemName})
					if (result[i].quantity > 0){
						reorganisedData[j].issues[issuesTracker].quantityAffected += parseInt(result[i].quantity)	
					}			
				}
			}

		}
		//debug(1, 'reorgd data', reorganisedData)
	})

	issuesData = reorganisedData;
}

async function listIssues(){
	debug(2, 'In listIssues()')

	displayTags('#mainPaneContainer');

	await processIssues();


	var severityText = '<h3>Severity Details</h3><ul>'

	labels.severity.forEach((element) => {
		severityText += `<li>${element.index} <strong>${element.label}</strong> ${element.description}</li>`
	})
	severityText += '</ul>'

	$('#mainPaneContainer').append(severityText);

	//Build the table
	var table = `<table class="table table-sm table-striped"><thead>
	<tr>
		<th scope="col" class="align-middle">Interface</th>
		<th scope="col" class="align-middle">Severity</th>
		<th scope="col" class="align-middle">Issue Title</th>
		<th scope="col" class="align-middle">Issue</th>
		<th scope="col" class="align-middle">Proposed Resolution</th>
		<th scope="col" class="align-middle">Qty Affected Interfaces</th>
		<th scope="col" class="align-middle">Affected Systems</th>
	</tr>
	</thead>
	<tbody>`

	issuesData.forEach((element) => {

		//Place the interface details into the table
		var rowspan = element.issues.length;
		if (rowspan == 0){ rowspan = 1 }

		table += `<tr><td rowspan="${rowspan}" class="align-middle"><a href="#" onclick="updateInterfaceModal(${element.id_interface})">${element.name}</a></td>`

		//Handle no issues
		if (element.issues.length == 0){
			table += `<td colspan="6" class="text-center align-middle"><a href="#" onclick="updateIssuesModal(${element.id_interface})">No issues recorded</a></td>`
		} else {
			element.issues.forEach((element2) => {
				if (element2.severity >= parseInt(localStorage.getItem('severityLevel'))){
					table += `<td class="text-center">${element2.severity}</td>`
					table += `<td><a href="#" onclick="updateIssuesModal(${element.id_interface},null,${element2.id_interfaceIssue})">${element2.name}</td>`
					table += `<td>${element2.issue}</td>`
					table += `<td>${element2.resolution}</td>`
					if (element2.quantityAffected == 0) {
						table += `<td>Nil</td>`
					} else {
						table += `<td>${element2.quantityAffected}</td>`
					}
					
					table += `<td>`
					element2.systems.forEach((element3) => {
						table += systemButton(element3.id_system, element3.name)
					})	
					table += `</td></tr>`
				} else {
					table += `<td colspan="6" class="text-center align-middle"><a href="#" onclick="updateIssuesModal(${element.id_interface})">Issue below the set severity threshold</a></td></tr>`
				}
			})
			table += `</tr>`
		}
	})

	table += `</tbody></table>`
	$('#mainPaneContainer').append(table);
}

async function charts(){
	debug(2, 'In charts()')

	displayTags('#mainPaneContainer');

	//Prepare the page

	$('#mainPaneContainer').append(`<h3 class="my-2">Total Interfaces Per Year (${parseInt(localStorage.getItem('yearMin'))} - ${parseInt(localStorage.getItem('yearMax'))})</h3>`);
	$('#mainPaneContainer').append(`<div class="my-1"><canvas id="chartInterfaces" width="200" height="500"></canvas></div>`);

	$('#mainPaneContainer').append(`<h3 class="my-5">Issues Map ${parseInt(localStorage.getItem('activeYear'))}</h3>`);
	$('#mainPaneContainer').append(`<div><canvas id="chartIssues" width="200" height="500"></canvas></div>`);

	//$('#mainPaneContainer').append(`<h3 class="my-5">Total Subsystems Per Year</h3>`);
	//$('#mainPaneContainer').append(`<div><canvas id="chartSubsystems" width="200" height="500"></canvas></div>`);

	//const cSubsystems = document.getElementById('chartSubsystems').getContext('2d');
	

	startYear = localStorage.getItem('yearMin');
	endYear = localStorage.getItem('yearMax');
	endYear++;
	var data = {}
	data.interfaces = []
	
	var labels = []
	var datasets = [];
	var colorIndex = 0;
	var interfacesSeen = [];

	//Get chart data for each year
	for (var i = startYear; i < endYear; i++){
		labels.push(i)
		
		postData = {
			type: 'InterfaceQuantitiesInYear',
			year: i,
			includedFilterTag: localStorage.getItem('includedFilterTag'),
			excludedFilterTag: localStorage.getItem('excludedFilterTag')
		}
		await $.post("chart.json", postData, (result) => {
			//debug('Passed to chart.json: ', postData);
			//debug('Response: ', result)

			if (result.msg){
				//An error was passed
				debug(1, 'error', result.msg)
				//updateSystemLinksModal(id_system,{info: 'failure', msg: `There was an error. Check the console.`}, id_SIMap);
			} else {
				//Interface data
				data.interfaces.push({x: i})
				result.forEach((element) => {
					data.interfaces[data.interfaces.length-1][element.name] = element.interfaceQty;
					interfacesSeen.push(element.id_interface);
				})
			}
		});
	}

	//Prune excess results from interfacesSeen
	interfacesSeen.sort();
	debug(1, 'interfacesSeen before', interfacesSeen)
	var tempArr = [interfacesSeen[0]];
	for (var i=0; i<interfacesSeen.length; i++){
		if (tempArr[tempArr.length - 1] != interfacesSeen[i]){
			tempArr.push(interfacesSeen[i]);
		}
	}
	interfacesSeen = tempArr;
	

	//Produce the interface chart
	postData2 = {
		type: 'Interface',
	}
	$.post("select.json", postData2, (result) => {
		//debug('Passed to select.json: ', postData2);
		//debug('Response: ', result)

		if (result.msg){
			//An error was passed
			debug(1, 'error', result.msg)
		} else {
			
			result.forEach((element) => {
				if (interfacesSeen.includes(element.id_interface)){
					datasets.push({
						label: element.name,
						data: data.interfaces,
						borderColor: getColor(colorIndex),
						parsing: { yAxisKey: element.name }
					})	
					colorIndex++;					
				}
			})
		}

		var chartInterfaces = {
			type: 'line',
			data: { labels: labels,	datasets: datasets }
		}
		chartInterfaces.options = {
			maintainAspectRatio: false,
			scales: { y: { beginAtZero: true } },
			plugins: { legend: { position: 'bottom'}}
		}
		const myChinterfaceChart = new Chart(document.getElementById('chartInterfaces').getContext('2d'), chartInterfaces)
		//debug(1,data)
	});

	//Produce the subsystems chart

	//Produce the issues chart
	issuesChartData = [];
	var issuesLabels = [];
	var colorIndex = 0;
	//issuesChartData = 

	await processIssues();

	//debug(1, 'issuesData', issuesData[0], issuesData[1])
	//debug(1, 'example chart data', datasets[0])

	issuesData.forEach((element) => { //Iterate through each interface
		//debug(1, element)
		issuesChartData.push({
			label: element.name,
			backgroundColor: getColor(colorIndex) + 'bb',
			data: []
		})

		//Color
		colorIndex++;

		//Produce graph data
		element.issues.forEach((element2) => { //Iterate through each issue within the interface
			//debug(1, element2)
			if (element2.severity > 0){
				issuesChartData[issuesChartData.length - 1].data.push({
					x: element2.quantityAffected,
					y: element2.systems.length,
					r: 20 * element2.severity,
					//Severity: element2.severity
				})						
			}
		})

	})
	
	debug(1, 'issuesLabels', issuesLabels)
	debug(1, 'data', issuesChartData)

	var chartIssues = {
		type: 'bubble',
		//data: issuesChartData
		data: { datasets: issuesChartData }
	}
	chartIssues.options = {
		maintainAspectRatio: false,
		//scales: { y: { beginAtZero: true } },
		scales: { 
			x: {title: {display: true, text: 'Quantity of Interfaces Affected'}},
			y: {title: {display: true, text: 'Quantity of Systems Affected'}}},
		plugins: { legend: { position: 'bottom'}}
	}
			
			
	const myIssueChart = new Chart(document.getElementById('chartIssues').getContext('2d'), chartIssues)
	
	
	
}

/**
 * @description Builds a new CY graph
 * 
 */
function newCy(){
	debug(1,'In newCy()')

	//Setup the graph 
	cy = cytoscape({ 
		container: $("#cy"),
		style: cyStyle,
		//wheelSensitivity: 0.4, //Required for scroll wheel on laptop to work. Reason unknown.
	});

	$('#nodeDetailsTable').empty();

	$('#pageTitle').text(`SOS Model ${parseInt(localStorage.getItem('activeYear'))}`)

	if (localStorage.getItem('showInterfaces') == 1){ var showInterfaces = true	} else { var showInterfaces = false }
	var showNetworkNodes = true;


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

	//Prepare and add system data to the graph
	var systemNodes = [];
	sosmSystemData.forEach((element) => {
		systemNodes.push({
			group: 'nodes',
			data: {
				id: 'node_s_' + element.id_system,
				idNo: element.id_system,
				id_system: element.id_system,
				nodeType: 'System',
				name: element.name,
				filename: './images/' + element.image,
			}, 
			classes: ''																			//Put classes here
		})
	})

	//Prepare and add interface data to the graph
	var interfaceNodes = [];
	if (showInterfaces){ //Display interfaces on the graph
		sosmSystemInterfaceData.forEach((element) => {
			interfaceNodes.push({ //Interface node
				group: 'nodes',
				data: {
					id: 'node_si_' + element.id_SIMap,
					idNo: element.id_SIMap,
					id_system: element.id_system,
					id_SIMap: element.id_SIMap,
					nodeType: 'SystemInterface',
					name: element.name,
					filename: './images/' + element.image,
				},
				classes: ''																				//Put classes here
			})

			interfaceNodes.push({ //S-SI edge
				group: 'edges',
				data: {
					id: 'edge_s_si_' + element.id_SIMap,
					idNo: element.id_SIMap,
					source: 'node_s_' + element.id_system,
					target: 'node_si_' + element.id_SIMap,
				},
				classes: ''																				//Put classes here
			})
		})
	}
	
	//Prepare and add network data to the graph
	var networkNodes = [];

	switch (2 * showInterfaces + 1 * showNetworkNodes){
		case 0: //Connect systems directly to each other (no interfaces nor network nodes)

		break;
		case 1: //Connect systems to network nodes (no interface nodes)
			addNetworkNodes();
			sosmNetworkData.forEach((element) => {
				networkNodes.push({
					group: 'edges',
					data: {
						id: 'edge_s_' + element.id_SIMap + '_n_' + element.id_network,
						idNo: element.id_network,
						id_network: element.id_network,
						source: 'node_s_' + element.id_system,
						target: 'node_n_' + element.id_network,
						//name: element.designation,
					},
					classes: 'blue'
				})
				
				//Handle classes
				if(element.designation){
					networkNodes[networkNodes.length-1].data.name = element.designation
					if(element.designation.substring(1,2) == 'J'){
						networkNodes[networkNodes.length-1].classes += ' class3';
					}
				}
			})
		break;
		case 2: //Connect interfaces directly to each other (no network nodes)

		break;
		case 3: //Connect interfaces to network nodes
			addNetworkNodes();
			sosmNetworkData.forEach((element) => {
				networkNodes.push({
					group: 'edges',
					data: {
						id: 'edge_si_' + element.id_SIMap + '_n_' + element.id_network,
						idNo: element.id_network,
						id_network: element.id_network,
						source: 'node_si_' + element.id_SIMap,
						target: 'node_n_' + element.id_network,
						//name: 'IF001',
					},
					classes: 'blue'																				//Put classes here
				})
				//Handle classes
				if(element.designation){
					networkNodes[networkNodes.length-1].data.name = element.designation
					if(element.designation.substring(1,2) == 'J'){
						networkNodes[networkNodes.length-1].classes += ' class3';
					}
				}
			})
		break;
		default:
			debug(1, `newCy switch default. Shouldn't make it here.`)
	}

	function addNetworkNodes(){
		//Add network nodes to the graph
		sosmNetworkData.forEach((element) => {
			networkNodes.push({
				group: 'nodes',
				data: {
					id: 'node_n_' + element.id_network,
					id_network: element.id_network,
					nodeType: 'Network',
					name: element.name,
					filename: './images/' + element.image,
				},
				classes: 'network'																			//Put classes here
			})
		})		
	}

	//Add all components
	//debug(1,systemNodes,interfaceNodes,networkNodes)
	cy.add(systemNodes);
	cy.add(interfaceNodes);
	cy.add(networkNodes);

	//Draw the graph
	cy.layout(graphSettings.getGraphLayout()).run();

	selectedNode = new Node();

	//Event: Node in graph selected
	cy.on('tap', 'node', (evt) => { nodeSelected(evt.target); })

	//Event: Node in graph selected
	cy.on('tap', 'edge', (evt) => { edgeSelected(evt.target); })
}

//Reset the Cy object
function resetCy(){
	debug(1,'In resetCy()');
	cy = cytoscape({
		container: $("#cy"),
		style: cyStyle,
		layout: JSON.parse(localStorage.getItem('graphLayout')),
		wheelSensitivity: 0.4, //Required for scroll wheel on laptop to work. Reason unknown.
	});
}


/**
 * Get SOSM data
 * 
 * @param callback
 */
function getGraphData(callback, year = parseInt(localStorage.getItem('activeYear'))){
	debug(1,'In getGraphData()');

	//Year of graph
	const postData = {
		type: 'GraphNodes',
		year: year,
		showInterfaces: localStorage.getItem('showInterfaces'),
		showIssues: localStorage.getItem('showIssues')
	}

	//Tag filters
	if (localStorage.getItem('includedFilterTag').length > 0){ postData.includedFilterTag = localStorage.getItem('includedFilterTag') }
	if (localStorage.getItem('excludedFilterTag').length > 0){ postData.excludedFilterTag = localStorage.getItem('excludedFilterTag') }

	$.post('/graph.json', postData, (result) => {
		debug(3,'Passed to graph.json:', postData);
		debug(3,'Response:', result)

		sosmSystemData = result[0];
		sosmSystemInterfaceData = result[1];
		sosmNetworkData = result[2];
		sosmStats = result[3];
		sosmNetworkStats = result[4];
		//sosmQuantities = result[5];

		if (callback) { callback() };
	})
}




