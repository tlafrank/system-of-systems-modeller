//************************************************************ Navigation Menu ******************************************************/

function data_exchanges(){
	dataExchangesModal();
}

function manageTags(){
	manageTagsModal();
}

function graphZoomIn(){
	debug(1,'firing');
	cy.zoom(cy.zoom() + parseFloat(localStorage.getItem('zoomSensitivity')))
}

function graphZoomOut(){
	cy.zoom(cy.zoom() - parseFloat(localStorage.getItem('zoomSensitivity')))
}

function viewCommonModal(modal, customData = false){

	var definition = {
		modal: modal,
		//mode: 'view',
		//newModal: true,
		continue: true,
	}

	if(customData) { definition.id_system = 1}



	commonModal(definition)

}


function view_compoundGraph(){
	pageSwitch('compoundGraph');
}

/**
 * @description Update the systems by choosing a system from a list
 * 
 */
function update_system(){ updateSystemsModal(1) }
function update_subsystems(){ updateSubsystemsModal() }

/**
 * @description Nav bar > Update > Interface. 
 * 
 */
function update_interface(){ updateInterfaceModal();}
function update_systemLinks(){ updateSystemLinksModal() }


/**
 * @description Nav bar > Update > Features
 * 
 */
function update_technologies(){
	updateTechnologiesModal();

}

/**
 * @description Update the networks by choosing the network from a list
 * 
 */
function update_network(){
	updateNetworkModal();
}

function update_issues(){
	updateIssuesModal();
}

/**
 * @description 
 * 
 */
function view_graph(){
	pageSwitch('graph');
}
function view_summary(){
	pageSwitch('summary');
}
function view_issues(){
	pageSwitch('issues');
}

function view_charts(){
	pageSwitch('charts')
}

/**
 * @description 
 * 
 */
function reorgGraph(){
	debug (1,'In reorgGraph()')
	cy.layout(cyLayout).run();
}

/**
 * @description 
 * 
 */
 function redrawGraph(){
	debug (1,'In redrawGraph()')
	pageSwitch();
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
 * @description User clicks the button to hide the currently selected node from the graph
 * 
 */
function hideSelectedNodeButton(){
	hideNode(selectedNode.id, selectedNode.idNo, selectedNode.type);
}

/**
 * @description Hide a node from the graph
 * 
 */
function hideNode(id, idNo, type){
	debug(2,`Hiding ${id} of type ${type} with ID: ${idNo}`);

	//Remove clicked node from the graph
	cy.remove(`[id = '${id}']`)

	//Remove relevant associated nodes
	if (type == `System`){
		//A system was clicked, remove its interfaces
		const postData = {};
		postData.type = `SystemInterfaces`;
		postData.id_system = idNo;

		//Get associated interfaces from the server
		$.post('./select.json', postData, (result) => {
			debug(3,'Passed to select.json:', postData);
			debug(3,'Response:', result)

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


/**
 * @description User clicks on a node in the graph
 * 
 */
 function nodeSelected(eventTarget){
	debug(1,'In nodeSelected()')

	//Hide the node if the hide nodes toggle button is enabled
	if (hideNodes){
		debug(3,'Hiding Node: ', eventTarget);
		hideNode(eventTarget.data('id'), eventTarget.data('idNo'), eventTarget.data('nodeType'));
	} else {

		const postData = {};
		debug(3,'NodeType: ' + eventTarget.data('nodeType'))
		postData.type = eventTarget.data('nodeType');

		switch (postData.type){
			case 'System':
				postData.id_system = eventTarget.data('id_system');
				postData.noTags = true;
				break;
			case 'SystemInterface':
				postData.id_SIMap = eventTarget.data('id_SIMap');
				break;
			case 'Link':
				postData.id_network = eventTarget.data('id_network');			
				break;
			default:
				debug(1,'Error in nodeSelected with unexpected nodeType: ' + eventTarget.data('nodeType'))
		}
		
		//Get node details from the server
		debug(1, `Sending '${postData.type}' to the server (select.json):`)
		$.post('./select.json', postData, (result) => {
			debug(3, postData, result)

			//Check the result
			if (result.msg){
				//An error was passed																			//Add error handling

			} else {
				//Set the selected node object
				result.type = postData.type;
				selectedNode.update(result, eventTarget.data('id'));				

				debug(3,'selectedNode:', selectedNode)
			}
			//Populate the table
			//$('#nodeDetailsTable').replaceWith(nodeDetailsTable());
			nodeTable('#nodeDetailsTable', result)
		})
	}
}

function edgeSelected(eventTarget){
	debug(1,'Edge clicked');
}


//************************************************************ Page Buttons ******************************************************/

/**
 * @description Opens the modal to allow a user to add/edit the systems, interfaces, features or networks
 * 
 */
function editNodeButton(){
	debug(1,'In editNodeButton()');
	debug(3, 'selectedNode is',selectedNode)



	switch (selectedNode.type){
		case 'System':
			commonModal({modal: 'systems', continue: true, id_system: selectedNode.id_system})
			break;
		case 'SystemInterface':
			commonModal({modal: 'interfacesToSystems', continue: true, id_system: selectedNode.id_system, id_SIMap: selectedNode.id_SIMap})
			break;
		case 'Link':
			commonModal({modal: 'links', continue: true, id_network: selectedNode.id_network})
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
	pageSwitch();
}
function incrementYearButton(){
	var newYear = parseInt(localStorage.getItem('activeYear'));
	newYear++;
	localStorage.setItem('activeYear', newYear)
	pageSwitch();
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
 * system, or assigns a network to a system's interface
 * 
 * Move within modal?
 */
function mappingModal_addButton(){
	debug(1,'In mappingModal_addButton()')
	$("#mappingModalAddButton").unbind();
	$("#mappingModalAddButton").on("click", () => {

		const postData = {};

		if (selectedNode.type == 'System') { 
			postData.type = 'InterfaceToSystem';
			postData.id_interface = $("#mappingModalSelect option:selected").data("id");
			postData.id_system = selectedNode.id_system;
		}

		if (selectedNode.type == 'SystemInterface') {
			postData.type = 'NetworkToSystemInterface';
			postData.id_network = $("#mappingModalSelect option:selected").data("id");
			postData.id_SIMap = selectedNode.id_SIMap;
		}


		$.post(`update.json`, postData, (result) => {
			debug(3,'Passed to update.json: ', postData);
			debug(3,'Response: ', result)

			//Reload the modal
			editConnectionsButton();
		});
	});
}


/**
 * @description Handler for the button on the mapModal which either deletes an interface from a
 * system, or deletes a network from a system's interface
 * 
 * Move within modal?
 */
function mappingModal_deleteButton(idToDelete){
	debug(1,'In mappingModal_deleteButton()')
	//Try to delete the interface from the system
	//May fail due to foreign key constraints
	const postData = {};

	if (selectedNode.type == 'System') { 
		postData.type = 'DeleteInterfaceFromSystem';
		postData.id_SIMap = idToDelete;
	}

	if (selectedNode.type == 'SystemInterface') { 
		postData.type = 'DeleteNetworkFromInterface';
		postData.id_SINMap = idToDelete;
	}


	$.post('/update.json', postData, (result) => {
		debug(3,'Passed to update.json: ', postData);
		debug(3,'Response: ', result)

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
	debug(1,'In hideNodesButton()');
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



