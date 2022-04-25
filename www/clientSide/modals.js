//******************************** Main Modals ****************************************
/**
 * @description Modify the global settings
 * 
 * Should be updated in time to be user specific settings. Cookies or database?
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
	debug('about to add controls');
	graphSettings.getFormControls().forEach((element) => {
		debug('adding elements');
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

	//Event: Add a new blank subsystem 
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
	$('#mainModalName, #nodeDescription, #subsystemTags').unbind();
	$('#interfaceIssues, #nodeDescription, #nodeDescription, #subsystemTags').on('input', () => {
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


function mapNetworksToSubsystemInterface(subsystemInterface, message){
	debug('In mapNetworksToSubsystemInterface()')
	debug(subsystemInterface)

	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Map Networks to Subsystem Interfaces');	
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
	breadcrumbs('#mainModal form', { type: 'Network', id_subsystem: subsystemInterface.id_subsystem, id_SIMap: subsystemInterface.id_SIMap });

	//Get subsystem image details
	const postData = {
		type: 'SIImages',
		id_SIMap: subsystemInterface.id_SIMap
	}
	$.post("select.json", postData, (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)

		//Place images
		installedInModalInsert(`#mainModal form`, {name: result[0].interfaceName, image: result[0].interfaceImage}, {name: result[0].subsystemName, image: result[0].subsystemImage}, true)

		
	});



	//Populate the existing networks select																		//Dumb way of doing it, should be achievable in a single query
	
	const postData3 = {
		type: 'CompatibleFeatures',
		id_SIMap: subsystemInterface.id_SIMap
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

	//Get all networks currently assigned to the subsystem interface
	
	const postData4 = {
		type: 'AssignedNetworks',
		id_SIMap: subsystemInterface.id_SIMap
	}

	$.post('select.json', postData4, (result) => {
		debug('Passed to select.json: ', postData4);
		debug('Result: ', result)

		
		result.forEach((element) => {

			//Create the button element for each interface installed into the subsystem
			addIconButton(`#mainModalNetworkContainer`, element.image, element.name, {name: 'id_SINMap', value: element.id_SINMap});

			//Event: An interface button was selected
			$('#mainModalNetworkContainer button:last-of-type').on( 'click', (event) => {

				//Toggle the selected interface button styling
				$("#mainModalNetworkContainer button").removeClass("btn-primary").addClass("btn-secondary");
				$(event.currentTarget).removeClass('btn-secondary').addClass('btn-primary');

				//Update the subsystem object with the in-focus id_SINMap
				subsystemInterface.id_SINMap = parseInt($(event.currentTarget).attr('data-id_SINMap'));

				//Enable the remove network button
				$('#mainModalDelete').prop('disabled', false);

				//Populate the additional details
				//populateAdditionalDetails();

			});


		})
		//Select the interface button if a subsystem.id_SIMap was supplied
		
		if (subsystemInterface.id_SINMap){
			//Focus on the supplied Subsystem Interface
			$(`#mainModalNetworkContainer button[data-id_SINMap='${subsystemInterface.id_SINMap}'`).removeClass('btn-secondary').addClass('btn-primary');
			
			//Load additional SI details
			//populateAdditionalDetails();
		} else {
			//Disable those controls which require a subsystem interface to be identified
			//$('#SIIssues').prop('disabled', true);
			//$('#assignNetworksButton').prop('disabled', true);
		}
		

	})


	//Event: Attach network to subsystem interface
	$(`#mainModalNetworkAttachButton`).unbind();
	$(`#mainModalNetworkAttachButton`).on('click', () => {
	
		const postData = {
			type: 'NetworkToSubsystemInterface',
			id_SIMap: subsystemInterface.id_SIMap,
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
				mapNetworksToSubsystemInterface(subsystemInterface, {info: 'success', msg: `The network was successfully attached.`})
			}
		})
	
	})

	//Event: Remove network
	$(`#mainModalDelete`).unbind();
	$(`#mainModalDelete`).on('click', () => {
		const postData = {
			type: 'DeleteNetworkFromInterface',
			id_SINMap: subsystemInterface.id_SINMap,
		}
	
		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
			} else {
				//Reload the modal
				mapNetworksToSubsystemInterface(subsystemInterface, {info: 'success', msg: `The network was successfully detached.`})
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
			case 'SubsystemInterface':
				debug('in updateIssuesModal() subsystemInterface')

				//Breadcrumbs
				breadcrumbs('#mainModal form', { type: 'IssuesSubsystemInterface', id_subsystem: issue.id_subsystem, id_SIMap: issue.id_SIMap });

				if (!issue.id_issue){ issue.id_issue = 0 }

				if (issue.id_issue == 0){
					//New issue
					debug('New issue')

					//Add buttons
					addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Save Issue'});
					addButton('#mainModal .modal-footer', {type: 'close'});

					//Add input fields
					form.issue.subsystemInterface.forEach((element) => { addFormElement('#mainModal form', element) })

					//Breadcrumbs
					//breadcrumbs('#mainModal form', { type: 'SubsystemInterfaceIssue', id_subsystem: issue.id_subsystem, id_SIMap: issue.id_SIMap });

					//Disable select
					$('#issueSelect').prop('disabled', true);

					//Place images
					const postData3 = {
						type: 'IssueImages',
						subtype: 'SubsystemInterface',
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
							installedInModalInsert(`#mainModal form`, {name: result[0].interfaceName, image: result[0].interfaceImage}, {name: result[0].subsystemName, image: result[0].subsystemImage}, true)
							issue.id_subsystem = result[0].id_subsystem;
						}
					})


					

				} else {
					//Existing issue
					debug('Existing issue')

					//Add buttons
					addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalAddNew', label: 'Add New Issue'});
					//addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalSubsystemInterface', label: 'Return to Subsystem interface'});
					//addButton('#mainModal .modal-footer', {type: 'delete', id: 'mainModalDelete', label: 'Delete Issue'});
					addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Save Issue'});
					addButton('#mainModal .modal-footer', {type: 'close'});

					//Add input fields
					form.issue.subsystemInterface.forEach((element) => { addFormElement('#mainModal form', element) })

					//Load known issues	for this subsystem interface
					const postData = {
						type: 'BasicIssues', 
						subtype: 'SubsystemInterface',
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
									//If a subsystem ID was supplied to the method, set this subsystem as selected
									if (issue.id_issue == element.id_issue){
										$(`#issueSelect option[data-id_issue="${issue.id_issue}"]`).prop('selected', true); 
									}	
								})

								updateFormElements();
							}


						}
					})

					//Event: Return to subsystem interface clicked
					$('#mainModalSubsystemInterface').unbind();
					$('#mainModalSubsystemInterface').click(() => {
						$('#mainModal').modal('hide');
						updateSubsystemInterfacesModal({ id_SIMap: issue.id_SIMap, id_subsystem: issue.id_subsystem} )
					});

					//Event: Add new issue selected
					$('#mainModalAddNew').unbind();
					$('#mainModalAddNew').click(() => {
						$('#mainModal').modal('hide');
						updateIssuesModal({ type: 'SubsystemInterface', id_SIMap: issue.id_SIMap, id_issue: 0} )
					});

					//Event: Delete issue

					//Event: Issue select change
					$('#issueSelect').unbind();
					$('#issueSelect').change(() => {
						$('#mainModal').modal('hide');
						updateIssuesModal({ type: 'SubsystemInterface', id_SIMap: issue.id_SIMap, id_issue: $('#issueSelect option:selected').attr(`data-id_issue`)} )
					})


				}

				//Event: Save issue
				$('#mainModalSubmit').unbind();
				$('#mainModalSubmit').click(() => {
					const postData = {
						type: 'Issue',
						subtype: 'SubsystemInterface',
						id_SIMap: issue.id_SIMap,
					}

					//Provide id_issue if this is an existing issue
					if (issue.id_issue > 0){ postData.id_issue = parseInt($('#issueSelect option:selected').attr(`data-id_issue`)) }
			
					//Subsystem details
					form.issue.subsystemInterface.forEach((element) => {
						if (element.columnName){ postData[element.columnName] = getFormElement('#' + element.id, element) }
					})
						
					$.post('update.json', postData, (result) => {
						debug('Passed to update.json: ', postData);
						debug('Response: ', result)
				
						//Check the result																												//Working here, having trouble adding a new subsystem
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


	//Event: Return to subsystem interfaces button
	$('#mainModalSubsystemInterface').unbind();
	$('#mainModalSubsystemInterface').click(() => {
		updateSubsystemInterfacesModal({ id_subsystem: issue.id_subsystem, id_SIMap: issue.id_SIMap })

	});

	//Load the data into the relevant fields
	var updateFormElements = () => {

		postData2 = {
			type: 'Issue',
			subtype: 'SubsystemInterface',
			id_issue: parseInt($('#issueSelect option:selected').attr(`data-id_issue`))
		}

		//Update the form controls
		$.post('select.json', postData2, (result) => {
			debug('Passed to select.json: ', postData2);
			debug('Response: ', result)

			//Place images
			installedInModalInsert(`#mainModal form`, {name: result[0].interfaceName, image: result[0].interfaceImage}, {name: result[0].subsystemName, image: result[0].subsystemImage}, true)

			//Populate the form controls
			form.issue.subsystemInterface.forEach((element) => {
				//Set the relevant form control values
				if(element.columnName){ setFormElement('#' + element.id, element, result[0][element.columnName]) }										//Handle traffic lights
			})
		})
	}
}


/**
 * @param  {id_subsystem, id_SIMap} subsystem
 * @param  {} message
 */
function updateSubsystemInterfacesModal(subsystem, message){
	debug('In updateSubsystemInterfacesModal()')
	debug(subsystem)

	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Update Subsystem Interfaces');	
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
	form.subsystemInterface.forEach((element) => { addFormElement('#mainModal form', element) })

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'SubsystemInterface', id_subsystem: subsystem.id_subsystem });

	//Get subsystem details
	$.post("select.json", {type: 'Subsystem', id_subsystem: subsystem.id_subsystem}, (result) => {
		debug('Passed to select.json: ', {type: 'Subsystem', id_subsystem: subsystem.id_subsystem});
		debug('Response: ', result)

		//Update image
		$('#mainModalSubsystemImage').attr('src', imagePath + result[0].image);

		//Update heading
		$('#mainModalSubsystemName').text(result[0].name);
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

	//Get all interfaces already attached to the subsystem, for the interface icon buttons
	const postData = {
		type: 'SubsystemInterfaces',
		id_subsystem: subsystem.id_subsystem,
	}
	$.post(`select.json`, postData, (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)

		//Place an icon of each installed interface
		result.forEach((element) => {

			//Create the button element for each interface installed into the subsystem
			addIconButton(`#mainModalInstalledInterfaceContainer`, element.image, element.name, {name: 'id_SIMap', value: element.id_SIMap});


			//Event: An interface button was selected (works)
			$('#mainModalInstalledInterfaceContainer button:last-of-type').on( 'click', (event) => {

				//Toggle the selected interface button styling
				$("#mainModalInstalledInterfaceContainer button").removeClass("btn-primary").addClass("btn-secondary");
				$(event.currentTarget).removeClass('btn-secondary').addClass('btn-primary');

				//Update the subsystem object with the in-focus id_SIMap
				subsystem.id_SIMap = parseInt($(event.currentTarget).attr('data-id_SIMap'));

				//Populate the additional details
				populateAdditionalDetails();

			});


		})
		//Select the interface button if a subsystem.id_SIMap was supplied
		if (subsystem.id_SIMap){
			//Focus on the supplied Subsystem Interface
			$(`#mainModalInstalledInterfaceContainer button[data-id_SIMap='${subsystem.id_SIMap}'`).removeClass('btn-secondary').addClass('btn-primary');
			
			//Load additional SI details
			populateAdditionalDetails();
		} else {
			//Disable those controls which require a subsystem interface to be identified
			$('#SIIssues').prop('disabled', true);
			$('#assignNetworksButton').prop('disabled', true);
		}

	});

	//Event: Assign networks button selected
	$('#assignNetworksButton').unbind();
	$('#assignNetworksButton').click(() => {
		mapNetworksToSubsystemInterface({ id_subsystem: subsystem.id_subsystem, id_SIMap: subsystem.id_SIMap })

	});


	//Event: Delete button selected
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click(() => {
		const postData = {
			type: 'DeleteInterfaceFromSubsystem',
			id_SIMap: subsystem.id_SIMap,
		}
	
		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateSubsystemInterfacesModal(subsystem, {info: 'failure', msg: `There was an error. Likely due to this interface having an associated network.`});
			} else {
				//Update was successful
				updateSubsystemInterfacesModal(subsystem, {info: 'success', msg: `The interface was successfully removed.`});
			}
	
		})

	});


	//Event: Install interface button selected (Works)
	$('#mainModalInstallInterfaceButton').unbind();
	$('#mainModalInstallInterfaceButton').click(() => {
		const postData = {
			type: 'InterfaceToSubsystem',
			id_interface: $('#mainModalInterfaceSelect option:selected').attr(`data-id_interface`),
			id_subsystem: subsystem.id_subsystem,
		}

		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateSubsystemInterfacesModal(subsystem, {info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Update was successful
				subsystem.id_SIMap = result.insertId;
				updateSubsystemInterfacesModal(subsystem, {info: 'success', msg: `The interface was successfully added.`});
			}
		})
	});
	
	//Event: Update details button selected (Works)
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		const postData = {
			type: 'UpdateSIMap',
			id_SIMap: subsystem.id_SIMap,
		}

		form.subsystemInterface.forEach((element) => {
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
				updateSubsystemInterfacesModal(subsystem, {info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Update was successful
				updateSubsystemInterfacesModal(subsystem, {info: 'success', msg: `The record was successfully updated.`});
			}
		});
	});

	//Event: Assign issues button selected (Works)
	$('#SIIssues').unbind();
	$('#SIIssues').click(() => {
		$('#mainModal').modal('hide');
		updateIssuesModal({ type: 'SubsystemInterface', id_subsystem: subsystem.id_subsystem, id_SIMap: subsystem.id_SIMap, id_issue: 1 });
	});


	//Event: Switch to the update subsystem modal (Works)
	$('#subsystemButton').unbind();
	$('#subsystemButton').click(() => {
		$('#mainModal').modal('hide');
		updateSubsystemModal(subsystem.id_subsystem);
	});

	//Event: Changes to additional details controls	(Works)
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
		$('#subsystemButton').prop('disabled', true);
		$('#assignNetworksButton').prop('disabled', true);
		$('#SIIssues').prop('disabled', true);
		$('#mainModalDelete').prop('disabled', true);


	}

	//Populate the additional details
	var populateAdditionalDetails = () => {
		//Enable/Disable particular buttons
		$('#mainModalDelete').prop('disabled', false);
		$('#subsystemButton').prop('disabled', false);
		$('#assignNetworksButton').prop('disabled', false);
		$('#SIIssues').prop('disabled', false);
		$('#mainModalDelete').prop('disabled', false);


		const postData = {
			type: 'SubsystemInterface',
			id_SIMap: subsystem.id_SIMap,
		}

		//Get all subsystems for the select
		$.post("select.json", postData, (result) => {
			debug('Passed to select.json: ', postData);
			debug('Response: ', result)

			//Load the list of interfaces into the select box
			form.subsystemInterface.forEach((element) => {
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
 * @description Pick the subsystem to update from a select. Helps find subsystems which
 * may be lost in years.
 * 
 */
function updateSubsystemModal(subsystem, message){
	debug('In updateSubsystemModal()')
	debug(subsystem)

	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Update Subsystems');	
	$('#mainModal').modal('show');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add the input fields
	document.querySelector('#mainModal .modal-body').innerHTML = `<form></form>`
	form.subsystem.forEach((element) => { addFormElement('#mainModal form', element)	})

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'Subsystem', id_subsystem: subsystem.id_subsystem});

	if (subsystem.id_subsystem == 0){
		//Creating a new subsystem

		//Buttons
		addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Add Interface'});
		addButton('#mainModal .modal-footer', {type: 'close'});

		//Disable some controls
		$('#mainModalSubsystemSelect').append(`<option data-id_subsystem="0"></option>`)
		$(`#mainModalSubsystemSelect option[data-id_subsystem="0"]`).prop('selected', true); 
		$('#mainModalSubsystemSelect').prop('disabled', true);
		$('#mainModalSubsystemSelect').prop('disabled', true);

		$('#updateSubsystemInterfacesButton').prop('disabled', true);
		$('#subsystemQuantitiesButton').prop('disabled', true);	

	} else {
		//Modifying an existing subsystem

		//Buttons
		addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalAddNew', label: 'Add New Subsystem'});
		addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Update Interface'});
		addButton('#mainModal .modal-footer', {type: 'close'});

		//Populate the dropbox
		const postData = {type: 'Subsystem'}
		$.post('select.json', postData, (result) => {
			debug('Passed to select.json: ', postData);
			debug('Response: ', result)

			//Check the result
			if (result.msg){
				//An error was passed

			} else {
				
				result.forEach((element) => {
					$('#mainModalSubsystemSelect').append(`<option data-id_subsystem="${element.id_subsystem}">${element.name}</option>`)
				})

				//If a subsystem ID was supplied to the method, set this subsystem as selected
				if (subsystem.id_subsystem > 0){
					$(`#mainModalSubsystemSelect option[data-id_subsystem="${subsystem.id_subsystem}"]`).prop('selected', true); 
				}
				
				updateFormElements();
			}
		})
	}

	//Event: Drag/drop a reference
	$('#subsystemReferenceDropZone')
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
				$('#subsystemReference').val(result)
			})
		}

		return false;
	})

	//Event: Changes to any controls
	$('#mainModalName, #nodeDescription, #subsystemTags').unbind();
	$('#mainModalName, #nodeDescription, #subsystemTags').on('input', () => {
		//Disable some controls to prevent navigating away from the modal before saving
		$('#subsystemQuantitiesButton, #updateSubsystemInterfacesButton, #mainModalAddNew, #mainModalSubsystemSelect').prop('disabled', true);
	});


	//Event: User clicks button to assign quantites to years
	$(`#subsystemQuantitiesButton`).unbind();
	$(`#subsystemQuantitiesButton`).on('click', () => {
		$('#mainModal').modal('hide');
		updateSubsystemQuantities(subsystem.id_subsystem);
	})


	//Event: Change to the modal which allows the user to assign interfaces to the subsystem
	$('#updateSubsystemInterfacesButton').unbind();
	$('#updateSubsystemInterfacesButton').click(() => {
		$('#mainModal').modal('hide');
		updateSubsystemInterfacesModal({ id_subsystem: subsystem.id_subsystem });
	});


	//Event: Add a new blank subsystem 
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click(() => {
		$('#mainModal').modal('hide');
		updateSubsystemModal({ id_subsystem: 0 });
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
	$('#mainModalSubsystemSelect').unbind();
	$('#mainModalSubsystemSelect').change(() => {
		//subsystem.id_subsystem = $('#mainModalSubsystemSelect option:selected').attr(`data-id_subsystem`)
		updateSubsystemModal({ id_subsystem: $('#mainModalSubsystemSelect option:selected').attr(`data-id_subsystem`) });
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
			type: 'Subsystem',
			id_subsystem: $('#mainModalSubsystemSelect option:selected').attr(`data-id_subsystem`),
		}

		//Subsystem details
		form.subsystem.forEach((element) => {
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
				updateSubsystemModal({info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Check if entry was a new entry
				if (result.insertId == 0){
					//Submission was an update
					updateSubsystemModal({id_subsystem: postData.id_subsystem}, {info: 'success', msg: `The ${postData.name} record was successfully updated.`});
				} else {
					//Submission was a new interface
					updateSubsystemModal({ id_subsystem: result.insertId}, {info: 'success', msg: `The ${postData.name} record was successfully added.`});
				}
				
			}
		})
	});


	//Load the data into the relevant fields
	var updateFormElements = () => {

		const postData2 = {
			type: 'Subsystem',
			id_subsystem: subsystem.id_subsystem 
		}

		//Update the form controls
		$.post('select.json', postData2, (result) => {
			debug('Passed to select.json: ', postData2);
			debug('Response: ', result)

			//Update heading
			$('#mainModalSubsystemName').text(result[0].name);

			form.subsystem.forEach((element) => {
				//Set the relevant form control values
				if(element.columnName){
					setFormElement('#' + element.id, element, result[0][element.columnName]);
				}
			})
		})
	}
}







/**
 * @description A modal which maps the quantity of subsystems available each year
 * 
 * @param  {} id_subsystem The id of the subsystem to which this modal applies
 * @param  {} returnModal
 */
function updateSubsystemQuantities(id_subsystem, message){
	debug('In updateSubsystemQuantities()');
	//Prepare the modal
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModalTitle').text('Map Subsystem Quantities to Years');	
	$('#mainModal').modal('show');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', {type: 'success', msg: message.msg}) }

	//Buttons
	addButton('#mainModal .modal-footer', {type: 'submit', id: 'mainModalSubmit', label: 'Save Mapping'});
	addButton('#mainModal .modal-footer', {type: 'close'});

	//Add the form
	document.querySelector('#mainModal .modal-body').innerHTML = `<form></form>`
	form.subsystemQuantities.forEach((element) => { addFormElement('#mainModal form', element) })

	//var inputCounter = 0;

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'Quantities', id_subsystem: id_subsystem });

	var inputCounter = 1;

	//Get the data for the image and name
	const postData = {
		type: 'Subsystem',
		id_subsystem: id_subsystem
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
			setFormElement('#mainModalSubsystemName', {type: 'heading'}, result[0].name);
		}
	})


	//Get the quantities per year for this subsystem from the server
	const postData2 = {
		type: 'QtyYears',
		id_subsystem: id_subsystem
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

	//Event: Return to subsystem
	$('#returnToSubsystem').unbind();
	$('#returnToSubsystem').click(() => {
		$('#mainModal').modal('hide');
		updateSubsystemModal(id_subsystem);
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
			id_subsystem: id_subsystem,
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
	$("#interfacesToSubsystemModalNetworksContainer").empty();
	$("#interfacesToSubsystemModalContainer").empty();
	$('#mappingModalImageContainer').empty();
	
	//Prepare the modal
	$("#mappingModal .modal-title").text(modalSetup.title1)
	$("#mappingModalTitle2").text(modalSetup.title2);
	$("#mappingModalTitle3").text(modalSetup.title3);
	$("#mappingModalAddButton").html(modalSetup.addButtonText);

	//Assign interfaces to subsystems
	if (selectedNode.type == "Subsystem"){
		mappingModal_subsystem();

		//Handle the add button
		mappingModal_addButton();
	}

	//Assign networks to subsystem interfaces
	if (selectedNode.type == "SubsystemInterface"){
		mappingModal_interface()

		//Handle the add button
		mappingModal_addButton();
	}

	$('#mappingModal').modal('show');
}





/**
 *CFD
 
 Handle the 'Assign Networks to Subsystem Interfaces' modal
 * 
 * 
 */
function mappingModal_interface(){
	debug('In mappingModal_interface()')

	//Set images & labels
	installedInModalInsert('#mappingModalImageContainer', {name: selectedNode.name, image: selectedNode.image}, {name: selectedNode.subsystemName, image: selectedNode.subsystemImage})

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

	//**********************    Get the networks already assigned to the subsystem
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
 * @description Provides a common layout when showing a graphical depection of interfaces installed in a subsystem
 * 
 * @param  {string} $selector The insert location of the element
 * @param  {name, image} left The left item, generally an interface
 * @param  {name, image} right The right itme, generally a subsystem
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
		case 'Subsystem':
			breadcrumbArr.push({ name: 'Subsystem', active: true, data: [{ key: 'id_subsystem', value: details.id_subsystem }]})
		break;
		case 'UpdateInterface':
			breadcrumbArr.push({ name: 'Interface', active: true, data: []})
		break;
		case 'SubsystemInterface':
			breadcrumbArr.push({ name: 'Subsystem', active: false, module: 'updateSubsystemModal', data: [{ key: 'id_subsystem', value: details.id_subsystem }]})
			//breadcrumbArr.push({ name: 'Subsystem Interface', active: true, data: [{ key: 'id_SIMap', value: details.id_SIMap }, {key: 'id_subsystem', value: details.id_subsystem}]})
			breadcrumbArr.push({ name: 'Subsystem Interface', active: true, data: [] })
		break;
		case 'Network':
			breadcrumbArr.push({ name: 'Subsystem', active: false, module: 'updateSubsystemModal', data: [{ key: 'id_subsystem', value: details.id_subsystem }]})
			breadcrumbArr.push({ name: 'Subsystem Interface', active: false, module: 'updateSubsystemInterfacesModal', data: [{ key: 'id_subsystem', value: details.id_subsystem },{ key: 'id_SIMap', value: details.id_SIMap }]})
			breadcrumbArr.push({ name: 'Map Network', active: true, data: []})
		break;
		case 'UpdateNetwork':
			breadcrumbArr.push({ name: 'Network', active: true, data: []})
		break;
		case 'IssuesSubsystemInterface':
			breadcrumbArr.push({ name: 'Subsystem', active: false, module: 'updateSubsystemModal', data: [{ key: 'id_subsystem', value: details.id_subsystem }]})
			breadcrumbArr.push({ name: 'Subsystem Interface', active: false, module: 'updateSubsystemInterfacesModal', data: [{ key: 'id_subsystem', value: details.id_subsystem },{ key: 'id_SIMap', value: details.id_SIMap }]})
			breadcrumbArr.push({ name: 'Issue', active: true, data: []})
		break;
		case 'Quantities':
			breadcrumbArr.push({ name: 'Subsystem', active: false, module: 'updateSubsystemModal', data: [{ key: 'id_subsystem', value: details.id_subsystem }]})
			//breadcrumbArr.push({ name: 'Subsystem Interface', active: true, data: [{ key: 'id_SIMap', value: details.id_SIMap }, {key: 'id_subsystem', value: details.id_subsystem}]})
			breadcrumbArr.push({ name: 'Subsystem Quantities', active: true, data: [] })
		break;
		default:
			debug(`Breadcrumb switch default. Shouldn't make it here`)
	}

	/*
		case 'Subsystem':
			updateSubsystemModal(selectedNode.id_subsystem)
			break;
		case 'SubsystemInterface':
			debug(selectedNode)
			updateSubsystemInterfacesModal({ id_subsystem: selectedNode.id_subsystem, id_SIMap: selectedNode.id_SIMap })
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

    //Event: Set the icon chooser modal buttons to return to the subsystem modal
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
		subsystemInterface: [
			{ type: 'select', id: 'issueSelect', label: 'Existing Issues'},
			{ type: 'text', id: 'issueTitle', label: 'Issue Title', columnName: 'name'},
			{ type: 'note', text: 'Issue severity'},
			{ type: "trafficLightRadio", id: 'issueSeverity', columnName: 'severity'},
			{ type: 'select', id: 'issueParty', label: 'Responsible Party', columnName: 'party'},
			{ type: 'textarea', id: 'issueDescription', label: 'Issue', columnName: 'issue'},
			{ type: 'textarea', id: 'issueResolution', label: 'Proposed Resolution', columnName: 'resolution'},
			{ type: 'buttons', buttons: [
				//{ id: 'mainModalSubsystemInterface', label: 'Return to Subsystem Interfaces'},
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
	subsystem: [
		{ type: 'select', id: 'mainModalSubsystemSelect', label: 'Existing Subsystems' },
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalSubsystemName', align: 'center' },
		{ type: 'text', id: 'mainModalName', label: 'Name', columnName: 'name'},
		//Add a subsystem class selector here
		{ type: 'textarea', id: 'nodeDescription', label: 'Description', columnName: 'description'},
		{ type: 'text', id: 'subsystemReference', label: 'Subsystem Block Diagram Reference', columnName: 'reference', append: {
			id: 'subsystemReferenceDropZone', label: '&#8595'
		} },
		{ type: 'text', id: 'subsystemTags', label: 'Tag List (Comma separated)', columnName: 'tags'},
		{ type: 'buttons', buttons: [
			{ id: 'iconChooserButton', label: 'Choose Icon'},
			{ id: 'subsystemQuantitiesButton', label: 'Map Subsystems to Years'},
			{ id: 'updateSubsystemInterfacesButton', label: 'Update Subsystem Interfaces'},
			
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
	subsystemInterface: [
		
		{ type: 'img', id: 'mainModalSubsystemImage', columnName: 'image' },
		{ type: 'heading', id: 'mainModalSubsystemName', align: 'center' },
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
	subsystemQuantities: [
		{ type: 'img', id: 'mainModalImage', columnName: 'image'},
		{ type: 'heading', id: 'mainModalSubsystemName', align: 'center' },
		{ type: 'note', text: `This form is used to track the introduction of new subsystems into the system. 
		For subsystems being removed, include a 0 in the final year to indicate removal.`},
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