const form = {
	mapSubsystems: [
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'platformName', align: 'center', columnName: 'name' },
		{ type: 'droppable', id: 'availableSubsystems', label: 'Available Subsystems' },
		{ type: 'droppable', id: 'assignedSubsystems', label: 'Installed Subsystems', source: 'data-attr', attr: 'id_subsystem' },
		
	],
	
	subsystems: [
		{ type: 'select', id: 'subsystemSelect', label: 'Existing Subsystems', onUpdate: 'lock', primary: true},
		{ type: 'text', id: 'subsystemName', label: 'Subsystem Name', columnName: 'name'},
		{ type: 'textarea', id: 'subsystemDescription', label: 'Subsystem Description', columnName: 'description'},
	],
	dataExchanges: [
		{ type: 'select', id: 'dataExchangeSelect', label: 'Existing Data Exchanges', onUpdate: 'lock', primary: true},
		{ type: 'text', id: 'dataExchangeName', label: 'Data Exchange Title', columnName: 'name'},
		{ type: 'textarea', id: 'dataExchangeDescription', label: 'Data Exchange Description', columnName: 'description'},

	],
	issue: [
		{ type: 'select', id: 'interfaceSelect', label: 'Interfaces', primary: true},
		{ type: 'select', id: 'issueSelect', label: 'Existing Interface Issues', onUpdate: 'lock'},
		{ type: 'text', id: 'issueTitle', label: 'Issue Title', columnName: 'name'},
		{ type: 'droppable', id: 'affectedSystems', label: 'Systems affected by this issue', columnName: 'affectedSystems', source: 'data-attr', attr: 'id_system' },
		{ type: 'droppable', id: 'unaffectedSystems', label: 'Other systems which implement this interface' },
		//{ type: 'note', text: 'Issue severity'},
		{ type: 'slider', id:'issueSeverity', text: 'Issue severity', max: 6, columnName: 'severity'},
		//{ type: "trafficLightRadio", id: 'issueSeverity', columnName: 'severity'},
		{ type: 'textarea', id: 'issueDescription', label: 'Issue', columnName: 'issue'},
		{ type: 'textarea', id: 'issueResolution', label: 'Proposed Resolution', columnName: 'resolution'},
	],
	tags: [
		{ type: 'droppable', id: 'availableTags', label: 'Availaible Tags' },
		{ type: 'droppable', id: 'includedTags', label: 'Included Tags', source: 'text', columnName: 'includedFilterTag'},
		{ type: 'droppable', id: 'excludedTags', label: 'Excluded Tags', source: 'text', columnName: 'excludedFilterTag'},
	],
	
	system: [
		{ type: 'select', id: 'mainModalSystemSelect', label: 'Existing Systems', onUpdate: 'lock', primary: true},
		{ type: 'img', id: 'mainModalImage', columnName: 'image', onUpdate: 'no change'},
		{ type: 'heading', id: 'mainModalSystemName', align: 'center', columnName: 'name', onUpdate: ''},
		{ type: 'text', id: 'mainModalName', label: 'Name', columnName: 'name', onUpdate: ''},
		//Add a system class selector here
		{ type: 'textarea', id: 'nodeDescription', label: 'Description', columnName: 'description', onUpdate: ''},
		{ type: 'text', id: 'systemReference', label: 'System Block Diagram Reference', columnName: 'reference', onUpdate: '', append: {
			id: 'systemReferenceDropZone', label: '&#8595'
		} },
		{ type: 'text', id: 'systemTags', label: 'Tag List (Comma separated)', columnName: 'tags', onUpdate: ''},
		{ type: 'buttons', buttons: [
			{ id: 'iconChooserButton', label: 'Choose Icon', onUpdate: ''},
			{ id: 'systemQuantitiesButton', label: 'Map Systems to Years', onUpdate: 'lock'},
			{ id: 'updateSystemInterfacesButton', label: 'Assign Interfaces', onUpdate: 'lock'},
			{ id: 'assignSubsystemsButton', label: 'Assign Subsystems', onUpdate: 'lock'},
		]}
	],
	interface: [
		{ type: 'select', id: 'mainModalInterfaceSelect', label: 'Existing Interfaces', onUpdate: 'lock', primary: true},
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalInterfaceName', align: 'center', columnName: 'name' },
		{ type: 'text', id: 'mainModalName', label: 'Name', columnName: 'name'},
		{ type: 'droppable', id: 'availableTechnologies', label: 'Available Technologies' },
		{ type: 'droppable', id: 'attachedTechnologies', label: 'Interface Technologies' },
		{ type: 'textarea', id: 'nodeDescription', label: 'Description', columnName: 'description'},
		{ type: 'buttons', buttons: [
			{ id: 'iconChooserButton', label: 'Choose Icon'},
		]}

	],
	systemInterface: [
		{ type: 'img', id: 'mainModalSystemImage', columnName: 'image' },
		{ type: 'heading', id: 'mainModalSystemName', align: 'center' },
		{ type: 'select', id: 'mainModalInterfaceSelect', label: 'Available Interfaces', primary: true},
		{ type: 'button', id: 'mainModalInstallInterfaceButton', label: '&#8595 Install Interface &#8595', align: 'centre'},
		{ type: 'container', id: 'mainModalInstalledInterfaceContainer' },
		{ type: 'note', text: 'Select an interface to access additional details:'},
		//{ type: "checkbox", id: 'mainModalPropsedInterface', label: 'Proposed only?', columnName: 'isProposed', additional: true},
		{ type: 'textarea', id: 'SIDescription', label: 'Description', columnName: 'description', additional: true},
		//{ type: 'buttons', buttons: [
		//	{ id: 'assignNetworksButton', label: 'Map Networks'},
		//]}
	],
	systemQuantities: [
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalSystemName', align: 'center', columnName: 'name' },
		{ type: 'note', text: `This form is used to track the introduction of new systems into the system. 
		For systems being removed, include a 0 in the final year to indicate removal.`},
		{ type: 'container', id: 'mainModalInstalledInterfaceContainer' },
		{ type: 'buttons', buttons: [
			{ id: 'addNewFieldsButton', label: 'Add New Field'},
			{ id: 'removeLastFieldButton', label: 'Remove Last Field'},
		]}
	],

	linkSystems: [
		{ type: 'select', id: 'mainModalSystemSelect', label: 'Systems', onUpdate: 'lock', primary: true},
		{ type: 'note', text: `This form is used to map links to system interfaces to identify communications paths between systems.`},
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalSystemName', align: 'center', columnName: 'name' },
		{ type: 'heading', id: 'mainModalSystemName', align: 'left', text: 'System Interfaces' },
		{ type: 'container', id: 'mainModalInstalledInterfaceContainer', onUpdate: 'lock' },
		{ type: 'droppable', id: 'availableLinks', label: 'Compatable Links' },
		{ type: 'droppable', id: 'primaryLinks', label: 'Primary Links', columnName: 'primaryLinks', source: 'data-attr', attr: 'id_network' },
		{ type: 'droppable', id: 'alternateLinks', label: 'Alternate Links', columnName: 'alternateLinks', source: 'data-attr', attr: 'id_network' },
		{ type: 'droppable', id: 'incapableLinks', label: 'Incapable Links', columnName: 'incapableLinks', source: 'data-attr', attr: 'id_network' },
	],
	network: [
		{ type: 'select', id: 'mainModalNetworkSelect', label: 'Existing Links', onUpdate: 'lock', primary: true },
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalNetworkName', align: 'center' },
		{ type: 'text', id: 'mainModalName', label: 'Name', columnName: 'name'},
		{ type: 'text', id: 'mainModalDesignation', label: 'Designation', columnName: 'designation'},
		{ type: 'select', id: 'mainModalTechnologySelect', label: 'Link Technology', columnName: 'id_technology', dataAttr: 'id_technology' },
		{ type: 'textarea', id: 'mainModalDescription', label: 'Description', columnName: 'description'},
		{ type: 'buttons', buttons: [
			{ id: 'iconChooserButton', label: 'Choose Icon'},
		]}
	],
	technologies: [
		{ type: 'select', id: 'mainModalTechnologySelect', label: 'Link Technologies', onUpdate: 'lock', primary: true },
		{ type: 'text', id: 'mainModalName', label: 'Name', columnName: 'name'},
		{ type: 'textarea', id: 'mainModalDescription', label: 'Description', columnName: 'description'},
	],
}

const labels = {
	severity: [
		{index: 0, label: 'Information', description: 'Non-issue. For information only.'},
		{index: 1, label: 'Notice', description: 'For notice and tracking only.'},
		{index: 2, label: 'Warning', description: 'An issue that is isolated to a small subset of the overall system.'},
		{index: 3, label: 'Error', description: 'An issue that has a limited impact on the overall system.'},
		{index: 4, label: 'Critical', description: 'An issue that has a wide impact on the overall system.'},
		{index: 5, label: 'Alert', description: 'An issue that has a detrimental impact on the overall system.'},
		{index: 6, label: 'Emergency', description: 'An issue that renders the overall system inoperable.'},
	]
}

const graphTable = {
	System: [
		{ label: 'System Name', type: 'text', columnName: 'name' },
		{ label: 'Quantities', type: 'text', columnName: '' },
		{ label: 'Block Diagram', type: 'link', columnName: 'reference'},
		{ label: 'Description', type: 'text', columnName: 'description' },
		
	],
	SystemInterface: [
		{ label: 'Interface Name', type: 'text', columnName: 'interfaceName' },
		{ label: 'Installed In', type: 'text', columnName: 'systemName' },
		{ label: 'Description', type: 'text', columnName: 'description' },	
	],
	Network: [
		{ label: 'Network Name', type: 'text', columnName: 'name' },
		{ label: 'Description', type: 'text', columnName: 'description' },	
	],
}

//Cy styling objects
var cyStyle = [ // the stylesheet for the graph

	{ selector: 'node',
		style: {
			'width': '100px',
			'background-width': '92px',
			'height': '100px',
			'background-height': '92px',
			'background-color': 'white',
			'background-image': 'data(filename)',
			'background-fit': 'none',
			'label': 'data(name)',
			'border-color': 'black',
			'border-width': '3px'
		}
	},
	{ selector: '.network',
		style: {
			'width': '80px',
			'background-width': '80px',
			'height': '80px',
			'background-height': '80px',
			'border-color': 'blue',
			'shape': 'round-octagon'
		}
	},
	{ selector: '.interface',
		style: {
			'width': '60px',
			'background-width': '52px',
			'height': '60px',
			'background-height': '52px',
			'border-color': 'black',
		}
	},

	{ selector: '.critical', style: { 'background-color': 'red' }},
	{ selector: '.warning', style: { 'background-color': '#ffcc00' }},
	{ selector: '.notice', style: { 'background-color': '#33cc33' }},

	{ selector: '.red', style: { 'line-color': 'red'	}},
	{ selector: '.blue', style: { 'line-color': 'blue'	}},
	{ selector: '.amber', style: { 'line-color': 'orange'	}},

	{
		selector: 'edge',
		style: {
			'width': 3,
			'line-color': '#000',
			'curve-style': 'bezier',
		}
	},
	{
		selector: 'edge[name]',
		style: {
			'label': 'data(name)',
			'color': 'black',
			'text-border-color': 'green',
			'text-border-opacity': 1,
			'text-border-width': 2,
			'line-color': 'orange',
			
			'text-background-padding': 1,
			'text-background-color': 'white',
			'text-background-opacity': 1,
		}
	},
	//Need to add styling for various subsystem classes
		
	{
		selector: '.class1',
		style: {
			'border-color': 'black',
		}
	},
	{
		selector: '.class2',
		style: {
			'border-color': 'orange',
		}
	},
	{
		selector: '.class3',
		style: {
			'text-border-color': 'purple',
		}
	},
	{
		selector: '.class4',
		style: {
			'border-color': 'green',
		}
	},

	{
		selector: '.proposed',
		style: {
			'line-style': 'dashed',
			'line-color': 'grey',
			'border-style': 'dashed',
			'border-color': 'grey',
		}
	},
];

const colors = [
	'#b52626',
	//'#5e388f',
	'#b56726',
	'#1f911f',
	'#8f840c',
	'#f5ea7s',
	'#2b7f7f',
	'#d34747',
	'#39a939',
	'#8c2f88',
	'#d38647',
	'#176c6c',
	'#8f0c0c',
	'#075656',
	'#95ae25',
	'#8f480c',
	'#0a730a',
]

const graphLayoutNames = ['cose', 'breadthfirst', 'circle', 'concentric', 'grid', 'random']; //Investigate 'cose-bilkent'
const defaultLandingPageOptions = ['graph', 'summary', 'issues'];

const settings = [
	{ type: 'heading', id: 'generalHeading', align: 'left', text: 'General Settings', noUpdate: true },
	{ type: 'select', id: 'defaultLandingPage', label: 'Default Landing Page', default: 'graph', options: defaultLandingPageOptions },
	{ type: 'checkbox', id: 'refreshOnUpdate', label: 'Redraw the graph on update', default: 0 },
	{ type: 'number', id: 'yearMin', label: 'Minimum Year', default: 2020},
	{ type: 'number', id: 'yearMax', label: 'Minimum Year', default: 2030},

	{ type: 'heading', align: 'left', text: 'Graph Settings', noUpdate: true },
	{ type: 'select', id: 'graphLayoutName', label: 'Graph Layout', default: 'cose', options: graphLayoutNames },
	{ type: 'checkbox', id: 'showInterfaces', label: 'Display Interface Nodes', default: 1 },
	{ type: 'checkbox', id: 'showIssues', label: 'Display issues on graph', default: 1 },
	{ type: 'checkbox', id: 'pruneEdgeLinks', label: 'Prune links with only one interface', default: 0 },
	{ type: 'checkbox', id: 'displaySubsystems', label: 'Display subsystems', default: 0 },
	{ type: 'number', id: 'zoomSensitivity', label: 'Scroll Wheel Zoom Sensitivity', default: 1},
	
	{ type: 'heading', align: 'left', text: 'Issue Settings', noUpdate: true},
	{ type: 'number', id: 'severityLevel', label: 'Minimum Severity to display', default: 0 },
	{ type: 'null', id: 'graphLayoutRows', default: 5 },
	{ type: 'null', id: 'graphLayoutAnimate', default: 0 },
	{ type: 'null', id: 'includedFilterTag', default: '' },
	{ type: 'null', id: 'excludedFilterTag', default: '' },
	{ type: 'null', id: 'activeYear', default: 2022 },
	{ type: 'null', id: 'linksAsNodes', default: 0 },
]

