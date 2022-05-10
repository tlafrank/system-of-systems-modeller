//Global variables
var debugOn = false;
debugOn = true;

var debugLevel = 4;
var cy = cytoscape();
let selectedNode; //Holds the Node object which is selected by the user
let modal; //Holds the object to provide modal setup information and the Node object being built
let graphSettings; //Holds the object to track graph settings between sessions
let sosmSystemData, sosmSystemInterfaceData, sosmNetworkData, sosmStats;

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
			$('#mainPaneContainer').append(`<div class="row"><div class="col"><div id="cy" class="px-1"></div></div></div>`);
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
		case 'issues2':
			sessionStorage.setItem('currentPage', 'issues2');
			$('#mainPaneContainer').empty();
			$('#pageTitle').text(`SOS Model Issues 2 ${parseInt(localStorage.getItem('activeYear'))}`)
			getGraphData(listIssues2);
		break;
	}
}

function listSummary(){
	debug(1,'listSummary()')

	//Process the stats
	var lastInterfaceId = 0;
	const statsArr = [];
	for (var i = 0; i < sosmStats.length; i++){
		if (sosmStats[i].id_interface > lastInterfaceId) { //First occurrance of a new interface
			lastInterfaceId = sosmStats[i].id_interface

			//Add to the statsArr
			statsArr.push({interface_id: lastInterfaceId, name: sosmStats[i].interfaceName, totalInterfaces: sosmStats[i].quantity, systemsCount: 1}); 
		} else { //Additional occurrances of the same interface
			//Update statsArr
			statsArr[statsArr.length - 1].systemsCount ++;
			statsArr[statsArr.length - 1].totalInterfaces += sosmStats[i].quantity;

		}
	}
	debug(1, 'statsArr', statsArr)
	
	var table = `<table class="table table-sm table-striped"><thead>
	<tr>
		<th scope="col">Interface Name</th>
		<th scope="col">Quantity</th>
		<th scope="col">Number of different system types</th>
	</tr>
	</thead>
	<tbody>`
	
	statsArr.forEach((element) => {
		table += `<tr>
			<td scope="row"><a href="#" onclick="updateInterfaceModal({ id_interface: ${element.id_interface} });">${element.name}</a></td>
			<td class="">${element.totalInterfaces}</td>
			<td>${element.systemsCount}</td>
		</tr>`			
	})

	table += `</tbody></table>`

	$('#mainPaneContainer').append(table);
}

async function listIssues(){
	debug(2, 'listIssues()')

	const postData = {
		type: 'Issues',
		subtype: 'SystemInterface',
		id_issueArr: sosmStats.issues.systemInterfaces
	}

	$.post('select.json', postData, (result) => {
		debug(3,'Passed to select.json: ', postData);
		debug(3,'Result: ', result)

		//Check the result
		if (result.msg){
			//An error was passed
		} else {
		
			var table = `<table class="table table-sm table-striped"><thead>
			<tr>
				<th scope="col">System Name</th>
				<th scope="col">Severity</th>
				<th scope="col">Interface Name</th>
				<th scope="col">Issue</th>
				<th scope="col">Proposed Resolution</th>
			</tr>
			</thead>
			<tbody>`
			
			result.forEach((element) => {
				table += `<tr>
					<td scope="row"><a href="#" onclick="updateSystemModal(${element.id_system})">${element.systemName}</a></td>
					<td class="text-center">${severity(element.severity)}</td>
					<td><a href="#" onclick="updateSystemInterfacesModal({id_system: ${element.id_system}, id_SIMap: ${element.id_SIMap}})">${element.interfaceName}</a></td>
					<td><a href="#" onclick="updateIssuesModal({type: 'SystemInterface', id_SIMap: ${element.id_SIMap}, id_system: ${element.id_system}, id_issue: ${element.id_issue}})"><strong>${element.issueName}. </strong></a>${element.issue}</td>
					<td>${element.resolution}</td>
					
				</tr>`
			})
			table += `</tbody></table>`

			$('#mainPaneContainer').append(table);
		}

	})	

	var severity = (severity) => {
		switch (severity){
			case 'critical':
				return '<img src="./assets/critical.png" width="20">'
			break;
			case 'warning':
				return '<img src="./assets/warning.png" width="20">'
			break;
			case 'notice':
				return '<img src="./assets/notice.png" width="20">'
			break;
			
		}
	}
}

async function listIssues2(){
	debug(2, 'listIssues2()')

	const postData = {
		type: 'Issues2',
		subtype: 'SystemInterface',
		id_issueArr: sosmStats.issues.systemInterfaces
	}

	$.post('select.json', postData, (result) => {
		debug(3,'Passed to select.json: ', postData);
		debug(3,'Result: ', result)

		//Check the result
		if (result.msg){
			//An error was passed
		} else {
		
			var table = `<table class="table table-sm table-striped"><thead>
			<tr>
				<th scope="col">Severity</th>
				<th scope="col">Interface</th>
				<th scope="col">Issue</th>
				<th scope="col">Proposed Resolution</th>
				<th scope="col">Affected Systems</th>
			</tr>
			</thead>
			<tbody>`
			
			result.forEach((element) => {
				table += `<tr>
					<td class="text-center">${severity(element.severity)}</td>
					<td><a href="#" onclick="updateSystemInterfacesModal({id_system: ${element.id_system}, id_SIMap: ${element.id_SIMap}})">${element.interfaceName}</a></td>
					<td><a href="#" onclick="updateIssuesModal({type: 'SystemInterface', id_SIMap: ${element.id_SIMap}, id_system: ${element.id_system}, id_issue: ${element.id_issue}})"><strong>${element.issueName}. </strong></a>${element.issue}</td>
					<td>${element.resolution}</td>
					<td scope="row"><a href="#" onclick="updateSystemModal(${element.id_system})">${element.systemName}</a></td>
				</tr>`
			})
			table += `</tbody></table>`

			$('#mainPaneContainer').append(table);
		}

	})	

	var severity = (severity) => {
		switch (severity){
			case 'critical':
				return '<img src="./assets/critical.png" width="20">'
			break;
			case 'warning':
				return '<img src="./assets/warning.png" width="20">'
			break;
			case 'notice':
				return '<img src="./assets/notice.png" width="20">'
			break;
		}
	}
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
	cy.add(systemNodes);


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
	cy.add(interfaceNodes);

	//Prepare and add network data to the graph
	var networkNodes = [];

	debug(2, 'Switch case result is ' + (2 * showInterfaces + 1 * showNetworkNodes))
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
						name: 'IF001',
					},
					classes: 'blue'																				//Put classes here
				})
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
						name: 'IF001',
					},
					classes: 'blue'																				//Put classes here
				})
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


	cy.add(networkNodes);

	//Draw the graph
	cy.layout(graphSettings.getGraphLayout()).run();

	selectedNode = new Node();

	//Event: Node in graph selected
	cy.on('tap', 'node', (evt) => { nodeSelected(evt.target); })
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
 * Get graph data
 * 
 * @param  {} cy The Cytoscape.js graph to populate
 * @param  {} id TBC
 */
function getGraphData(callback){
	debug(1,'In getGraphData()');

	//Year of graph
	const postData = {
		type: 'GraphNodes',
		year: parseInt(localStorage.getItem('activeYear')),
		showInterfaces: localStorage.getItem('showInterfaces'),
		showIssues: localStorage.getItem('showIssues')
	}

	//Tag filters
	if (localStorage.getItem('includedFilterTag').length > 0){ postData.includedFilterTag = localStorage.getItem('includedFilterTag') }
	if (localStorage.getItem('excludedFilterTag').length > 0){ postData.excludedFilterTag = localStorage.getItem('excludedFilterTag') }

	//New post which will return an object suitable for direct insertion into cy
	$.post('/graph.json', postData, (result) => {
		debug(3,'Passed to graph.json:', postData);
		debug(3,'Response:', result)

		sosmSystemData = result[0];
		sosmSystemInterfaceData = result[1];
		sosmNetworkData = result[2];
		sosmStats = result[3];
		callback();
	})
}




