//******************************** Main Modals ****************************************
/**
 * @description A modal to allow the user to select the tags to include or exclude from the graph
 * 
 * 
 */
 function manageTagsModal(){
	
	/*
	var formControls = [
		{ type: 'note', id: 'manageTagsDesc', text: 'Description of how these tags work.' },
		{ type: 'select', id: 'availableTags', label: 'Available Tags' },
		{ type: 'text', id: 'includedTags', label: 'Included Tags' },
				
	];
	*/

	var availableTags;
	const pageLayout = [

		{ type: 'droppable', id: 'availableTags', label: 'Availaible Tags' },
		{ type: 'droppable', id: 'includedTags', label: 'Included Tags' },
		{ type: 'droppable', id: 'excludedTags', label: 'Excluded Tags' },
	];
	
	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');

	//Modal elements
	document.querySelector('#mainModal .modal-body').innerHTML = `<p>Tags allow the graph contents to be filtered for the view. Tags are added to the system's definition page. When using tages, included tags are applied first, followed by excluded tags.</p>`
	
	pageLayout.forEach((element) => {
		addFormElement('#mainModal .modal-body', element);
	})

	//Get tags from the server
	const postData = {
		type: 'TagList'
	}

	$.post('select.json', postData, (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)

		var tagData = [];
		var tagList = [];
		//Iterate over each tag list
		result.forEach((element) => {
			//Split the tags into an array and check if the tag has already been entered into tagData
			tagList = element.tags.split(',');
			for (var i = 0; i<tagList.length; i++){
				if (!tagData.includes(tagList[i])){
					tagData.push(tagList[i]);
				}
			}
		})

		tagData = tagData.sort();

		//Put all the tags which exist into the availableTags div
		for (var i = 0; i < tagData.length; i++){
			addDragableBadge('#availableTags .card-body', tagData[i], i )
		}

		//Iterate through localStorage includedTags and move tags from availableTags to the includedTags div
		//Convert to array
		var includedTags = localStorage.getItem("includedFilterTag").split(",");
		availableTags = document.querySelectorAll("#availableTags span");
		includedTags.forEach((element) => {
			//Iterate through availableTags until found
			availableTags.forEach((element2) => {
				if (element2.textContent == element) {
					$('#includedTags .card-body').append(element2);
				}
			})
		})

		//Iterate through localStorage excludedTags and move tags from availableTags to the excludedTags div
		//Convert to array
		var excludedTags = localStorage.getItem("excludedFilterTag").split(",");
		availableTags = document.querySelectorAll("#availableTags span");
		excludedTags.forEach((element) => {
			//Iterate through availableTags until found
			availableTags.forEach((element2) => {
				if (element2.textContent == element) {
					$('#excludedTags .card-body').append(element2);
				}
			})
		})
	})

	//Buttons
	addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Update'});
	addButton('#mainModal .modal-footer', {type: 'close'});

	$('#mainModalTitle').text('Show / Hide by Tag');
	$('#mainModal').modal('show');

	//Event: Update button clicked
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click((event) => {
		//Update localStorage with includedTags
		var includedTags = document.querySelectorAll("#includedTags span");
		var includedTagsString = '';
		includedTags.forEach((element) => {
			includedTagsString += element.textContent + ','
		})
		//Trim
		if (includedTagsString.length > 0){ includedTagsString = includedTagsString.substring(0,includedTagsString.length - 1);	}
		localStorage.setItem('includedFilterTag', includedTagsString);

		//Update localStorage with excludedTags
		var excludedTags = document.querySelectorAll("#excludedTags span");
		var excludedTagsString = '';
		excludedTags.forEach((element) => {
			excludedTagsString += element.textContent + ','
		})
		//Trim
		if (excludedTagsString.length > 0){ excludedTagsString = excludedTagsString.substring(0,excludedTagsString.length - 1);	}
		localStorage.setItem('excludedFilterTag', excludedTagsString);

		newCy();
		$('#mainModal').modal('hide');
	});

 }

/**
 * @description Modify the graph settings for the local user
 * 
 * 
 */
function settingsModal(message){
	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Buttons
	addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Update'});
	addButton('#mainModal .modal-footer', {type: 'close'});

	$('#mainModalTitle').text('Settings');
	$('#mainModal').modal('show');

	//Add the form element
	document.querySelector('#mainModal .modal-body').innerHTML = `<form></form>`

	//Add the form controls
	graphSettings.getFormControls().forEach((element) => {
		addFormElement('#mainModal form', element);
	})

	//Event: Update button clicked
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click((event) => {

		//Gather and validate form data. Uses the same method of GraphSettings to check all 

		const settingsArr = [];

		graphSettings.getFormControls().forEach((element) => {
			//debug(element);
			localStorage.setItem(element.id, getFormElement('#' + element.id, element))
			//debug(localStorage.getItem(element.id));
		})

		debug(localStorage);
		newCy();
		$('#mainModal').modal('hide');
	});
}



/*
 function settingsModal(message){
	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Buttons
	addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Update'});
	addButton('#mainModal .modal-footer', {type: 'close'});

	$('#mainModalTitle').text('Settings');
	$('#mainModal').modal('show');

	//Add the form element
	document.querySelector('#mainModal .modal-body').innerHTML = `<form></form>`

	//Add the form controls
	graphSettings.getFormControls().forEach((element) => {
		addFormElement('#mainModal form', element);
	})

	//Event: Update button clicked
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click((event) => {

		//Gather and validate form data. Uses the same method of GraphSettings to check all 

		const settingsArr = [];
		const errorFlag = false;

		graphSettings.getFormControls().forEach((element) => {
			debug(element);

			graphSettings[element.id] = getFormElement('#' + element.id, element);

		})

		debug(graphSettings)

		if (errorFlag == false){
			//Validation was successful, submit to the server
			graphSettings.update(settingsArr);

			uploadSettings();
	
		} else {
			//An error in validation occurred

		}
		$('#mainModal').modal('hide');
	});
}
*/

/**
 * @description Pick the interface to update from a select.
 * 
 */
 function updateInterfaceModal(interface, message){
	debug(`In updateInterfaceModal()`)
	debug(interface)

	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Update Interfaces');
	$('#mainModal').modal('show');	

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Buttons
	if (interface.id_interface == 0){
		addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Add Interface'});
	} else {
		addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalAddNew', label: 'Add New Interface'});
		addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Update Interface'});
	}
	addButton('#mainModal .modal-footer', {type: 'close'});


	//Add the input fields
	document.querySelector('#mainModal .modal-body').innerHTML = `<form></form>`
	form.interface.forEach((element) => { addFormElement('#mainModal form', element) })

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'UpdateInterface' });

	//Populate the existing interfaces select
	const postData = {
		type: 'Interface'
	}
	$.post('select.json', postData, (result) => {
		debug('Passed to select.json2: ', postData);
		debug('Response: ', result)
	
		result.forEach((element) => {
			$('#mainModalInterfaceSelect').append(`<option data-id_interface="${element.id_interface}">${element.name}</option>`)
		})

		//If an interface id was supplied to the method, set this interface as selected
		if (interface.id_interface > 0){
			$(`#mainModalInterfaceSelect option[data-id_interface="${interface.id_interface}"]`).prop('selected', true); 
		}
		

	})

	//Populate the available features select
	const postData2 = {
		type: 'Features'
	}
	
	$.post('/select.json', postData2, (result2) => {
		debug('Passed to select.json2: ', postData2);
		debug('Response2: ', result2)

		if (result2.msg){
			//Errors
		} else {
			//Load the list of features into the available select box
			$('#mainModalFeaturesAttached').empty();
			result2.forEach((element) => {
				$('#mainModalFeaturesAvailable').append(`<option data-id_feature="${element.id_feature}">${element.name}</option>`)
			})
		}

		//Carry out the initial population of the form
		updateFormElements();
	})

	//Disable the select if creating a new interface (id_interface == 0)
	if (interface.id_interface == 0){
		$('#mainModalInterfaceSelect').append(`<option data-id_interface="0"></option>`)
		$(`#mainModalInterfaceSelect option[data-id_interface="0"]`).prop('selected', true); 
		$('#mainModalInterfaceSelect').prop('disabled', true);
	}

	//Event: Issues button clicked
	$('#interfaceIssues').unbind();
	$('#interfaceIssues').click(() => {
		$('#mainModal').modal('hide');
		updateIssuesModal({type: 'Interface', id: $('#mainModalInterfaceSelect option:selected').attr(`data-id_interface`)})
	})

	//Events: Attach/Detach feature buttons
	swapSelectOptions('#mainModalFeaturesAddButton', '#mainModalFeaturesAvailable','#mainModalFeaturesAttached')
	swapSelectOptions('#mainModalFeaturesRemoveButton', '#mainModalFeaturesAttached','#mainModalFeaturesAvailable')

	//Event: Add a new blank system 
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click(() => {
		$('#mainModal').modal('hide');
		updateInterfaceModal({ id_interface: 0 });
	});


	//Event: Select existing interfaces changes
	$('#mainModalInterfaceSelect').unbind();
	$('#mainModalInterfaceSelect').change(() => {
		updateInterfaceModal({ id_interface: $('#mainModalInterfaceSelect option:selected').attr(`data-id_interface`) });
	})


	//Event: Assign Icon button clicked
	$('#iconChooserButton').unbind();
	$('#iconChooserButton').click(() => {
		//debug('loading icons')
		$('#mainModal').modal('hide');
		selectIconModal('#mainModal', getFormElement('#mainModalImage', { type: 'img', id: 'mainModalImage' }) ,(updatedIcon) => {
			setFormElement('#mainModalImage', { type: 'img', id: 'mainModalImage', columnName: 'image'}, updatedIcon)
		});
	})

	//Event: Update interface in database
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {

		const postData = {
			type: 'Interface',
			id_interface: interface.id_interface,
		}

		//Interface details from mainModal
		form.interface.forEach((element) => {
			if (element.columnName){
				postData[element.columnName] = getFormElement('#' + element.id, element);
			}
		})

		//Get all the selected features
		interface.features = [];
		let options = document.querySelectorAll('#mainModalFeaturesAttached option')
		options.forEach((element) => {
			interface.features.push(element.dataset.id_feature)
		})
		debug('Interface obj is:')
		debug(interface)


		postData.features = interface.features;
		
		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Response: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
			} else {
				//Check if entry was a new entry
				if (result.insertId == 0){
					//Submission was an update
					updateInterfaceModal({ id_interface: postData.id_interface }, {type: 'success', msg: `The ${postData.name} interface was updated successfully`})
				} else {
					//Submission was a new interface
					updateInterfaceModal({ id_interface: result.insertId }, {type: 'success', msg: `The new interface was created successfully`})
				}
			}
		})
	});

	//Event: Changes to any controls
	$('#mainModalName, #nodeDescription, #systemTags').unbind();
	$('#interfaceIssues, #nodeDescription, #nodeDescription, #systemTags').on('input', () => {
		//Disable some controls to prevent navigating away from the modal before saving
		$('#mainModalInterfaceSelect, #interfaceIssues, #mainModalAddNew').prop('disabled', true);
	});


	//Load the data into the relevant fields
	var updateFormElements = () => {
		
		//Only get details if populating the controls with an existing interface
		if (interface.id_interface > 0){
			//Update the form controls
			postData3 = {
				type: 'Interface',
				id_interface: interface.id_interface
			}
			debug('Passing to select.json: ', postData3);
			$.post('select.json', postData3, (result) => {
				debug('Response3: ', result)

				//Populate the form controls
				form.interface.forEach((element) => {
					//Set the relevant form control values
					if(element.columnName){ setFormElement('#' + element.id, element, result[0][element.columnName]);}
				})

				//For those features already attached, move to the correct select
				const featuresArr  = result[0].features.split(',');

				//debug('featuresArr');
				//debug(featuresArr);

				featuresArr.forEach((element) => {
					debug(element)
					//Find and move items from mainModalFeaturesAvailable to mainModalFeaturesAttached
					var toMove = $(`#mainModalFeaturesAvailable option[data-id_feature="${element}"]`)
					
					$(`#mainModalFeaturesAttached`).append($(toMove).clone());
					$(toMove).remove();
				})


			})
		}
	}
}

/**
 * @description Pick the network to update from a select.
 * 
 * @param  {} id_network
 * @param  {} message
 */
 function updateNetworkModal(network, message){
	debug(`In updateNetworkModal()`)
	debug(network)

	//Load the data into the relevant fields
	//var updateFormElements = () => {}

	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Update Networks');	
	$('#mainModal').modal('show');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add fields to modal
	document.querySelector('#mainModal .modal-body').innerHTML = `<form></form>`
	form.network.forEach((element) => {	addFormElement('#mainModal form', element) })

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'UpdateNetwork', id_network: network.id_network });

	//Populate the associated feature select
	const postData2 = {
		type: 'Features'
	}
	debug('Passing to select.json: ', postData2);
	$.post('select.json', postData2, (result) => {
		debug('Response: ', result)

		result.forEach((element) => {
			$('#mainModalFeatureSelect').append(`<option data-id_feature="${element.id_feature}">${element.name}</option>`)
		})
	})

	//Populate the existing network select
	const postData = {
		type: 'Network'
	}
	debug('Passing to select.json: ', postData);
	$.post('select.json', postData, (result) => {
		debug('Response: ', result)

		result.forEach((element) => {
			$('#mainModalNetworkSelect').append(`<option data-id_network="${element.id_network}">${element.name}</option>`)
		})

		//If an interface id was supplied to the method, set this interface as selected
		if (network.id_network > 0){
			$(`#mainModalNetworkSelect option[data-id_network="${network.id_network}"]`).prop('selected', true); 
		}
	})

	if (network.id_network == 0) {
		//New network

		//Buttons
		addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Add Network'});
		addButton('#mainModal .modal-footer', {type: 'close'});

		//Disable some controls select if we're adding a new network
		$('#mainModalNetworkSelect').append(`<option data-id_network="0"></option>`)
		$(`#mainModalNetworkSelect option[data-id_network="0"]`).prop('selected', true); 
		$('#mainModalNetworkSelect').prop('disabled', true);

	} else {
		//Existing network

		//Buttons
		addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalAddNew', label: 'Add New Network'});
		addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Update Network'});
		addButton('#mainModal .modal-footer', {type: 'close'});

		//Update the form controls
		postData3 = {
			type: 'Network',
			id_network: network.id_network
		}

		$.post('select.json', postData3, (result) => {
			debug('Passed to select.json: ', postData3);
			debug('Response: ', result)

			form.network.forEach((element) => {
				//Set the relevant form control values
				if(element.columnName){	setFormElement('#' + element.id, element, result[0][element.columnName]) }
			})

			//Set heading
			$('#mainModalNetworkName').text(result[0].name);

			//Set features
			$(`#mainModalFeatureSelect option[data-id_feature="${result[0].id_feature}"]`).prop('selected', true);
		})
	}


	//Event: Add a new network 
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click(() => {
		$('#mainModal').modal('hide');
		updateNetworkModal({id_network: 0});
	});


	//Event: Select existing network changes
	$('#mainModalNetworkSelect').unbind();
	$('#mainModalNetworkSelect').change(() => {
		updateNetworkModal({ id_network: $('#mainModalNetworkSelect option:selected').attr(`data-id_network`) });
	})


	//Event: Assign Icon button clicked
	$('#iconChooserButton').unbind();
	$('#iconChooserButton').click(() => {
		debug('loading icons')
		$('#mainModal').modal('hide');
		selectIconModal('#mainModal', getFormElement('#mainModalImage', { type: 'img', id: 'mainModalImage' }) ,(updatedIcon) => {
			setFormElement('#mainModalImage', { type: 'img', id: 'mainModalImage', columnName: 'image'}, updatedIcon)
		});
	})

	//Event: Update network in database
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {

		const postData = {
			type: 'Network',
			id_network: network.id_network,
		}

		//Network details from mainModal
		form.network.forEach((element) => {
			if (element.columnName){
				postData[element.columnName] = getFormElement('#' + element.id, element);
			}
		})
	
		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Response: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
			} else {
				//Check if entry was a new entry
				if (result.insertId == 0){
					//Submission was an update
					updateNetworkModal({ id_network: postData.id_network }, {type: 'success', msg: `The ${postData.name} network was updated successfully`})
				} else {
					//Submission was a new interface
					updateNetworkModal({ id_network: result.insertId }, {type: 'success', msg: `The new network was created successfully`})
				}
				
			}
		})
	});
}


function mapNetworksToSystemInterface(systemInterface, message){
	debug('In mapNetworksToSystemInterface()')
	debug(systemInterface)

	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Map Networks to System Interfaces');	
	$('#mainModal').modal('show');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Buttons
	addButton('#mainModal .modal-footer', {type: 'delete', id: 'mainModalDelete', label: 'Detach Network'});
	addButton('#mainModal .modal-footer', {type: 'close'});
	$('#mainModalDelete').prop('disabled', true);
	
	//Add the input fields
	document.querySelector('#mainModal .modal-body').innerHTML = `<form></form>`
	form.mapNetwork.forEach((element) => { addFormElement('#mainModal form', element) })

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'Network', id_system: systemInterface.id_system, id_SIMap: systemInterface.id_SIMap });

	//Get system image details
	const postData = {
		type: 'SIImages',
		id_SIMap: systemInterface.id_SIMap
	}
	$.post("select.json", postData, (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)

		//Place images
		installedInModalInsert(`#mainModal form`, {name: result[0].interfaceName, image: result[0].interfaceImage}, {name: result[0].systemName, image: result[0].systemImage}, true)

		
	});



	//Populate the existing networks select																		//Dumb way of doing it, should be achievable in a single query
	
	const postData3 = {
		type: 'CompatibleFeatures',
		id_SIMap: systemInterface.id_SIMap
	}
	
	$.post("select.json", postData3, (result) => {
		debug('Passed to select.json: ', postData3);
		debug('Response: ', result)

		const postData2 = {
			type: 'CompatibleNetworks',
			features: result[0].features.split(',')
		}
		$.post("select.json", postData2, (result) => {
			debug('Passed to select.json: ', postData2);
			debug('Response: ', result)

			//Load the list of interfaces into the select box
			result.forEach((element) => {
				$('#mainModalNetworkSelect').append(`<option data-id_network="${element.id_network}">${element.name}</option>`)
			})
		});
	});

	//Get all networks currently assigned to the system interface
	
	const postData4 = {
		type: 'AssignedNetworks',
		id_SIMap: systemInterface.id_SIMap
	}

	$.post('select.json', postData4, (result) => {
		debug('Passed to select.json: ', postData4);
		debug('Result: ', result)

		
		result.forEach((element) => {

			//Create the button element for each interface installed into the system
			addIconButton(`#mainModalNetworkContainer`, element.image, element.name, {name: 'id_SINMap', value: element.id_SINMap});

			//Event: An interface button was selected
			$('#mainModalNetworkContainer button:last-of-type').on( 'click', (event) => {

				//Toggle the selected interface button styling
				$("#mainModalNetworkContainer button").removeClass("btn-primary").addClass("btn-secondary");
				$(event.currentTarget).removeClass('btn-secondary').addClass('btn-primary');

				//Update the system object with the in-focus id_SINMap
				systemInterface.id_SINMap = parseInt($(event.currentTarget).attr('data-id_SINMap'));

				//Enable the remove network button
				$('#mainModalDelete').prop('disabled', false);

				//Populate the additional details
				//populateAdditionalDetails();

			});


		})
		//Select the interface button if a system.id_SIMap was supplied
		
		if (systemInterface.id_SINMap){
			//Focus on the supplied System Interface
			$(`#mainModalNetworkContainer button[data-id_SINMap='${systemInterface.id_SINMap}'`).removeClass('btn-secondary').addClass('btn-primary');
			
			//Load additional SI details
			//populateAdditionalDetails();
		} else {
			//Disable those controls which require a system interface to be identified
			//$('#SIIssues').prop('disabled', true);
			//$('#assignNetworksButton').prop('disabled', true);
		}
		

	})


	//Event: Attach network to system interface
	$(`#mainModalNetworkAttachButton`).unbind();
	$(`#mainModalNetworkAttachButton`).on('click', () => {
	
		const postData = {
			type: 'NetworkToSystemInterface',
			id_SIMap: systemInterface.id_SIMap,
			id_network: $('#mainModalNetworkSelect option:selected').attr(`data-id_network`),
		}
	
		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
			} else {
				//Reload the modal
				mapNetworksToSystemInterface(systemInterface, {info: 'success', msg: `The network was successfully attached.`})
			}
		})
	
	})

	//Event: Remove network
	$(`#mainModalDelete`).unbind();
	$(`#mainModalDelete`).on('click', () => {
		const postData = {
			type: 'DeleteNetworkFromInterface',
			id_SINMap: systemInterface.id_SINMap,
		}
	
		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
			} else {
				//Reload the modal
				mapNetworksToSystemInterface(systemInterface, {info: 'success', msg: `The network was successfully detached.`})
			}
	
		})
	})
	
}


/**
 * @description Handler for the different types of issues which may be encountered. Might not require.
 * 
 * @param  {} issue
 * @param  {} message
 */
function updateIssuesModal(issue,message){
	debug('in updateIssuesModal()')
	debug(issue)

	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-body').append('<form></form>');
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Update Issues');
	$('#mainModal').modal('show');
	
	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	if (issue.type){
		switch (issue.type){
			case 'SystemInterface':
				debug('in updateIssuesModal() systemInterface')

				//Breadcrumbs
				breadcrumbs('#mainModal form', { type: 'IssuesSystemInterface', id_system: issue.id_system, id_SIMap: issue.id_SIMap });

				if (!issue.id_issue){ issue.id_issue = 0 }

				if (issue.id_issue == 0){
					//New issue
					debug('New issue')

					//Add buttons
					addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Save Issue'});
					addButton('#mainModal .modal-footer', {type: 'close'});

					//Add input fields
					form.issue.systemInterface.forEach((element) => { addFormElement('#mainModal form', element) })

					//Breadcrumbs
					//breadcrumbs('#mainModal form', { type: 'SystemInterfaceIssue', id_system: issue.id_system, id_SIMap: issue.id_SIMap });

					//Disable select
					$('#issueSelect').prop('disabled', true);

					//Place images
					const postData3 = {
						type: 'IssueImages',
						subtype: 'SystemInterface',
						id_SIMap: issue.id_SIMap,
					}

					$.post('select.json', postData3, (result) => {
						debug('Passed to select.json: ', postData3);
						debug('Response: ', result);

						if (result.msg){
							//An error was passed
							updateIssuesModal({}, {info: 'failure', msg: `There was an error. Check the console.`});
						} else {
							//Populate the form
							installedInModalInsert(`#mainModal form`, {name: result[0].interfaceName, image: result[0].interfaceImage}, {name: result[0].systemName, image: result[0].systemImage}, true)
							issue.id_system = result[0].id_system;
						}
					})


					

				} else {
					//Existing issue
					debug('Existing issue')

					//Add buttons
					addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalAddNew', label: 'Add New Issue'});
					//addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalSystemInterface', label: 'Return to System interface'});
					//addButton('#mainModal .modal-footer', {type: 'delete', id: 'mainModalDelete', label: 'Delete Issue'});
					addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Save Issue'});
					addButton('#mainModal .modal-footer', {type: 'close'});

					//Add input fields
					form.issue.systemInterface.forEach((element) => { addFormElement('#mainModal form', element) })

					//Load known issues	for this system interface
					const postData = {
						type: 'BasicIssues', 
						subtype: 'SystemInterface',
						id_SIMap: issue.id_SIMap
					}

					$.post('select.json', postData, (result) => {
						debug('Passed to select.json: ', postData);
						debug('Response: ', result)

						if (result.msg){
							//An error was passed
							updateIssuesModal({}, {info: 'failure', msg: `There was an error. Check the console.`});
						} else {
							//Check if any issues are registered
							if (result.length == 0){
								//No issues recorded against this SI, reload to add
								issue.id_issue = 0;
								updateIssuesModal(issue, {info: 'warning', msg: `No issues recorded. Entering add new issue mode.`})

							} else {
								//Populate the form
								//Load the select
								result.forEach((element) => {
									$('#issueSelect').append(`<option data-id_issue="${element.id_issue}">${element.name}</option>`)
									//If a system ID was supplied to the method, set this system as selected
									if (issue.id_issue == element.id_issue){
										$(`#issueSelect option[data-id_issue="${issue.id_issue}"]`).prop('selected', true); 
									}	
								})

								updateFormElements();
							}


						}
					})

					//Event: Return to system interface clicked
					$('#mainModalSystemInterface').unbind();
					$('#mainModalSystemInterface').click(() => {
						$('#mainModal').modal('hide');
						updateSystemInterfacesModal({ id_SIMap: issue.id_SIMap, id_system: issue.id_system} )
					});

					//Event: Add new issue selected
					$('#mainModalAddNew').unbind();
					$('#mainModalAddNew').click(() => {
						$('#mainModal').modal('hide');
						updateIssuesModal({ type: 'SystemInterface', id_SIMap: issue.id_SIMap, id_issue: 0} )
					});

					//Event: Delete issue

					//Event: Issue select change
					$('#issueSelect').unbind();
					$('#issueSelect').change(() => {
						$('#mainModal').modal('hide');
						updateIssuesModal({ type: 'SystemInterface', id_SIMap: issue.id_SIMap, id_issue: $('#issueSelect option:selected').attr(`data-id_issue`)} )
					})


				}

				//Event: Save issue
				$('#mainModalSubmit').unbind();
				$('#mainModalSubmit').click(() => {
					const postData = {
						type: 'Issue',
						subtype: 'SystemInterface',
						id_SIMap: issue.id_SIMap,
					}

					//Provide id_issue if this is an existing issue
					if (issue.id_issue > 0){ postData.id_issue = parseInt($('#issueSelect option:selected').attr(`data-id_issue`)) }
			
					//System details
					form.issue.systemInterface.forEach((element) => {
						if (element.columnName){ postData[element.columnName] = getFormElement('#' + element.id, element) }
					})
						
					$.post('update.json', postData, (result) => {
						debug('Passed to update.json: ', postData);
						debug('Response: ', result)
				
						//Check the result																												//Working here, having trouble adding a new system
						if (result.msg){
							//An error was passed
							updateIssuesModal({},{info: 'failure', msg: `There was an error. Check the console.`});
						} else {
							//Check if entry was a new entry
							if (result.insertId == 0){
								//Submission was an update
								$('#mainModal').modal('hide');
								updateIssuesModal({type: postData.subtype, id_SIMap: postData.id_SIMap, id_issue: postData.id_issue}, {info: 'success', msg: `The ${postData.name} record was successfully updated.`});
								
							} else {
								//Submission was a new interface
								updateIssuesModal({type: postData.subtype, id_SIMap: postData.id_SIMap, id_issue: result.insertId}, {info: 'success', msg: `The ${postData.name} record was successfully added.`});
							}
							
						}
					})
				});


			break;
			case 'Interface':

			

			break;
			case 'Feature':

			

			break;
			case 'Network':

			

			break;
			default:
				debug(`Default switch reached. Unexpected.`)

		}
	} else {
		debug('No issue type was provided to updateIssuesModal()')

	}

	//Event: Traffic light button clicked
	$('#issueSeverity button').unbind();
	$('#issueSeverity button').click((event) => {
		debug('clicked')
		$('#issueSeverity button').removeClass('btn-primary')
		$(event.currentTarget)
			.removeClass('btn-light')
			.addClass('btn-primary')
		
	});


	//Event: Return to system interfaces button
	$('#mainModalSystemInterface').unbind();
	$('#mainModalSystemInterface').click(() => {
		updateSystemInterfacesModal({ id_system: issue.id_system, id_SIMap: issue.id_SIMap })

	});

	//Load the data into the relevant fields
	var updateFormElements = () => {

		postData2 = {
			type: 'Issue',
			subtype: 'SystemInterface',
			id_issue: parseInt($('#issueSelect option:selected').attr(`data-id_issue`))
		}

		//Update the form controls
		$.post('select.json', postData2, (result) => {
			debug('Passed to select.json: ', postData2);
			debug('Response: ', result)

			//Place images
			installedInModalInsert(`#mainModal form`, {name: result[0].interfaceName, image: result[0].interfaceImage}, {name: result[0].systemName, image: result[0].systemImage}, true)

			//Populate the form controls
			form.issue.systemInterface.forEach((element) => {
				//Set the relevant form control values
				if(element.columnName){ setFormElement('#' + element.id, element, result[0][element.columnName]) }										//Handle traffic lights
			})
		})
	}
}


/**
 * @param  {id_system, id_SIMap} system
 * @param  {} message
 */
function updateSystemInterfacesModal(system, message){
	debug('In updateSystemInterfacesModal()')
	debug(system)

	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Update System Interfaces');	
	$('#mainModal').modal('show');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	addButton('#mainModal .modal-footer', {type: 'delete', id: 'mainModalDelete', label: 'Remove Interface'});
	addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Update Additional Details'});
	addButton('#mainModal .modal-footer', {type: 'close'});
	$('#mainModalDelete').prop('disabled', true);
	$('#mainModalSubmit').prop('disabled', true);
	
	//Add the input fields
	document.querySelector('#mainModal .modal-body').innerHTML = `<form></form>`
	form.systemInterface.forEach((element) => { addFormElement('#mainModal form', element) })

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'SystemInterface', id_system: system.id_system });

	//Get system details
	$.post("select.json", {type: 'System', id_system: system.id_system}, (result) => {
		debug('Passed to select.json: ', {type: 'System', id_system: system.id_system});
		debug('Response: ', result)

		//Update image
		$('#mainModalSystemImage').attr('src', imagePath + result[0].image);

		//Update heading
		$('#mainModalSystemName').text(result[0].name);
	});

	//Get all interfaces for the select
	$.post("select.json", {type: 'Interface'}, (result) => {
		debug('Passed to select.json: ', {type: 'Interface'});
		debug('Response: ', result)

		//Load the list of interfaces into the select box
		result.forEach((element) => {
			$('#mainModalInterfaceSelect').append(`<option data-id_interface="${element.id_interface}">${element.name}</option>`)
		})
	});

	//Get all interfaces already attached to the system, for the interface icon buttons
	const postData = {
		type: 'SystemInterfaces',
		id_system: system.id_system,
	}
	$.post(`select.json`, postData, (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)

		//Place an icon of each installed interface
		result.forEach((element) => {

			//Create the button element for each interface installed into the system
			addIconButton(`#mainModalInstalledInterfaceContainer`, element.image, element.name, {name: 'id_SIMap', value: element.id_SIMap});


			//Event: An interface button was selected (works)
			$('#mainModalInstalledInterfaceContainer button:last-of-type').on( 'click', (event) => {

				//Toggle the selected interface button styling
				$("#mainModalInstalledInterfaceContainer button").removeClass("btn-primary").addClass("btn-secondary");
				$(event.currentTarget).removeClass('btn-secondary').addClass('btn-primary');

				//Update the system object with the in-focus id_SIMap
				system.id_SIMap = parseInt($(event.currentTarget).attr('data-id_SIMap'));

				//Populate the additional details
				populateAdditionalDetails();

			});


		})
		//Select the interface button if a system.id_SIMap was supplied
		if (system.id_SIMap){
			//Focus on the supplied System Interface
			$(`#mainModalInstalledInterfaceContainer button[data-id_SIMap='${system.id_SIMap}'`).removeClass('btn-secondary').addClass('btn-primary');
			
			//Load additional SI details
			populateAdditionalDetails();
		} else {
			//Disable those controls which require a system interface to be identified
			$('#SIIssues').prop('disabled', true);
			$('#assignNetworksButton').prop('disabled', true);
		}

	});

	//Event: Assign networks button selected
	$('#assignNetworksButton').unbind();
	$('#assignNetworksButton').click(() => {
		mapNetworksToSystemInterface({ id_system: system.id_system, id_SIMap: system.id_SIMap })

	});


	//Event: Delete button selected
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click(() => {
		const postData = {
			type: 'DeleteInterfaceFromSystem',
			id_SIMap: system.id_SIMap,
		}
	
		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateSystemInterfacesModal(system, {info: 'failure', msg: `There was an error. Likely due to this interface having an associated network.`});
			} else {
				//Update was successful
				updateSystemInterfacesModal(system, {info: 'success', msg: `The interface was successfully removed.`});
			}
	
		})

	});


	//Event: Install interface button selected (Works)
	$('#mainModalInstallInterfaceButton').unbind();
	$('#mainModalInstallInterfaceButton').click(() => {
		const postData = {
			type: 'InterfaceToSystem',
			id_interface: $('#mainModalInterfaceSelect option:selected').attr(`data-id_interface`),
			id_system: system.id_system,
		}

		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateSystemInterfacesModal(system, {info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Update was successful
				system.id_SIMap = result.insertId;
				updateSystemInterfacesModal(system, {info: 'success', msg: `The interface was successfully added.`});
			}
		})
	});
	
	//Event: Update details button selected
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		const postData = {
			type: 'UpdateSIMap',
			id_SIMap: system.id_SIMap,
		}

		form.systemInterface.forEach((element) => {
			if (element.additional) {
				postData[element.columnName] = getFormElement('#' + element.id, element)
			}
		})

		$.post("update.json", postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Response: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateSystemInterfacesModal(system, {info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Update was successful
				updateSystemInterfacesModal(system, {info: 'success', msg: `The record was successfully updated.`});
			}
		});
	});

	//Event: Assign issues button selected
	$('#SIIssues').unbind();
	$('#SIIssues').click(() => {
		$('#mainModal').modal('hide');
		updateIssuesModal({ type: 'SystemInterface', id_system: system.id_system, id_SIMap: system.id_SIMap, id_issue: 1 });
	});


	//Event: Switch to the update system modal
	$('#systemButton').unbind();
	$('#systemButton').click(() => {
		$('#mainModal').modal('hide');
		updateSystemModal(system.id_system);
	});

	//Event: Changes to additional details controls
	$('#SIDescription').unbind();
	$('#SIDescription').on('input', () => {
		currentlyEditingAdditionalDetails();
	});
	$('#mainModalPropsedInterface').unbind();
	$('#mainModalPropsedInterface').change(() => {
		currentlyEditingAdditionalDetails();
	});

	var currentlyEditingAdditionalDetails = () => {
		//Enable controls
		$('#mainModalSubmit').prop('disabled', false);

		//Disable controls
		$('#systemButton').prop('disabled', true);
		$('#assignNetworksButton').prop('disabled', true);
		$('#SIIssues').prop('disabled', true);
		$('#mainModalDelete').prop('disabled', true);


	}

	//Populate the additional details
	var populateAdditionalDetails = () => {
		//Enable/Disable particular buttons
		$('#mainModalDelete').prop('disabled', false);
		$('#systemButton').prop('disabled', false);
		$('#assignNetworksButton').prop('disabled', false);
		$('#SIIssues').prop('disabled', false);
		$('#mainModalDelete').prop('disabled', false);


		const postData = {
			type: 'SystemInterface',
			id_SIMap: system.id_SIMap,
		}

		//Get all systems for the select
		$.post("select.json", postData, (result) => {
			debug('Passed to select.json: ', postData);
			debug('Response: ', result)

			//Load the list of interfaces into the select box
			form.systemInterface.forEach((element) => {
				if(element.additional){
					setFormElement('#' + element.id, element, result[0][element.columnName])
				}
			})
		});
	}
}


/**
 * @description Prepare and display the modal which allows the user to quickly update features															//Could add a 'do not use past' year
 * using a select to access all available features.																										//Adding a new feature is messy
 * 
 * @param  {info, msg} message
 */
function updateFeaturesModal(message){
	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	
	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Buttons
	addButton('#mainModal .modal-footer', {type: 'delete', id: 'mainModalDelete', label: 'Delete'});
	addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalAddNew', label: 'Add New Feature'});
	addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Update'});
	addButton('#mainModal .modal-footer', {type: 'close'});
	
	$('#mainModalTitle').text('Update Features');
	$('#mainModal').modal('show');

	//Add the input fields
	document.querySelector('#mainModal .modal-body').innerHTML = 
	`<form>
		<div class="form-group">
			<label id="mainModalFeaturesSelectLabel" for="mainModalFeaturesSelect">Feature</label>
			<select class="form-control" id="mainModalFeaturesSelect"></select>
		</div>
		<div class="form-group">
			<label for="mainModalFeaturesName">Name</label>
			<input type="text" class="form-control" id="mainModalFeaturesName"></input>
		</div>
		<div class="form-group">
			<label for="mainModalFeaturesDescription">Description</label>
			<textarea class="form-control" id="mainModalFeaturesDescription" rows="5"></textarea>
		</div>
	</form>`
	
	//Populate the dropbox
	const postData = {type: 'Features'}
	$.post('select.json', postData, (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)

		//Check the result
		if (result.msg){
			//An error was passed

		} else {
			
			result.forEach((element) => {
				
				$('#mainModalFeaturesSelect').append(`<option data-id="${element.id_feature}" data-description="${element.description}">${element.name}</option>`)
				$('#mainModalFeaturesDescription').val($('#mainModalFeaturesSelect option:selected').attr('data-description'));
				$('#mainModalFeaturesName').val($('#mainModalFeaturesSelect option:selected').text());				
			})
			//Select the new entry, if created
			if (message) { 
				if (message.newId){
					$(`#mainModalFeaturesSelect option[data-id="${message.newId}"]`).prop('selected', true); 
				}
			}
		}
	})

	//Event: Add a new blank feature
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click((event) => {

		const postData = {
			type: 'Feature',
			name: '',
			description: '',
		}

		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Response: ', result)

			//Check the result
			if (result.msg){
				//An error was passed
				
			} else {
				updateFeaturesModal({info: 'success', msg: `The new feature was successfully added.`, newId: result.insertId});
			}
		})
	})

	//Event: Delete a feature
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click((event) => {

		const postData = {
			type: 'DeleteFeature',
			id_feature: $('#mainModalFeaturesSelect option:selected').attr('data-id'),
			name: $('#mainModalFeaturesName').val()
		}

		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Response: ', result)

			//Check the result
			if (result.msg){
				//An error was passed
				updateFeaturesModal({info: 'failure', msg: `The ${postData.name} record was unable to be deleted.`});
			} else {
				updateFeaturesModal({info: 'success', msg: `The ${postData.name} record was successfully deleted.`});
			}
		})
	})


	//Event: Changes in the feature select
	$('#mainModalFeaturesSelect').unbind();
	$('#mainModalFeaturesSelect').change((event) => {
		$('#mainModalFeaturesDescription').val($('#mainModalFeaturesSelect option:selected').attr('data-description'));
		$('#mainModalFeaturesName').val($('#mainModalFeaturesSelect option:selected').text());
	})

	//Event: Submission of the modal
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click((event) => {

		const postData = {
			type: 'Feature',
			id_feature: $('#mainModalFeaturesSelect option:selected').attr('data-id'),
			name: $('#mainModalFeaturesName').val(),
			description: $('#mainModalFeaturesDescription').val()
		}

		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Response: ', result)

			//Check the result
			if (result.msg){
				//An error was passed
				updateFeaturesModal({info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				updateFeaturesModal({info: 'success', msg: `The ${postData.name} record was successfully updated.`});
			}
		})
	})
}


/**
 * @description Allows the user to easily map features to networks using selects
 * @param  {type, msg} message
 */
 function mapFeaturesToNetworksModal(message){
	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	
	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Buttons
	addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalEditNetwork', label: 'Edit Network'});
	addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Save Mapping'});
	addButton('#mainModal .modal-footer', {type: 'close'});
	
	$('#mainModalTitle').text('Update Features');
	$('#mainModal').modal('show');

	//Add the input fields
	document.querySelector('#mainModal .modal-body').innerHTML = 
	`<form>
		<div class="form-group">
			<label id="mainModalNetworkSelectLabel" for="mainModalNetworkSelect">Network</label>
			<select class="form-control" id="mainModalNetworkSelect"></select>
		</div>
		<div class="form-group">
			<label id="mainModalFeatureSelectLabel" for="mainModalFeatureSelect">Feature</label>
			<select class="form-control" id="mainModalFeatureSelect">
				<option data-id_feature="0"></option>
			</select>
		</div>
	</form>`

	//Populate the network dropbox
	const postData = {type: 'Networks'}
	$.post('select.json', postData, (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)

		//Check the result
		if (result.msg){
			//An error was passed

		} else {
			result.forEach((element) => {
				$('#mainModalNetworkSelect').append(`<option data-id_network="${element.id_network}" data-id_feature="${element.id_feature}" data-description="${element.description}">${element.name}</option>`)			
			})
		}
	})

	//Need to make sure both selects are populated before matching the features to the first entry in the networks select.

	//Use a promise or two queries?


	//Populate the dropbox
	const postData2 = {type: 'Features'}
	$.post('select.json', postData2, (result) => {
		debug('Passed to select.json: ', postData2);
		debug('Response: ', result)

		//Check the result
		if (result.msg){
			//An error was passed

		} else {
			
			result.forEach((element) => {
				
				$('#mainModalFeatureSelect').append(`<option data-id_feature="${element.id_feature}" data-description="${element.description}">${element.name}</option>`)
			
			})
		}
	})

	//Event: Changes to the network select
	$('#mainModalNetworkSelect').unbind();
	$('#mainModalNetworkSelect').change((event) => {
		//Check if a feature is mapped
		debug('feature id is: ' + $(`#mainModalNetworkSelect option:selected`).attr('data-id_feature'));
		var id_feature = $(`#mainModalNetworkSelect option:selected`).attr('data-id_feature');
		if (id_feature > 0) {
			//Select that feature
			$(`#mainModalFeatureSelect option[data-id_feature="${id_feature}"]`).prop('selected', true); 
		} else {
			//Select the empty feature (data-id="0")
			$(`#mainModalFeatureSelect option[data-id_feature="0"]`).prop('selected', true);
		}
	})

	//Event: Edit network
	$('#mainModalEditNetwork').unbind();
	$('#mainModalEditNetwork').click(() => {
		
		const selectedNetwork = new Node();

		//Get node details from the server
		const postData3 = {type: 'Network', id_network: $(`#mainModalNetworkSelect option:selected`).attr('data-id_network')}
		$.post('./select.json', postData3, (result) => {
			debug('Passed to select.json:', postData3);
			debug('Response:', result)

			//Check the result
			if (result.msg){
				//An error was passed																			//Add error handling

			} else {
				//Set the selected node object
		
				result[0].type = postData3.type;
				selectedNetwork.update(result[0]);

				$('#mainModal').modal('hide');

				nodeModal({
					title: 'Update Network',
					description: '',
					type: 'Network',
					NodeModal: new NodeModal('Network', selectedNetwork),
				});				
			}
		})
	});

	//Event: Save mapping button
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click((event) => {

		const postData4 = {
			type: 'NetworkFeature',
			id_feature: $('#mainModalFeatureSelect option:selected').attr('data-id_feature'),
			id_network: $('#mainModalNetworkSelect option:selected').attr('data-id_network'),
		}

		$.post('update.json', postData4, (result) => {
			debug('Passed to update.json: ', postData4);
			debug('Response: ', result)

			//Check the result
			if (result.msg){
				//An error was passed
				mapFeaturesToNetworksModal({info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				mapFeaturesToNetworksModal({info: 'success', msg: `The mapping of ${$('#mainModalFeatureSelect option:selected').val()} to ${$('#mainModalNetworkSelect option:selected').text()} was successfully updated.`});
			}
		})
	})
}





/**
 * @description Pick the system to update from a select. Helps find systems which
 * may be lost in years.
 * 
 */
function updateSystemModal(system, message){
	debug('In updateSystemModal()')
	debug(system)

	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Update Systems');	
	$('#mainModal').modal('show');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add the input fields
	document.querySelector('#mainModal .modal-body').innerHTML = `<form></form>`
	form.system.forEach((element) => { addFormElement('#mainModal form', element)	})

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'System', id_system: system.id_system});

	if (system.id_system == 0){
		//Creating a new system

		//Buttons
		addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Add Interface'});
		addButton('#mainModal .modal-footer', {type: 'close'});

		//Disable some controls
		$('#mainModalSystemSelect').append(`<option data-id_system="0"></option>`)
		$(`#mainModalSystemSelect option[data-id_system="0"]`).prop('selected', true); 
		$('#mainModalSystemSelect').prop('disabled', true);
		$('#mainModalSystemSelect').prop('disabled', true);

		$('#updateSystemInterfacesButton').prop('disabled', true);
		$('#systemQuantitiesButton').prop('disabled', true);	

	} else {
		//Modifying an existing system

		//Buttons
		addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalAddNew', label: 'Add New System'});
		addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Update Interface'});
		addButton('#mainModal .modal-footer', {type: 'close'});

		//Populate the dropbox
		const postData = {type: 'System'}
		$.post('select.json', postData, (result) => {
			debug('Passed to select.json: ', postData);
			debug('Response: ', result)

			//Check the result
			if (result.msg){
				//An error was passed

			} else {
				
				result.forEach((element) => {
					$('#mainModalSystemSelect').append(`<option data-id_system="${element.id_system}">${element.name}</option>`)
				})

				//If a system ID was supplied to the method, set this system as selected
				if (system.id_system > 0){
					$(`#mainModalSystemSelect option[data-id_system="${system.id_system}"]`).prop('selected', true); 
				}
				
				updateFormElements();
			}
		})
	}

	//Event: Drag/drop a reference
	$('#systemReferenceDropZone')
	//.on('dragover', false)
	//.on('dragenter', false)
	.on('dragover', (event) => {
		event.preventDefault();
		event.stopPropagation();
	})
	.on('dragenter', (event) => {
		event.preventDefault();
		event.stopPropagation();
	})
	.on('drop', (event) => {
		event.preventDefault();
		event.stopPropagation();
		//debug(event.originalEvent);
		if (event.originalEvent.dataTransfer.files.length == 1){
			debug('file list = 1')
			var file = event.originalEvent.dataTransfer.files[0]
			debug(file)
			file.text().then((result) => {
				debug(result)
				$('#systemReference').val(result)
			})
		}

		return false;
	})

	//Event: Changes to any controls
	$('#mainModalName, #nodeDescription, #systemTags').unbind();
	$('#mainModalName, #nodeDescription, #systemTags').on('input', () => {
		//Disable some controls to prevent navigating away from the modal before saving
		$('#systemQuantitiesButton, #updateSystemInterfacesButton, #mainModalAddNew, #mainModalSystemSelect').prop('disabled', true);
	});


	//Event: User clicks button to assign quantites to years
	$(`#systemQuantitiesButton`).unbind();
	$(`#systemQuantitiesButton`).on('click', () => {
		$('#mainModal').modal('hide');
		updateSystemQuantities(system.id_system);
	})


	//Event: Change to the modal which allows the user to assign interfaces to the system
	$('#updateSystemInterfacesButton').unbind();
	$('#updateSystemInterfacesButton').click(() => {
		$('#mainModal').modal('hide');
		updateSystemInterfacesModal({ id_system: system.id_system });
	});


	//Event: Add a new blank system 
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click(() => {
		$('#mainModal').modal('hide');
		updateSystemModal({ id_system: 0 });
	});

	
	//Event: Modal hidden																						//Firing incorrectly when reloading the modal
	/*
	$('#mainModal').on('hidden.bs.modal', () => {
		debug('Modal closing')
		if (graphSettings.refreshOnUpdate) {
			//newCy();										
		}
	})
	*/

	//Event: Select changes
	$('#mainModalSystemSelect').unbind();
	$('#mainModalSystemSelect').change(() => {
		//system.id_system = $('#mainModalSystemSelect option:selected').attr(`data-id_system`)
		updateSystemModal({ id_system: $('#mainModalSystemSelect option:selected').attr(`data-id_system`) });
	})


	//Event: Assign Icon button clicked
	$('#iconChooserButton').unbind();
	$('#iconChooserButton').click(() => {
		$('#mainModal').modal('hide');
		selectIconModal('#mainModal', getFormElement('#mainModalImage', { type: 'img', id: 'mainModalImage' }) ,(updatedIcon) => {
			setFormElement('#mainModalImage', { type: 'img', id: 'mainModalImage', columnName: 'image'}, updatedIcon)
		});
	})


	//Event: Submit
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {

		const postData = {
			type: 'System',
			id_system: $('#mainModalSystemSelect option:selected').attr(`data-id_system`),
		}

		//System details
		form.system.forEach((element) => {
			if (element.columnName){
				postData[element.columnName] = getFormElement('#' + element.id, element);
			}
		})

		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Response: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateSystemModal({info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Check if entry was a new entry
				if (result.insertId == 0){
					//Submission was an update
					updateSystemModal({id_system: postData.id_system}, {info: 'success', msg: `The ${postData.name} record was successfully updated.`});
				} else {
					//Submission was a new interface
					updateSystemModal({ id_system: result.insertId}, {info: 'success', msg: `The ${postData.name} record was successfully added.`});
				}
				
			}
		})
	});


	//Load the data into the relevant fields
	var updateFormElements = () => {

		const postData2 = {
			type: 'System',
			id_system: system.id_system 
		}

		//Update the form controls
		$.post('select.json', postData2, (result) => {
			debug('Passed to select.json: ', postData2);
			debug('Response: ', result)

			//Update heading
			$('#mainModalSystemName').text(result[0].name);

			form.system.forEach((element) => {
				//Set the relevant form control values
				if(element.columnName){
					setFormElement('#' + element.id, element, result[0][element.columnName]);
				}
			})
		})
	}
}







/**
 * @description A modal which maps the quantity of systems available each year
 * 
 * @param  {} id_system The id of the system to which this modal applies
 * @param  {} returnModal
 */
function updateSystemQuantities(id_system, message){
	debug('In updateSystemQuantities()');
	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Map System Quantities to Years');	
	$('#mainModal').modal('show');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', {type: 'success', msg: message.msg}) }

	//Buttons
	addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Save Mapping'});
	addButton('#mainModal .modal-footer', {type: 'close'});

	//Add the form
	document.querySelector('#mainModal .modal-body').innerHTML = `<form></form>`
	form.systemQuantities.forEach((element) => { addFormElement('#mainModal form', element) })

	//var inputCounter = 0;

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'Quantities', id_system: id_system });

	var inputCounter = 1;

	//Get the data for the image and name
	const postData = {
		type: 'System',
		id_system: id_system
	}

	debug('Passing to select.json: ', postData);
	$.post('select.json', postData, (result) => {
		
		debug('Result: ', result)

		//Check the result
		if (result.msg){
			//An error was passed
		} else {
			//Update the image and title
			setFormElement('#mainModalImage', {type: 'img'}, result[0].image );
			setFormElement('#mainModalSystemName', {type: 'heading'}, result[0].name);
		}
	})


	//Get the quantities per year for this system from the server
	const postData2 = {
		type: 'QtyYears',
		id_system: id_system
	}

	debug('Passing to select.json: ', postData2);
	$.post('select.json', postData2, (result) => {
		debug('Result: ', result)

		//Check the result
		if (result.msg){
			//An error was passed
		} else {
			//Add year / qty headings
			//$('#mainModalInstalledInterfaceContainer')															//Working here


			//Add controls for each year where the quantity changes
			if (result.length == 0){
				//No entries, add a blank entry
				addQuantityFormControl('#mainModalInstalledInterfaceContainer', inputCounter, {year: 2020, quantity: 0})
				inputCounter = 1;

			} else {
				//Load entries
				result.forEach((element) => {
					addQuantityFormControl('#mainModalInstalledInterfaceContainer', inputCounter, {year: element.year, quantity: element.quantity})
					inputCounter++;
				})
			}

		}

	})

	//Event: Add new field
	$('#addNewFieldsButton').unbind();
	$('#addNewFieldsButton').click(() => {
		debug('inputcounter: ' + inputCounter)
		if(inputCounter > 1){
			var year = parseInt(getFormElement(`#formYears_${inputCounter - 1}`, {type: 'year'})) + 1;
		} else {
			var year = 2020;
		}

		addQuantityFormControl(`#mainModalInstalledInterfaceContainer`, inputCounter, {year: year, quantity: 0})
		//addQuantityFormControl(`#inputDiv_${inputCounter - 1}`, inputCounter, {year: year, quantity: 0}, true)
		
		inputCounter++;
	})

	//Event: Remove last field
	$('#removeLastFieldButton').unbind();
	$('#removeLastFieldButton').click(() => {
		//Make sure the last box cannot be removed
		//if (inputCounter == 0)
		inputCounter--;
		$(`#inputDiv_${inputCounter}`).remove();
		debug('at end of remove button inputCounter = ' + inputCounter)
	})

	//Event: Return to system
	$('#returnToSystem').unbind();
	$('#returnToSystem').click(() => {
		$('#mainModal').modal('hide');
		updateSystemModal(id_system);
	});


	//Event: Submission of form
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		debug('inputCounter: ' + inputCounter);

		//Update modal object and return to the previous modal
		const recordArr = [];

		for (var i = 1; i <= inputCounter; i++){
			debug('i: ' + i)
			recordArr.push({year: $(`#formYears_${i}`).val(), quantity: $(`#formQuantity_${i}`).val()})
		}

		//Upload to database
		const postData = {
			type: 'QtyYears',
			id_system: id_system,
			years: recordArr
		}

		debug('Passing to update.json: ', postData);
		$.post('update.json', postData, (result) => {
			debug('Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
			} else {
				
			}
	
		})

		//modal.node.qtyInYears = recordArr;
		//$('#supportModal').modal('hide');
		//$(returnModal).modal('show');

	})
}


//******************************** Supporting Modals ****************************************




/**
 * @description 
 * 
 * @param  {} callingModal
 * @param  {} initialIcon
 * @param  {} callback
 */
function selectIconModal(callingModal, initialIcon, callback){

	//Prepare the modal
	$('#supportModal .modal-body').empty();
	$('#supportModal .modal-footer').html('<div class="warning-holder"></div>');

	//Notifications
	//if (message){ addBadge('#mainModal .warning-holder', {type: 'success', msg: message.msg}) }

	//Buttons
	addButton('#supportModal .modal-footer', {type: 'submit', id: 'supportModalSubmit', label: 'Select Icon'});
	//addButton('#supportModal .modal-footer', {type: 'close'});

	//Swap modals
	$(callingModal).modal('hide');
	$('#supportModal').modal('show');

	//Get the list of images from the server
	$.get('images.json', (result) => {
			
		//Iterate through the list and populate the relevant location
		result.forEach((element) => {
			//Create the element
			var domElement = document.createElement('button');
			$(domElement).addClass('btn btn-secondary m-2');
			$(domElement).attr('data-image', element);
			$(domElement).html(`<img src="${imagePath + element}" width="100" height="100"><br>${element}`);

			//Event: Image button clicked
			$(domElement).on("click", () => {

				//Reset all icon buttons
				$("#supportModal .modal-body button").removeClass('btn-primary').addClass('btn-secondary');

				//Update targeted icon button
				$(domElement).removeClass('btn-secondary').addClass('btn-primary');

			})
		
			//Insert the image, its containing button and event handler into the modal
			$('#supportModal .modal-body').append(domElement);
		})
	})

	//Event: Submit button clicked
	$('#supportModalSubmit').unbind();
	$('#supportModalSubmit').click(() => {
		$('#supportModal').modal('hide');
		$(callingModal).modal('show');
		//debug($('#supportModal .modal-body button.btn-primary').attr('data-image'));
		callback($('#supportModal .modal-body button.btn-primary').attr('data-image'));
	});
}



/**
 * Handles the two different variants of the mappingModal.
 * 
 */
function mappingModal(modalSetup){
	debug('In mappingModal()')
	//debug('selectedNode:', selectedNode)

	//Cleanup the modal
	$("#mappingModalContainer").empty();
    $("#mappingModalContainer").unbind();
    $("#mappingModalSelect").empty();
    $("#mappingModalDeleteButton").unbind();
    $("#mappingModalDeleteButton").prop('disabled', true);
	$("#interfacesToSystemModalNetworksContainer").empty();
	$("#interfacesToSystemModalContainer").empty();
	$('#mappingModalImageContainer').empty();
	
	//Prepare the modal
	$("#mappingModal .modal-title").text(modalSetup.title1)
	$("#mappingModalTitle2").text(modalSetup.title2);
	$("#mappingModalTitle3").text(modalSetup.title3);
	$("#mappingModalAddButton").html(modalSetup.addButtonText);

	//Assign interfaces to systems
	if (selectedNode.type == "System"){
		mappingModal_system();

		//Handle the add button
		mappingModal_addButton();
	}

	//Assign networks to system interfaces
	if (selectedNode.type == "SystemInterface"){
		mappingModal_interface()

		//Handle the add button
		mappingModal_addButton();
	}

	$('#mappingModal').modal('show');
}





/**
 *CFD
 
 Handle the 'Assign Networks to System Interfaces' modal
 * 
 * 
 */
function mappingModal_interface(){
	debug('In mappingModal_interface()')

	//Set images & labels
	installedInModalInsert('#mappingModalImageContainer', {name: selectedNode.name, image: selectedNode.image}, {name: selectedNode.systemName, image: selectedNode.systemImage})

	//**********************    Get the list of compatible networks for this interface
	const postData = {
		type: 'CompatibleNetworks', 
		//id_network: selectedNode.id_network,
		features: selectedNode.features,
	};
	$.post('/select.json', postData, (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)
		//debug(selectedNode)

		//Load the list of interfaces into the select box
		result.forEach((element) => {
			$("#mappingModalSelect").append(`<option data-id="${element.id_network}">${element.name}</option>`)
		})
	})

	//**********************    Get the networks already assigned to the system
	const postData2 = {
		type: 'AssignedNetworks', 
		id_SIMap: selectedNode.id_SIMap,
	};
	$.post('/select.json', postData2, (result) => {
		debug('Passed to select.json: ', postData2);
		debug('Response: ', result)
		//debug(selectedNode)

		//Place an icon of each installed interface
		result.forEach((element) => {

			//Create the element
			var imageButton = nodeSelectButton(element.id_SINMap, element.image, element.name);

			//Event: Handle selection of the interface (for deleting)
			$(imageButton).on("click", (event) => {

				//Toggle styling
				$("#mappingModalContainer button").removeClass("btn-primary").addClass("btn-secondary");
				$(imageButton).removeClass('btn-secondary').addClass('btn-primary');
				$("#mappingModalWarning").addClass('d-none');
				
				var id_SINMap = imageButton.getAttribute('data-id');
				
				debug('Delete ID: ' + id_SINMap)

				//Delete button function
				$("#mappingModalDeleteButton").prop('disabled', false);
				$("#mappingModalDeleteButton").unbind();
				$("#mappingModalDeleteButton").on("click", (event) => { mappingModal_deleteButton(id_SINMap) })
			})

			//Insert the image, its containing button and event handler into the modal
			$("#mappingModalContainer").append(imageButton);
		})
	})
}

/**
 * @description Provides a common layout when showing a graphical depection of interfaces installed in a system
 * 
 * @param  {string} $selector The insert location of the element
 * @param  {name, image} left The left item, generally an interface
 * @param  {name, image} right The right itme, generally a system
 * @param  {boolean} prepend True if result should prepend to $selector. False appends.
 */
function installedInModalInsert($selector,left,right,prepend){

	var response = `<div class="row text-center">
		<div class="col-sm">
			<h5>${left.name}</h5>
			<img src="${imagePath + left.image}" width="100px" height="100px">
		</div>
		<div class="col-sm mt-5">
			<h5>Installed In<br><h3>&#8594</h3></h5>
		</div>
		<div class="col-sm">
			<h5>${right.name}</h5>
			<img src="${imagePath + right.image}" width="100px" height="100px">
		</div>
	</div>`

	if (prepend){
		$($selector).prepend(response)
	} else {
		$($selector).append(response)
	}
}


function breadcrumbs($selector, details){

	var breadcrumbArr = [];
	var breadcrumbHtml = '<nav aria-label="breadcrumb"><ol class="breadcrumb">';
	//var breadcrumbHtml = `<nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb"><ol class="breadcrumb">`;


	//Start by pushing the detail of each breadcrumb into the array

	switch (details.type){
		case 'System':
			breadcrumbArr.push({ name: 'System', active: true, data: [{ key: 'id_system', value: details.id_system }]})
		break;
		case 'UpdateInterface':
			breadcrumbArr.push({ name: 'Interface', active: true, data: []})
		break;
		case 'SystemInterface':
			breadcrumbArr.push({ name: 'System', active: false, module: 'updateSystemModal', data: [{ key: 'id_system', value: details.id_system }]})
			//breadcrumbArr.push({ name: 'System Interface', active: true, data: [{ key: 'id_SIMap', value: details.id_SIMap }, {key: 'id_system', value: details.id_system}]})
			breadcrumbArr.push({ name: 'System Interface', active: true, data: [] })
		break;
		case 'Network':
			breadcrumbArr.push({ name: 'System', active: false, module: 'updateSystemModal', data: [{ key: 'id_system', value: details.id_system }]})
			breadcrumbArr.push({ name: 'System Interface', active: false, module: 'updateSystemInterfacesModal', data: [{ key: 'id_system', value: details.id_system },{ key: 'id_SIMap', value: details.id_SIMap }]})
			breadcrumbArr.push({ name: 'Map Network', active: true, data: []})
		break;
		case 'UpdateNetwork':
			breadcrumbArr.push({ name: 'Network', active: true, data: []})
		break;
		case 'IssuesSystemInterface':
			breadcrumbArr.push({ name: 'System', active: false, module: 'updateSystemModal', data: [{ key: 'id_system', value: details.id_system }]})
			breadcrumbArr.push({ name: 'System Interface', active: false, module: 'updateSystemInterfacesModal', data: [{ key: 'id_system', value: details.id_system },{ key: 'id_SIMap', value: details.id_SIMap }]})
			breadcrumbArr.push({ name: 'Issue', active: true, data: []})
		break;
		case 'Quantities':
			breadcrumbArr.push({ name: 'System', active: false, module: 'updateSystemModal', data: [{ key: 'id_system', value: details.id_system }]})
			//breadcrumbArr.push({ name: 'System Interface', active: true, data: [{ key: 'id_SIMap', value: details.id_SIMap }, {key: 'id_system', value: details.id_system}]})
			breadcrumbArr.push({ name: 'System Quantities', active: true, data: [] })
		break;
		default:
			debug(`Breadcrumb switch default. Shouldn't make it here`)
	}

	/*
		case 'System':
			updateSystemModal(selectedNode.id_system)
			break;
		case 'SystemInterface':
			debug(selectedNode)
			updateSystemInterfacesModal({ id_system: selectedNode.id_system, id_SIMap: selectedNode.id_SIMap })
			break;
		case 'Network':
			updateNetworkModal(selectedNode.id_network);
			break;
	*/
	

	//Produce the HTML
	breadcrumbArr.forEach((element) => {
		var paramData = '{ '
		element.data.forEach((element2) => {
			paramData += `${element2.key}: ${element2.value},`
		})
		paramData += '}'

		if (element.active){
			breadcrumbHtml += `<li class="breadcrumb-item active" aria-current="page">${element.name}<li>`;
		} else {
			breadcrumbHtml += `<li class="breadcrumb-item"><a href="#" onclick="${element.module}(${paramData})">${element.name}</a></li>`;
		}

	})
	breadcrumbHtml += `</ol></nav>`

	//debug(breadcrumbHtml)

	$($selector).before(breadcrumbHtml)
}


//******************************** Candidates for deletion ****************************************


/**
 * @description Load images into the icon selector modal
 * 
 * 
 * @param  {} jQuerySelector
 */
 function loadIcons(jQuerySelector){
	 debug(`SHOULDN'T BE HERE loadIcons()`)
  
    //Make sure the relevant location is empty
    $(jQuerySelector).empty();
  
    //Get the list of images from the server
    $.get('images.json', (result) => {
  
		//Iterate through the list and populate the relevant location
		result.forEach(element => {
		//Create the element
		var domElement = document.createElement('button');
		$(domElement).addClass('btn btn-secondary m-2');
		$(domElement).attr('data-image', element);
		$(domElement).html(`<img src="${imagePath + element}" width="100" height="100"><br>${element}`);

		//Event: Image button clicked on
		$(domElement).on("click", () => {
			debug('User clicked on an image button')
			//Reset all icon buttons
			$(jQuerySelector + " button").removeClass('btn-primary').addClass('btn-secondary');

			//Update targeted icon button
			$(domElement).removeClass('btn-secondary').addClass('btn-primary');
			
			//Update calling modal
			debug('Image was: ' + modal.node.image);
			modal.node.image = element;
			debug('Image iss: ' + modal.node.image);

			$("#nodeModalimage").attr("src", imagePath + modal.node.image);
		})
		
		//Insert the image, its containing button and event handler into the modal
		$(jQuerySelector).append(domElement);
		})
    })
}

/**
 * @description Handles a user clicking on the add icon button in a node modal
 * 
 */
 function loadIconModal(lastModalSelector){
	debug(`SHOULDN'T BE HERE loadIconModal()`)
    debug('loadIconModal fired')
    debug('Node image is ' + modal.node.image)
    //if (!selectedIcon) { selectedIcon = 'tba.svg' }

    //Set the currently selected icon in the icon modal
    $('#iconContainer button').addClass('btn-secondary').removeClass('btn-primary');
    $('#iconContainer [data-image="' + modal.node.image + '"]').addClass('btn-primary').removeClass('btn-secondary');
    //$('#iconContainer').find('[data-image="' + modal.node.image + '"]').addClass('btn-primary').removeClass('btn-secondary');
    
    //Hide the current modal
    //$('#nodeModal').modal('hide');
  
    //Show the icon modal
    $('#iconModal').modal('show');

    //Event: Set the icon chooser modal buttons to return to the system modal
    $('#iconModalSave').unbind();
    $('#iconModalSave').on("click", () => {
        //Save the state
        //modal.node.image = selectedIcon;

        //Update the image displayed in nodeModal
        //$("#iconNodeModal").attr("src", "./images/" + modal.node.image);
    
        //Revert to the previous modal
        $('#iconModal').modal('hide');
        $(lastModalSelector).modal('show');
    })
}



//******************************** Modal helpers ****************************************

function uploadSettings(){
	debug('In uploadSettings()')

	const postData = {
		type: 'Settings',
		settings: graphSettings.export(),
	}

	$.post('update.json', postData, (result) => {
		debug('Passed to update.json: ', postData);
		debug('Response: ', result)

		//Check the result
		if (result.msg){
			//An error was passed
		} else {
			//Close the modal and reload the graph
			//$('#mainModal').modal('hide');
			//settingsModal({type: 'success', msg: `The global settings were updated successfully`})
			//newCy();
		}
	})	
}

const form = {

	issue: {
		systemInterface: [
			{ type: 'select', id: 'issueSelect', label: 'Existing Issues'},
			{ type: 'text', id: 'issueTitle', label: 'Issue Title', columnName: 'name'},
			{ type: 'note', text: 'Issue severity'},
			{ type: "trafficLightRadio", id: 'issueSeverity', columnName: 'severity'},
			{ type: 'select', id: 'issueParty', label: 'Responsible Party', columnName: 'party'},
			{ type: 'textarea', id: 'issueDescription', label: 'Issue', columnName: 'issue'},
			{ type: 'textarea', id: 'issueResolution', label: 'Proposed Resolution', columnName: 'resolution'},
			{ type: 'buttons', buttons: [
				//{ id: 'mainModalSystemInterface', label: 'Return to System Interfaces'},
			]}
			
		],
		interface: [
			{ type: 'select', id: 'InterfaceSelect', label: 'Interface'},
			{ type: 'select', id: 'issueSelect', label: 'Existing Issues'},
			{ type: 'text', id: 'issueTitle', label: 'Issue Title', columnName: 'title'},
			{ type: "radio", id: 'issueSeverity', label: 'Severity', columnName: 'severity', options: ['Critical', 'Warning', 'Notice']},
			{ type: 'select', id: 'issueParty', label: 'Responsible Party', columnName: 'party'},
			{ type: 'textarea', id: 'issueDescription', label: 'Issue', columnName: 'issue'},
			{ type: 'textarea', id: 'issueResolution', label: 'Proposed Resolution', columnName: 'resolution'},
		],
		feature:[
			{ type: 'select', id: 'featureSelect', label: 'Feature' },
			{ type: 'select', id: 'issueSelect', label: 'Existing Issues'},
			{ type: 'text', id: 'issueTitle', label: 'Issue Title', columnName: 'title'},
			{ type: "radio", id: 'issueSeverity', label: 'Severity', columnName: 'severity', options: ['Critical', 'Warning', 'Notice']},
			{ type: 'select', id: 'issueParty', label: 'Responsible Party', columnName: 'party'},
			{ type: 'textarea', id: 'issueDescription', label: 'Issue', columnName: 'issue'},
			{ type: 'textarea', id: 'issueResolution', label: 'Proposed Resolution', columnName: 'resolution'},
		],

		network: [
			{ type: 'select', id: 'networkSelect', label: 'Network' },
			{ type: 'select', id: 'issueSelect', label: 'Existing Issues'},
			{ type: 'text', id: 'issueTitle', label: 'Issue Title', columnName: 'title'},
			{ type: "radio", id: 'issueSeverity', label: 'Severity', columnName: 'severity', options: ['Critical', 'Warning', 'Notice']},
			{ type: 'select', id: 'issueParty', label: 'Responsible Party', columnName: 'party'},
			{ type: 'textarea', id: 'issueDescription', label: 'Issue', columnName: 'issue'},
			{ type: 'textarea', id: 'issueResolution', label: 'Proposed Resolution', columnName: 'resolution'},
		],
	},
	system: [
		{ type: 'select', id: 'mainModalSystemSelect', label: 'Existing Systems' },
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalSystemName', align: 'center' },
		{ type: 'text', id: 'mainModalName', label: 'Name', columnName: 'name'},
		//Add a system class selector here
		{ type: 'textarea', id: 'nodeDescription', label: 'Description', columnName: 'description'},
		{ type: 'text', id: 'systemReference', label: 'System Block Diagram Reference', columnName: 'reference', append: {
			id: 'systemReferenceDropZone', label: '&#8595'
		} },
		{ type: 'text', id: 'systemTags', label: 'Tag List (Comma separated)', columnName: 'tags'},
		{ type: 'buttons', buttons: [
			{ id: 'iconChooserButton', label: 'Choose Icon'},
			{ id: 'systemQuantitiesButton', label: 'Map Systems to Years'},
			{ id: 'updateSystemInterfacesButton', label: 'Update System Interfaces'},
			
		]}
	],
	interface: [
		{ type: 'select', id: 'mainModalInterfaceSelect', label: 'Existing Interfaces' },
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalInterfaceName', align: 'center', columnName: 'name' },
		{ type: 'text', id: 'mainModalName', label: 'Name', columnName: 'name'},
		{ type: 'select', id: 'mainModalFeaturesAvailable', label: 'Available Features', selectType: 'featuresAvailable', multiple: true},								//SelectType may be unnecessary
		{ type: 'button', id: 'mainModalFeaturesAddButton', label: 'Attach Feature', fromId: 'nodeModalFeaturesAvailable', toId: 'nodeModalFeaturesAttached'},
		{ type: 'button', id: 'mainModalFeaturesRemoveButton', label: 'Unattach Feature', fromId: 'nodeModalFeaturesAttached', toId: 'nodeModalFeaturesAvailable'},
		{ type: 'select', id: 'mainModalFeaturesAttached', label: 'Attached Features', selectType: 'featuresAttached', multiple: true},
		{ type: 'textarea', id: 'nodeDescription', label: 'Description', columnName: 'description'},
		{ type: 'buttons', buttons: [
			{ id: 'iconChooserButton', label: 'Choose Icon'},
			{ id: 'interfaceIssues', label: 'Assign Issues'},
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
			{ id: 'SIIssues', label: 'Assign Issues'},
			{ id: 'assignNetworksButton', label: 'Map Networks'},
		]}
	],
	systemQuantities: [
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalSystemName', align: 'center' },
		{ type: 'note', text: `This form is used to track the introduction of new systems into the system. 
		For systems being removed, include a 0 in the final year to indicate removal.`},
		{ type: 'container', id: 'mainModalInstalledInterfaceContainer' },
		{ type: 'buttons', buttons: [
			{ id: 'addNewFieldsButton', label: 'Add New Field'},
			{ id: 'removeLastFieldButton', label: 'Remove Last Field'},
		]}
	],
	mapNetwork: [
		{ type: 'select', id: 'mainModalNetworkSelect', label: 'Compatible Networks' },
		{ type: 'button', id: 'mainModalNetworkAttachButton', label: 'Attach to Network' },
		{ type: 'container', id: 'mainModalNetworkContainer' },
		{ type: 'note', text: 'Select a network to access additional details:'},
		{ type: 'buttons', buttons: [

		]}

	],
	network: [
		{ type: 'select', id: 'mainModalNetworkSelect', label: 'Existing Networks' },
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalNetworkName', align: 'center' },
		{ type: 'text', id: 'mainModalName', label: 'Name', columnName: 'name'},
		{ type: 'select', id: 'mainModalFeatureSelect', label: 'Associated Feature', columnName: 'id_feature', dataAttr: 'id_feature' },
		{ type: 'textarea', id: 'mainModalDescription', label: 'Description', columnName: 'description'},
		{ type: 'buttons', buttons: [
			{ id: 'iconChooserButton', label: 'Choose Icon'},
		]}
	],
}