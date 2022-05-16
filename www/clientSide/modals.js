//Systems modal doesnt save icon appropriately when changing (form isnt locked out until update is selected)
//Update link technology isnt locking out the buttons as expected
//Update link isnt locking out new link buttons as expected
//Clicking on edit node button when an interface is selected fails to correctly load that interface
//Update links choose icon button is broken




/**
 * @description 
 * 
 * @workRequired Needs to handle assignment of links better, including for interfaces which may have multiple links which may connect to the same link
 * 
 * @param id_system
 * @param {} message
 * @param id_SIMap
 */
async function updateSystemLinksModal(id_system = 1, message, id_SIMap = 0, newWindow = false){
	debug(1, 'In updateSystemLinksModal() with id_system = ' + id_system + ' and id_SIMap = ' + id_SIMap + ' and newWindow = ' + newWindow);

	var properties = {
		postType: 'SystemNoTags',
		formReference: 'linkSystems', 
		key: 'id_system', 
		subjectId: id_system,
		//postData: [{key: 'id_system', value: id_system}]
	}

	if (id_SIMap == 0 || newWindow){
		prepareModal('Link Systems');

		//Add the input fields
		form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

		//Buttons
		defaultButtons([
			//{type: 'delete', label: 'Uninstall'},
			{type: 'submit', label: 'Update'},
			{type: 'close'},
		])

		//Systems dropdown
		await populatePrimarySelect(updateSystemLinksModal, properties);

		//Load System Interfaces
		var postData = {
			type: 'SystemInterfaces',
			id_system: id_system
		}
		await $.post("select.json", postData, (result) => {
			debug('Passed to select.json: ', postData);
			debug('Response: ', result)

			//Load the list of interfaces into the select box
			result.forEach((element) => {
				placeInterfaceButtons('#mainModalInstalledInterfaceContainer',element,id_system, id_SIMap, updateSystemLinksModal)
			})
		});
	}

	//Prepare the modal
	prepareModal('Link Systems', false);

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }	

	//Unlock controls, in case they're locked
	lockControlsOnUpdate(form[properties.formReference], false)
	controlState(null,['#mainModalSubmit']);


	//$('#mainModalDelete').prop('disabled', true);
	//$('#mainModalSubmit').prop('disabled', true);

	//Breadcrumbs
	//breadcrumbs('#mainModal form', { type: 'SystemInterface', id_system: id_system });


	if (id_SIMap > 0){
		//Update droppable contents based on the interface selected
		var postData2 = {
			type: 'CompatibleNetworks',
			id_SIMap: id_SIMap
		}
		await $.post("select.json", postData2, (result) => {
			debug('Passed to select.json: ', postData2);
			debug('Response: ', result)

			//Empty divs before repopulating
			form[properties.formReference].forEach((element) => {
				if (element.type == 'droppable'){ $('#' + element.id + ' .card-body').empty(); }
			})

			//Load all systems which implement the interface into the unaffected droppable
			result[0].forEach((element) => {
				addDragableBadge('#availableLinks .card-body', element.name, 'id_network', element.id_network)
			})

			//Move incapable links
			setFormElement("#incapableLinks", {type: 'droppable', $source: '#availableLinks', dataAttr: 'id_network'}, result[3]);
			//Move primary links
			setFormElement("#primaryLinks", {type: 'droppable', $source: '#availableLinks', dataAttr: 'id_network'}, result[1]);
			//Move alternate links
			setFormElement("#alternateLinks", {type: 'droppable', $source: '#availableLinks', dataAttr: 'id_network'}, result[2]);

			//Create new entries for primary and alternate links
			/*
			result[1].forEach((element) => {
				addDragableBadge('#primaryLinks .card-body', element.name, 'id_network', element.id_network)
			})
			result[2].forEach((element) => {
				addDragableBadge('#alternateLinks .card-body', element.name, 'id_network', element.id_network)
			})
			*/
		});

	}

	//Events: Changes to controls
	updateEvents(form[properties.formReference], lockControlsOnUpdate);

	//Event: Save
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		var postData = {
			type: 'AssignNetworksToSystemInterface',
			id_SIMap: id_SIMap
		}

		//Get the links which are assigned to the interface
		form[properties.formReference].forEach((element) => {
			if (element.type == 'droppable' && element.columnName){ postData[element.columnName] = getFormElement('#' + element.id, element) }
		})

		$.post("update.json", postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Response: ', result)

			if (result.msg){
				//An error was passed
				updateSystemLinksModal(id_system,{info: 'failure', msg: `There was an error. Check the console.`}, id_SIMap);
			} else {
				updateSystemLinksModal(id_system, {info: 'success', msg: `The system interface was successfully updated.`}, id_SIMap);
			}
		});
	});
}

/**
 * @description 
 * 
 * @param id_system
 * @param id_SIMap
 * @param {} message
 */
 async function updateSystemInterfacesModal(id_system, id_SIMap = 0, message){
	debug('In updateSystemInterfacesModal() with id_system = ' + id_system + ' and id_SIMap = ' + id_SIMap)

	var properties = {
		postType: 'SystemNoTags',
		formReference: 'systemInterface', 
		key: 'id_system', 
		subjectId: id_system,
		postData: [{key: 'id_system', value: id_system}]
	}

	//Prepare the modal
	prepareModal('Update System Interfaces');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add the input fields
	form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

	//Buttons
	defaultButtons([
		{type: 'delete', label: 'Uninstall'},
		{type: 'submit', label: 'Update'},
		{type: 'close'},
	])

	$('#mainModalDelete').prop('disabled', true);
	$('#mainModalSubmit').prop('disabled', true);

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'SystemInterface', id_system: id_system });

	//Check if id_system was provided
	if (id_system > 0){ //id_system always required
		await populatePrimarySelect(updateSystemInterfacesModal, properties);
		
		//Undo the system description entry into the textarea
		$('#SIDescription').val('');

		const postData = {
			type: 'Interface',
		}

		//Get all interfaces for the select
		$.post("select.json", postData, (result) => {
			debug('Passed to select.json: ', postData);
			debug('Response: ', result)

			//Load the list of interfaces into the select box
			result.forEach((element) => {
				$('#mainModalInterfaceSelect').append(`<option data-id_interface="${element.id_interface}">${element.name}</option>`)
			})
		});

		//Get all interfaces already attached to the system, for the interface icon buttons
		const postData2 = {
			type: 'SystemInterfaces',
			id_system: id_system,
		}
		$.post(`select.json`, postData2, (result) => {
			debug('Passed to select.json: ', postData2);
			debug('Response: ', result)

			//Place an icon of each installed interface
			result.forEach((element) => {

				//Create the button element for each interface installed into the system
				addIconButton(`#mainModalInstalledInterfaceContainer`, element.image, element.name, {name: 'id_SIMap', value: element.id_SIMap});

				//Event: An interface button was selected
				$('#mainModalInstalledInterfaceContainer button:last-of-type').on( 'click', (event) => {

					//Toggle the selected interface button styling
					$("#mainModalInstalledInterfaceContainer button").removeClass("btn-primary").addClass("btn-secondary");
					$(event.currentTarget).removeClass('btn-secondary').addClass('btn-primary');

					//Update the system object with the in-focus id_SIMap
					id_SIMap = parseInt($(event.currentTarget).attr('data-id_SIMap'));

					//Populate the additional details
					populateAdditionalDetails();

					//Event: Map Networks button
					$('#assignNetworksButton').unbind();
					$('#assignNetworksButton').click(() => {
						updateSystemLinksModal(id_system, null, id_SIMap, true)
					});					
				});
			})
			//Select the interface button if a system.id_SIMap was supplied
			if (id_SIMap){
				//Focus on the supplied System Interface
				$(`#mainModalInstalledInterfaceContainer button[data-id_SIMap='${id_SIMap}'`).removeClass('btn-secondary').addClass('btn-primary');
				
				//Load additional SI details
				populateAdditionalDetails();
			} else {
				//Disable those controls which require a system interface to be identified
				controlState(null, ['#SIIssues','#assignNetworksButton', '#mainModalPropsedInterface', '#SIDescription'])
			}
		});
	}

	//Event: Delete
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click(() => {
		const postData = {
			type: 'DeleteInterfaceFromSystem',
			id_SIMap: id_SIMap,
		}
	
		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateSystemInterfacesModal(id_system, id_SIMap, {info: 'failure', msg: `There was an error. Likely due to this interface having an associated network.`});
			} else {
				//Update was successful
				updateSystemInterfacesModal(id_system, 0, {info: 'success', msg: `The interface was successfully removed.`});
			}
		})
	});

	//Event: Update
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		const postData = {
			type: 'UpdateSIMap',
			id_SIMap: id_SIMap,
		}

		form[properties.formReference].forEach((element) => {
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
				updateSystemInterfacesModal(id_system, id_SIMap, {info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Update was successful
				updateSystemInterfacesModal(id_system, id_SIMap, {info: 'success', msg: `The record was successfully updated.`});
			}
		});
	});



	//Event: Install Interface button
	$('#mainModalInstallInterfaceButton').unbind();
	$('#mainModalInstallInterfaceButton').click(() => {
		const postData = {
			type: 'InterfaceToSystem',
			id_interface: $('#mainModalInterfaceSelect option:selected').attr(`data-id_interface`),
			id_system: id_system,
		}

		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateSystemInterfacesModal(id_system, id_SIMap, {info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Update was successful
				id_SIMap = result.insertId;
				updateSystemInterfacesModal(id_system, id_SIMap, {info: 'success', msg: `The interface was successfully added.`});
			}
		})
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
		controlState(['#mainModalSubmit'],['#systemButton','#assignNetworksButton','#SIIssues','#mainModalDelete']);
		/*
		//Enable controls
		$('#mainModalSubmit').prop('disabled', false);

		//Disable controls
		$('#systemButton').prop('disabled', true);
		$('#assignNetworksButton').prop('disabled', true);
		$('#SIIssues').prop('disabled', true);
		$('#mainModalDelete').prop('disabled', true);
		*/
	}

	//Populate the additional details
	var populateAdditionalDetails = () => {

		controlState(['#mainModalDelete','#systemButton','#assignNetworksButton','#SIIssues','#mainModalDelete','#mainModalPropsedInterface', '#SIDescription'])

		/*
		//Enable/Disable particular buttons
		$('#mainModalDelete').prop('disabled', false);
		$('#systemButton').prop('disabled', false);
		$('#assignNetworksButton').prop('disabled', false);
		$('#SIIssues').prop('disabled', false);
		$('#mainModalDelete').prop('disabled', false);
		*/

		const postData = {
			type: 'SystemInterface',
			id_SIMap: id_SIMap,
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
 * @description Modal to map subsystems to systems
 * 
 * @param id_system
 * @param {} message
 */
 async function updateSystemToSubsystemMap(id_system = 0, message){
	debug(1, 'In updateSystemToSubsystemMap()')

	var properties = {
		postType: 'SystemNoTags',
		formReference: 'mapSubsystems', 
		key: 'id_system', 
		subjectId: id_system,
		postData: [{key: 'id_system', value: id_system}]
	}

	//Prepare the modal
	prepareModal('Assign Subsystems to System');

	//Handle notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add input fields
	form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

	//Add buttons
	defaultButtons([
		{type: 'submit', label: 'Save & Return'},
		{type: 'close'},
	])

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'AssignSubsystems', id_system: id_system });
	

	//Check if adding a new entry
	if (id_system > 0){  //id_system always required
		await populatePrimarySelect(updateSystemToSubsystemMap, properties);

		//Populate available system droppable
		const postData = {type: 'Subsystems'}
		await $.post('select.json', postData, (result) => {
			debug('Passed to select.json: ', postData);
			debug('Response: ', result)

			//Put all the tags which exist into the availableTags div
			result.forEach((element) => {
				addDragableBadge2('#availableSubsystems .card-body', { text: element.name, dataAttrName: 'id_subsystem', dataAttrValue: element.id_subsystem })
			})
		})

		//Get the list of subsystems currently allocated to the system
		const postData2 = {type: 'SubsystemMap', id_system: id_system}
		await $.post('select.json', postData2, (result) => {
			debug('Passed to select.json: ', postData2);
			debug('Response: ', result)

			//Move installed subsystems from the available subsystems droppable
			setFormElement("#assignedSubsystems", {type: 'droppable', $source: '#availableSubsystems', dataAttr: 'id_subsystem'}, result);
		})
	}
	
	//Event: Save
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		const postData = {
			type: 'MapSubsystemsToSystems',
			id_system: id_system,
			subsystems: []
		}

		//Load installed subsystem details into postData
		postData.subsystems = getFormElement('#' + 'assignedSubsystems', {type: 'droppable', id: 'assignedSubsystems', source: 'data-attr', attr: 'id_subsystem'})

		//Check if there are an subsystems
		$.post('update.json', postData, (result) => {
			debug(2,'Passed to update.json: ', postData);
			debug(2,'Response: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateSystemToSubsystemMap(id_system,{info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Success
				$('#mainModal').modal('hide');
				updateSystemsModal(id_system, {info: 'success', msg: `Subsystems were successfully updated.`});
			}
		})
	});
}

/**
 * @description A modal which maps the quantity of systems available each year
 * 
 * @param  id_system The id of the system to which this modal applies
 * @param  {} message
 */
 async function updateSystemQuantities(id_system, message){
	debug('In updateSystemQuantities() with id_system = ' + id_system);

	const properties = {
		postType: 'SystemNoTags',
		formReference: 'systemQuantities', 
		key: 'id_system',
		subjectId: id_system,
		postData: [{key: 'id_system', value: id_system}]
	}

	//Prepare the modal
	prepareModal('Map System Quantities to Years');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', {type: 'success', msg: message.msg}) }

	//Add the form
	form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

	//Buttons
	defaultButtons([
		{type: 'submit', label: 'Save & Return'},
		{type: 'close'},
	])

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'Quantities', id_system: id_system });

	var inputCounter = 1;

	//Check that system_id was provided
	if (id_system > 0){
		await populatePrimarySelect(updateSystemsModal, properties);
		
		//Get the quantities per year for this system from the server
		const postData2 = {
			type: 'QtyYears',
			id_system: id_system
		}

		
		$.post('select.json', postData2, (result) => {
			debug('Passed to select.json: ', postData2);
			debug('Result: ', result)

			//Check the result
			if (result.msg){
				//An error was passed
			} else {

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
	}

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
	/*
	$('#returnToSystem').unbind();
	$('#returnToSystem').click(() => {
		$('#mainModal').modal('hide');
		updateSystemsModal(id_system);
	});
	*/

	//Event: Submission of form
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		//Update modal object and return to the previous modal
		const recordArr = [];

		for (var i = 1; i <= inputCounter; i++){
			recordArr.push({year: $(`#formYears_${i}`).val(), quantity: $(`#formQuantity_${i}`).val()})
		}

		//Upload to database
		const postData = {
			type: 'QtyYears',
			id_system: id_system,
			years: recordArr
		}

		
		$.post('update.json', postData, (result) => {
			debug(2, 'Passed to update.json: ', postData);
			debug(2,'Result: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
			} else {
				$('#mainModal').modal('hide');
				updateSystemsModal(id_system);
			}
		})
	})
}

/**
 * @description 
 * 
 * 
 */
 async function updateSystemsModal(id_system = 0, message){
	debug(1, 'In updateSystemsModal() with id_system = ' + id_system)

	var properties = {
		postType: 'SystemNoTags',
		formReference: 'system', 
		key: 'id_system',
		subjectId: id_system
	}

	//Prepare the modal
	prepareModal('Update Systems');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add the input fields
	form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

	//Add buttons
	defaultButtons([
		{type: 'new', label: 'Add New System'},
		{type: 'delete', label: 'Delete System'},
		{type: 'submit', label: 'Save System'},
		{type: 'close'},
	])

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'System', id_system: id_system});

	//Check if adding a new entry
	if (id_system == -1){ //New entry
		//Disable controls to prevent navigation
		lockControlsOnUpdate(form[properties.formReference])
		controlState(null,['#mainModalAddNew','#mainModalDelete'])

	} else { //Existing entry
		await populatePrimarySelect(updateSystemsModal, properties);
		controlState(null,['#mainModalSubmit'])
		const postData2 = {
			type: 'System',
			id_system: id_system 
		}

		//Update the form controls
		$.post('select.json', postData2, (result) => {
			debug('Passed to select.json: ', postData2);
			debug('Response: ', result)
			const systemDetails = result[0];
			const tagDetails = result[1];
			var tagString = '';

			//Turn tagDetails into a comma separated list
			if (tagDetails){
				tagDetails.forEach((element) => {
					tagString += element.tag + ',';
				})
				tagString = tagString.substring(0, tagString.length -1);

				$('#systemTags').val(tagString);				
			}
		})
	}

	//Events: Changes to controls
	updateEvents(form[properties.formReference], lockControlsOnUpdate);

	//Event: Drag/drop a reference
	$('#systemReferenceDropZone').on('dragover', (event) => {
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

	//Event: Assign Interfaces button
	$('#updateSystemInterfacesButton').unbind();
	$('#updateSystemInterfacesButton').click(() => {
		$('#mainModal').modal('hide');
		updateSystemInterfacesModal(id_system);
	});

	//Event: Map Systems to Years button
	$(`#systemQuantitiesButton`).unbind();
	$(`#systemQuantitiesButton`).on('click', () => {
		$('#mainModal').modal('hide');
		updateSystemQuantities(id_system);
	})

	//Event: Assign Subsystems button
	$(`#assignSubsystemsButton`).unbind();
	$(`#assignSubsystemsButton`).on('click', () => {
		$('#mainModal').modal('hide');
		updateSystemToSubsystemMap(id_system);
	})

	//Event: Assign Icon button clicked
	$('#iconChooserButton').unbind();
	$('#iconChooserButton').click(() => {
		$('#mainModal').modal('hide');
		selectIconModal('#mainModal', getFormElement('#mainModalImage', { type: 'img', id: 'mainModalImage' }) ,(updatedIcon) => {
			setFormElement('#mainModalImage', { type: 'img', id: 'mainModalImage', columnName: 'image'}, updatedIcon)
		});
	})

	//Event: Add
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click(() => {
		$('#mainModal').modal('hide');
		updateSystemsModal(-1);
	});

	//Event: Delete
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click(() => {
		const postData = {
			type: 'DeleteSystem',
			id_system: $('#mainModalSystemSelect option:selected').attr(`data-id_system`),
			name: $('#mainModalSystemSelect option:selected').text()
		}

		$.post('update.json', postData, (result) => {
			debug('Passed to update.json: ', postData);
			debug('Response: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateSystemsModal(id_system, {info: 'failure', msg: result.msg});
			} else {
				updateSystemsModal(1, {info: 'success', msg: `The ${postData.name} record was successfully deleted.`});
			}
		})
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
				if (result[1].insertId == 0){
					//Submission was an update
					updateSystemsModal(id_system, {info: 'success', msg: `The ${postData.name} record was successfully updated.`});
				} else {
					//Submission was a new interface
					updateSystemsModal(result[1].insertId, {info: 'success', msg: `The ${postData.name} record was successfully added.`});
				}
				
			}
		})
	});
}

/**
 * @description Modal to capture or update subsystems
 * 
 * @param id_subsystem
 * @param {} message
 */
async function updateSubsystemsModal(id_subsystem = 1, message){
	debug(1, 'In updateSubsystemsModal()')

	var properties = {
		postType: 'Subsystems',
		formReference: 'subsystems', 
		key: 'id_subsystem', 
		subjectId: id_subsystem
	}

	//Prepare the modal
	prepareModal('Update Subsystems');

	//Handle notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add input fields
	form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

	//Add buttons
	defaultButtons([
		{type: 'new', label: 'Add New Subsystem'},
		{type: 'delete', label: 'Delete Subsystem'},
		{type: 'submit', label: 'Save Subsystem'},
		{type: 'close'},
	])

	//Check if adding a new entry
	if (id_subsystem == -1){ //New entry
		//Disable controls to prevent navigation
		controlState(null, ['#subsystemSelect', '#mainModalAddNew', '#mainModalDelete' ])
	} else { //Existing entry
		await populatePrimarySelect(updateSubsystemsModal, properties);
	}

	//Events: Changes to controls
	updateEvents(form[properties.formReference], lockControlsOnUpdate);
	
	//Event: Save
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		saveEntry(updateSubsystemsModal, properties);
	});

	//Event: Delete
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click(() => {
		deleteEntry(updateSubsystemsModal, properties);
	});

	//Event: Add
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click((event) => {
		$('#mainModal').modal('hide');
		updateSubsystemsModal(-1);
	})
}

/**
 * @description Modal to capture or update data exchanges
 * 
 * @param id_dataExchange
 * @param {} message
 */
 async function dataExchangesModal(id_dataExchange = 1, message){
	debug(1, 'In dataExchangesModal()')

	var properties = {
		postType: 'DataExchange',
		formReference: 'dataExchanges', 
		key: 'id_dataExchange', 
		subjectId: id_dataExchange
	}

	//Prepare the modal
	prepareModal('Update Data Exchanges');

	//Handle notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add input fields
	form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

	//Add buttons
	defaultButtons([
		{type: 'new', label: 'Add New Exchange'},
		{type: 'delete', label: 'Delete Exchange'},
		{type: 'submit', label: 'Save Exchange'},
		{type: 'close'},
	])

	//Check if adding a new entry
	if (id_dataExchange == -1){ //New entry
		//Disable controls to prevent navigation
		controlState(null, ['#dataExchangeSelect', '#mainModalAddNew', '#mainModalDelete' ])
	} else { //Existing entry
		await populatePrimarySelect(dataExchangesModal, properties);
	}

	//Events: Changes to controls
	updateEvents(form[properties.formReference], lockControlsOnUpdate);

	//Event: Save
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		saveEntry(dataExchangesModal, properties);
	});

	//Event: Delete
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click(() => {
		deleteEntry(dataExchangesModal, properties);
	});

	//Event: Add
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click((event) => {
		$('#mainModal').modal('hide');
		dataExchangesModal(-1);
	})

//Old below

	//Check if adding a new data exchange
	/*
	if(id_dataExchange == -1){ //New data exchange entry
	} else { //Load the list of data exchanges
		var postData = { type: 'DataExchanges' }
		$.post('select.json', postData, (result) => {
			debug(2, 'Passed to select.json: ', postData);
			debug(2, 'Response: ', result)

			if (result.msg){
				//An error was passed
				dataExchangesModal(id_dataExchange, {info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Load the data exchange select
				result.forEach((element) => {

					$('#dataExchangeSelect').append(`<option data-id_dataExchange="${element.id_dataExchange}">${element.name}</option>`)
					//If this is the interface that was provided, set this system as the selected option
					debug(1, 'id_dataExchange is ' + id_dataExchange)
					if (id_dataExchange == element.id_dataExchange){ 
						debug(1, 'match on ' + element.id_dataExchange)
						$(`#dataExchangeSelect option[data-id_dataExchange="${element.id_dataExchange}"]`).prop('selected', true);

						//Populate the form
						form.dataExchanges.forEach((element2) => {
							if (element2.columnName){ 
								setFormElement('#' + element2.id, element2, element[element2.columnName]) 
								//Event for changes
								$(`#${element2.id}`).on('input',() => {
									controlState(['#mainModalSubmit'], ['#dataExchangeSelect', '#mainModalAddNew', '#mainModalDelete'])
								})
							}
						})
					}
				})
			}
		})		
	}

	//Event: Issue select changes
	$('#dataExchangeSelect').unbind();
	$('#dataExchangeSelect').change(() => {
		$('#mainModal').modal('hide');
		dataExchangesModal($('#dataExchangeSelect option:selected').attr(`data-id_dataExchange`))
	})

	//Event: Add New Issue button clicked
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click((event) => {
		$('#mainModal').modal('hide');
		dataExchangesModal(-1);
	})

	//Event: Save
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		const postData = { type: 'DataExchange' }

		if (id_dataExchange > 0){
			postData.id_dataExchange = id_dataExchange;
		}
		
		//Load issue details into postData
		form.dataExchanges.forEach((element) => {
			if (element.columnName){ postData[element.columnName] = getFormElement('#' + element.id, element) }
		})
		
		$.post('update.json', postData, (result) => {
			debug(2,'Passed to update.json: ', postData);
			debug(2,'Response: ', result)

			//Check the result
			if (result.msg){
				//An error was passed
				dataExchangesModal(id_dataExchange, {info: 'failure', msg: `There was an error. Check the console.`});
			} else {
				//Check if entry was a new entry
				if (result.insertId == 0){
					//Submission was an update
					$('#mainModal').modal('hide');
					dataExchangesModal(id_dataExchange, {info: 'success', msg: `The '${postData.name}' record was successfully updated.`});
					
				} else {
					//Submission was a new interface
					dataExchangesModal(result.insertId, {info: 'success', msg: `The '${postData.name}' record was successfully added.`});
				}
			}
		})
	});
*/
}

/**
 * @description Modal to capture issues associated with interfaces, and the platforms affected
 * 
 * @param id_interface
 * @param id_interfaceIssue
 * @param {} message
 */
async function updateIssuesModal(id_interface = 1, message, id_interfaceIssue = 0){
	debug(1, `In updateIssuesModal() with id_interface = ${id_interface} & id_interfaceIssue = ${id_interfaceIssue}`)

	var properties = {
		postType: 'Interface',
		formReference: 'issue', 
		key: 'id_interface', 
		subjectId: id_interface
	}

	//Prepare the modal
	prepareModal('Update Interface Issues');
	
	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add input fields
	form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

	//Add buttons
	defaultButtons([
		{type: 'new', label: 'Add New Issue'},
		{type: 'delete', label: 'Delete Issue'},
		{type: 'submit', label: 'Save Issue'},
		{type: 'close'},
	])

	//Check if adding a new entry
	if (id_interface == -1){ //New entry
		//Disable controls to prevent navigation
		controlState(null, ['#dataExchangeSelect', '#mainModalAddNew', '#mainModalDelete' ])
	} else { //Existing entry
		//Populate interfaces select
		await populateSelect('#interfaceSelect', {type: 'Interface'}, {attr: 'id_interface', value: id_interface})
		//Event: Issue select changes
		$('#interfaceSelect').unbind();
		$('#interfaceSelect').change(() => {
			updateIssuesModal($('#interfaceSelect option:selected').attr(`data-id_interface`))
		})

		//Populate existing issues select
		//Empty all fields
		$('#issueSelect').empty();
		$('#issueTitle').empty();
		$('#issueSeverity button').removeClass('btn-primary')
		$('#issueDescription').empty();
		$('#issueResolution').empty();
		$('#unaffectedSystems .card-body').empty();		

		//Load all systems which implement the interface into the unaffected droppable
		postData = { type: 'SystemsWithSpecificInterface', id_interface: id_interface }
		$.post('select.json', postData, (result) => {
			debug(2,'Passed to select.json: ', postData);
			debug(2,'Response: ', result)

			//Load all systems which implement the interface into the unaffected droppable
			result.forEach((element) => {
				addDragableBadge('#unaffectedSystems .card-body', element.name, 'id_system', element.id_system)
			})
		})

		if (id_interfaceIssue > -1){
			//Get: [0] 
			//	   [1] The oldest interface issue id
			//	   [2] All the issues associated with the currently selected interface
			//	   [3] The list of systems which are affected by this issue
			
			//Disable save button
			controlState(null,['#mainModalSubmit'])	


			//Update the form controls
			postData2 = {
				type: 'InterfaceIssues',
				id_interface: id_interface,
				id_interfaceIssue: id_interfaceIssue
			}
			$.post('select.json', postData2, (result) => {
				debug(2,'Passed to select.json: ', postData2);
				debug(2,'Response: ', result)

				//Check if there are any results
				if (result[1][0].id_interfaceIssue === null){ //No issues are currently associated with this interface

					//Don't allow data entry until the user selects add new issue
					controlState(null, ['#mainModalDelete', '#issueSelect', '#issueTitle', '#issueSeverity', '#issueDescription', '#issueResolution'])

					//Disable draggable systems
					$('#unaffectedSystems span').prop('draggable', false);

				} else { //There are results associated with the interface
					
					//Set the id_interfaceIssue to the oldest interfaceIssue for the selected interface
					id_interfaceIssue = result[1][0].id_interfaceIssue

					//Load each issue into the issues select
					result[2].forEach((element) => {
						debug(1, element)
						$('#issueSelect').append(`<option data-id_interfaceIssue="${element.id_interfaceIssue}">${element.name}</option>`)

						//Load the rest of the form if this is the issue to display
						if (element.id_interfaceIssue == id_interfaceIssue) { populateFields(element, result[3]) }
					})
				}
			})
		}
	}



	//Populate fields
	var populateFields = (interfaceIssue, affectedSystems) => {
		debug(1, 'in popluateFields');

		//Move the relevant affected systems from the unaffected systems div
		setFormElement("#affectedSystems", {type: 'droppable', $source: '#unaffectedSystems', dataAttr: 'id_system'}, affectedSystems);

		//Set the selected interfaceIssue item
		$(`#issueSelect option[data-id_interfaceIssue="${interfaceIssue.id_interfaceIssue}"]`).prop('selected', true);

		//Populate the remainder of the form fields
		form.issue.forEach((element) => {
			//Set the relevant form control values
			if(element.columnName && element.type != 'droppable'){ setFormElement('#' + element.id, element, interfaceIssue[element.columnName]) }
		})
	}

	//Events: Changes to controls
	updateEvents(form[properties.formReference], lockControlsOnUpdate);

	//Event: Change to exisitng interface issue select
	$('#issueSelect').unbind();
	$('#issueSelect').change(() => {
		updateIssuesModal(id_interface, null, $('#issueSelect option:selected').attr(`data-id_interfaceIssue`))
	})	

	//Event: Save
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		const postData = {
			type: 'Issue2',
			id_interface: id_interface,
			id_interfaceIssue: id_interfaceIssue,
		}

		//Load issue details into postData
		form.issue.forEach((element) => {
			if (element.columnName){ postData[element.columnName] = getFormElement('#' + element.id, element) }
		})
		
		$.post('update.json', postData, (result) => {
			debug(2,'Passed to update.json: ', postData);
			debug(2,'Response: ', result)
	
			//Check the result
			if (result.msg){
				//An error was passed
				updateIssuesModal(id_interface,{info: 'failure', msg: `There was an error. Check the console.`}, id_interfaceIssue);
			} else {
				//Check if entry was a new entry
				if (result[1].insertId == 0){
					//Submission was an update
					$('#mainModal').modal('hide');
					updateIssuesModal(id_interface, {info: 'success', msg: `The '${postData.name}' record was successfully updated.`}, id_interfaceIssue);
					
				} else {
					//Submission was a new issue
					updateIssuesModal(id_interface, {info: 'success', msg: `The '${postData.name}' record was successfully added.`}, result[1].insertId);
				}
			}
		})
	});

	//Event: Delete
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click(() => {

		//Check if there is an issue loaded
		if (id_interfaceIssue == 0){
			updateIssuesModal(id_interface, id_interfaceIssue,{info: 'failure', msg: `No interface is selected.`});
		}

		const postData = {
			type: 'DeleteIssue2',
			id_interfaceIssue: id_interfaceIssue,
		}
		
		$.post('update.json', postData, (result) => {
			debug(2,'Passed to update.json: ', postData);
			debug(2,'Response: ', result)
	
			//Check the result																												//Working here, having trouble adding a new system
			if (result.msg){
				//An error was passed
				updateIssuesModal(id_interface, {info: 'failure', msg: `There was an error. Check the console.`}, id_interfaceIssue,);
			} else {
				
				//Check if entry was a new entry
				if (true){
					//Delete was successful
					$('#mainModal').modal('hide');
					updateIssuesModal(id_interface, {info: 'success', msg: `The record was successfully deleted.`}, 0);
				}
				
			}
		})
		
	});

	//Event: Add
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click((event) => {
		$('#mainModal').modal('hide');
		updateIssuesModal(id_interface, null, -1);
		controlState(null, ['#interfaceSelect','#issueSelect', '#mainModalAddNew', '#mainModalDelete' ])
	})	

	/*
	//Event: Issue select changes


	//Event: Issue select changes
	$('#affectedSystems, #unaffectedSystems').unbind();
	$('#affectedSystems, #unaffectedSystems').on('drop',() => {
		preventNavigationDuringUpdate();
	})

	//Event: Other controls change
	$('#issueTitle, #issueDescription, #issueResolution').unbind();
	$('#issueTitle, #issueDescription, #issueResolution').on('input',() => {
		preventNavigationDuringUpdate();
	})
	*/
}

/**
 * @description Modal to allow the user to select the tags to include or exclude from the graph and subsequent results pages
 * 
 */
 function manageTagsModal(){
	debug(1, 'In manageTagsModal()');

	var availableTags;
	
	//Prepare the modal
	prepareModal('Show / Hide by Tag');
	
	//Modal elements
	document.querySelector('#mainModal .modal-body').innerHTML = `<p>Tags allow the graph contents to be filtered for the view. Tags are added to the system's definition page. When using tages, included tags are applied first, followed by excluded tags.</p>`
	
	form.tags.forEach((element) => {
		addFormElement('#mainModal .modal-body', element);
	})

	//Buttons
	defaultButtons([
		{type: 'submit', label: 'Update'},
		{type: 'close'},
	])

	//Get tags from the server
	const postData = {
		type: 'TagList'
	}

	$.post('select.json', postData, (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)

		//Put all the tags which exist into the availableTags div
		result.forEach((element) => {
			addDragableBadge2('#availableTags .card-body', { text: element.tag, dataAttrName: 'tag', dataAttrValue: element.tag })
		})


		//Iterate through localStorage includedTags and move tags from availableTags to the includedTags div
		//Convert to array
		var includedTags = JSON.parse(localStorage.getItem('includedFilterTag'));
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
		var excludedTags = JSON.parse(localStorage.getItem('excludedFilterTag'));
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

	//Event: Update button clicked
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click((event) => {

		//Update localStorage with includedTags
		var includedTags = document.querySelectorAll("#includedTags span");
		var includedTagsArr = [];
		includedTags.forEach((element) => {
			includedTagsArr.push(element.textContent)
		})
		//Trim
		localStorage.setItem('includedFilterTag', JSON.stringify(includedTagsArr));
		
		//Update localStorage with excludedTags
		var excludedTags = document.querySelectorAll("#excludedTags span");
		var excludedTagsArr = [];
		excludedTags.forEach((element) => {
			excludedTagsArr.push(element.textContent)
		})
		//Trim
		localStorage.setItem('excludedFilterTag', JSON.stringify(excludedTagsArr));

		pageSwitch(sessionStorage.getItem('currentPage'));
		$('#mainModal').modal('hide');
	});
 }

/**
 * @description Modal for changing graph settings for the local user
 * 
 * @param {} message
 */
function settingsModal(message){

	//Prepare the modal
	prepareModal('Settings');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Buttons
	defaultButtons([
		{type: 'submit', label: 'Update'},
		{type: 'close'},
	])

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
			localStorage.setItem(element.id, getFormElement('#' + element.id, element))
		})

		pageSwitch(sessionStorage.getItem('currentPage'));
		$('#mainModal').modal('hide');
	});
}

/**
 * @description Pick the interface to update from a select.
 * 
 * @param id_interface
 * @param {} message
 */
async function updateInterfaceModal(id_interface = 1, message){
	debug(1, `In updateInterfaceModal() with id_interface = ` + id_interface)
	
	var properties = {
		postType: 'Interface',
		formReference: 'interface', 
		key: 'id_interface', 
		subjectId: id_interface
	}

	//Prepare the modal
	prepareModal('Update Interfaces');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add input fields
	form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

	//Buttons
	defaultButtons([
		{type: 'new', label: 'Add New Interface'},
		{type: 'delete', label: 'Delete Interface'},
		{type: 'submit', label: 'Update'},
		{type: 'close'},
	])

	//Populate the available technologies droppable
	postData = { type: 'Technologies' }
	await $.post('select.json', postData, (result) => {
		debug(2,'Passed to select.json: ', postData);
		debug(2,'Response: ', result)

		result.forEach((element) => {
			addDragableBadge2('#availableTechnologies .card-body', { text: element.name, dataAttrName: 'id_technology', dataAttrValue: element.id_technology })
		})
	})

	//Check if adding a new entry
	if (id_interface == -1){ //New entry
		//Disable controls to prevent navigation
		controlState(null, ['#mainModalInterfaceSelect', '#mainModalAddNew', '#mainModalDelete' ])
	} else { //Existing entry
		await populatePrimarySelect(updateInterfaceModal, properties);

		//Move technologies from availableTechnologies to attachedTechnologies
		postData = { type: 'AssignedTechnologies', id_interface: id_interface }
		await $.post('select.json', postData, (result) => {
			debug(2,'Passed to select.json: ', postData);
			debug(2,'Response: ', result)
	
			//Load all systems which implement the interface into the unaffected droppable
			setFormElement("#attachedTechnologies", {type: 'droppable', $source: '#availableTechnologies', dataAttr: 'id_technology'}, result);
		})
		controlState(null, ['#mainModalSubmit'])
	}

	//Events: Changes to controls
	updateEvents(form[properties.formReference], lockControlsOnUpdate);

	//Event: Save
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		//Add attachedTechnologies to properties.postData
		properties.postData = [],
		properties.postData.push({ key: 'technologies', value: getFormElement('#attachedTechnologies', {type: 'droppable', id: 'attachedTechnologies', source: 'data-attr', attr: 'id_technology'}) });

		saveEntry(updateInterfaceModal, properties);
	});

	//Event: Delete
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click(() => {
		deleteEntry(updateInterfaceModal, properties);
	});

	//Event: Add
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click((event) => {
		$('#mainModal').modal('hide');
		updateInterfaceModal(-1);
	})

	//Event: Assign Icon button
	$('#iconChooserButton').unbind();
	$('#iconChooserButton').click(() => {
		//debug('loading icons')
		$('#mainModal').modal('hide');
		selectIconModal('#mainModal', getFormElement('#mainModalImage', { type: 'img', id: 'mainModalImage' }) ,(updatedIcon) => {
			setFormElement('#mainModalImage', { type: 'img', id: 'mainModalImage', columnName: 'image'}, updatedIcon)
		});
	})
}

/**
 * @description Pick the network to update from a select.
 * 
 * @param  {} id_network
 * @param  {} message
 */
 async function updateNetworkModal(id_network = 1, message){
	debug(`In updateNetworkModal()`)
	
	var properties = {
		postType: 'Network',
		formReference: 'network', 
		key: 'id_network', 
		subjectId: id_network
	}

	//Prepare the modal
	prepareModal('Update Links');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Add fields to modal
	form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

	//Add buttons
	defaultButtons([
		{type: 'new', label: 'Add New Link'},
		{type: 'delete', label: 'Delete Link'},
		{type: 'submit', label: 'Update'},
		{type: 'close'},
	])

	//Breadcrumbs
	breadcrumbs('#mainModal form', { type: 'UpdateNetwork', id_network: id_network });

	//Check if adding a new entry
	await populateSelect('#mainModalTechnologySelect', {type: 'Technologies'}, 'id_technology')
	if (id_network == -1){ //New entry
		//Disable controls to prevent navigation
		controlState(null, ['#mainModalNetworkSelect', '#mainModalAddNew', '#mainModalDelete' ])
	} else { //Existing entry
		//Populate the link technology select
		await populatePrimarySelect(updateNetworkModal, properties);
	}


	//Events: Changes to controls
	updateEvents(form[properties.formReference], lockControlsOnUpdate);
	
	//Event: Save
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		saveEntry(updateNetworkModal, properties);
	});

	//Event: Delete
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click(() => {
		deleteEntry(updateNetworkModal, properties);
	});

	//Event: Add
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click((event) => {
		$('#mainModal').modal('hide');
		updateNetworkModal(-1);
	})
}

/**
 * @description 
 * 
 */
function mapNetworksToSystemInterface(systemInterface, message){
	debug('In mapNetworksToSystemInterface()')
	debug(systemInterface)

	//Prepare the modal
	prepareModal('Map Networks to System Interfaces');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Buttons
	defaultButtons([
		{type: 'delete', label: 'Detach Network'},
		{type: 'close'},
	])
	
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
 * @description Prepare and display the modal which allows the user to quickly update technologies
 * using a select to access all available technologies.		
 * 
 * @param  {info, msg} message
 */
async function updateTechnologiesModal(id_technology = 1, message){
	debug(1,'In updateTechnologiesModal()')

	var properties = {
		postType: 'Technologies',
		formReference: 'technologies', 
		key: 'id_technology', 
		subjectId: id_technology,
	}

	//Prepare the modal
	prepareModal('Update Link Technologies');
	
	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Buttons
	defaultButtons([
		{type: 'new', label: 'Add New Technology'},
		{type: 'delete', label: 'Delete'},
		{type: 'submit', label: 'Update'},
		{type: 'close'},
	])

	//Add input fields
	form[properties.formReference].forEach((element) => { addFormElement('#mainModal form', element) })

	//Check if adding a new entry
	if (id_technology == -1){ //New entry
		//Disable controls to prevent navigation
		controlState(null, ['#mainModalAddNew', '#mainModalDelete' ])
		lockControlsOnUpdate(form[properties.formReference]);
	} else { //Existing entry
		await populatePrimarySelect(updateTechnologiesModal, properties);
	}

	//Events: Changes to controls
	updateEvents(form[properties.formReference], lockControlsOnUpdate);
	
	//Event: Save
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click(() => {
		saveEntry(updateTechnologiesModal, properties);
	});

	//Event: Delete
	$('#mainModalDelete').unbind();
	$('#mainModalDelete').click(() => {
		deleteEntry(updateTechnologiesModal, properties);
	});

	//Event: Add
	$('#mainModalAddNew').unbind();
	$('#mainModalAddNew').click((event) => {
		$('#mainModal').modal('hide');
		updateTechnologiesModal(-1);
	})
}

/**
 * @description Allows the user to easily map features to networks using selects
 * @param  {type, msg} message
 */
 function mapFeaturesToNetworksModal(message){


	//Prepare the modal
	prepareModal('Update Features');

	//Notifications
	if (message){ addBadge('#mainModal .warning-holder', message) }

	//Buttons
	addButton('#mainModal .modal-footer', {type: 'info', id: 'mainModalEditNetwork', label: 'Edit Network'});
	defaultButtons([
		{type: 'submit', label: 'Save Mapping'},
		{type: 'close'},
	])

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
			debug(3,'Passed to select.json:', postData3);
			debug(3,'Response:', result)

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
					//NodeModal: new NodeModal('Network', selectedNetwork),
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



//******************************************** WORK REQUIRED */

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
 * @description Handles the two different variants of the mappingModal.
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

