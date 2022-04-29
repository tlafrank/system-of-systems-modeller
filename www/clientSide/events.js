//************************************************************ Navigation Menu ******************************************************/

function manageTags(){
	manageTagsModal();
}


/**
 * @description Update the subsystems by choosing a subsystem from a list
 * 
 */
function update_subsystem(){
	updateSubsystemModal({ id_subsystem: 1 });
}

/**
 * @description Nav bar > Update > Interface. 
 * 
 */
function update_interface(){
	updateInterfaceModal({ id_interface: 1 });

	//selectInterfaceModal();

	// $('#nodeModalTitle').text("Edit Interfaces");
	// $("#nodeModalNodeDescription").text("Modify existing interfaces in the database.");
	// modal = new NodeModal('Interface');
	// $("#editInterfaceModal").modal('show')
	// interfaceModal();
}

/**
 * @description Nav bar > Update > Features
 * 
 */
function update_features(){
	updateFeaturesModal();

}

/**
 * @description Update the networks by choosing the network from a list
 * 
 */
 function update_network(){
	updateNetworkModal({id_network: 1});
}

/**
 * @description 
 * 
 */
function view_graph(){
	localStorage.setItem('mainPage', 'graph');
	uploadSettings();
	mainPage();
}

function view_summary(){
	localStorage.setItem('mainPage', 'summary');
	uploadSettings();
	mainPage();
}

function view_issues(){
	localStorage.setItem('mainPage', 'issues');
	uploadSettings();
	mainPage();
}

/**
 * @description 
 * 
 */
function reorgGraph(){
	debug ('In reorgGraph()')

	cy.layout(cyLayout).run();

	// var layout = cy.layout();
	// layout.run();
}

/**
 * @description 
 * 
 */
function savePng(){
	var image = cy.png();

	var hiddenElement = document.createElement('a');

	hiddenElement.href = encodeURI(image);

	hiddenElement.target = '_blank';
	hiddenElement.download = 'tba.png';
	hiddenElement.click();
}


/**
 * @description User clicks on a node in the graph
 * 
 */
function hideSelectedNodeButton(){
	hideNode(selectedNode.id, selectedNode.idNo, selectedNode.type);
}

/**
 * @description User clicks on a node in the graph
 * 
 */
function hideNode(id, idNo, type){
	debug(`Hiding ${id} of type ${type} with ID: ${idNo}`);

	//Remove clicked node from the graph
	cy.remove(`[id = '${id}']`)

	//Remove relevant associated nodes
	if (type == `Subsystem`){
		//A subsystem was clicked, remove its interfaces
		const postData = {};
		postData.type = `SubsystemInterfaces`;
		postData.id_subsystem = idNo;

		//Get associated interfaces from the server
		$.post('./select.json', postData, (result) => {
			debug('Passed to select.json:', postData);
			debug('Response:', result)

			//Check the result
			if (result.msg){
				//An error was passed																			//Add error handling
			} else {
				result.forEach((element) => {
					cy.remove(`[id = 'node_si_${element.id_SIMap}']`)
				})	
			}
		})
	}
	
	//Remove all orphaned nodes (i.e. networks)

}


//************************************************************ Graph Nodes ******************************************************/
/**
 * @description User clicks on a node in the graph
 * 
 */
 function nodeSelected(eventTarget){

	if (hideNodes){
		debug('Hiding Node: ', eventTarget);
		hideNode(eventTarget.data('id'), eventTarget.data('idNo'), eventTarget.data('nodeType'));
	} else {

		const postData = {};
		debug('NodeType: ' + eventTarget.data('nodeType'))
		postData.type = eventTarget.data('nodeType');

		switch (eventTarget.data('nodeType')){
			case 'Subsystem':
				postData.id_subsystem = eventTarget.data('id_subsystem');		
				break;
			case 'SubsystemInterface':
				postData.id_SIMap = eventTarget.data('id_SIMap');
				break;
			case 'Network':
				postData.id_network = eventTarget.data('id_network');			
				break;
			default:
				debug('Error in nodeSelected with unexpected nodeType: ' + eventTarget.data('nodeType'))
						
		}
		
		//Get node details from the server
		$.post('./select.json', postData, (result) => {
			debug('Passed to select.json:', postData);
			debug('Response:', result)

			//Check the result
			if (result.msg){
				//An error was passed																			//Add error handling

			} else {
				//Set the selected node object

				result[0].type = postData.type;
				selectedNode.update(result[0], eventTarget.data('id'));

				debug('selectedNode:', selectedNode)
			}
			//Populate the table
			//$('#nodeDetailsTable').replaceWith(nodeDetailsTable());
			nodeTable('#nodeDetailsTable', result[0])
		})
	}
}


//************************************************************ Page Buttons ******************************************************/

/**
 * @description Opens the modal to allow a user to add/edit the subsystems, interfaces, features or networks
 * 
 */
function editNodeButton(){
	debug('In editNode()');
	//debug('selectedNode', selectedNode)
	switch (selectedNode.type){
		case 'Subsystem':
			updateSubsystemModal({id_subsystem: selectedNode.id_subsystem})
			break;
		case 'SubsystemInterface':
			debug(selectedNode)
			updateSubsystemInterfacesModal({ id_subsystem: selectedNode.id_subsystem, id_SIMap: selectedNode.id_SIMap })
			break;
		case 'Network':
			updateNetworkModal({ id_network: selectedNode.id_network });
			break;
	}
}


/**
 * @description 
 * 
 */
function decrementYearButton(){
	var newYear = parseInt(localStorage.getItem('activeYear'));
	newYear--;
	localStorage.setItem('activeYear', newYear)
	newCy();
}
function incrementYearButton(){
	var newYear = parseInt(localStorage.getItem('activeYear'));
	newYear++;
	localStorage.setItem('activeYear', newYear)
	newCy();
}


//************************************************************ Modal Buttons ******************************************************/

/**
 * @description Handles a user clicking on the assign icon button from within a modal
 * 
 */
//function modalAssignIconButton(){

	
//}


//************************************************************ Other Buttons ******************************************************/

/**
 * @description Handler for the button on the mapModal which either assigns an interface to a
 * subsystem, or assigns a network to a subsystem's interface
 * 
 * Move within modal?
 */
function mappingModal_addButton(){
	debug('In mappingModal_addButton()')
	$("#mappingModalAddButton").unbind();
	$("#mappingModalAddButton").on("click", () => {

		const postData = {};

		if (selectedNode.type == 'Subsystem') { 
			postData.type = 'InterfaceToSubsystem';
			postData.id_interface = $("#mappingModalSelect option:selected").data("id");
			postData.id_subsystem = selectedNode.id_subsystem;
		}

		if (selectedNode.type == 'SubsystemInterface') {
			postData.type = 'NetworkToSubsystemInterface';
			postData.id_network = $("#mappingModalSelect option:selected").data("id");
			postData.id_SIMap = selectedNode.id_SIMap;
		}


		$.post(`update.json`, postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Response: ', result)

			//Reload the modal
			editConnectionsButton();
		});
	});
}


/**
 * @description Handler for the button on the mapModal which either deletes an interface from a
 * subsystem, or deletes a network from a subsystem's interface
 * 
 * Move within modal?
 */
function mappingModal_deleteButton(idToDelete){
	debug('In mappingModal_deleteButton()')
	//Try to delete the interface from the subsystem
	//May fail due to foreign key constraints
	const postData = {};

	if (selectedNode.type == 'Subsystem') { 
		postData.type = 'DeleteInterfaceFromSubsystem';
		postData.id_SIMap = idToDelete;
	}

	if (selectedNode.type == 'SubsystemInterface') { 
		postData.type = 'DeleteNetworkFromInterface';
		postData.id_SINMap = idToDelete;
	}


	$.post('/update.json', postData, (result) => {
		debug('Passed to update.json: ', postData);
		debug('Response: ', result)

		//Check the result
		if (result.err){ $("#mappingModalWarning").removeClass('d-none').text(result.err);}
		
		//Reload the modal
		editConnectionsButton();
	})
}


/**
 * @description Toggle whether clicking on a node in the graph should hide the node
 * 
 */
 function hideNodesButton(){
	debug ('In hideNodesButton()');
	var button = document.querySelector('#hideNodeToggleButton')

	//Toggle hidenodes
	if (hideNodes) {
		//Change to hide nodes on
		button.classList.remove('btn-primary');
		button.classList.add('btn-secondary');
		hideNodes = false;
	} else {
		//Change to hide nodes off
		button.classList.remove('btn-secondary');
		button.classList.add('btn-primary');
		hideNodes = true;
	}
}



