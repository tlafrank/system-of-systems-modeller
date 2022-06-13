//Global variables
var debugOn = false;
debugOn = true;

var debugLevel = 4;
var cy = cytoscape();
let selectedNode; //Holds the Node object which is selected by the user
let modal; //Holds the object to provide modal setup information and the Node object being built
//let graphSettings; //Holds the object to track graph settings between sessions
let sosmSystemData, sosmSystemInterfaceData, sosmNetworkData, sosmStats, sosmNetworkStats, sosmQuantities;
let issuesData = [];
let breadcrumbTracker = [];

const imagePath = './images/'
var hideNodes = false; //Tracks whether a click on a node should remove it from the graph

$(document).ready(function(){
	//graphSettings = new GraphSettings();

	//Load private constants, if they exist
	//if(typeof privateSeverityLabels !== 'undefined'){ const severityLabels = privateSeverityLabels}
	//if(typeof privateTechnologyCategory !== 'undefined'){ technologyCategory = privateTechnologyCategory}

	//Load graph settings, if none exist
	settings.forEach((element) => {
		if (element.type != 'heading'){
			if (!localStorage.getItem(element.id)) { localStorage.setItem(element.id, element.default)}
		}
	})

	debug(1, localStorage)

	pageSwitch();
  	selectedNode = new Node();
})

//Load the appropriate main pane data
async function pageSwitch(page){
	debug(1,'In pageSwitch()')

	if (!page){
		if (sessionStorage.getItem('currentPage') === null){
			page = localStorage.getItem('defaultLandingPage');
		} else {
			page = sessionStorage.getItem('currentPage');
		}
	}

	switch (page){
		case 'standard':
			sessionStorage.setItem('currentPage', page);
			$('#mainPaneContainer').empty();
			displayTags('#mainPaneContainer');
			$('#mainPaneContainer').append(`<div class="row"><div class="col"><div id="cy" class="px-1 w-100"></div></div></div>`);
			commonGraph({graph: page})
			break;	
		case 'subsystems':
		case 'standardOrganisation':
			sessionStorage.setItem('currentPage', page);
			$('#mainPaneContainer').empty();
			$('#mainPaneContainer').append(`<div class="row"><div class="col"><div id="cy" class="px-1 w-100"></div></div></div>`);
			commonGraph({graph: page})
		break;
		case 'summary':
			sessionStorage.setItem('currentPage', 'summary');
			$('#mainPaneContainer').empty();
			$('#pageTitle').text(`SOS Model Summary ${parseInt(localStorage.getItem('activeYear'))}`)
			listSummary();
		break;
		case 'issues':
			sessionStorage.setItem('currentPage', 'issues');
			$('#mainPaneContainer').empty();
			$('#pageTitle').text(`SOS Model Issues ${parseInt(localStorage.getItem('activeYear'))}`)
			listIssues();
		break;
		case 'charts':
			sessionStorage.setItem('currentPage', 'charts');
			$('#mainPaneContainer').empty();
			$('#pageTitle').text(`Summary Charts`)
			charts();
	}
}

async function listSummary(){
	debug(1,'In listSummary()')

	//Display the current filter tags
	displayTags('#mainPaneContainer');
	
	//Prepare the page
	var table = `<table class="table table-sm table-striped"><thead>
	<tr>
		<th scope="col">Interface Name</th>
		<th scope="col">Quantity of Interfaces</th>
		<th scope="col">Number of different system types</th>
		<th scope="col">Systems implementing the interface</th>
	</tr>
	</thead>
	<tbody>`

	await commonGraph({graph: 'standard', headless: true})
	await commonGraph({graph: 'summary', headless: true})

	debug(1, 'starting')

	sosm.stats.interfaces.forEach((element) => {
		table += `<tr>
			<td scope="row"><a href="#" onclick="commonModal({modal: 'interfaces', id_interface: ${element.id_interface}});">${element.name}</a></td>
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

async function listIssues(){
	debug(2, 'In listIssues()')

	displayTags('#mainPaneContainer');

	await commonGraph({graph: 'issues', headless: true})

	var severityText = '<h3>Severity Details</h3><ul>'

	severityLabels.forEach((element) => {
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

	sosm.issues.forEach((element) => {

		//Place the interface details into the table
		var rowspan = element.issues.length;
		if (rowspan == 0){ rowspan = 1 }

		table += `<tr><td rowspan="${rowspan}" class="align-middle"><a href="#" onclick="commonModal({modal: 'interfaces', id_interface: '${element.id_interface}'})">${element.name}</a></td>`

		//Handle no issues
		if (element.issues.length == 0){
			table += `<td colspan="6" class="text-center align-middle"><a href="#" onclick="commonModal({modal: 'interfaceIssues', id_interface: '${element.id_interface}'})">No issues recorded</a></td>`
		} else {
			element.issues.forEach((element2) => {
				//debug(1, element2)
				if (element2.severity >= parseInt(localStorage.getItem('severityLevel'))){
					table += `<td class="text-center">${element2.severity}</td>`
					table += `<td><a href="#" onclick="commonModal({modal: 'interfaceIssues', id_interface: ${element2.id_interface}, id_interfaceIssue: '${element2.id_interfaceIssue}'})">${element2.name}</td>`
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
					table += `<td colspan="6" class="text-center align-middle"><a href="#" onclick="commonModal({modal: 'interfaceIssues', id_interface: '${element.id_interface}'})">Issue below the set severity threshold</a></td></tr>`
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

	startYear = localStorage.getItem('yearMin');
	endYear = localStorage.getItem('yearMax');
	endYear++;
	//endYear = 2022
	var data = {}
	data.interfaces = []
	
	var labels = []
	var datasets = [];
	var colorIndex = 0;
	var interfacesSeen = [];

	await commonGraph({graph: 'reset', headless: true})

	for (var i = startYear; i < endYear; i++){
		await commonGraph({graph: 'chartInterfaces', headless: true, year: parseInt(i)})
	}

	await commonGraph({graph: 'chartInterfaces2', headless: true})

	var chartInterfaces = {
			type: 'line',
			data: { labels: sosm.charts.labels,	datasets: sosm.charts.datasets }
		}
		chartInterfaces.options = {
			maintainAspectRatio: false,
			scales: { y: { beginAtZero: true } },
			plugins: { legend: { position: 'bottom'}}
		}

	debug(1, 'chartInterface', chartInterfaces)

	const myChinterfaceChart = new Chart(document.getElementById('chartInterfaces').getContext('2d'), chartInterfaces)
	
	
	
	
	//Produce the issues chart
	issuesChartData = [];
	var issuesLabels = [];
	var colorIndex = 0;
	//issuesChartData = 

	await commonGraph({graph: 'issues', headless: true})

	sosm.issues.forEach((element) => { //Iterate through each interface
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



/*


async function charts(){
	debug(2, 'In charts()')

	displayTags('#mainPaneContainer');

	

	//Prepare the page
	$('#mainPaneContainer').append(`<h3 class="my-2">Total Interfaces Per Year (${parseInt(localStorage.getItem('yearMin'))} - ${parseInt(localStorage.getItem('yearMax'))})</h3>`);
	$('#mainPaneContainer').append(`<div class="my-1"><canvas id="chartInterfaces" width="200" height="500"></canvas></div>`);

	$('#mainPaneContainer').append(`<h3 class="my-5">Issues Map ${parseInt(localStorage.getItem('activeYear'))}</h3>`);
	$('#mainPaneContainer').append(`<div><canvas id="chartIssues" width="200" height="500"></canvas></div>`);

	
	
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
		

		//await commonGraph({graph: 'chartInterfaces', headless: true, year: i})

		postData = {
			type: 'InterfaceQuantitiesInYear',
			year: i,
		}

		postData.includedFilterTag = JSON.parse(localStorage.getItem('includedFilterTag'))
		postData.excludedFilterTag = JSON.parse(localStorage.getItem('excludedFilterTag'))

		debug(1, `Sending '${postData.type}' to the server (chart.json):`)
		await $.post("chart.json", postData, (result) => {
			//debug(1, postData, result);

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
	var postData2 = {
		type: 'AllInterfaces',
	}
	debug(1, `Sending '${postData2.type}' to the server (select.json):`)
	$.post("select.json", postData2, (result) => {
		debug(1, 'interface chart', postData2, result);

		if (result.msg){
			//An error was passed
			debug(1, 'error', result.msg)
		} else {
			debug(1, 'fafddsf')
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


*/