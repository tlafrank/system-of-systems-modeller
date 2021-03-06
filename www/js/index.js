//Global variables
var debugOn = false;
debugOn = true;
var cy = cytoscape();
let selectedNode; //Holds the Node object which is selected by the user
let modal; //Holds the object to provide modal setup information and the Node object being built
let graphSettings; //Holds the object to track graph settings between sessions
let sosm;

const imagePath = './images/'
var hideNodes = false; //Tracks whether a click on a node should remove it from the graph

$(document).ready(function(){
	graphSettings = new GraphSettings();
	updateGraphSettings(mainPage);
  	selectedNode = new Node();
})

/**
 * @description Get the graphSettings from the server and populate the GraphSettings object
 * 
 * @param  {} callback
 */
function updateGraphSettings(callback) {
	debug('In updateGraphSettings()')

	const postData = {type: 'graphSettings'};
	$.post('/select.json', postData, (result) => {
		console.log('Passed to select.json:', postData);
		
		if (result.err) {
			console.log('Err response:')
			if (result.err.errno == 1045){
				console.log(result.err.sqlMessage)
				console.log('Is the database configured correctly?')	
			} else {
				console.log(result.err);
			}
			 
			//Display error to homepage and stop further requests to the server
			
		} else {
			debug('Successful Response, executing graphSettings.update()')
			graphSettings.update(result);
		}

		
		
		if (callback) { callback(); }
	})
}

//Load the appropriate main pane data
function mainPage(){
	debug('In mainPage()')
	switch (graphSettings.mainPage){
		case 'graph':
			var pageContent = `<div class="row"><div class="col"><div id="cy" class="px-1"></div></div></div>`

			$('#mainPaneContainer').empty();
			$('#mainPaneContainer').append(pageContent);
			
			newCy()
		break;
		case 'summary':
			var pageContent = ``

			$('#mainPaneContainer').empty();
			$('#mainPaneContainer').append(pageContent);

			listSummary();
			
		break;
		case 'issues':
			var pageContent = ``

			$('#mainPaneContainer').empty();
			$('#mainPaneContainer').append(pageContent);
			
			listIssues();
		break;
	}
}

async function listSummary(){
	await getGraphData();
	debug('listSummary()')
	
	var table = `<table class="table table-sm table-striped"><thead>
	<tr>
		<th scope="col">Interface Name</th>
		<th scope="col">Quantity</th>
		<th scope="col">Number of different subsystem types</th>
	</tr>
	</thead>
	<tbody>`
	
	sosm.interfaceCounts.forEach((element) => {
		table += `<tr>
			<td scope="row"><a href="#" onclick="updateInterfaceModal({ id_interface: ${element.id_interface} });">${element.name}</a></td>
			<td class="">${element.quantity}</td>
			<td>${element.subsystems.length}</td>
		</tr>`
	})
	table += `</tbody></table>`

	$('#mainPaneContainer').append(table);
}

async function listIssues(){
	await getGraphData();
	debug('listIssues()')
	debug(sosm.issues)

	const postData = {
		type: 'Issues',
		subtype: 'SubsystemInterface',
		id_issueArr: sosm.issues.subsystemInterfaces
	}

	$.post('select.json', postData, (result) => {
		console.log('Passed to select.json: ', postData);
		console.log('Result: ', result)

		//Check the result
		if (result.msg){
			//An error was passed
		} else {
		
			var table = `<table class="table table-sm table-striped"><thead>
			<tr>
				<th scope="col">Subsystem Name</th>
				<th scope="col">Severity</th>
				<th scope="col">Interface Name</th>
				<th scope="col">Issue</th>
				<th scope="col">Proposed Resolution</th>
			</tr>
			</thead>
			<tbody>`
			
			result.forEach((element) => {
				table += `<tr>
					<td scope="row"><a href="#" onclick="updateSubsystemModal(${element.id_subsystem})">${element.subsystemName}</a></td>
					<td class="text-center">${severity(element.severity)}</td>
					<td><a href="#" onclick="updateSubsystemInterfacesModal({id_subsystem: ${element.id_subsystem}, id_SIMap: ${element.id_SIMap}})">${element.interfaceName}</a></td>
					<td><a href="#" onclick="updateIssuesModal({type: 'SubsystemInterface', id_SIMap: ${element.id_SIMap}, id_subsystem: ${element.id_subsystem}, id_issue: ${element.id_issue}})"><strong>${element.issueName}. </strong></a>${element.issue}</td>
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



//Reset the graph
function newCy(){
	debug('In newCy()')

	cy = cytoscape({ 
		container: $("#cy"),
		style: cyStyle,
		//wheelSensitivity: 0.4, //Required for scroll wheel on laptop to work. Reason unknown.
	});

	$('#nodeDetailsTable').empty();

	getGraphData(cy);

	$('#pageTitle').text(`SOS Model ${graphSettings.activeYear}`)

	selectedNode = new Node();

	//Event: Node in graph selected
	cy.on('tap', 'node', (evt) => { nodeSelected(evt.target); })
}

//Reset the Cy object
function resetCy(){
	debug('in resetCy()');
	cy = cytoscape({
		container: $("#cy"),
		style: cyStyle,
		layout: graphSettings.getLayout(),
		wheelSensitivity: 0.4, //Required for scroll wheel on laptop to work. Reason unknown.
	});
}


/**
 * Get graph data
 * 
 * @param  {} cy The Cytoscape.js graph to populate
 * @param  {} id TBC
 */
async function getGraphData(cy){
	debug('in getGraphData()');

	console.log('graphsettings', graphSettings)
	debug(graphSettings.activeYear)

	//Year of graph
	const postData = {
		type: 'GraphNodes',
		year: graphSettings.activeYear,
		showInterfaces: graphSettings.showInterfaces,
		showIssues: graphSettings.showIssues
	}

	//Filters
	if (graphSettings.includedFilterTag.length > 0){
		postData.includedFilterTag = graphSettings.includedFilterTag
	}
	if (graphSettings.excludedFilterTag.length > 0){
		postData.excludedFilterTag = graphSettings.excludedFilterTag
	}


	//New post which will return an object suitable for direct insertion into cy
	await $.post('/graph.json', postData, (result) => {
		console.log('Passed to graph.json:', postData);
		console.log('Response:', result)

		

		//Handle the stats data as well
		sosm = result[1];

		if (cy) { 
			cy.add(result[0]);
			cy.layout(graphSettings.getLayout()).run();
			
			
			//cy.stop(true, true); 
		}
		
		return true;
	})
}




