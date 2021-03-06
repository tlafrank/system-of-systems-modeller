//************************************************************ Navigation Menu ******************************************************/

/**
 * @description Update the subsystems by choosing a subsystem from a list
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
 */
 function update_network(){
	updateNetworkModal({id_network: 1});
}


function view_graph(){
	graphSettings.mainPage = 'graph';
	uploadSettings();
	mainPage();
}

function view_summary(){
	graphSettings.mainPage = 'summary';
	uploadSettings();
	mainPage();
}

function view_issues(){
	graphSettings.mainPage = 'issues';
	uploadSettings();
	mainPage();
}


/**
 * @description Save the contents of the GraphSettings object
 * 
 */
function settings(){
	settingsModal();

	/*

	const postData = graphSettings.export()

	$.post('/update.json', postData, (result) => {
		console.log('Passed to select.json:', postData);
		console.log('Response:', result)

	})
	*/
}

function reorgGraph(){
	debug ('In reorgGraph()')

	cy.layout(cyLayout).run();

	// var layout = cy.layout();
	// layout.run();
}

function save_png(){
	var image = cy.png();

	var hiddenElement = document.createElement('a');

	hiddenElement.href = encodeURI(image);

	hiddenElement.target = '_blank';
	hiddenElement.download = 'tba.png';
	hiddenElement.click();
}


//************************************************************ Graph Nodes ******************************************************/
/**
 * @description User clicks on a node in the graph
 * 
 */
 function nodeSelected(eventTarget){

	if (hideNodes){
		debug(eventTarget)
		cy.remove(`[id = '${eventTarget.data('id')}']`)

		//Also need to remove all its nodes


		//Remove all orphaned nodes (i.e. networks)
		
	} else {

		const postData = {};
		debug('NodeType: ' + eventTarget.data('nodeType'))
		postData.type = eventTarget.data('nodeType');

		switch (eventTarget.data('nodeType')){
			case 'Subsystem':
				postData.id_subsystem = eventTarget.data('id_subsystem');
				document.querySelector('#makeSubject').disabled = false;				
				break;
			case 'SubsystemInterface':
				debug('in si map')
				postData.id_SIMap = eventTarget.data('id_SIMap');
				document.querySelector('#makeSubject').disabled = true;
				break;
			case 'Network':
				postData.id_network = eventTarget.data('id_network');
				document.querySelector('#makeSubject').disabled = true;				
				break;
			default:
				debug('Error in nodeSelected with unexpected nodeType: ' + eventTarget.data('nodeType'))
						
		}
		
		//Get node details from the server
		$.post('./select.json', postData, (result) => {
			console.log('Passed to select.json:', postData);
			console.log('Response:', result)

			//Check the result
			if (result.msg){
				//An error was passed																			//Add error handling

			} else {
				//Set the selected node object

				result[0].type = postData.type;
				selectedNode.update(result[0]);

				console.log('selectedNode:', selectedNode)
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
	//console.log('selectedNode', selectedNode)
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



function decrementYearButton(){
	graphSettings.activeYear--;
	newCy();
}


function incrementYearButton(){
	graphSettings.activeYear++;
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
			console.log('Passed to update.json: ', postData);
			console.log('Response: ', result)

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
		console.log('Passed to update.json: ', postData);
		console.log('Response: ', result)

		//Check the result
		if (result.err){ $("#mappingModalWarning").removeClass('d-none').text(result.err);}
		
		//Reload the modal
		editConnectionsButton();
	})
}


/**
 * @description Handles change to focus node
 * 
 */
function makeSubjectButton(){
	newCy({id_subsystem: selectedNode.id_subsystem})
}


/**
 * @description Toggle whether clicking on a node in the graph should hide the node
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



