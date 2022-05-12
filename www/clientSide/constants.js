const form = {
	mapSubsystems: [
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'platformName', align: 'center', columnName: 'name' },
		{ type: 'droppable', id: 'availableSubsystems', label: 'Available Subsystems' },
		{ type: 'droppable', id: 'assignedSubsystems', label: 'Installed Subsystems', source: 'data-attr', attr: 'id_subsystem' },
		
	],
	
	subsystems: [
		{ type: 'select', id: 'subsystemSelect', label: 'Existing Subsystems', onUpdate: 'lock'},
		{ type: 'text', id: 'subsystemName', label: 'Subsystem Name', columnName: 'name'},
		{ type: 'textarea', id: 'subsystemDescription', label: 'Subsystem Description', columnName: 'description'},
	],
	dataExchanges: [
		{ type: 'select', id: 'dataExchangeSelect', label: 'Existing Data Exchanges', onUpdate: 'lock'},
		{ type: 'text', id: 'dataExchangeName', label: 'Data Exchange Title', columnName: 'name'},
		{ type: 'textarea', id: 'dataExchangeDescription', label: 'Data Exchange Description', columnName: 'description'},

	],
	issue: [
		{ type: 'select', id: 'interfaceSelect', label: 'Interfaces'},
		{ type: 'select', id: 'issueSelect', label: 'Existing Interface Issues'},
		{ type: 'text', id: 'issueTitle', label: 'Issue Title', columnName: 'name'},
		{ type: 'droppable', id: 'affectedSystems', label: 'Systems affected by this issue', columnName: 'affectedSystems', source: 'data-attr', attr: 'id_system' },
		{ type: 'droppable', id: 'unaffectedSystems', label: 'Other systems which implement this interface' },
		{ type: 'note', text: 'Issue severity'},
		{ type: 'slider', text: 'Issue severity', max: 6 },
		{ type: "trafficLightRadio", id: 'issueSeverity', columnName: 'severity'},
		{ type: 'textarea', id: 'issueDescription', label: 'Issue', columnName: 'issue'},
		{ type: 'textarea', id: 'issueResolution', label: 'Proposed Resolution', columnName: 'resolution'},


		{ type: 'buttons', buttons: [
			//{ id: 'mainModalSystemInterface', label: 'Return to System Interfaces'},
		]}
	],
	tags: [
		{ type: 'droppable', id: 'availableTags', label: 'Availaible Tags' },
		{ type: 'droppable', id: 'includedTags', label: 'Included Tags', source: 'text', columnName: 'includedFilterTag'},
		{ type: 'droppable', id: 'excludedTags', label: 'Excluded Tags', source: 'text', columnName: 'excludedFilterTag'},
	],
	
	system: [
		{ type: 'select', id: 'mainModalSystemSelect', label: 'Existing Systems', onUpdate: 'lock' },
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
		{ type: 'select', id: 'mainModalInterfaceSelect', label: 'Existing Interfaces', onUpdate: 'lock' },
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalInterfaceName', align: 'center', columnName: 'name' },
		{ type: 'text', id: 'mainModalName', label: 'Name', columnName: 'name'},

		{ type: 'droppable', id: 'availableTechnologies', label: 'Available Technologies' },
		{ type: 'droppable', id: 'attachedTechnologies', label: 'Interface Technologies' },
		//, columnName: 'affectedSystems', source: 'data-attr', attr: 'id_technology'

		//{ type: 'select', id: 'mainModalFeaturesAvailable', label: 'Available Features', selectType: 'featuresAvailable', multiple: true},								//SelectType may be unnecessary
		//{ type: 'button', id: 'mainModalFeaturesAddButton', label: 'Attach Feature', fromId: 'nodeModalFeaturesAvailable', toId: 'nodeModalFeaturesAttached'},
		//{ type: 'button', id: 'mainModalFeaturesRemoveButton', label: 'Unattach Feature', fromId: 'nodeModalFeaturesAttached', toId: 'nodeModalFeaturesAvailable'},
		//{ type: 'select', id: 'mainModalFeaturesAttached', label: 'Attached Features', selectType: 'featuresAttached', multiple: true},
		{ type: 'textarea', id: 'nodeDescription', label: 'Description', columnName: 'description'},
		{ type: 'buttons', buttons: [
			{ id: 'iconChooserButton', label: 'Choose Icon'},
		]}

	],
	systemInterface: [
		
		{ type: 'img', id: 'mainModalSystemImage', columnName: 'image' },
		{ type: 'heading', id: 'mainModalSystemName', align: 'center' },
		{ type: 'select', id: 'mainModalInterfaceSelect', label: 'Available Interfaces' },
		{ type: 'button', id: 'mainModalInstallInterfaceButton', label: '&#8595 Install Interface &#8595', align: 'centre'},
		{ type: 'container', id: 'mainModalInstalledInterfaceContainer' },
		{ type: 'note', text: 'Select an interface to access additional details:'},
		{ type: "checkbox", id: 'mainModalPropsedInterface', label: 'Proposed only?', columnName: 'isProposed', additional: true},
		{ type: 'textarea', id: 'SIDescription', label: 'Description', columnName: 'description', additional: true},
		{ type: 'buttons', buttons: [
			{ id: 'assignNetworksButton', label: 'Map Networks'},
		]}
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
/*	mapNetwork: [
		{ type: 'select', id: 'mainModalNetworkSelect', label: 'Compatible Networks' },
		{ type: 'button', id: 'mainModalNetworkAttachButton', label: 'Attach to Network' },
		{ type: 'container', id: 'mainModalNetworkContainer' },
		{ type: 'note', text: 'Select a network to access additional details:'},
	],*/

	linkSystems: [
		{ type: 'select', id: 'mainModalSystemSelect', label: 'Systems', onUpdate: 'lock'},
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
		{ type: 'select', id: 'mainModalNetworkSelect', label: 'Existing Links' },
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
		{ type: 'select', id: 'mainModalTechnologySelect', label: 'Link Technologies', onUpdate: 'lock' },
		{ type: 'text', id: 'mainModalName', label: 'Name', columnName: 'name'},
		{ type: 'textarea', id: 'mainModalDescription', label: 'Description', columnName: 'description'},
	],
}

const labels = {
	severity: [
		{index: 6, label: 'informational', description: 'Non-issue. For information only.'},
		{index: 5, label: 'notice', description: 'For notice and tracking only.'},
		{index: 4, label: 'warning', description: 'An issue that is isolated to a small subset of the overall system.'},
		{index: 3, label: 'error', description: 'An issue that has a limited impact on the overall system.'},
		{index: 2, label: 'critical', description: 'An issue that has a wide impact on the overall system.'},
		{index: 1, label: 'alert', description: 'An issue that has a detrimental impact on the overall system.'},
		{index: 0, label: 'emergency', description: 'An issue that renders the overall system inoperable.'},
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
