/**
 * @description Objects to support graph production
 * 
 */
const graph = {
	reset: {
		title: 'Reset sosm object',
		iterations: [
			{
				//queryType: 'Systems',
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
				],
				afterServerInstructions:[

				]			
			},
		],
	},

	standard: { //Node name prefix: g1
		title: 'Standard Graph',
		//Naming Convention
		//System Nodes: 					g1_node_system_<id_system>_<id_system>
		//Subsystem Nodes: 					g1_node_system_<id_system>_<id_system>
		//SystemInterface Nodes: 			g1_node_systemInterface_<id_ISMap>
		//Link Nodes: 						g1_node_link_<id_SILMap>
		//System-System Interface Edges: 	g1_edge_System_<id_system>_SystemInterface_<id_ISMap>
		//System-Link Edges: 				g1_edge_System_<id_system>_Link_<id_SILMap>
		//SystemInterface-Link Edges: 		g1_edge_SystemInterface_<id_ISMap>_Link_<id_link>


		iterations: [
			//Get and prepare the systems as nodes on the graph
			{
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
					{action: 'toServer_fromLocalStorage_int', sourceName: 'activeYear', columnName: 'year'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'includedFilterTag', columnName: 'includedFilterTag'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'excludedFilterTag', columnName: 'excludedFilterTag'},
					{action: 'toServer_fromDefinition', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showInterfaces', sosmDisplayName: 'interfaces'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showPrimaryLinks', sosmDisplayName: 'primaryLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showAlternateLinks', sosmDisplayName: 'alternateLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'displaySubsystems', sosmDisplayName: 'compoundSystems'},
				],
				queryType: 'Systems', url: 'graph', 
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system', 'id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult', nodeName: 'version', format: '<0>', columnNames: ['version']},
							{action: 'fromResult_Name', nodeName: 'name', columnNames: ['name', 'version']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'systems', default: 'black'},
						],
						classes: ['image'],
						position: true,
					},
					{action: 'getDataFromResult', sosmName: 'id_system_arr', columnName: 'id_system'},
				],
			},

			//Get and prepare subsystems as nodes on the graph
			{
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
					{action: 'toServer_fromGraphConstant', columnName: 'startDepth', value: 1},
				],
				queryType: 'Subsystems', url: 'graph',
				afterServerInstructions:[ 
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'displaySubsystems'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_system_<0>_<1>', columnNames: ['topSystem', 'id_system']},
							{action: 'fromResult', nodeName: 'parent', format: 'g1_node_system_<0>_<1>', columnNames: ['topSystem', 'immediateParent']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Subsystem', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromDefault', nodeName: 'lineColor', default: 'black'},
						],
						classes: ['subsystem', 'centerLabel'],
						position: true,
					},
				]		
			},

			//Get and prepare System Interfaces as nodes on the graph, and their associated edges, if setting is enabled
			{
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
				],
				queryType: 'Interfaces', url: 'graph',
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'interfaces',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_systemInterface_<0>', columnNames: ['id_ISMap']},
							{action: 'fromResult', nodeName: 'id_interface', format: '<0>', columnNames: ['id_interface']},
							{action: 'fromResult', nodeName: 'id_ISMap', format: '<0>', columnNames: ['id_ISMap']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'SystemInterface', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'proposed', format: '<0>', columnNames: ['isProposed']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'interfaces', default: 'red'},
						],
						classes: ['small'],
						position: true
					},
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_System_<id_system>_SystemInterface_<0>', columnNames: ['id_ISMap']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system','id_system']}, //System
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_systemInterface_<0>', columnNames: ['id_ISMap']}, //SystemInterface
							{action: 'fromDefault', nodeName: 'lineColor', default: 'black'},
						],
						classes: []
					},

					{action: 'getDataFromResult', sosmName: 'id_ISMap_arr', columnName: 'id_ISMap'}
				]			
			},

			//Get and prepare Links as nodes on their graph, and their associated edges.
			{
				queryType: 'Links',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_ISMap_arr', columnName: 'id_ISMap_arr'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'links',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_link_<0>', columnNames: ['id_link']},
							{action: 'fromResult', nodeName: 'id_link', format: '<0>', columnNames: ['id_link']},
							{action: 'fromResult', nodeName: 'id_ISMap', format: '<0>', columnNames: ['id_ISMap']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Link', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'proposed', format: '<0>', columnNames: ['isProposed']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'links', default: 'red'},
						],
						classes: ['network'],
						position: true,
					},
					//Draw edges from interfaces to links, if showInterfaces is true
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges', 
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_SystemInterface_<0>_Link_<1>', columnNames: ['id_ISMap','id_link']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_systemInterface_<0>', columnNames: ['id_ISMap']}, //SystemInterface
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_link_<0>', columnNames: ['id_link']}, //Link
							{action: 'fromResult', nodeName: 'id_link', format: '<0>', columnNames: ['id_link']},
							{action: 'fromResult', nodeName: 'lineColor', format: '<0>', columnNames: ['technologyCategoryColor']},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: []
					},
					//Draw edges from systems to links, if showInterfaces is false
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges', 
						conditions: [{type: '!checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_System_<0>_Link_<1>', columnNames: ['id_system','id_link']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system', 'id_system']}, //System
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_link_<0>', columnNames: ['id_link']}, //Link
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_link']},
							{action: 'fromResult', nodeName: 'id_link', format: '<0>', columnNames: ['id_link']},
							{action: 'fromResult', nodeName: 'lineColor', format: '<0>', columnNames: ['technologyCategoryColor']},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: []
					},
				],
			},
		]
	},

	standardOrganisation:{
		title: 'Standard Graph by Organisation',
		iterations: [
			//Get the organisational structure below the node provided at id_organisation
			{
				queryType: 'GetAllOrganisationalNodesBelow',
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
					{action: 'toServer_fromLocalStorage_int', sourceName: 'currentOrganisation', columnName: 'id_organisation'},
				],
				afterServerInstructions:[
					{action: 'getDataFromResult', sosmName: 'id_organisation_arr', columnName: 'id_organisation'},
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'node_o_<0>', columnNames: ['id_organisation']},
							{action: 'fromResult', nodeName: 'parent', format: 'node_o_<0>', columnNames: ['parent']},
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_organisation']},
							{action: 'fromResult', nodeName: 'id_organisation', format: '<0>', columnNames: ['id_organisation']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Organisation', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							//{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							//{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'links', default: 'red'},
						],
						classes: ['square'],
						position: true,
					},
				]
			},

			//Get all the systems which are attacehd to the organisational nodes provided at id_organisation_arr
			{
				queryType: 'Systems_WithOrganisation',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_organisation_arr', columnName: 'id_organisation_arr'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showInterfaces', sosmDisplayName: 'interfaces'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showPrimaryLinks', sosmDisplayName: 'primaryLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showAlternateLinks', sosmDisplayName: 'alternateLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'displaySubsystems', sosmDisplayName: 'compoundSystems'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'node_os_<0>', columnNames: ['id_OSMap']},
							{action: 'fromResult', nodeName: 'parent', format: 'node_o_<0>', columnNames: ['id_organisation']},
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult_Name', nodeName: 'name', columnNames: ['name', 'version']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'systems', default: 'black'},
						],
						classes: [],
						position: true,
					},
					{action: 'getDataFromResult', sosmName: 'id_system_arr', columnName: 'id_system'},
				]			
			},
			
			//Get all subsystems, if enabled in settings
			{
				queryType: 'ChildrenSystems_WithOrganisation',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
					{action: 'toServer_fromSosmObject', sosmName: 'id_organisation_arr', columnName: 'id_organisation_arr'},
					
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
					conditions: [{type: 'checkLocalStorage', localStorageName: 'displaySubsystems'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'node_ss_<0>_<1>', columnNames: ['id_SMap','id_OSMap']},
							{action: 'fromResult', nodeName: 'parent', format: 'node_os_<0>', columnNames: ['id_OSMap']},
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_SMap']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Subsystem', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'org', format: '<0>', columnNames: ['id_organisation']},
							//{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'systems', default: 'black'},
						],
						classes: ['square', 'centerLabel'],
						position: true,
					},
				]		
			},
		],
	},

	subsystems: { //Node name prefix: g2
		//Naming Convention
		//System Nodes: 					g2_node_system_<id_system>
		//Subsystem Nodes: 					g2_node_system_<id_system>
		//System-Subsystem Edges:			g2_edge_System_<id_system>_Subsystem_<id_SMap>
		//SystemInterface Nodes: 			g2_node_systemInterface_<id_ISMap>
		//Link Nodes: 						g2_node_link_<id_SILMap>
		//System-System Interface Edges: 	g2_edge_System_<id_system>_SystemInterface_<id_ISMap>
		//System-Link Edges: 				g2_edge_System_<id_system>_Link_<id_SILMap>
		//SystemInterface-Link Edges: 		g2_edge_SystemInterface_<id_ISMap>_Link_<id_link>
		title: 'Distributed Subsystem Graph',
		iterations: [

			//Place all primary systems in the given year
			{
				queryType: 'Systems',//'Systems',
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
					{action: 'toServer_fromLocalStorage_int', sourceName: 'activeYear', columnName: 'year'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g2_node_system_<0>', columnNames: ['id_system']},
							//{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult_Name', nodeName: 'name', columnNames: ['name', 'version']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'systems', default: 'black'},
						],
						classes: ['small'],
						position: true,
					},
					{action: 'getDataFromResult', sosmName: 'id_system_arr', columnName: 'id_system'},
					{action: 'getDataFromResult', sosmName: 'id_system_arr!', columnName: 'id_system'},
				],		
			},

			//Place all distributed systems
			{
				queryType: 'AllDistributedSubsystems',
				beforeServerInstructions: [],
				afterServerInstructions:[

					//Place the distributed systems
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g2_node_system_<0>', columnNames: ['id_system']},
							//{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Subsystem', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
						],
						classes: [],
						position: true,
					},
				],
			},

			//Edges between systems and subsystems
			{
				queryType: 'SystemToSubsystems',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'links',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g2_edge_System_Subsystem_<0>', columnNames: ['id_SMap']},
							{action: 'fromResult', nodeName: 'source', format: 'g2_node_system_<0>', columnNames: ['parent']},
							{action: 'fromResult', nodeName: 'target', format: 'g2_node_system_<0>', columnNames: ['child']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: [],
						position: true,
					},
					{action: 'removeFromArr', sosmName: 'id_system_arr!', columnName: 'parent'},
				],
			},


			//Edges between distributed subsystems
			{
				queryType: 'DistributedSubsystemAssociations',
				beforeServerInstructions: [],
				afterServerInstructions:[
					//Links between distributed systems
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'links',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g2_edge_System_Subsystem_<0>', columnNames: ['id_SMap']},
							{action: 'fromResult', nodeName: 'source', format: 'g2_node_system_<0>', columnNames: ['parent']},
							{action: 'fromResult', nodeName: 'target', format: 'g2_node_system_<0>', columnNames: ['child']},
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: [],
						position: true,
					},
				],
			},

			//For systems with no distributed systems, draw the network links between associated systems
			{
				queryType: 'LinksForAssociatedSystems',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr!', columnName: 'id_system_arr!'},
					{action: 'toServer_fromGraphConstant', columnName: 'linkCategory', value: 'primary'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'links',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							//{action: 'fromResult', nodeName: 'id', format: 'g2_edge_System_System_<0>_<1>', columnNames: ['id_AMap', 'id_link']},
							{action: 'fromResult', nodeName: 'id', format: 'g2_edge_System_System_<0>', columnNames: ['id_link']},
							{action: 'fromResult', nodeName: 'source', format: 'g2_node_system_<0>', columnNames: ['source']},
							{action: 'fromResult', nodeName: 'target', format: 'g2_node_system_<0>', columnNames: ['destination']},
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_SILMap']},
							{action: 'fromResult', nodeName: 'id_SILMap', format: '<0>', columnNames: ['id_SILMap']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: [],
						position: true,
					},
					
				],
			},	
		]
	},

	summary: {
		title: 'Summary',
		iterations: [
			{
				queryType: 'QuantityOfInterfacesPerSystem',
				beforeServerInstructions: [
					{action: 'toServer_fromLocalStorage_int', sourceName: 'activeYear', columnName: 'year'},
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
				],
				afterServerInstructions:[
					{action: 'buildSummaryObject_interfaces', },
				]			
			},
		]
	},

	issues: {
		title: 'Issues',
		iterations: [
			{
				queryType: 'Issues',
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
					{action: 'toServer_fromLocalStorage_int', sourceName: 'activeYear', columnName: 'year'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'includedFilterTag', columnName: 'includedFilterTag'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'excludedFilterTag', columnName: 'excludedFilterTag'},
				],
				afterServerInstructions:[
					{action: 'buildIssuesObject'},
				]			
			},
		]
	},

	chartInterfaces: {
		title: 'chartInterfaces',
		iterations: [
			{
				queryType: 'InterfaceQuantitiesInYear',
				beforeServerInstructions: [
					//{action: 'resetSosmObject'},
					//{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
					{action: 'toServer_fromDefinition', definitionName: 'year', columnName: 'year'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'includedFilterTag', columnName: 'includedFilterTag'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'excludedFilterTag', columnName: 'excludedFilterTag'},					
				],
				afterServerInstructions:[
					{action: 'buildInterfaceChartObject',},
				]			
			},
		]
	},

	chartInterfaces2: {
		title: 'chartInterfaces2',
		iterations: [
			{
				queryType: 'AllInterfaces',
				url: 'select',
				beforeServerInstructions: [				
				],
				afterServerInstructions:[
					{action: 'buildInterfaceChartObject_2',},
				]			
			},
		]
	},

	specificSystem: { //Node name prefix: g1
		title: 'Standard Graph',
		//Naming Convention
		//System Nodes: 					g1_node_system_<id_system>_<id_system>
		//Subsystem Nodes: 					g1_node_system_<id_system>_<id_system>
		//SystemInterface Nodes: 			g1_node_systemInterface_<id_ISMap>
		//Link Nodes: 						g1_node_link_<id_SILMap>
		//System-System Interface Edges: 	g1_edge_System_<id_system>_SystemInterface_<id_ISMap>
		//System-Link Edges: 				g1_edge_System_<id_system>_Link_<id_SILMap>
		//SystemInterface-Link Edges: 		g1_edge_SystemInterface_<id_ISMap>_Link_<id_link>


		iterations: [
			//Get and prepare the systems as nodes on the graph
			{
				beforeServerInstructions: [
					{action: 'resetSosmObject'},
					{action: 'toServer_fromLocalStorage_int', sourceName: 'activeYear', columnName: 'year'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'includedFilterTag', columnName: 'includedFilterTag'},
					{action: 'toServer_fromLocalStorage_arr', sourceName: 'excludedFilterTag', columnName: 'excludedFilterTag'},
					{action: 'toServer_fromDefinition', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showInterfaces', sosmDisplayName: 'interfaces'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showPrimaryLinks', sosmDisplayName: 'primaryLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'showAlternateLinks', sosmDisplayName: 'alternateLinks'},
					{action: 'setSosmDisplay_fromLocalStorage', sourceName: 'displaySubsystems', sosmDisplayName: 'compoundSystems'},
				],
				queryType: 'Systems', url: 'graph', 
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system', 'id_system']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'systems', default: 'black'},
						],
						classes: ['image'],
						position: true,
					},
					{action: 'getDataFromResult', sosmName: 'id_system_arr', columnName: 'id_system'},
				],
			},

			//Get and prepare subsystems as nodes on the graph
			{
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
					{action: 'toServer_fromGraphConstant', columnName: 'startDepth', value: 1},
				],
				queryType: 'Subsystems', url: 'graph',
				afterServerInstructions:[ 
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'systems',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'displaySubsystems'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_system_<0>_<1>', columnNames: ['topSystem', 'id_system']},
							{action: 'fromResult', nodeName: 'parent', format: 'g1_node_system_<0>_<1>', columnNames: ['topSystem', 'immediateParent']},
							{action: 'fromResult', nodeName: 'id_system', format: '<0>', columnNames: ['id_system']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'System', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
						],
						classes: ['square', 'centerLabel'],
						position: true,
					},
				]		
			},

			//Get and prepare System Interfaces as nodes on the graph, and their associated edges, if setting is enabled
			{
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_system_arr', columnName: 'id_system_arr'},
				],
				queryType: 'Interfaces', url: 'graph',
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'interfaces',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_systemInterface_<0>', columnNames: ['id_ISMap']},
							{action: 'fromResult', nodeName: 'id_interface', format: '<0>', columnNames: ['id_interface']},
							{action: 'fromResult', nodeName: 'id_ISMap', format: '<0>', columnNames: ['id_ISMap']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'SystemInterface', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'proposed', format: '<0>', columnNames: ['isProposed']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'interfaces', default: 'red'},
						],
						classes: ['small'],
						position: true
					},
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges',
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_System_<id_system>_SystemInterface_<0>', columnNames: ['id_ISMap']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system','id_system']}, //System
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_systemInterface_<0>', columnNames: ['id_ISMap']}, //SystemInterface
							{action: 'fromDefault', nodeName: 'lineColor', default: 'black'},
						],
						classes: []
					},

					{action: 'getDataFromResult', sosmName: 'id_ISMap_arr', columnName: 'id_ISMap'}
				]			
			},

			//Get and prepare Links as nodes on their graph, and their associated edges.
			{
				queryType: 'Links',
				beforeServerInstructions: [
					{action: 'toServer_fromSosmObject', sosmName: 'id_ISMap_arr', columnName: 'id_ISMap_arr'},
				],
				afterServerInstructions:[
					{action: 'nodeOrEdge', group: 'nodes', sosmNodeName: 'links',
						conditions: [{type: 'alwaysRun'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_node_link_<0>', columnNames: ['id_link']},
							{action: 'fromResult', nodeName: 'id_link', format: '<0>', columnNames: ['id_link']},
							{action: 'fromResult', nodeName: 'id_ISMap', format: '<0>', columnNames: ['id_ISMap']},
							{action: 'fromResult', nodeName: 'nodeType', format: 'Link', columnNames: []},
							{action: 'fromResult', nodeName: 'name', format: '<0>', columnNames: ['name']},
							{action: 'fromResult', nodeName: 'proposed', format: '<0>', columnNames: ['isProposed']},
							{action: 'fromResult', nodeName: 'filename', format: './images/<0>', columnNames: ['image']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'category', constantName: 'links', default: 'red'},
						],
						classes: ['network'],
						position: true,
					},
					//Draw edges from interfaces to links, if showInterfaces is true
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges', 
						conditions: [{type: 'checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_SystemInterface_<0>_Link_<1>', columnNames: ['id_ISMap','id_link']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_systemInterface_<0>', columnNames: ['id_ISMap']}, //SystemInterface
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_link_<0>', columnNames: ['id_link']}, //Link
							{action: 'fromResult', nodeName: 'id_link', format: '<0>', columnNames: ['id_link']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: []
					},
					//Draw edges from systems to links, if showInterfaces is false
					{action: 'nodeOrEdge', group: 'edges', sosmNodeName: 'edges', 
						conditions: [{type: '!checkLocalStorage', localStorageName: 'showInterfaces'}],
						fields: [
							{action: 'fromResult', nodeName: 'id', format: 'g1_edge_System_<0>_Link_<1>', columnNames: ['id_system','id_link']},
							{action: 'fromResult', nodeName: 'source', format: 'g1_node_system_<0>_<1>', columnNames: ['id_system', 'id_system']}, //System
							{action: 'fromResult', nodeName: 'target', format: 'g1_node_link_<0>', columnNames: ['id_link']}, //Link
							{action: 'fromResult', nodeName: 'idNo', format: '<0>', columnNames: ['id_link']},
							{action: 'fromResult', nodeName: 'id_link', format: '<0>', columnNames: ['id_link']},
							{action: 'fromConstant', nodeName: 'lineColor', columnName: 'technologyCategory', constantName: 'technology', default: 'black'},
							{action: 'fromResult', nodeName: 'linkCategory', format: '<0>', columnNames: ['linkCategory']},
						],
						classes: []
					},
				],
			},
		]
	},
}





const graphTable = {
	System: [
		{ label: 'System Name', type: 'text', columnName: 'name' },
		{ label: 'Quantities', type: 'text', columnName: '' },
		{ label: 'Block Diagram', type: 'link', columnName: 'reference'},
		{ label: 'Description', type: 'text', columnName: 'description' },
	],
	Subsystem: [
		{ label: 'Subsystem Name', type: 'text', columnName: 'name' },
		//{ label: 'Quantities', type: 'text', columnName: '' },
		//{ label: 'Block Diagram', type: 'link', columnName: 'reference'},
		{ label: 'Description', type: 'text', columnName: 'description' },
	],
	SystemInterface: [
		{ label: 'Interface Name', type: 'text', columnName: 'interfaceName' },
		{ label: 'Installed In', type: 'text', columnName: 'systemName' },
		{ label: 'Description', type: 'text', columnName: 'description' },	
	],
	Link: [
		{ label: 'Link Name', type: 'text', columnName: 'name' },
		{ label: 'Description', type: 'text', columnName: 'description' },	
	],
}

//Cy styling objects
const cyStyle = [ // the stylesheet for the graph
	{ selector: 'node',
		style: {
			'width': '200px',
			'background-width': '200px',
			'height': '200px',
			'background-height': '200px',
			'background-color': 'white',
			'background-fit': 'none',
			'label': 'data(name)',
			'border-color': 'red',
			'border-width': '4px',
			'font-size': '26px',
		}
	},
	{
		selector: 'node[proposed = "1"]',
		style: {
			'border-style': 'dashed',
			//'border-width': 3,
			//'border-dash-pattern': [10,50],
			//'border-opacity': 0.5,
			//'border-color': 'grey',
		}
	},
	{ selector: '.small',
		style: {
			'width': '100px',
			'background-width': '95px',
			'height': '100px',
			'background-height': '95px',
		}
	},
	{ selector: '.network',
		style: {
			'width': '100px',
			'background-width': '105px',
			'height': '100px',
			'background-height': '105px',
			'shape': 'round-octagon',
		}
	},
	{ selector: '[filename]',
		style: {
			'background-image': 'data(filename)',
		}
	},
	{ selector: 'node[lineColor]',
	style: {
		'border-color': 'data(lineColor)',
	}
	},

	{
		selector: 'edge',
		style: {
			'width': 4,
			'line-color': 'data(lineColor)',
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
			'text-background-padding': 1,
			'text-background-color': 'white',
			'text-background-opacity': 1,
		}
	},
	{
		selector: 'edge[linkCategory = "alternate"]',
		style: {
			'line-style': 'dashed',
			'line-opacity': 0.7,
			'line-dash-pattern': [25,25],
		}
	},
	{ selector: '.critical', style: { 'background-color': 'red' }},
	{ selector: '.warning', style: { 'background-color': '#ffcc00' }},
	{ selector: '.notice', style: { 'background-color': '#33cc33' }},

	{ selector: '.red', style: { 'line-color': 'red'}},
	{ selector: '.blue', style: { 'line-color': 'blue'}},
	{ selector: '.amber', style: { 'line-color': 'orange'}},


	{
		selector: '.subordinateSystem',
		style: {
			'border-color': 'grey',
			'border-opacity': 0.5,

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
		selector: '.subsystem',
		style: {
			'shape': 'round-rectangle',
			'background-color': '#D0D0D0',
			'height': '120px',
		}
	},
	{
		selector: '.centerLabel',
		style: {
			'text-halign':'center',
			'text-valign':'center',
		}
	},
];


function cyLayout(){
	var obj = {
		name: localStorage.getItem('graphLayoutName'),
		rows: localStorage.getItem('graphLayoutRows'),
		animate: localStorage.getItem('graphLayoutAnimate'),
		idealEdgeLength: 200,
	}
	return obj
}

const colors = [//Cyclic array for chart colur selection
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

//var colorNames = ['red','green','blue','black','orange' ]




const graphLayoutNames = ['cose', 'breadthfirst', 'circle', 'concentric', 'grid', 'random', 'fcose', 'preset'];
const defaultLandingPageOptions = ['standard', 'summary', 'issues'];

/**
 * @description Settings definition. All are stored in localStorage
 * 
 */
const settings = [
	{ type: 'heading', id: 'generalHeading', align: 'left', text: 'General Settings', noUpdate: true },
	{ type: 'select', id: 'defaultLandingPage', label: 'Default Landing Page', default: 'standard', options: defaultLandingPageOptions },
	{ type: 'checkbox', id: 'refreshOnUpdate', label: 'Redraw the graph on update', default: 0 },
	{ type: 'number', id: 'yearMin', label: 'Minimum Year', default: 2020},
	{ type: 'number', id: 'yearMax', label: 'Minimum Year', default: 2030},

	{ type: 'heading', align: 'left', text: 'Graph Settings', noUpdate: true },
	{ type: 'select', id: 'graphLayoutName', label: 'Graph Layout', default: 'cose', options: graphLayoutNames },
	{ type: 'checkbox', id: 'showInterfaces', label: 'Display Interface Nodes', default: 1 },
	{ type: 'checkbox', id: 'displaySubsystems', label: 'Display Subsystem Nodes', default: 0 },
	//{ type: 'checkbox', id: 'showIssues', label: 'Display issues on graph', default: 1 },
	//{ type: 'checkbox', id: 'pruneEdgeLinks', label: 'Prune links with only one interface', default: 0 },
	{ type: 'checkbox', id: 'showPrimaryLinks', label: 'Display Primary Links', default: 1 },
	{ type: 'checkbox', id: 'showAlternateLinks', label: 'Display Alternate Links', default: 1 },
	{ type: 'checkbox', id: 'snapToGrid', label: 'Snap To Grid', default: 1 },
	{ type: 'number', id: 'zoomSensitivity', label: 'Scroll Wheel Zoom Sensitivity', default: 1},
	
	{ type: 'heading', align: 'left', text: 'Issue Settings', noUpdate: true},
	{ type: 'number', id: 'severityLevel', label: 'Minimum Severity to display', default: 0 },
	{ type: 'null', id: 'graphLayoutRows', default: 5 },
	{ type: 'null', id: 'graphLayoutAnimate', default: 0 },
	{ type: 'null', id: 'includedFilterTag', default: [] },
	{ type: 'null', id: 'excludedFilterTag', default: [] },
	{ type: 'null', id: 'activeYear', default: 2022 },
	{ type: 'null', id: 'linksAsNodes', default: 0 },
]



/**
 * @description Object which holds the definition for all the modals
 * 
 * 
 */
const modals = {
	min: {
		title: 'Modal Title', //The title of the modal to display at the top of the modal
		formButtons: [ //The buttons to insert at the bottom of the modal
		{type: 'info', id: 'buttonNew', label: 'New Interface', initialState: 'unlock'},
		{type: 'delete', id: 'buttonDelete', label: 'Delete Interface', initialState: 'unlock'},
		{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
		{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ //The empty controls to insert in the modal

		],
		monitorChanges: [], //The ID of the controls to monitor for changes
		lockOnChange: [], //The ID of the controls to lock when editing an object
		unlockOnChange: [], //The ID of the controls to lock when editing an object
		iterations: [ //The objects to process in order to fetch information from the server and insert into the form controls
			{ //The first iteration of a query to the server
				type: '', //The type of select query to call (See req.body.type in select.js)
				definitionFields: [], //The params from definition that also need to be sent to the server to accompany the query
				continueOnUndefined: true, //If true, continue to send the request to the server if any of the definition fields is undefined
				instructions: [ //The actions to perform upon return of the query from the server
					{action: ''},
				],
			},
		],
		events: [
			{
				handlers: [{controlId: '', event: 'click'},], //The event type and control to add a handler to
				postType: '', //The type of update to send to the server, if required
				instructions: [ //Pre-server instructions
				],
				cleanup: [ //Post server instructions
				],
			},
		]
	},

	min_noComments: {
		title: 'Title',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Interface', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Interface', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 

		],
		monitorChanges: [

		],
		lockOnChange: [],
		unlockOnChange: [], 
		iterations: [
			{ 
				type: '', 
				definitionFields: [], 
				continueOnUndefined: true,
				instructions: [ 
					{action: ''},
				],
			},
		],
		events: [
			{
				handlers: [{controlId: '', event: 'click'}, ],
				postType: '', 
				instructions: [
				],
				cleanup: [
				],
			},
		]
	},

	organisation: {
		title: 'Organisations',
		formButtons: [
			//{type: 'info', id: 'buttonMove', label: 'Move Node', initialState: 'unlock'},
			{type: 'info', id: 'buttonNew', label: 'New Node', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},	
		],
		formFields: [
			{ type: 'organisation', id: 'pathAbove', text: `Path to Current Organisational Node: `},
			{ type: 'organisation', id: 'currentNode', text: `Current Organisational Node: `},
			{ type: 'organisation', id: 'childNodes', text: `Child Subordinates Nodes: `},
			{ type: 'text', id: 'textName', label: 'Name'},
		],
		
		monitorChanges: [//The controls to monitor for changes
			{id: 'mainModalName', on: 'input'},
		], 
		lockOnChange: ['buttonDelete', 'buttonMove', 'buttonNew', 'pathAbove button','currentNode button','childNodes button'], //The ID of the controls to lock when editing an object
		unlockOnChange: ['buttonUpdate'], //The ID of the controls to lock when editing an object
		iterations: [
			{
				type: 'Organisation',
				definitionFields: ['id_organisation'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndex', id: 'id_organisation',  arrayIndex: 1, columnName: 'id_organisation'},
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndexFirstIndex', id: 'parent', arrayIndex: 0, columnName: 'id_organisation'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'orgPath', id: 'pathAbove', modal: 'organisation', arrayIndex: 0, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'currentNode', modal: 'organisation', arrayIndex: 1, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'childNodes', modal: 'organisation', arrayIndex: 2, columnName: 'name'},
					{action: 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex', type: 'text', id: 'textName', arrayIndex: 1, columnName: 'name'}
				],
			}
		],
		events: [
			{ //New organisation button clicked
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'moveDefinitionValue', old: 'id_organisation', new: 'parent'},
					{action: 'emptyControl', type: 'text', id: 'textName'}
				],
				cleanup: [],
			},
			{ //Update the organisation with the server
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'Organisation',
				instructions: [
					{action: 'toServer_ControlValue', type: 'text', id: 'textName', columnName: 'name'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_organisation', columnName: 'id_organisation'},
					{action: 'toServer_DefinitionValue', definitionName: 'parent', columnName: 'parent'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_organisation'},
					{action: 'reload'},
				],
			},
			{ //Delete the current organisation
				handlers: [{controlId: 'buttonDelete', event: 'click'}, ],
				postType: 'DeleteOrganisation',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_organisation', columnName: 'id_organisation'},
					{action: 'moveDefinitionValue', old: 'parent', new: 'id_organisation'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Handle clicks to node buttons in pathAbove or childNodes
				handlers: [
					{controlId: 'pathAbove button', event: 'click'},
					{controlId: 'childNodes button', event: 'click'},
				],
				instructions: [{action: 'setDefinition_FromClickedButton', id: 'pathAbove', dataAttr: 'id_organisation', definitionName: 'id_organisation'},],
				cleanup: [{action: 'reload'},],
			},
		]
	},

	mapSystems: {
		title: 'Map Subsystems to Systems',
		formButtons: [
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		],
		formFields: [
			{ type: 'select', id: 'parentSystem', label: 'Parent System'},
			{ type: 'img', id: 'imageSystem', columnName: 'image'},
			{ type: 'heading', id: 'headingSystemName', align: 'center'},
			{ type: 'droppable2', id: 'availableChildSystems', label: 'Available Subsystems'},
			{ type: 'droppable2', id: 'assignedChildSystems', label: 'Assigned Subsystems'},
		],
		monitorChanges: [//The controls to monitor for changes
			{id: 'assignedChildSystems', on: 'input'},
		], 
		lockOnChange: ['buttonDelete'], //The ID of the controls to lock when editing an object
		unlockOnChange: ['buttonUpdate'], //The ID of the controls to lock when editing an object
		
		iterations: [
			{ //Get the systems for the parent system select
				type: 'AllSystems',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions_MultipleFields', id: 'parentSystem', columnName: ['name','version'], attr: {name: 'id_system', columnName: 'id_system'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'parentSystem', definition: 'id_system', dataAttr: 'id_system', columnName: 'id_system'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'parentSystem', definition: 'id_system', dataAttr: 'id_system'},

				],
			},
			{ //Get the subsystems for the available subsystems box
				type: 'AllSubsystems',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'droppableElements', id: 'availableChildSystems', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'} },
					{action: 'removeElement', id: 'availableChildSystems span', dataAttr: 'id_system', definitionName: 'id_system' },
				],
			},
			{ //Get specific system details
				type: 'SingleSystem',
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [
					//{action: 'setControl_SingleValue', id: 'headingSystemName', type: 'heading', columnName: 'name'},
					{action: 'setControl_MultipleValues', id: 'headingSystemName', type: 'headingMultiple', columnName: ['name','version']},
					{action: 'setControl_SingleValue', id: 'imageSystem', type: 'image', columnName: 'image'},
				]
			},

			{ //Get all the systems which may be children
				type: 'SystemChildren',
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'moveDroppableElements', sourceId: 'availableChildSystems', id: 'assignedChildSystems', columnName: 'name', attr: {name: 'id_system', columnName: 'child'} },
					{action: 'setControl_Focus', id: 'parentSystem'},
				],
			}
		],
		events: [
			{ //Changes to the parent system select
				handlers: [{controlId: 'parentSystem', event: 'change'},],
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'parentSystem', definitionName: 'id_system', dataAttr: 'id_system'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},

			{	//Handle elements being dropped
				handlers: [{controlId: 'assignedChildSystems div', event: 'drop'},],
				postType: 'UpdateChildSystemAssignments',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop', id: 'assignedChildSystems div'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'assignedChildSystems', dataAttr: 'id_system', columnName: 'id_system_arr'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
				],
				cleanup: [
				],
			},
			{	//Handle elements being dropped
				handlers: [{controlId: 'availableChildSystems div', event: 'drop'},],
				postType: 'UpdateChildSystemAssignments',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop', id: 'availableChildSystems div'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'assignedChildSystems', dataAttr: 'id_system', columnName: 'id_system_arr'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
				],
				cleanup: [
				],
			},


			{	//Handle elements being dragged
				handlers: [{controlId: 'availableChildSystems div', event: 'dragover'},],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},
			{	//Handle elements being dragged
				handlers: [{controlId: 'assignedChildSystems div', event: 'dragover'},],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},
			{ //Close the modal
				handlers: [{controlId: 'buttonCancel', event: 'click'},], 
				instructions: [],
				cleanup: [
					{action: 'returnToLastModal'},
				],
			},
		]
	},

	orgSystemMap: {
		title: 'Systems to Organisations',
		formButtons: [
			{type: 'delete', id: 'buttonDelete', label: 'Remove System', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},		
		],
		formFields: [
			{ type: 'organisation', id: 'pathAbove', text: `Path to Current Organisational Node: `},
			{ type: 'organisation', id: 'currentNode', text: `Current Organisational Node: `},
			{ type: 'organisation', id: 'childNodes', text: `Child Subordinates Nodes: `},
			{ type: 'select', id: 'selectSystem', label: 'Primary Systems'},
			{ type: 'button', id: 'buttonAssignSystem', label: '&#8595 Assign System &#8595', align: 'centre'},
			{ type: 'container', id: 'containerAssignedSystems' },
			{ type: 'note', text: 'Select a system to access additional details:'},
			{ type: 'number', id: 'numberQuantities', label: 'Quantity of Systems'},
		],
		monitorChanges: [//The controls to monitor for changes
			{id: 'numberQuantities', on: 'input'},
		], 
		lockOnChange: ['buttonDelete', 'pathAbove button','currentNode button','childNodes button', 'selectSystem', 'containerAssignedSystems button', 'buttonAssignSystem'], //The ID of the controls to lock when editing an object
		unlockOnChange: ['buttonUpdate'], //The ID of the controls to lock when editing an object
		
		iterations: [
			{ //Get the organisational structure
				type: 'Organisation',
				definitionFields: ['id_organisation'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndex', id: 'id_organisation',  arrayIndex: 1, columnName: 'id_organisation'},
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndexFirstIndex', id: 'parent', arrayIndex: 0, columnName: 'id_organisation'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'orgPath', id: 'pathAbove', modal: 'organisation', arrayIndex: 0, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'currentNode', modal: 'organisation', arrayIndex: 1, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'childNodes', modal: 'organisation', arrayIndex: 2, columnName: 'name'},
				],
			},
			{ //Get the systems which can be added to the organisational nodes
				type: 'PrimarySystems',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectSystem', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'} },
				],
			},
			{ //Get the systems which have been assigned to the current organisational node
				type: 'SystemsAssignedToOrg',
				definitionFields: ['id_organisation'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'iconButton', id: 'containerAssignedSystems', columnName: 'name', attr: {name: 'id_OSMap', columnName: 'id_OSMap'}},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'number', id: 'numberQuantities', definition: 'id_OSMap', columnName: 'quantity'},
					{action: 'setControl_SingleValue_fromDefinitionIfExists', type: 'iconButtonSelected', id: 'containerAssignedSystems', attrName: 'id_osmap', definitionName: 'id_OSMap'},
					
				],
			},
		],
		events: [
			{ 	//Update the systems allocated to each organisation node with the server
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'UpdateOrgSystemMap',
				instructions: [
					{action: 'toServer_ControlValue', type: 'number', id: 'numberQuantities', columnName: 'quantity'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_OSMap', columnName: 'id_OSMap'},
				],
				cleanup: [
					//{action: 'setDefinition_FromResultInsert', definitionName: 'id_organisation'},
					{action: 'reload'},
				],
			},
			{
				handlers: [{controlId: 'buttonAssignSystem', event: 'click'},],
				postType: 'AssignSystemToOrg',
				instructions: [
					{action: 'toServer_ControlValue', type: 'select', id: 'selectSystem', dataAttr: 'id_system', columnName: 'id_system'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_organisation', columnName: 'id_organisation'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},			
			{ //Remove the current system from the current organisation
				handlers: [{controlId: 'buttonDelete', event: 'click'},],
				postType: 'DeleteSystemFromOrganisation',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_OSMap', columnName: 'id_OSMap'},
				],
				cleanup: [
					{action: 'deleteDefinition', definitionName: 'id_OSMap'},
					{action: 'reload'},
				],
			},
			{	//Handle clicks to node buttons in pathAbove
				handlers: [{controlId: 'pathAbove button', event: 'click'},],
				instructions: [
					{action: 'setDefinition_FromClickedButton', definitionName: 'id_organisation', dataAttr: 'id_organisation'},
			],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Handle clicks to node buttons in childNodes
				handlers: [{controlId: 'childNodes button', event: 'click'},],
				instructions: [
					{action: 'setDefinition_FromClickedButton', definitionName: 'id_organisation', dataAttr: 'id_organisation'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{ 	//Clicks on system buttons
				handlers: [{controlId: 'containerAssignedSystems button', event: 'click'},],
				postType: 'SystemsAssignedToOrgDetail',
				url: 'select',
				instructions: [
					{action: 'setDefinition_FromClickedButton', definitionName: 'id_OSMap', dataAttr: 'id_osmap'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_OSMap', columnName: 'id_OSMap'},
					{action: 'resetButtonClasses', id: 'containerAssignedSystems'},
					{action: 'setButtonClassesCurrentTarget', id: 'containerAssignedSystems'},
				],
				cleanup: [
					{action: 'setControl_SingleValue', type: 'number', id: 'numberQuantities', columnName: 'quantity'}
				],
			},

		],
	},

	systems: {
		title: 'Systems', //The title of the modal to display at the top of the modal
		formButtons: [ //The buttons to insert at the bottom of the modal
			{type: 'info', id: 'buttonNew', label: 'New System', initialState: 'unlock'},
			{type: 'info', id: 'buttonClone', label: 'Clone System', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Remove System', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ //The empty controls to insert in the modal
			{ type: 'select', id: 'selectSystem', label: 'System'},
			{ type: 'img', id: 'imageSystem', columnName: 'image'},
			{ type: 'heading', id: 'headingSystemName', align: 'center'},
			{ type: 'text', id: 'textSystemName', label: 'Name'},
			{ type: 'select', id: 'selectFamily', label: 'Family'},
			{ type: 'text', id: 'textVersion', label: 'Version'},
			{ type: 'textarea', id: 'textSystemDescription', label: 'Description' },
			{ type: 'select', id: 'selectCategory', label: 'Category'},
			{ type: 'text', id: 'textSystemReferences', label: 'System Block Diagram Reference', append: {
				id: 'systemReferenceDropZone', label: '&#8595'
			} },
			{ type: 'text', id: 'textSystemTags', label: 'Tag List (Comma separated)'},
			{ type: 'buttons', buttons: [
				{ id: 'buttonIcons', label: 'Choose Icon'},
				{ id: 'buttonSystemQuantities', label: 'Map Systems to Years'},
				{ id: 'buttonUpdateSystemInterfaces', label: 'Attach Interfaces & Connect Links'},
				{ id: 'buttonSystemRelationships', label: 'Attach Subsystems'},
				{ id: 'buttonParameters', label: 'System Parameters'},
			]}

		],
		monitorChanges: [//The ID of the controls to monitor for changes
			{id: 'textSystemName', on: 'input'},
			{id: 'selectFamily', on: 'change'},
			{id: 'textVersion', on: 'input'},
			{id: 'textSystemDescription', on: 'input'},
			{id: 'textSystemReferences', on: 'input'},
			{id: 'textSystemTags', on: 'input'},
			{id: 'selectCategory', on: 'change'},
		],
		lockOnChange: ['selectSystem','buttonNew','buttonClone','buttonDelete','buttonIcons','buttonSystemQuantities', 'buttonUpdateSystemInterfaces','buttonSystemRelationships','buttonParameters'], //The ID of the controls to lock when editing an object
		unlockOnChange: ['buttonUpdate'], //The ID of the controls to lock when editing an object
		iterations: [ //The objects to process in order to fetch information from the server and insert into the form controls
			{ //Get the all the systems
				type: 'AllSystems',
				definitionFields: [],
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions_MultipleFields', id: 'selectSystem', columnName: ['name','version'], attr: {name: 'id_system', columnName: 'id_system'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectSystem', definition: 'id_system', dataAttr: 'id_system', columnName: 'id_system'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectSystem', definition: 'id_system', dataAttr: 'id_system'},
					{action: 'setControl_MultipleValues_fromConstant', type: 'selectOptions', id: 'selectCategory', constantName: 'systems', columnName: 'title', attr: {name: 'category', columnName: 'value'} },
				],
			},
			{ //Get the all the families
				type: 'AllFamilies',
				definitionFields: [],
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectFamily', columnName: 'name', attr: {name: 'id_family', columnName: 'id_family'} },
					//Simple test to make suure at least one family has been defined
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectFamily', definition: 'id_family', dataAttr: 'id_family'},
				],
			},
			{ //Get specific system details
				type: 'SingleFamily',
				definitionFields: ['id_family'],
				continueOnUndefined: false,
				instructions: [],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonNew','buttonDelete','buttonClone','selectSystem','textSystemName','selectFamily','textVersion','textSystemDescription','selectCategory','textSystemReferences','textSystemTags','buttonIcons',
						'buttonSystemQuantities','buttonUpdateSystemInterfaces','buttonSystemRelationships','buttonParameters']},
				]
			},
			{ //Get specific system details
				type: 'SingleSystem_WithTags',
				definitionFields: ['id_system'],
				continueOnUndefined: false,
				instructions: [
					
					{action: 'setControl_MultipleValues', arrayIndex: 0, id: 'headingSystemName', type: 'headingMultiple', columnName: ['name','version']},
					{action: 'setControl_SingleValue', arrayIndex: 0, id: 'imageSystem', type: 'image', columnName: 'image'},
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndex', arrayIndex: 0, id: 'image', columnName: 'image',},
					{action: 'setControl_SingleValue', arrayIndex: 0, id: 'textSystemName', type: 'text', columnName: 'name'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'select', id: 'selectFamily', dataAttr: 'id_family', columnName: 'id_family'},
					{action: 'setControl_SingleValue', arrayIndex: 0, id: 'textVersion', type: 'text', columnName: 'version'},
					{action: 'setControl_SingleValue', arrayIndex: 0, id: 'textSystemDescription', type: 'text', columnName: 'description'},
					{action: 'setControl_SingleValue', arrayIndex: 0, id: 'textSystemReferences', type: 'text', columnName: 'reference'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', arrayIndex: 1, id: 'textSystemTags', type: 'textList', columnName: 'tag'},
					{action: 'setControl_Focus', id: 'selectSystem'},
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonDelete','buttonClone','selectSystem','textSystemName','selectFamily','textVersion','textSystemDescription','selectCategory','textSystemReferences','textSystemTags','buttonIcons',
						'buttonSystemQuantities','buttonUpdateSystemInterfaces','buttonSystemRelationships','buttonParameters']},
				]
			}

		],
		events: [
			{	//System quantities button clicked
				handlers: [{controlId: 'buttonSystemQuantities', event: 'click'},],
				instructions: [
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'systemQuantities'},
				],
			},
			{	//Delete system button clicked
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteSystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'deleteDefinitionValue', definitionName: 'id_system'},
				],
				cleanup: [{action: 'reload'},],
			},
			
			{ 	//New system button clicked
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'setControls_Enabled', controls: ['selectSystem','textSystemName','selectFamily','textVersion','textSystemDescription','selectCategory','textSystemReferences','textSystemTags','buttonIcons',
						'buttonSystemQuantities','buttonUpdateSystemInterfaces','buttonSystemRelationships','buttonParameters']},
					{action: 'deleteDefinitionValue', definitionName: 'id_system'},
					{action: 'emptyControl', type: 'select', id: 'selectSystem'},
					{action: 'emptyControl', type: 'heading', id: 'headingSystemName'},
					{action: 'emptyControl', type: 'text', id: 'textSystemName'},
					{action: 'emptyControl', type: 'text', id: 'textVersion'},
					{action: 'emptyControl', type: 'text', id: 'textSystemDescription'},
					{action: 'emptyControl', type: 'image', id: 'imageSystem'},
					{action: 'emptyControl', type: 'text', id: 'textSystemReferences'},
					{action: 'emptyControl', type: 'text', id: 'textSystemTags'},
					{action: 'lockControls'}
				],
				cleanup: [],
			},
			{	//Update system button clicked
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'UpdateSystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'toServer_ControlValue', id: 'textSystemName', type: 'text', columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectFamily', columnName: 'id_family', dataAttr: 'id_family'},
					{action: 'toServer_ControlValue', id: 'textVersion', type: 'text', columnName: 'version'},
					{action: 'toServer_ControlValue', id: 'imageSystem',  type: 'image', columnName: 'image'},
					{action: 'toServer_ControlValue', id: 'textSystemDescription',  type: 'text', columnName: 'description'},
					{action: 'toServer_ControlValue', id: 'textSystemReferences',  type: 'text', columnName: 'reference'},
					{action: 'toServer_ControlValue', id: 'textSystemTags',  type: 'text', columnName: 'tags'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectCategory', columnName: 'category', dataAttr: 'category'},

				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_system'},
					{action: 'reload'}
				],
			},
			{	//Clone system button clicked
				handlers: [{controlId: 'buttonClone', event: 'click'},],
				postType: 'CloneSystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_system'},
					{action: 'reload'}
				],
			},
			{	//System relationship modal
				handlers: [{controlId: 'buttonSystemRelationships', event: 'click'},],
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'mapSystems'},
				],
			},
			{	//Icon chooser
				handlers: [{controlId: 'buttonIcons', event: 'click'},],
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'icons'},
				],
			},
			{	//Change to system select
				handlers: [{controlId: 'selectSystem', event: 'change'},],
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectSystem', definitionName: 'id_system', dataAttr: 'id_system'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Attach interfaces button
				handlers: [{controlId: 'buttonUpdateSystemInterfaces', event: 'click'},],
				instructions: [	],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'interfacesToSystems'},
				],
			},
			{	//Parameters modal
				handlers: [{controlId: 'buttonParameters', event: 'click'},],
				instructions: [
					{action: 'setDefinition_SingleValue_FromConstant', definitionName: 'paramType', value: 'system'},
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'parameters'},
				],
			},
		]
	},

	subsystems: {
		title: 'Subsystems', //The title of the modal to display at the top of the modal
		formButtons: [ //The buttons to insert at the bottom of the modal
			{type: 'info', id: 'buttonNew', label: 'New Subsystem', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Remove Subsystem', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ //The empty controls to insert in the modal
			{ type: 'select', id: 'selectSubsystem', label: 'Subsystems'},
			{ type: 'img', id: 'imageSubsystem', columnName: 'image'},
			{ type: 'heading', id: 'headingSubsystemName', align: 'center'},
			{ type: 'text', id: 'textSubsystemName', label: 'Name'},
			{ type: 'textarea', id: 'textSubsystemDescription', label: 'Description' },
			{ type: 'checkbox', id: 'chkDistributedSystem', label: 'Distributed Subsystem' },
			{ type: 'buttons', buttons: [
				{ id: 'buttonIcons', label: 'Choose Icon'},
				{ id: 'buttonParameters', label: 'Subsystem Parameters'},
			]}

		],
		monitorChanges: [//The ID of the controls to monitor for changes
			{id: 'textSubsystemName', on: 'input'},
			{id: 'textSubsystemDescription', on: 'input'},
			{id: 'chkDistributedSystem', on: 'input'},
			//{id: 'selectCategory', on: 'change'},
		],
		lockOnChange: ['selectSubsystem','buttonNew','buttonDelete','buttonIcons','buttonSystemQuantities', 'buttonUpdateSystemInterfaces'], //The ID of the controls to lock when editing an object
		unlockOnChange: ['buttonUpdate'], //The ID of the controls to lock when editing an object
		iterations: [ //The objects to process in order to fetch information from the server and insert into the form controls
			{ //Get the all the subsystems
				type: 'AllSubsystems',
				definitionFields: [], 
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectSubsystem', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectSubsystem', definition: 'id_system', dataAttr: 'id_system', columnName: 'id_system'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectSubsystem', definition: 'id_system', dataAttr: 'id_system'},
				],
			},
			{ //Get specific system details
				type: 'SingleSystem',
				definitionFields: ['id_system'],
				continueOnUndefined: false,
				instructions: [
					{action: 'setControl_SingleValue', id: 'headingSubsystemName', type: 'heading', columnName: 'name'},
					{action: 'setControl_SingleValue', id: 'imageSubsystem', type: 'image', columnName: 'image'},
					{action: 'setDefinition_SingleValue', id: 'image', columnName: 'image'},
					{action: 'setControl_SingleValue',  id: 'textSubsystemName', type: 'text', columnName: 'name'},
					{action: 'setControl_SingleValue', id: 'textSubsystemDescription', type: 'text', columnName: 'description'},
					//{action: 'setControl_MultipleValues_fromConstant', type: 'selectOptions', id: 'selectCategory', constantName: 'systems', columnName: 'title', attr: {name: 'category', columnName: 'value'} },
					//{action: 'setControl_SingleValue', type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
					{action: 'setControl_SingleValue', id: 'chkDistributedSystem', type: 'checkbox', columnName: 'distributedSubsystem'},
					{action: 'setControl_Focus', id: 'selectSubsystem'}
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonDelete','textSubsystemName','textSubsystemDescription','chkDistributedSystem','buttonIcons','buttonParameters']},
				]
			}
		],
		events: [
			{	//System quantities button clicked
				handlers: [{controlId: 'buttonSystemQuantities', event: 'click'},],
				instructions: [
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'systemQuantities'},
				],
			},
			{	//Delete system button clicked
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteSystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'deleteDefinitionValue', definitionName: 'id_system'},
				],
				cleanup: [{action: 'reload'},],
			},
			
			{ 	//New system button clicked
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'setControls_Enabled', controls: ['textSubsystemName','textSubsystemDescription','chkDistributedSystem']},
					{action: 'deleteDefinitionValue', definitionName: 'id_system'},
					{action: 'emptyControl', type: 'heading', id: 'headingSubsystemName'},
					{action: 'emptyControl', type: 'text', id: 'textSubsystemName'},
					{action: 'emptyControl', type: 'text', id: 'textSubsystemDescription'},
					{action: 'emptyControl', type: 'image', id: 'imageSubsystem'},
					{action: 'emptyControl', type: 'checkbox', id: 'chkDistributedSystem'},
					{action: 'lockControls'}
				],
				cleanup: [],
			},
			{	//Update system button clicked
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'UpdateSubsystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'toServer_ControlValue', id: 'textSubsystemName', type: 'text', columnName: 'name'},
					{action: 'toServer_ControlValue', id: 'imageSubsystem',  type: 'image', columnName: 'image'},
					{action: 'toServer_ControlValue', id: 'textSubsystemDescription',  type: 'text', columnName: 'description'},
					{action: 'toServer_ControlValue', id: 'chkDistributedSystem',  type: 'checkbox', columnName: 'distributedSubsystem'},
					//{action: 'toServer_ControlValue', type: 'select', id: 'selectCategory', columnName: 'category', dataAttr: 'category'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_system'},
					{action: 'reload'}
				],
			},
			{	//System relationship modal
				handlers: [{controlId: 'buttonSystemRelationships', event: 'click'},],
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'mapSystems'},
				],
			},
			{	//Icon chooser
				handlers: [{controlId: 'buttonIcons', event: 'click'},],
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'icons'},
				],
			},
			{	//Change to system select
				handlers: [{controlId: 'selectSubsystem', event: 'change'},],
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectSubsystem', definitionName: 'id_system', dataAttr: 'id_system'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Attach interfaces button
				handlers: [{controlId: 'buttonUpdateSystemInterfaces', event: 'click'},],
				instructions: [

				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'interfacesToSystems'},
				],
			},
			{	//Parameters modal
				handlers: [{controlId: 'buttonParameters', event: 'click'},],
				instructions: [
					{action: 'setDefinition_SingleValue_FromConstant', definitionName: 'paramType', value: 'subsystem'},
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'parameters'},
				],
			},
		]
	},

	icons: {
		title: 'Choose Icon', //The title of the modal to display at the top of the modal
		formButtons: [ //The buttons to insert at the bottom of the modal
			{type: 'submit', id: 'buttonUpdate', label: 'Select', initialState: 'unlock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Cancel', initialState: 'unlock'},
		], 
		formFields: [ //The empty controls to insert in the modal
			{ type: 'container', id: 'containerIcons' },
		],
		monitorChanges: [], 
		lockOnChange: [], 
		unlockOnChange: [],
		iterations: [ 
			{ 
				type: 'images', 
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues_EntireArray', type: 'iconButtonChooser', id: 'containerIcons',},
					{action: 'setControl_SingleValue_fromDefinitionIfExists', type: 'chosenIconBySrc', id: 'containerIcons', definitionName: 'image'}
				],
			},
		],
		events: [
			{ //Handle icon button clicks to highlight the selected icon to the user
				handlers: [{controlId: 'containerIcons button', event: 'click'},],
				instructions: [ //Pre-server instructions
					{action: 'resetButtonClasses', id: 'containerIcons'},
					{action: 'setButtonClassesCurrentTarget', id: 'containerIcons'}
				],
				cleanup: [ //Post server instructions
				],
			},
			{ //Handle update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'UpdateImage', //The type of update to send to the server, if required
				instructions: [ //Pre-server instructions
					{action: 'toServer_ControlValue', type: 'selectedImage', id: 'containerIcons', columnName: 'image'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_link', columnName: 'id_link'},
				],
				cleanup: [ //Post server instructions
					{action: 'returnToLastModal'},
				],
			},
			{ //Handle icon button clicks to highlight the selected icon to the user
				handlers: [{controlId: 'buttonCancel', event: 'click'},], 
				instructions: [],
				cleanup: [ //Post server instructions
					{action: 'returnToLastModal'},
				],
			},
		]
	},

	interfacesToSystems: {
		title: 'Assign Interfaces & Links to System',
		formButtons: [
			{type: 'delete', id: 'buttonDelete', label: 'Remove Interface', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [			
			{ type: 'img', id: 'imageSystem', columnName: 'image'},
			{ type: 'heading', id: 'headingSystemName', align: 'center'},
			{ type: 'select', id: 'selectInterface', label: 'Available Interfaces'},
			{ type: 'button', id: 'buttonAssignSystem', label: '&#8595 Assign Interface to System &#8595', align: 'centre'},
			{ type: 'container', id: 'containerAssignedInterfaces' },
			{ type: 'note', text: 'Select an interface to access additional details:'},
			{ type: 'text', id: 'textSystemInterfaceName', label: 'System Interface Name' },
			{ type: 'textarea', id: 'textSystemInterfaceDescription', label: 'Description' },
			{ type: 'select', id: 'selectCategory', label: 'Category'},
			{ type: 'checkbox', id: 'chkIsProposed', label: 'Proposed Interface'},
			{ type: 'droppable2', id: 'containerCompatibleLinks', label: 'Compatible Links'},
			{ type: 'droppable2', id: 'containerPrimaryLinks', label: 'Primary Links'},
			{ type: 'droppable2', id: 'containerAlternateLinks', label: 'Alternate Links'},
		],
		monitorChanges: [
			{id: 'textSystemInterfaceName', on: 'input'},
			{id: 'textSystemInterfaceDescription', on: 'input'},
			{id: 'chkIsProposed', on: 'change'},
			{id: 'selectCategory', on: 'change'},
		],
		lockOnChange: ['buttonAssignSystem','containerAssignedInterfaces','buttonDelete', 'containerAssignedInterfaces button'], 
		unlockOnChange: ['buttonUpdate'], 
		iterations: [ 
			{ 
				type: 'SingleSystem',
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_SingleValue', type: 'image', id: 'imageSystem', columnName: 'image'},
					{action: 'setControl_MultipleValues', id: 'headingSystemName', type: 'headingMultiple', columnName: ['name','version']},
				],
			},
			{ 
				type: 'AllInterfaces',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectInterface', columnName: 'name', attr: {name: 'id_interface', columnName: 'id_interface'}},
				],
			},
			{
				type: 'SystemInterfaces',
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'iconButton', id: 'containerAssignedInterfaces', columnName: 'name', attr: {name: 'id_ISMap', columnName: 'id_ISMap'}},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'text', id: 'textSystemInterfaceName', definition: 'id_ISMap', columnName: 'SIName'},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'text', id: 'textSystemInterfaceDescription', definition: 'id_ISMap', columnName: 'description'},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'checkbox', id: 'chkIsProposed', definition: 'id_ISMap', columnName: 'isProposed'},
					{action: 'setControl_SingleValue_fromDefinitionIfExists', type: 'iconButtonSelected', id: 'containerAssignedInterfaces', attrName: 'id_ISMap', definitionName: 'id_ISMap'},
					{action: 'setControl_MultipleValues_fromConstant', type: 'selectOptions', id: 'selectCategory', constantName: 'systems', columnName: 'title', attr: {name: 'category', columnName: 'value'} },
					
				],
			},
			{	//Populate the droppables
				type: 'SpecificSystemInterfaceAndLinks',
				definitionFields: ['id_ISMap'],
				continueOnUndefined: false,
				instructions: [
					{action: 'setControl_MultipleValues', arrayIndex: 1, type: 'droppableElements', id: 'containerCompatibleLinks', columnName: 'name', attr: {name: 'id_link', columnName: 'id_link'}},
					{action: 'setControl_MultipleValues', arrayIndex: 2, type: 'moveDroppableElements', id: 'containerPrimaryLinks', sourceId: 'containerCompatibleLinks', dataAttr: 'id_link', attr: {name: 'id_link', columnName: 'id_link'}},
					{action: 'setControl_MultipleValues', arrayIndex: 3, type: 'moveDroppableElements', id: 'containerAlternateLinks', sourceId: 'containerCompatibleLinks', dataAttr: 'id_link', attr: {name: 'id_link', columnName: 'id_link'}},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
				],
			},
		],
		events: [
			{	//Remove interface button clicked
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteInterfaceFromSystem',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_ISMap', columnName: 'id_ISMap'},
					{action: 'deleteDefinitionValue', definitionName: 'id_ISMap'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{ 	//Clicks on individual interface buttons
				handlers: [{controlId: 'containerAssignedInterfaces button', event: 'click'}],
				postType: 'SpecificSystemInterfaceAndLinks',
				url: 'select',
				instructions: [
					{action: 'setDefinition_FromClickedButton', definitionName: 'id_ISMap', dataAttr: 'id_ISMap'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_ISMap', columnName: 'id_ISMap'},
					{action: 'resetButtonClasses', id: 'containerAssignedInterfaces'},
					{action: 'setButtonClassesCurrentTarget', id: 'containerAssignedInterfaces'},
				],
				cleanup: [
					{action: 'emptyControl', type: 'droppableElements', id: 'containerCompatibleLinks'},
					{action: 'emptyControl', type: 'droppableElements', id: 'containerPrimaryLinks'},
					{action: 'emptyControl', type: 'droppableElements', id: 'containerAlternateLinks'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'text', id: 'textSystemInterfaceName', columnName: 'name'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'text', id: 'textSystemInterfaceDescription', columnName: 'description'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'checkbox', id: 'chkIsProposed', columnName: 'isProposed'},
					{action: 'setControl_SingleValue', arrayIndex: 0, type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
					{action: 'setControl_MultipleValues', arrayIndex: 1, type: 'droppableElements', id: 'containerCompatibleLinks', columnName: 'name', attr: {name: 'id_link', columnName: 'id_link'}},
					{action: 'setControl_MultipleValues', arrayIndex: 2, type: 'moveDroppableElements', id: 'containerPrimaryLinks', sourceId: 'containerCompatibleLinks', dataAttr: 'id_link', attr: {name: 'id_link', columnName: 'id_link'}},
					{action: 'setControl_MultipleValues', arrayIndex: 3, type: 'moveDroppableElements', id: 'containerAlternateLinks', sourceId: 'containerCompatibleLinks', dataAttr: 'id_link', attr: {name: 'id_link', columnName: 'id_link'}},
				],
			},
			{	//Assign Interface to System button clicked
				handlers: [{controlId: 'buttonAssignSystem', event: 'click'}], 
				postType: 'AssignInterfaceToSystem',
				instructions: [ 
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectInterface', dataAttr: 'id_interface', definitionName: 'id_interface'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Update System Interface details
				handlers: [{controlId: 'buttonUpdate', event: 'click'}], 
				postType: 'UpdateInterfaceToSystemMap',
				instructions: [ 
					{action: 'toServer_DefinitionValue', definitionName: 'id_ISMap', columnName: 'id_ISMap'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textSystemInterfaceName',  columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textSystemInterfaceDescription', columnName: 'description'},
					{action: 'toServer_ControlValue', type: 'checkbox', id: 'chkIsProposed', columnName: 'isProposed'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectCategory', columnName: 'category', dataAttr: 'category'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Close button
				handlers: [{controlId: 'buttonCancel', event: 'click'}], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
			{	//Handle elements being dropped
				handlers: [
					{controlId: 'containerCompatibleLinks div', event: 'drop'},
					{controlId: 'containerPrimaryLinks div', event: 'drop'},
					{controlId: 'containerAlternateLinks div', event: 'drop'},
				],
				postType: 'AssignLinksToSystemInterface',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'containerPrimaryLinks', dataAttr: 'id_link', columnName: 'primaryLinks'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'containerAlternateLinks', dataAttr: 'id_link', columnName: 'alternateLinks'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_ISMap', columnName: 'id_ISMap'},
				],
				cleanup: [],
			},
			{	//Handle elements being dragged
				handlers: [
					{controlId: 'containerCompatibleLinks div', event: 'dragover'},
					{controlId: 'containerPrimaryLinks div', event: 'dragover'},
					{controlId: 'containerAlternateLinks div', event: 'dragover'},
				],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},

		]
	},

	interfaces: {
		title: 'Interfaces',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Interface', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Interface', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectInterfaces', label: 'Existing Interfaces'},
			{ type: 'img', id: 'imageInterface', columnName: 'image'},
			{ type: 'heading', id: 'headingInterfaceName', align: 'center'},
			{ type: 'text', id: 'textInterfaceName', label: 'Name'},
			{ type: 'textarea', id: 'textInterfaceDescription', label: 'Description' },
			{ type: 'droppable2', id: 'availableTechnologies', label: 'Available Technologies'},
			{ type: 'droppable2', id: 'assignedTechnologies', label: 'Interface Technologies'},
			{ type: 'buttons', buttons: [
				{ id: 'buttonIcons', label: 'Choose Icon'},
				{ id: 'buttonParameters', label: 'Interface Parameters'},
			]}
		],
		monitorChanges: [
			{id: 'textInterfaceName', on: 'input'},
			{id: 'textInterfaceDescription', on: 'input'},
		],
		lockOnChange: ['selectInterfaces','buttonIcons','buttonNew','buttonDelete'],
		unlockOnChange: ['buttonUpdate'], 
		iterations: [
			{ 	//Populate interface select
				type: 'AllInterfaces',
				definitionFields: [],
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectInterfaces', columnName: 'name', attr: {name: 'id_interface', columnName: 'id_interface'}},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectInterfaces', definition: 'id_interface', dataAttr: 'id_interface', columnName: 'id_interface'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectInterfaces', definition: 'id_interface', dataAttr: 'id_interface'},
				],
			},
			{ 	//Display interface details for the currently selected interface
				type: 'SingleInterface', 
				definitionFields: ['id_interface'],
				continueOnUndefined: false,
				instructions: [ 
					{action: 'setControl_SingleValue', type: 'image', id: 'imageInterface', columnName: 'image'},
					{action: 'setControl_SingleValue', type: 'heading', id: 'headingInterfaceName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textInterfaceName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textInterfaceDescription', columnName: 'description'},
					{action: 'setDefinition_SingleValue_fromParamNoArray', definitionName: 'image', columnName: 'image'},
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonDelete','selectInterfaces','textInterfaceName','textInterfaceDescription','availableTechnologies','assignedTechnologies','buttonIcons','buttonParameters','availableTechnologies','assignedTechnologies']},
				]
			},
			{ 	//Get all technologies
				type: 'AllTechnologies', 
				definitionFields: [], 
				instructions: [ 
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'droppableElements', id: 'availableTechnologies', columnName: 'name', attr: {name: 'id_technology', columnName: 'id_technology'} },
				],
			},
			{	//Get technologies associated with the selected interface and move to the appropriate container
				type: 'AssignedTechnologies', 
				definitionFields: ['id_interface'], 
				instructions: [ 
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'moveDroppableElements', sourceId: 'availableTechnologies', id: 'assignedTechnologies', columnName: 'name', attr: {name: 'id_technology', columnName: 'id_technology'} },
				],
			},

		],
		events: [
			{	//Icon chooser
				handlers: [{controlId: 'buttonIcons', event: 'click'},],
				instructions: [
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'icons'},
				],
			},
			{	//Delete Interface button clicked
				handlers: [{controlId: 'buttonDelete', event: 'click'},],
				postType: 'DeleteInterface',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
					{action: 'deleteDefinitionValue', definitionName: 'id_interface'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{ //New interface button clicked
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'setControls_Enabled', controls: ['textInterfaceName','textInterfaceDescription','availableTechnologies','assignedTechnologies']},
					{action: 'deleteDefinitionValue', definitionName: 'id_interface'},
					{action: 'emptyControl', type: 'select', id: 'selectInterfaces'},
					{action: 'emptyControl', type: 'heading', id: 'headingInterfaceName'},
					{action: 'emptyControl', type: 'text', id: 'textInterfaceName'},
					{action: 'emptyControl', type: 'text', id: 'textInterfaceDescription'},
					{action: 'emptyControl', type: 'image', id: 'imageInterface'},
					{action: 'hideControls', controls: ['availableTechnologies','availableTechnologies_heading','assignedTechnologies','assignedTechnologies_heading' ]},
					{action: 'lockControls'}
				],
				cleanup: [],
			},
			{	//Update Interface button clicked
				handlers: [{controlId: 'buttonUpdate', event: 'click'},],
				postType: 'UpdateInterface',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textInterfaceName', columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textInterfaceDescription', columnName: 'description'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_interface'},
					{action: 'reload'},
				],
			},
			{	//Interface select changes
				handlers: [{controlId: 'selectInterfaces', event: 'change'},],
				postType: 'SingleInterface', 
				url: 'select',
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectInterfaces', definitionName: 'id_interface', dataAttr: 'id_interface'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Handle elements being dropped
				handlers: [
					{controlId: 'assignedTechnologies div', event: 'drop'},
					{controlId: 'availableTechnologies div', event: 'drop'},
				],
				postType: 'UpdateInterfaceTechnologyAssignments',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'assignedTechnologies', dataAttr: 'id_technology', columnName: 'id_technology_arr'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
				],
				cleanup: [
				],
			},
			{	//Handle elements being dragged
				handlers: [
					{controlId: 'availableTechnologies div', event: 'dragover'},
					{controlId: 'assignedTechnologies div', event: 'dragover'},
				],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},
			{	//Parameters modal
				handlers: [{controlId: 'buttonParameters', event: 'click'},],
				instructions: [
					{action: 'setDefinition_SingleValue_FromConstant', definitionName: 'paramType', value: 'interface'},
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'parameters'},
				],
			},
		]
	},

	systemQuantities: {
		title: 'System Quantities',
		formButtons: [
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'unlock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'img', id: 'imageSystem', columnName: 'image'},
			{ type: 'heading', id: 'headingSystemName', align: 'center'},
			{ type: 'note', text: `This form is used to track the introduction of new systems into the system. For systems being removed, include a 0 in the final year to indicate removal.`},
			{ type: 'container', id: 'containerQtyToYears' },
			{ type: 'buttons', buttons: [
				{ id: 'buttonNewField', label: 'Add New Field'},
				{ id: 'buttonRemoveLastField', label: 'Remove Last Field'},
			]}
		],
		monitorChanges: [],
		lockOnChange: [],
		unlockOnChange: [], 
		iterations: [
			{ 
				type: 'SingleSystem', 
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [ 
					//{action: 'setControl_SingleValue', id: 'headingSystemName', type: 'heading', columnName: 'name'},
					{action: 'setControl_MultipleValues', id: 'headingSystemName', type: 'headingMultiple', columnName: ['name','version']},
					{action: 'setControl_SingleValue', id: 'imageSystem', type: 'image', columnName: 'image'},
				],
			},
			{ 
				type: 'QtyYears', 
				definitionFields: ['id_system'],
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues_EntireArray', type: 'qtyYears', id: 'containerQtyToYears'}
				],
			},
		],
		events: [
			{
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'QtyYears', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'toServer_ControlValue', type: 'qtyYears', id: 'containerQtyToYears', columnName: 'years'},
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Add additional controls
				handlers: [{controlId: 'buttonNewField', event: 'click'},],
				instructions: [
					{action: 'addControls', id: 'containerQtyToYears', type: 'qtyYears'},
					{action: 'unlockControls'},
				],
				cleanup: [
				],
			},
			{	//Remove last control
				handlers: [{controlId: 'buttonRemoveLastField', event: 'click'},], 
				instructions: [
					{action: 'removeControls', id: 'containerQtyToYears', type: 'qtyYears'},
					{action: 'unlockControls'},
				],
				cleanup: [
				],
			},
			{	//Cancel button
				handlers: [{controlId: 'buttonCancel', event: 'click'},],  
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},			
		]
	},

	links: {
		title: 'Interface Links',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Link', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Link', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Cancel', initialState: 'unlock'},
		], 
		formFields: [
			{ type: 'select', id: 'selectLinks', label: 'Existing Links'},
			{ type: 'img', id: 'imageLinks', columnName: 'image'},
			{ type: 'heading', id: 'headingLinks', align: 'center'},
			{ type: 'text', id: 'textLinkName', label: 'Name'},
			{ type: 'select', id: 'selectCategory', label: 'Category'},
			{ type: 'text', id: 'textLinkDesignation', label: 'Designation'},
			{ type: 'select', id: 'selectTechnology', label: 'Link Technology'},
			{ type: 'textarea', id: 'textLinkDescription', label: 'Description' },
			{ type: 'buttons', buttons: [
				{ id: 'buttonIcons', label: 'Choose Icon'},
				{ id: 'buttonParameters', label: 'Link Parameters'},
			]}

		],
		monitorChanges: [
			{id: 'textLinkName', on: 'input'},
			{id: 'textLinkDesignation', on: 'input'},
			{id: 'selectTechnology', on: 'change'},
			{id: 'textLinkDescription', on: 'input'},
			{id: 'selectLinkColor', on: 'change'},
			{id: 'selectCategory', on: 'change'}
		],
		lockOnChange: ['buttonDelete','buttonNew','selectLinks','buttonIcons',],
		unlockOnChange: ['buttonUpdate'], 
		iterations: [
			{
				type: 'AllTechnologies', 
				definitionFields: [],
				instructions: [ 
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectTechnology', columnName: 'name', attr: {name: 'id_technology', columnName: 'id_technology'} },
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectTechnology', definition: 'id_technology', dataAttr: 'id_technology'},
				],
			},
			{
				//Simple check to prevent the user going further if no technology has been defined
				type: 'SingleTechnology',
				definitionFields: ['id_technology'], 
				continueOnUndefined: false,
				instructions: [ ],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonNew','buttonDelete','textLinkName','selectCategory','textLinkDesignation','selectTechnology','textLinkDescription','buttonIcons','buttonParameters']},
				]
			},
			{
				type: 'AllLinks', 
				definitionFields: [], 
				instructions: [ 
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectLinks', columnName: 'name', attr: {name: 'id_link', columnName: 'id_link'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectLinks', definition: 'id_link', dataAttr: 'id_link', columnName: 'id_link'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectLinks', definition: 'id_link', dataAttr: 'id_link'},
				],
			},
			{ 
				type: 'Link',
				definitionFields: ['id_link'], 
				continueOnUndefined: false,
				instructions: [ 
					{action: 'setControl_SingleValue', type: 'image', id: 'imageLinks', columnName: 'image'},
					{action: 'setDefinition_SingleValue_fromParamNoArray', definitionName: 'image', columnName: 'image'},
					{action: 'setControl_SingleValue', type: 'heading', id: 'headingLinks', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textLinkName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textLinkDesignation', columnName: 'designation'},
					{action: 'setControl_MultipleValues_fromConstant', type: 'selectOptions', id: 'selectCategory', constantName: 'links', columnName: 'title', attr: {name: 'category', columnName: 'value'} },
					{action: 'setControl_SingleValue', type: 'select', id: 'selectTechnology', columnName: 'id_technology', dataAttr: 'id_technology'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textLinkDescription', columnName: 'description'},
					{action: 'setControl_SingleValue', type: 'select', id: 'selectCategory', dataAttr: 'category', columnName: 'category'},
					{action: 'setControl_Focus', id: 'selectLinks'}
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonDelete','textLinkName','selectCategory','textLinkDesignation','selectTechnology','textLinkDescription','buttonIcons','buttonParameters']},
				]
			},
		],
		events: [
			{	//Change to link select
				handlers: [{controlId: 'selectLinks', event: 'change'},], 
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectLinks', definitionName: 'id_link', dataAttr: 'id_link'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Choose icon button
				handlers: [{controlId: 'buttonIcons', event: 'click'},], 
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'icons'},
				],
			},
			{	//Add New link button
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'setControls_Enabled', controls: ['textLinkName','selectCategory','textLinkDesignation','selectTechnology','textLinkDescription']},
					{action: 'deleteDefinitionValue', definitionName: 'id_link'},
					{action: 'emptyControl', type: 'select', id: 'selectLinks'},
					{action: 'emptyControl', type: 'heading', id: 'headingLinks'},
					{action: 'emptyControl', type: 'text', id: 'textLinkName'},
					{action: 'emptyControl', type: 'text', id: 'textLinkDesignation'},
					{action: 'emptyControl', type: 'text', id: 'textLinkDescription'},
					{action: 'emptyControl', type: 'image', id: 'imageLinks'},
					{action: 'lockControls'}					
				],
				cleanup: [
				],
			},
			{	//Delete button
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteLink', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_link', columnName: 'id_link'},
				],
				cleanup: [
					{action: 'deleteDefinition', definitionName: 'id_link'},
					{action: 'reload'},
				],
			},
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'UpdateLink', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_link', columnName: 'id_link'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textLinkName', columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textLinkDesignation', columnName: 'designation'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectTechnology', columnName: 'id_technology', dataAttr: 'id_technology'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textLinkDescription', columnName: 'description'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectCategory', columnName: 'category', dataAttr: 'category'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_link'},
					{action: 'reload'},
				],
			},
			{	//Close buttton
				handlers: [{controlId: 'buttonCancel', event: 'click'},], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
			{	//Parameters modal
				handlers: [{controlId: 'buttonParameters', event: 'click'},],
				instructions: [
					{action: 'setDefinition_SingleValue_FromConstant', definitionName: 'paramType', value: 'link'},
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'parameters'},
				],
			},
		]
	},

	technologies: {
		title: 'Link Technologies',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Technology', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectTechnologies', label: 'Link Technologies'},
			{ type: 'text', id: 'textTechnologyName', label: 'Name'},
			{ type: 'select', id: 'selectCategory', label: 'Category'},
			{ type: 'textarea', id: 'textTechnologyDescription', label: 'Description' },
			{ type: 'buttons', buttons: [
				{ id: 'buttonParameters', label: 'Technology Parameters'},
			]}
		],
		monitorChanges: [
			{id: 'textTechnologyName', on: 'input'},
			{id: 'textTechnologyDescription', on: 'input'},
			{id: 'selectCategory', on: 'change'},
		],
		lockOnChange: ['buttonDelete','buttonNew','selectTechnologies'],
		unlockOnChange: ['buttonUpdate'], 
		iterations: [
			{ 
				type: 'AllTechCategories',
				definitionFields: [],
				instructions: [
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectCategory', columnName: 'name', attr: {name: 'id_techCategory', columnName: 'id_techCategory'} },
					//{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectCategory', definition: 'id_techCategory', dataAttr: 'id_techCategory', columnName: 'id_techCategory'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectCategory', definition: 'id_techCategory', dataAttr: 'id_techCategory'},
				],
			},
			{ //Prevent being able to create a link if no technology categories exist
				type: 'SingleTechCategory', 
				definitionFields: ['id_techCategory'],
				continueOnUndefined: false,
				instructions: [],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonNew','buttonDelete','selectTechnologies','textTechnologyName','selectCategory','textTechnologyDescription','buttonParameters']},
				]
			},
			{ 
				type: 'AllTechnologies',
				definitionFields: [],
				instructions: [
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectTechnologies', columnName: 'name', attr: {name: 'id_technology', columnName: 'id_technology'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectTechnologies', definition: 'id_technology', dataAttr: 'id_technology', columnName: 'id_technology'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectTechnologies', definition: 'id_technology', dataAttr: 'id_technology'},
				],
			},

			{
				type: 'SingleTechnology', 
				definitionFields: ['id_technology'],
				continueOnUndefined: false,
				instructions: [ 
					{action: 'setControl_SingleValue', type: 'text', id: 'textTechnologyName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textTechnologyDescription', columnName: 'description'},
					{action: 'setControl_SingleValue', type: 'select', id: 'selectCategory', dataAttr: 'id_techCategory', columnName: 'id_techCategory'},
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonDelete','selectTechnologies','textTechnologyName','selectCategory','textTechnologyDescription','buttonParameters']},
				]
			},
		],
		events: [
			{	//Change to technology select
				handlers: [{controlId: 'selectTechnologies', event: 'change'},], 
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectTechnologies', definitionName: 'id_technology', dataAttr: 'id_technology'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			
			{	//Add New link button
				handlers: [{controlId: 'buttonNew', event: 'click'},], 
				instructions: [
					{action: 'setControls_Enabled', controls: ['selectTechnologies','textTechnologyName','selectCategory','textTechnologyDescription']},
					{action: 'deleteDefinitionValue', definitionName: 'id_technology'},
					{action: 'emptyControl', type: 'select', id: 'selectTechnologies'},
					{action: 'emptyControl', type: 'text', id: 'textTechnologyName'},
					{action: 'emptyControl', type: 'text', id: 'textTechnologyDescription'},
					{action: 'lockControls'}					
				],
				cleanup: [],
			},
			{	//Delete button
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteTechnology', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_technology', columnName: 'id_technology'},
				],
				cleanup: [
					{action: 'deleteDefinition', definitionName: 'id_technology'},
					{action: 'reload'},
				],
			},
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'UpdateTechnology', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_technology', columnName: 'id_technology'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textTechnologyName', columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textTechnologyDescription', columnName: 'description'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectCategory', columnName: 'id_techCategory', dataAttr: 'id_techCategory'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_technology'},
					{action: 'reload'},
				],
			},
			{	//Close buttton
				handlers: [{controlId: 'buttonCancel', event: 'click'},], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
			{	//Parameters modal
				handlers: [{controlId: 'buttonParameters', event: 'click'},],
				instructions: [
					{action: 'setDefinition_SingleValue_FromConstant', definitionName: 'paramType', value: 'technology'},
				],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'parameters'},
				],
			},
		]
	},

	tags: {
		title: 'Show / Hide Systems by Tag',
		formButtons: [ 
			{type: 'submit', id: 'buttonUpdate', label: 'Save & Close', initialState: 'unlock'},
			//{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'droppable2', id: 'availableTags', label: 'Availaible Tags' },
			{ type: 'droppable2', id: 'includedTags', label: 'Included Tags', source: 'text', columnName: 'includedFilterTag'},
			{ type: 'droppable2', id: 'excludedTags', label: 'Excluded Tags', source: 'text', columnName: 'excludedFilterTag'},
		],
		monitorChanges: [

		],
		lockOnChange: [],
		unlockOnChange: [], 
		iterations: [
			{ 
				type: 'TagList', 
				definitionFields: [], 
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues', type: 'droppableElements', id: 'availableTags', columnName: 'tag', attr: {name: 'tag', columnName: 'tag'}},
					{action: 'setControl_MultipleValues_FromLocalStorage', type: 'moveDroppableElements', id: 'includedTags', sourceId: 'availableTags', localStorageName: 'includedFilterTag', attr: {name: 'tag', columnName: 'tag'}},
					{action: 'setControl_MultipleValues_FromLocalStorage', type: 'moveDroppableElements', id: 'excludedTags', sourceId: 'availableTags', localStorageName: 'excludedFilterTag', attr: {name: 'tag', columnName: 'tag'}},
				],
			},
		],
		events: [
			{	//Save/Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'}, ],
				instructions: [
					{action: 'setLocalStorage', type: 'dropTargetContents', id: 'includedTags', localStorageName: 'includedFilterTag', attrName: 'tag'},
					{action: 'setLocalStorage', type: 'dropTargetContents', id: 'excludedTags', localStorageName: 'excludedFilterTag', attrName: 'tag'},
				],
				cleanup: [
					{action: 'reloadPage'},
					{action: 'closeModal'},
				],
			},
			{	//Handle elements being dropped
				handlers: [
					{controlId: 'availableTags div', event: 'drop'},
					{controlId: 'includedTags div', event: 'drop'},
					{controlId: 'excludedTags div', event: 'drop'},
				],
				//postType: 'UpdateSystemsAssociatedwithIssues',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop'},
				//	{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'droppableAffectedSystems', dataAttr: 'id_system', columnName: 'affectedSystems'},
				//	{action: 'toServer_DefinitionValue', definitionName: 'id_interfaceIssue', columnName: 'id_interfaceIssue'},
				],
				cleanup: [],
			},
			{	//Handle elements being dragged
				handlers: [
					{controlId: 'availableTags div', event: 'dragover'},
					{controlId: 'includedTags div', event: 'dragover'},
					{controlId: 'excludedTags div', event: 'dragover'},
				],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},
		]
	},

	interfaceIssues: {
		title: 'Interface Issues',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Issue', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Issue', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Save Issue', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectInterface', label: 'Interfaces'},
			{ type: 'select', id: 'selectIssue', label: 'Existing Interface Issue'},
			{ type: 'text', id: 'textTitle', label: 'Issue Title'},
			{ type: 'droppable2', id: 'droppableAffectedSystems', label: 'Systems affected by this issue'},
			{ type: 'droppable2', id: 'droppableSystemsUsingThisInterface', label: 'Other systems which implement this interface'},
			{ type: 'slider', id: 'sliderSeverity', label: 'Severity', max: 6},
			{ type: 'textarea', id: 'textIssueDetails', label: 'Issue'},
			{ type: 'textarea', id: 'textIssueResolution', label: 'Proposed Resolution'},
		],
		monitorChanges: [
			{id: 'textTitle', on: 'input'},
			{id: 'sliderSeverity', on: 'input'},
			{id: 'textIssueDetails', on: 'input'},
			{id: 'textIssueResolution', on: 'input'},
		],
		lockOnChange: ['buttonNew','buttonDelete','selectInterface','selectIssue','droppableAffectedSystems','droppableSystemsUsingThisInterface'],
		unlockOnChange: ['buttonUpdate'], 
		iterations: [
			{ 	//Populate interface select
				type: 'AllInterfaces',
				definitionFields: [],
				instructions: [
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectInterface', columnName: 'name', attr: {name: 'id_interface', columnName: 'id_interface'}},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectInterface', definition: 'id_interface', dataAttr: 'id_interface', columnName: 'id_interface'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectInterface', definition: 'id_interface', dataAttr: 'id_interface'},
				],
			},
			{ 	//Populate issues select
				type: 'AllInterfaceIssues',
				definitionFields: ['id_interface'],
				continueOnUndefined: false,
				instructions: [
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectIssue', columnName: 'name', attr: {name: 'id_interfaceIssue', columnName: 'id_interfaceIssue'}},
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectIssue', definition: 'id_interfaceIssue', dataAttr: 'id_interfaceIssue', columnName: 'id_interfaceIssue'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectIssue', definition: 'id_interfaceIssue', dataAttr: 'id_interfaceIssue'},
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonNew','buttonDelete','selectInterface','selectIssue','textTitle','sliderSeverity','textIssueDetails','textIssueResolution']},
				]
			},
			{ 	//Populate the droppable with all systems which implement this interface
				type: 'SystemsWithSpecificInterface',
				definitionFields: ['id_interface'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues', type: 'droppableElements', id: 'droppableSystemsUsingThisInterface', columnName: 'name', attr: {name: 'id_system', columnName: 'id_system'}},
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonNew','buttonDelete','selectInterface','selectIssue','textTitle','sliderSeverity','textIssueDetails','textIssueResolution']},
				]
			},
			
			{ 	//Get selected issue detail
				type: 'SpecificInterfaceIssue',
				definitionFields: ['id_interfaceIssue'],
				continueOnUndefined: false,
				instructions: [
					{action: 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex', type: 'text', id: 'textTitle', arrayIndex: 0, columnName: 'name'},
					{action: 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex', type: 'slider', id: 'sliderSeverity', arrayIndex: 0,  columnName: 'severity'},
					{action: 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex', type: 'text', id: 'textIssueDetails', arrayIndex: 0,  columnName: 'issue'},
					{action: 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex', type: 'text', id: 'textIssueResolution', arrayIndex: 0,  columnName: 'resolution'},
					
					{action: 'setControl_MultipleValues', arrayIndex: 1, type: 'moveDroppableElements', id: 'droppableAffectedSystems', sourceId: 'droppableSystemsUsingThisInterface', dataAttr: 'id_system', attr: {name: 'id_system', columnName: 'id_system'}},
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonDelete','selectInterface','selectIssue','textTitle','sliderSeverity','textIssueDetails','textIssueResolution']},
				]
			},
		],
		events: [
			{	//Update issue details
				handlers: [{controlId: 'buttonUpdate', event: 'click'}], 
				postType: 'UpdateInterfaceIssue',
				instructions: [ 
					{action: 'toServer_DefinitionValue', definitionName: 'id_interfaceIssue', columnName: 'id_interfaceIssue'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textTitle',  columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'slider', id: 'sliderSeverity', columnName: 'severity'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textIssueDetails',  columnName: 'issue'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textIssueResolution', columnName: 'resolution'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_interfaceIssue'},
					{action: 'reload'},
				],
			},
			
			{ 	//Severity slider changes
				handlers: [{controlId: 'sliderSeverity', event: 'input'},],
				instructions: [
					//{action: 'preventDefault'},
					{action: 'debug', message: 'fired'},
					{action: 'setSliderDescription', type: 'sliderDescription', id: 'sliderSeverity'},
					{action: 'lockControls'}
				],
				cleanup: [],
			},

			{	//Delete button clicked
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteInterfaceIssue',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_interfaceIssue', columnName: 'id_interfaceIssue'},
					{action: 'deleteDefinitionValue', definitionName: 'id_interfaceIssue'},
				],
				cleanup: [{action: 'reload'},],
			},


			{ 	//New system button clicked
				handlers: [{controlId: 'buttonNew', event: 'click'},],
				instructions: [
					{action: 'setControls_Enabled', controls: ['textTitle','sliderSeverity','textIssueDetails','textIssueResolution']},
					{action: 'deleteDefinitionValue', definitionName: 'id_interfaceIssue'},
					{action: 'emptyControl', type: 'select', id: 'selectIssue'},
					{action: 'emptyControl', type: 'text', id: 'textTitle'},
					{action: 'emptyControl', type: 'slider', id: 'sliderSeverity'},
					{action: 'emptyControl', type: 'text', id: 'textIssueDetails'},
					{action: 'emptyControl', type: 'text', id: 'textIssueResolution'},
					{action: 'lockControls'}
				],
				cleanup: [],
			},



			{	//Issue select changes
				handlers: [{controlId: 'selectIssue', event: 'change'},],
				instructions: [{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectIssue', definitionName: 'id_interfaceIssue', dataAttr: 'id_interfaceIssue'},],
				cleanup: [{action: 'reload'},],
			},
			{	//Interface select changes
				handlers: [{controlId: 'selectInterface', event: 'change'},],
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectInterface', definitionName: 'id_interface', dataAttr: 'id_interface'},
					{action: 'deleteDefinitionValue', definitionName: 'id_interfaceIssue'},
				],
				cleanup: [{action: 'reload'},],
			},
			{	//Close button
				handlers: [{controlId: 'buttonCancel', event: 'click'}], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
			{	//Handle elements being dropped
				handlers: [
					{controlId: 'droppableAffectedSystems div', event: 'drop'},
					{controlId: 'droppableSystemsUsingThisInterface div', event: 'drop'},
				],
				postType: 'UpdateSystemsAssociatedwithIssues',
				instructions: [
					{action: 'preventDefault'},
					{action: 'handleDrop'},
					{action: 'toServer_ControlValue', type: 'dropTargetContents', id: 'droppableAffectedSystems', dataAttr: 'id_system', columnName: 'affectedSystems'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interfaceIssue', columnName: 'id_interfaceIssue'},
				],
				cleanup: [],
			},
			{	//Handle elements being dragged
				handlers: [
					{controlId: 'droppableAffectedSystems div', event: 'dragover'},
					{controlId: 'droppableSystemsUsingThisInterface div', event: 'dragover'},
				],
				instructions: [{action: 'preventDefault'},],
				cleanup: [],
			},
		]
	},

	selectOrganisation: {
		title: 'Select Organisation',
		formButtons: [
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},	
		],
		formFields: [
			{ type: 'organisation', id: 'pathAbove', text: `Path to Current Organisational Node: `},
			{ type: 'organisation', id: 'currentNode', text: `Current Organisational Node: `},
			{ type: 'organisation', id: 'childNodes', text: `Child Subordinates Nodes: `},
		],
		
		monitorChanges: [], 
		lockOnChange: [], //The ID of the controls to lock when editing an object
		unlockOnChange: [], //The ID of the controls to lock when editing an object
		iterations: [
			{
				type: 'Organisation',
				definitionFields: ['id_organisation'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndex', id: 'id_organisation',  arrayIndex: 1, columnName: 'id_organisation'},
					{action: 'setDefinition_SingleValue_AtSpecificArrayIndexFirstIndex', id: 'parent', arrayIndex: 0, columnName: 'id_organisation'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'orgPath', id: 'pathAbove', modal: 'organisation', arrayIndex: 0, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'currentNode', modal: 'organisation', arrayIndex: 1, columnName: 'name'},
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'organisation', id: 'childNodes', modal: 'organisation', arrayIndex: 2, columnName: 'name'},
				],
			}
		],
		events: [
			{	//Handle clicks to node buttons in pathAbove or childNodes
				handlers: [
					{controlId: 'pathAbove button', event: 'click'},
					{controlId: 'childNodes button', event: 'click'},
				],
				instructions: [
					{action: 'setDefinition_FromClickedButton', id: 'pathAbove', dataAttr: 'id_organisation', definitionName: 'id_organisation'},
					{action: 'setLocalStorage_fromDefinition', localStorageName: 'currentOrganisation', definitionName: 'id_organisation'}
				],
				cleanup: [{action: 'reload'},],
			},
		]
	},

	export: {
		title: 'Export Data',
		formButtons: [ 
			//{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'buttons', buttons: [
				{ id: 'exportPNG', label: 'Export PNG'},
				{ id: 'exportJPG', label: 'Export JPG'},
				{ id: 'exportCSV', label: 'Export CSV'},
				{ id: 'exportCim', label: 'CIM Export'},
			]},
		],
		monitorChanges: [],
		lockOnChange: [],
		unlockOnChange: [], 
		iterations: [
		],
		events: [
			{
				handlers: [{controlId: 'exportPNG', event: 'click'}, ], 
				instructions: [],
				cleanup: [
					{action: 'launchFunction', functionName: 'savePNG'},
					{action: 'closeModal'},
				],
			},
			{
				handlers: [{controlId: 'exportJPG', event: 'click'}, ],
				instructions: [],
				cleanup: [
					{action: 'launchFunction', functionName: 'saveJPG'},
					{action: 'closeModal'},
				],
			},
			{
				handlers: [{controlId: 'exportCim', event: 'click'}, ],
				instructions: [],
				cleanup: [
					{action: 'launchFunction', functionName: 'saveCimCsv'},
					{action: 'closeModal'},
				],
			},
			{
				handlers: [{controlId: 'exportCSV', event: 'click'}, ],
				instructions: [],
				cleanup: [
					{action: 'launchFunction', functionName: 'saveCSV'},
					{action: 'closeModal'},

				],
			},
		]
	},

	specificSystem: {
		title: 'Display Single System',
		formButtons: [ 
			{type: 'submit', id: 'buttonGo', label: 'Go', initialState: 'unlock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectSystem', label: 'System'},
		],
		monitorChanges: [],
		lockOnChange: [],
		unlockOnChange: [], 
		iterations: [
			{ //Get the all the systems
				type: 'AllSystems', 
				definitionFields: [], 
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions_MultipleFields', id: 'selectSystem', columnName: ['name','version'], attr: {name: 'id_system', columnName: 'id_system'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectSystem', definition: 'id_system', dataAttr: 'id_system', columnName: 'id_system'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectSystem', definition: 'id_system', dataAttr: 'id_system'},
				],
			},
		],
		events: [
			{	//Go button clicked
				handlers: [{controlId: 'buttonGo', event: 'click'},],
				instructions: [
					{action: 'resetDefinition'},
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectSystem', definitionName: 'id_system', dataAttr: 'id_system'},
					{action: 'setDefinition_SingleValue_FromConstant', definitionName: 'graph', value: 'standard'},
				],
				cleanup: [
					{action: 'setSessionStorageFromConstant', sessionStorageName: 'currentPage', value: 'specificSystem'},
					{action: 'setSessionStorageFromDefinition', sessionStorageName: 'id_system', definitionName: 'id_system'},
					{action: 'launchFunctionWithDefinition', functionName: 'commonGraph'},
					{action: 'closeModal'},
				],
			},
		]
	},

	families: {
		title: 'Families',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Family', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Family', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectFamily', label: 'System Families'},
			{ type: 'text', id: 'textFamilyName', label: 'Name'},
			{ type: 'textarea', id: 'textFamilyDescription', label: 'Description'},
		],
		monitorChanges: [
			{id: 'textFamilyName', on: 'input'},
			{id: 'textFamilyDescription', on: 'input'},
		],
		lockOnChange: ['buttonDelete','buttonNew','selectFamily'],
		unlockOnChange: ['buttonUpdate'],
		iterations: [
			{ 
				type: 'AllFamilies',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectFamily', columnName: 'name', attr: {name: 'id_family', columnName: 'id_family'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectFamily', definition: 'id_family', dataAttr: 'id_family', columnName: 'id_family'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectFamily', definition: 'id_family', dataAttr: 'id_family'},
				],
			},
			{
				type: 'SingleFamily', 
				definitionFields: ['id_family'],
				continueOnUndefined: false,
				instructions: [
					{action: 'setControl_SingleValue', type: 'text', id: 'textFamilyName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textFamilyDescription', columnName: 'description'},
					{action: 'setControls_Enabled', controls: ['buttonDelete', 'textFamilyName', 'textFamilyDescription']}
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['textFamilyName','textFamilyDescription','buttonDelete']},
				]
			},
		],
		events: [
			
			{	//Change to family select
				handlers: [{controlId: 'selectFamily', event: 'change'},], 
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectFamily', definitionName: 'id_family', dataAttr: 'id_family'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Add New family button
				handlers: [{controlId: 'buttonNew', event: 'click'},], 
				instructions: [
					{action: 'setControls_Enabled', controls: ['textFamilyName', 'textFamilyDescription']},
					{action: 'deleteDefinitionValue', definitionName: 'id_family'},
					{action: 'emptyControl', type: 'select', id: 'selectFamily'},
					{action: 'emptyControl', type: 'text', id: 'textFamilyName'},
					{action: 'emptyControl', type: 'text', id: 'textFamilyDescription'},
					{action: 'lockControls'}					
				],
				cleanup: [],
			},
			{	//Delete button
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteFamily', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_family', columnName: 'id_family'},
				],
				cleanup: [
					{action: 'deleteDefinition', definitionName: 'id_family'},
					{action: 'reload'},
				],
			},
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'UpdateFamily',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_family', columnName: 'id_family'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textFamilyName', columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textFamilyDescription', columnName: 'description'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_family'},
					{action: 'reload'},
				],
			},
			{	//Close buttton
				handlers: [{controlId: 'buttonCancel', event: 'click'},], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
		]
	},

	techCategories: {
		title: 'Technology Categories',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Technology Category', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Technology Category', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'close', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectTechCategory', label: 'All Technology Categories'},
			{ type: 'text', id: 'textTechCategoryName', label: 'Name'},
			{ type: 'select', id: 'selectTechCategoryColor', label: 'Assigned Colour' },
		],
		monitorChanges: [
			{id: 'textTechCategoryName', on: 'input'},
			{id: 'selectTechCategoryColor', on: 'change'},
		],
		lockOnChange: ['buttonDelete','buttonNew','selectTechCategory'],
		unlockOnChange: ['buttonUpdate'],
		iterations: [
			{ 
				type: 'AllTechCategories',
				definitionFields: [],
				continueOnUndefined: true,
				instructions: [ 
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectTechCategory', columnName: 'name', attr: {name: 'id_techCategory', columnName: 'id_techCategory'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectTechCategory', definition: 'id_techCategory', dataAttr: 'id_techCategory', columnName: 'id_techCategory'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectTechCategory', definition: 'id_techCategory', dataAttr: 'id_techCategory'},
					{action: 'setControl_Colors', type: 'selectOptions', id: 'selectTechCategoryColor'},
				],
			},
			{
				type: 'SingleTechCategory', 
				definitionFields: ['id_techCategory'],
				continueOnUndefined: false,
				instructions: [ 
					{action: 'setControl_SingleValue', type: 'text', id: 'textTechCategoryName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'select', id: 'selectTechCategoryColor', columnName: 'color'},
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonDelete','textTechCategoryName','selectTechCategoryColor']},
				]
			},
		],
		events: [
			{	//Change to all tech categories select
				handlers: [{controlId: 'selectTechCategory', event: 'change'},], 
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectTechCategory', definitionName: 'id_techCategory', dataAttr: 'id_techCategory'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Add New Tech Category button
				handlers: [{controlId: 'buttonNew', event: 'click'},], 
				instructions: [
					{action: 'setControls_Enabled', controls: ['textTechCategoryName','selectTechCategoryColor']},
					{action: 'deleteDefinitionValue', definitionName: 'id_techCategory'},
					{action: 'emptyControl', type: 'select', id: 'selectTechCategory'},
					{action: 'emptyControl', type: 'text', id: 'textTechCategoryName'},
					{action: 'lockControls'}
				],
				cleanup: [],
			},
			{	//Delete button
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteTechCategory', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_techCategory', columnName: 'id_techCategory'},
				],
				cleanup: [
					{action: 'deleteDefinition', definitionName: 'id_techCategory'},
					{action: 'reload'},
				],
			},
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'UpdateTechCategory',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_techCategory', columnName: 'id_techCategory'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textTechCategoryName', columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectTechCategoryColor', columnName: 'color'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_techCategory'},
					{action: 'reload'},
				],
			},
			{	//Close buttton
				handlers: [{controlId: 'buttonCancel', event: 'click'},], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
		]
	},

	paramDefinition: {
		title: 'Define Parameters',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Parameter', initialState: 'lock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Parameter', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectParamGroup', label: 'Parameter Group'},
			{ type: 'select', id: 'selectParamDefinition', label: 'Parameter'},
			{ type: 'text', id: 'textParamName', label: 'Parameter Name'},
			{ type: 'select', id: 'selectParamType', label: 'Parameter Type'},
			{ type: 'textarea', id: 'textParamOptions', label: 'Parameter Options'},
			{ type: 'checkbox', id: 'chkApplicableToSystem', label: 'Applicable to System'},
			{ type: 'checkbox', id: 'chkApplicableToSubsystem', label: 'Applicable to Subsystem'},
			{ type: 'checkbox', id: 'chkApplicableToInterface', label: 'Applicable to Interface'},
			{ type: 'checkbox', id: 'chkApplicableToLink', label: 'Applicable to Link'},
			{ type: 'checkbox', id: 'chkApplicableToTechnology', label: 'Applicable to Technology'},
			

			{ type: 'buttons', buttons: [
				{ id: 'buttonParamGroups', label: 'Parameter Groups'},
			]}
			//{ type: 'select', id: 'selectTechCategoryColor', label: 'Assigned Color' },
		],
		monitorChanges: [
			{id: 'textParamName', on: 'input'},
			{id: 'textParamOptions', on: 'input'},
			{id: 'selectParamType', on: 'change'},
			{id: 'chkApplicableToSystem', on: 'change'},
			{id: 'chkApplicableToSubsystem', on: 'change'},
			{id: 'chkApplicableToInterface', on: 'change'},
			{id: 'chkApplicableToLink', on: 'change'},
			{id: 'chkApplicableToTechnology', on: 'change'},
		],
		lockOnChange: ['buttonDelete','buttonNew','selectParamGroup','selectParamDefinition','buttonParamGroups'],
		unlockOnChange: ['buttonUpdate'],
		iterations: [
			{ 
				//Populate fixed controls
				definitionFields: [],
				continueOnUndefined: false,
				instructions: [
					//Populate selectParamType
					{action: 'setControl_FromList', type: 'selectOptions', id: 'selectParamType', attr: {name: 'paramType', columnName: 'value'}, columnName: 'title',
					list: [
						{title: 'Single Option', value: 'singleOption'},
						{title: 'Multiple Options', value: 'multiOption'},
						{title: 'True/False', value: 'boolean'},
						{title: 'Free Text', value: 'freeText'},
						{title: 'Number', value: 'number'},
					]},
				]
			},
			{ 
				//Load the parameter groups
				type: 'AllParamGroups',
				definitionFields: [],
				instructions: [ 
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectParamGroup', columnName: 'name', attr: {name: 'id_paramGroup', columnName: 'id_paramGroup'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectParamGroup', definition: 'id_paramGroup', dataAttr: 'id_paramGroup', columnName: 'id_paramGroup'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectParamGroup', definition: 'id_paramGroup', dataAttr: 'id_paramGroup'},
				],
			},
			{
				//Load the parameter definitions which exist within the parameter group
				type: 'ParamDefinitionsWithinGroup', 
				definitionFields: ['id_paramGroup'],
				continueOnUndefined: false,
				instructions: [ 
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectParamDefinition', columnName: 'name', attr: {name: 'id_paramDefinition', columnName: 'id_paramDefinition'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectParamDefinition', definition: 'id_paramDefinition', dataAttr: 'id_paramDefinition', columnName: 'id_paramDefinition'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectParamDefinition', definition: 'id_paramDefinition', dataAttr: 'id_paramDefinition'},
					{action: 'setControls_Enabled', controls: ['buttonNew','buttonDelete']},

				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['buttonNew','buttonDelete']},
				]
			},
			{ //Get specific parameter definition details
				type: 'SingleParamDefinition',
				definitionFields: ['id_paramDefinition'],
				continueOnUndefined: false,
				instructions: [
					{action: 'setControl_SingleValue', type: 'text', id: 'textParamName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'text', id: 'textParamOptions', columnName: 'options'},
					{action: 'setControl_SingleValue', type: 'checkbox', id: 'chkApplicableToSystem', columnName: 'applicableToSystem'},
					{action: 'setControl_SingleValue', type: 'checkbox', id: 'chkApplicableToSubsystem', columnName: 'applicableToSubsystem'},
					{action: 'setControl_SingleValue', type: 'checkbox', id: 'chkApplicableToInterface', columnName: 'applicableToInterface'},
					{action: 'setControl_SingleValue', type: 'checkbox', id: 'chkApplicableToLink', columnName: 'applicableToLink'},
					{action: 'setControl_SingleValue', type: 'checkbox', id: 'chkApplicableToTechnology', columnName: 'applicableToTechnology'},
					{action: 'setControl_SingleValue', type: 'select', id: 'selectParamType', dataAttr: 'paramType', columnName: 'paramType'},
					{action: 'showHideControls_ifValueEquals', id: 'selectParamType', type: 'select', dataAttr: 'paramType', dataAttrValues: ['boolean','freeText','number'], controlsToHide: ['textParamOptions'], controlsToShow: []},
					{action: 'showHideControls_ifValueEquals', id: 'selectParamType', type: 'select', dataAttr: 'paramType', dataAttrValues: ['singleOption','multiOption'], controlsToHide: [], controlsToShow: ['textParamOptions']},
				],
				ifUndefined: [
					{action: 'emptyControl', type: 'select', id: 'selectParamType'},
					{action: 'setControls_Disabled', controls: ['buttonDelete','selectParamDefinition','textParamName','selectParamType','textParamOptions','chkApplicableToSystem','chkApplicableToSubsystem','chkApplicableToInterface','chkApplicableToLink','chkApplicableToTechnology']},
				]
			}
		],
		events: [
			{	//Change to parameter type select
				handlers: [{controlId: 'selectParamType', event: 'change'},],
				instructions: [
					{action: 'showHideControls_ifValueEquals', id: 'selectParamType', type: 'select', dataAttr: 'paramType', dataAttrValues: ['boolean','freeText','number'], controlsToHide: ['textParamOptions'], controlsToShow: []},
					{action: 'showHideControls_ifValueEquals', id: 'selectParamType', type: 'select', dataAttr: 'paramType', dataAttrValues: ['singleOption','multiOption'], controlsToHide: [], controlsToShow: ['textParamOptions']},
				],
				cleanup: [],
			},
			
			{	//Param Group button
				handlers: [{controlId: 'buttonParamGroups', event: 'click'},], 
				instructions: [],
				cleanup: [
					{action: 'modalDefinitionToBreadcrumb'},
					{action: 'newModal', modal: 'paramGroupDefinition'},
				],
			},
			{	//Change to parameter group select
				handlers: [{controlId: 'selectParamGroup', event: 'change'},], 
				instructions: [
					{action: 'setDefinition_SingleValue_FromConstant', definitionName: 'id_paramDefinition', value: null},
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectParamGroup', definitionName: 'id_paramGroup', dataAttr: 'id_paramGroup'},
					
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Change to parameter definition select
				handlers: [{controlId: 'selectParamDefinition', event: 'change'},], 
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectParamDefinition', definitionName: 'id_paramDefinition', dataAttr: 'id_paramDefinition'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
			{	//Add New parameter definition button
				handlers: [{controlId: 'buttonNew', event: 'click'},], 
				instructions: [
					{action: 'deleteDefinitionValue', definitionName: 'id_paramDefinition'},
					{action: 'emptyControl', type: 'select', id: 'selectParamDefinition'},
					{action: 'emptyControl', type: 'text', id: 'textParamName'},
					{action: 'emptyControl', type: 'textarea', id: 'textParamOptions'},
					{action: 'emptyControl', type: 'checkbox', id: 'chkApplicableToSystem'},
					{action: 'emptyControl', type: 'checkbox', id: 'chkApplicableToSubsystem'},
					{action: 'emptyControl', type: 'checkbox', id: 'chkApplicableToInterface'},
					{action: 'emptyControl', type: 'checkbox', id: 'chkApplicableToLink'},
					{action: 'emptyControl', type: 'checkbox', id: 'chkApplicableToTechnology'},
					{action: 'setControl_FromList', type: 'selectOptions', id: 'selectParamType', attr: {name: 'paramType', columnName: 'value'}, columnName: 'title',
					list: [
						{title: 'Single Option', value: 'singleOption'},
						{title: 'Multiple Options', value: 'multiOption'},
						{title: 'True/False', value: 'boolean'},
						{title: 'Free Text', value: 'freeText'},
						{title: 'Number', value: 'number'},
					]},
					{action: 'setControls_Enabled', controls: ['selectParamDefinition','textParamName','selectParamType','textParamOptions','chkApplicableToSystem','chkApplicableToSubsystem','chkApplicableToInterface','chkApplicableToLink','chkApplicableToTechnology']},
					{action: 'lockControls'},
					{action: 'setControl_Focus', id: 'textParamName'},
				],
				cleanup: [],
			},
			
			{	//Delete button
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteParamDefinition', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_paramDefinition', columnName: 'id_paramDefinition'},
				],
				cleanup: [
					{action: 'deleteDefinition', definitionName: 'id_paramDefinition'},
					{action: 'reload'},
				],
			},
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'UpdateParamDefinition',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_paramGroup', columnName: 'id_paramGroup'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_paramDefinition', columnName: 'id_paramDefinition'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textParamName', columnName: 'name'},
					{action: 'toServer_ControlValue', type: 'select', id: 'selectParamType', dataAttr: 'paramType', columnName: 'paramType'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textParamOptions', columnName: 'options'},
					{action: 'toServer_ControlValue', type: 'checkbox', id: 'chkApplicableToSystem', columnName: 'applicableToSystem'},
					{action: 'toServer_ControlValue', type: 'checkbox', id: 'chkApplicableToSubsystem', columnName: 'applicableToSubsystem'},
					{action: 'toServer_ControlValue', type: 'checkbox', id: 'chkApplicableToInterface', columnName: 'applicableToInterface'},
					{action: 'toServer_ControlValue', type: 'checkbox', id: 'chkApplicableToLink', columnName: 'applicableToLink'},
					{action: 'toServer_ControlValue', type: 'checkbox', id: 'chkApplicableToTechnology', columnName: 'applicableToTechnology'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_paramDefinition'},
					{action: 'reload'},
				],
			},
			{	//Close buttton
				handlers: [{controlId: 'buttonClose', event: 'click'},], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
		]
	},

	paramGroupDefinition: {
		title: 'Define Group Parameter',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Parameter Group', initialState: 'unlock'},
			{type: 'delete', id: 'buttonDelete', label: 'Delete Parameter Group', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonClose', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectParamGroup', label: 'Parameter Group'},
			{ type: 'text', id: 'textParamGroupName', label: 'Parameter Group Name'},
		],
		monitorChanges: [
			//{id: 'selectParamGroup', on: 'change'},
			{id: 'textParamGroupName', on: 'input'},
		],
		lockOnChange: ['buttonDelete','buttonNew','selectParamGroup'],
		unlockOnChange: ['buttonUpdate'],
		iterations: [
			{
				type: 'AllParamGroups',
				definitionFields: [],
				instructions: [
					{action: 'setControl_MultipleValues', type: 'selectOptions', id: 'selectParamGroup', columnName: 'name', attr: {name: 'id_paramGroup', columnName: 'id_paramGroup'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectParamGroup', definition: 'id_paramGroup', dataAttr: 'id_paramGroup', columnName: 'id_paramGroup'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectParamGroup', definition: 'id_paramGroup', dataAttr: 'id_paramGroup'},
					
				],
			},
			{ 
				type: 'SingleParamGroup',
				definitionFields: ['id_paramGroup'],
				continueOnUndefined: false,
				instructions: [
					{action: 'setControl_SingleValue', type: 'text', id: 'textParamGroupName', columnName: 'name'},
				],
				ifUndefined: [
					{action: 'setControls_Disabled', controls: ['textParamGroupName','buttonDelete']},
				]
			},
		],
		events: [
			{	//Add New Parameter Group
				handlers: [{controlId: 'buttonNew', event: 'click'},], 
				instructions: [
					{action: 'setControls_Enabled', controls: ['textParamGroupName']},
					{action: 'deleteDefinitionValue', definitionName: 'id_paramGroup'},
					{action: 'emptyControl', type: 'select', id: 'selectParamGroup'},
					{action: 'emptyControl', type: 'text', id: 'textParamGroupName'},
					{action: 'lockControls'},
					{action: 'setControl_Focus', id: 'textParamGroupName'},
				],
				cleanup: [],
			},
			{	//Change to all param groups select
				handlers: [{controlId: 'selectParamGroup', event: 'change'},], 
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectParamGroup', definitionName: 'id_paramGroup', dataAttr: 'id_paramGroup'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},	
			{	//Delete button
				handlers: [{controlId: 'buttonDelete', event: 'click'},], 
				postType: 'DeleteParamGroup', 
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_paramGroup', columnName: 'id_paramGroup'},
				],
				cleanup: [
					{action: 'deleteDefinition', definitionName: 'id_paramGroup'},
					{action: 'reload'},
				],
			},
				
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'UpdateParamGroup',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_paramGroup', columnName: 'id_paramGroup'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textParamGroupName', columnName: 'name'},
				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_techCategory'},
					{action: 'reload'},
				],
			},
			{	//Close buttton
				handlers: [{controlId: 'buttonClose', event: 'click'},], 
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
		]
	},

	parameters: {
		title: 'Parameters',
		formButtons: [ 
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{type: 'container', id: 'params'}
		],
		monitorChanges: [
			{id: 'params', on: 'any'},
			//{id: 'container', on: 'change'},
		],
		lockOnChange: [],
		unlockOnChange: ['buttonUpdate'], 
		iterations: [
			{
				type: 'Params', 
				definitionFields: ['paramType','id_system', 'id_interface', 'id_link', 'id_technology'], 
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'params', id: 'params'},
				],
			},
		],
		events: [
			{	//Cancel button
				handlers: [{controlId: 'buttonCancel', event: 'click'},],  
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'UpdateParams',
				instructions: [

					//Working here
					{action: 'toServer_DefinitionValue', definitionName: 'paramType', columnName: 'paramType'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_system', columnName: 'id_system'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_interface', columnName: 'id_interface'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_link', columnName: 'id_link'},
					{action: 'toServer_DefinitionValue', definitionName: 'id_technology', columnName: 'id_technology'},

					//{action: 'toServer_DefinitionValue', definitionName: 'id_paramDefinition', columnName: 'id_paramDefinition'},
					{action: 'toServer_ControlValue', type: 'params', id: 'params', columnName: 'params'},

				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_paramDefinition'},
					{action: 'reload'},
				],
			},
		]
	},

	exports: {
		title: 'Export Data',
		formButtons: [ 
			
			{type: 'submit', id: 'buttonUpdate', label: 'Export', initialState: 'unlock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectExport', label: 'Export Name'},
		],
		monitorChanges: [],
		lockOnChange: [],
		unlockOnChange: ['buttonUpdate'],
		iterations: [
			{
				type: 'AllExports', 
				definitionFields: [], 
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectExport', columnName: 'name', attr: {name: 'id_export', columnName: 'id_export'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectExport', definition: 'id_export', dataAttr: 'id_export', columnName: 'id_export'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectExport', definition: 'id_export', dataAttr: 'id_export'},
				],
			},
		],
		events: [
			{	//Cancel button
				handlers: [{controlId: 'buttonCancel', event: 'click'},],  
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				//postType: 'UpdateParams',
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectExport', definitionName: 'id_export', dataAttr: 'id_export'},
					{action: 'launchFunctionWithDefinition', functionName: 'exportSosmData'}
				],
				cleanup: [
					//{action: 'reload'},
				],
			},
		]
	},

	configureExports: {
		title: 'Configure Data Export Formats',
		formButtons: [ 
			{type: 'info', id: 'buttonNew', label: 'New Export', initialState: 'unlock'},
			{type: 'submit', id: 'buttonUpdate', label: 'Update', initialState: 'lock'},
			{type: 'cancel', id: 'buttonCancel', label: 'Close', initialState: 'unlock'},
		], 
		formFields: [ 
			{ type: 'select', id: 'selectExport', label: 'Exports'},
			{ type: 'text', id: 'textExportName', label: 'Name'},
			{ type: 'radioGroup', id: 'radioGroupExportFormat', label: 'Export Format', options:[
				{id: 'csv', label: 'CSV'},
				{id: 'xls', label: 'XLS'},
				{id: 'tsv', label: 'TSV'},
			]},
			{ type: 'textarea', id: 'textExportObject', label: 'Export Object', rows: 30},
			{ type: 'buttons', buttons: [
				{ id: 'buttonTestJson', label: 'Insert Test JSON'},
			]}
		],
		monitorChanges: [
			{id: 'textExportName', on: 'input'},
			{id: 'textExportObject', on: 'input'},
			{id: 'radioGroupExportFormat', on: 'change'},
			{id: 'buttonTestJson', on: 'click'},
		],
		lockOnChange: ['selectExport','buttonNew'],
		unlockOnChange: ['buttonUpdate'], 
		iterations: [
			{
				type: 'AllExports', 
				definitionFields: ['id_export'], 
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes', type: 'selectOptions', id: 'selectExport', columnName: 'name', attr: {name: 'id_export', columnName: 'id_export'} },
					{action: 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition', type: 'select', id: 'selectExport', definition: 'id_export', dataAttr: 'id_export', columnName: 'id_export'},
					{action: 'setDefinition_SingleValue_ifDefintionNotAlreadySet', type: 'select', id: 'selectExport', definition: 'id_export', dataAttr: 'id_export'},
					//{action: 'setControl_MultipleValues_fromConstant', type: 'selectOptions', id: 'selectCategory', constantName: 'systems', columnName: 'title', attr: {name: 'category', columnName: 'value'} },
					//{action: 'setControl_MultipleValues_AtSpecificArrayIndex', type: 'select', id: 'selectExport'},
				],
				ifUndefined: [
					//{action: 'emptyControl', type: 'select', id: 'selectParamType'},
					{action: 'setControls_Disabled', controls: ['selectExport','textExportName','radioGroupExportFormat_csv','radioGroupExportFormat_xls','radioGroupExportFormat_tsv','textExportObject']},
				]
			},
			{ //Get specific export details
				type: 'SingleExport',
				definitionFields: ['id_export'],
				continueOnUndefined: true,
				instructions: [
					{action: 'setControl_SingleValue', type: 'text', id: 'textExportName', columnName: 'name'},
					{action: 'setControl_SingleValue', type: 'radioGroup', id: 'radioGroupExportFormat', columnName: 'exportFormat'},
					{action: 'setControl_SingleValue_JSON', type: 'textarea', id: 'textExportObject', columnName: 'exportObject'},
					{action: 'setControl_Focus', id: 'selectExport'},
					
				]
			}

		],
		events: [
			{	//Param Group button
				handlers: [{controlId: 'buttonTestJson', event: 'click'},], 
				instructions: [],
				cleanup: [
					{action: 'emptyControl', type: 'textarea', id: 'textExportObject'},
					{action: 'setControl_JSONFromObject', type: 'textarea', id: 'textExportObject', variableName: 'testExportObject'},
				],
			},
			{	//Add New Export
				handlers: [{controlId: 'buttonNew', event: 'click'},], 
				instructions: [
					{action: 'deleteDefinitionValue', definitionName: 'id_export'},
					{action: 'emptyControl', type: 'select', id: 'selectExport'},
					{action: 'emptyControl', type: 'text', id: 'textExportName'},
					{action: 'emptyControl', type: 'text', id: 'textExportObject'},
					{action: 'setControls_Enabled', controls: ['textExportName','radioGroupExportFormat_csv','radioGroupExportFormat_xls','radioGroupExportFormat_tsv','textExportObject']},
					{action: 'lockControls'},
					{action: 'setControl_Focus', id: 'textExportName'},
				],
				cleanup: [],
			},
			{	//Cancel button
				handlers: [{controlId: 'buttonCancel', event: 'click'},],  
				instructions: [],
				cleanup: [{action: 'returnToLastModal'},],
			},
			{	//Update button
				handlers: [{controlId: 'buttonUpdate', event: 'click'},], 
				postType: 'UpdateExport',
				instructions: [
					{action: 'toServer_DefinitionValue', definitionName: 'id_export', columnName: 'id_export'},
					{action: 'toServer_ControlValue', type: 'text', id: 'textExportName', columnName: 'name'},

					{action: 'toServer_ControlValue', type: 'radioGroup', id: 'radioGroupExportFormat', columnName: 'exportFormat', default: 'csv'},
					{action: 'toServer_ControlValue_JSON', type: 'textarea', id: 'textExportObject', columnName: 'exportObject'},

				],
				cleanup: [
					{action: 'setDefinition_FromResultInsert', definitionName: 'id_export'},
					{action: 'reload'},
				],
			},
			{	//Change to export select
				handlers: [{controlId: 'selectExport', event: 'change'},],
				instructions: [
					{action: 'setDefinitionValueFromControlWithDataAttribute', type: 'select', id: 'selectExport', definitionName: 'id_export', dataAttr: 'id_export'}
				],
				cleanup: [
					{action: 'reload'},
				],
			},
		]
	},
}

/**
 * @description The size of the grid to snap to
 */
const snapToGridDistance = 80




/**
 * @description The available CSS color names. Commented out ones are not able to be processed by cytoscape.
 */
const CSS_COLOR_NAMES = [
	"AliceBlue",
	"AntiqueWhite",
	"Aqua",
	"Aquamarine",
	"Azure",
	"Beige",
	"Bisque",
	"Black",
	"BlanchedAlmond",
	"Blue",
	"BlueViolet",
	"Brown",
	"BurlyWood",
	"CadetBlue",
	"Chartreuse",
	"Chocolate",
	"Coral",
	"CornflowerBlue",
	"Cornsilk",
	"Crimson",
	"Cyan",
	"DarkBlue",
	"DarkCyan",
	"DarkGoldenRod",
	"DarkGray",
	"DarkGrey",
	"DarkGreen",
	"DarkKhaki",
	"DarkMagenta",
	"DarkOliveGreen",
	"DarkOrange",
	"DarkOrchid",
	"DarkRed",
	"DarkSalmon",
	"DarkSeaGreen",
	"DarkSlateBlue",
	"DarkSlateGray",
	"DarkSlateGrey",
	"DarkTurquoise",
	"DarkViolet",
	"DeepPink",
	"DeepSkyBlue",
	"DimGray",
	"DimGrey",
	"DodgerBlue",
	"FireBrick",
	"FloralWhite",
	"ForestGreen",
	"Fuchsia",
	"Gainsboro",
	"GhostWhite",
	"Gold",
	"GoldenRod",
	"Gray",
	"Grey",
	"Green",
	"GreenYellow",
	"HoneyDew",
	"HotPink",
	"IndianRed",
	"Indigo",
	"Ivory",
	"Khaki",
	"Lavender",
	"LavenderBlush",
	"LawnGreen",
	"LemonChiffon",
	"LightBlue",
	"LightCoral",
	"LightCyan",
	"LightGoldenRodYellow",
	"LightGray",
	"LightGrey",
	"LightGreen",
	"LightPink",
	"LightSalmon",
	"LightSeaGreen",
	"LightSkyBlue",
	"LightSlateGray",
	"LightSlateGrey",
	"LightSteelBlue",
	"LightYellow",
	"Lime",
	"LimeGreen",
	"Linen",
	"Magenta",
	"Maroon",
	"MediumAquaMarine",
	"MediumBlue",
	"MediumOrchid",
	"MediumPurple",
	"MediumSeaGreen",
	"MediumSlateBlue",
	"MediumSpringGreen",
	"MediumTurquoise",
	"MediumVioletRed",
	"MidnightBlue",
	"MintCream",
	"MistyRose",
	"Moccasin",
	"NavajoWhite",
	"Navy",
	"OldLace",
	"Olive",
	"OliveDrab",
	"Orange",
	"OrangeRed",
	"Orchid",
	"PaleGoldenRod",
	"PaleGreen",
	"PaleTurquoise",
	"PaleVioletRed",
	"PapayaWhip",
	"PeachPuff",
	"Peru",
	"Pink",
	"Plum",
	"PowderBlue",
	"Purple",
	//"RebeccaPurple",
	"Red",
	"RosyBrown",
	"RoyalBlue",
	"SaddleBrown",
	"Salmon",
	"SandyBrown",
	"SeaGreen",
	"SeaShell",
	"Sienna",
	"Silver",
	"SkyBlue",
	"SlateBlue",
	"SlateGray",
	"SlateGrey",
	"Snow",
	"SpringGreen",
	"SteelBlue",
	"Tan",
	"Teal",
	"Thistle",
	"Tomato",
	"Turquoise",
	"Violet",
	"Wheat",
	"White",
	"WhiteSmoke",
	"Yellow",
	"YellowGreen",
  ];



/**
 * @description Labels for the issue severity. To stay a variable so it can be replaced by privateConstants.js, if required.
 * 
 */
/*
const severityLabels = [
	{index: 0, label: 'Information', description: 'Non-issue. For information only.'},
	{index: 1, label: 'Notice', description: 'For notice and tracking only.'},
	{index: 2, label: 'Warning', description: 'An issue that is isolated to a small subset of the overall system.'},
	{index: 3, label: 'Error', description: 'An issue that has a limited impact on the overall system.'},
	{index: 4, label: 'Critical', description: 'An issue that has a wide impact on the overall system.'},
	{index: 5, label: 'Alert', description: 'An issue that has a detrimental impact on the overall system.'},
	{index: 6, label: 'Emergency', description: 'An issue that renders the overall system inoperable.'},
];
*/


