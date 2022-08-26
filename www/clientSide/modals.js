
async function commonModal(definition){
	/*
	definition = {
		modal: the name of the object in the modals object which defines this instance of modal
		mode: [view|edit|add]
		message: any message objects passed to the modal
		[modalSpecificFields]: Defined in the modals[modal].definition array
	}

	*/
	debug(1, 'In CommonModal() with definition: ', definition)

	//Build new modal
	prepareModal2();
	if(typeof definition.continue === 'undefined') {definition.continue = true}

	//Add default buttons
	modals[definition.modal].formButtons.forEach((element) => {addButton('#mainModal .modal-footer', element)})

	//Add the form fields to the modal
	modals[definition.modal].formFields.forEach((element) => {addFormElement('#mainModal form', element)})	

	//Notifications
	$('#mainModal .warning-holder').empty()
	if (definition.message){ 
		addBadge('#mainModal .warning-holder', definition.message) 
		delete definition.message
	}

	//Modal title
	$('#mainModalTitle').text(modals[definition.modal].title);

	//Breadcrumbs
	//breadcrumbs('#mainModal form', { type: 'SystemInterface', id_system: id_system });

	//Get the data from the server to display in the modal
	if (definition.continue){
		for (var i = 0; i < modals[definition.modal].iterations.length; i++){
			//Populate the fields
			var postData = { 
				type: modals[definition.modal].iterations[i].type
			}
			
			var definitionsFound = true;

			modals[definition.modal].iterations[i].definitionFields.forEach((element2) => { 
				if (definition[element2] !== undefined){
					postData[element2] = definition[element2]
				} else {
					definitionsFound = false
				}
			})
			//debug(1, modals[definition.modal].iterations[i].onUndefined)
			if(modals[definition.modal].iterations[i].continueOnUndefined){
				definitionsFound = true
			}

			if(definitionsFound == true){
				await commonModal_getData(definition, modals[definition.modal].iterations[i], postData)
			}			
		}
	
		//Handle Events
		for (var i = 0; i < modals[definition.modal].events.length; i++){ 
			//debug(1, 'event for ', modals[definition.modal].events[i])
			commonModal_event(definition, modals[definition.modal].events[i])
		}

		//Event: Changes to any fields (Transition View -> Edit mode)
		modals[definition.modal].monitorChanges.forEach((element4) => {
			$('#' + element4.id).unbind().on(element4.on, () => {
				//Prevent update
				modals[definition.modal].lockOnChange.forEach((element5) => {$('#' + element5).prop('disabled', true)})
				modals[definition.modal].unlockOnChange.forEach((element5) => {$('#' + element5).prop('disabled', false)})	
			})
		})
	}
}

async function commonModal_getData(definition, formData, postData){
	//debug(1,definition)
	debug(1, `Getting '${postData.type}' from the server (select.json):`)
	
	await $.post('select.json', postData, (result) => {
		debug(2, postData, result);

		if (result.msg){
			//An error was passed
			definition.message = {info: 'failure', msg: `There was an error. Check the console.`};
			definition.continue = false;
			commonModal(definition);
		} else {
			//Populate the form's fields
			formData.instructions.forEach((element3) => {

				switch (element3.action){

					default:
						commonModal_actions(definition, element3, postData, result)
				}
			})
		}
	})
	//debug(1, definition)
}

function commonModal_event(definition, event){
	//debug(1, 'In commonModal_event with definition:', definition)
	//debug(1, 'In commonModal_event for '+ event.handler.controlId)

	//Create the event handler
	event.handlers.forEach((handler) => {

		$('#' + handler.controlId).on(handler.event, async (e) => {
			//debug(1, 'event handler for ' + event.handler.controlId)
			//e.preventDefault();
			//debug(1, e)
			
			if (event.postType) {
				var postData = {};
				postData.type = event.postType
			}
	
			event.instructions.forEach((element) => {
	
				//Do things that can't be done in commonModal_actions()
				switch (element.action){
					case 'setButtonClassesCurrentTarget':
						$(e.currentTarget).addClass('btn-primary').removeClass('btn-secondary')
						break;
					case 'preventDefault':
						e.preventDefault();
						break;
					case 'setDefinition_FromClickedButton':
						definition[element.definitionName] = e.currentTarget.dataset[element.dataAttr.toLowerCase()]
						break;
					case 'handleDrop':
						debug(1, e)
						const data = e.originalEvent.dataTransfer.getData("draggableElement");
						$(e.currentTarget).append(document.getElementById(data))
						break;
					default:
						commonModal_actions(definition, element, postData)
				}
			})
	
			//Send to server
			if (event.postType){
				if (event.url == 'select'){
					debug(1, `Sending '${postData.type}' to the server (select.json):`)
					var result = await $.post("select.json", postData, (result) => {
						debug(1, postData, result);
	
						//Check the result																												Need work here
						if (result.msg){ //An error was passed
							definition.message = {info: 'failure', msg: `There was an error. Check the console.`}
							definition.continue = false;
						}
						return result;
					});
				} else {
					debug(1, `Sending '${postData.type}' to the server (update.json):`)
					var result = await $.post("update.json", postData, (result) => {
						debug(1, postData, result);
	
						//Check the result
						if (result.msg){ //An error was passed
							definition.message = {info: 'failure', msg: `There was an error. Check the console.`}
							definition.continue = false;
						} else { //Update was successful
							if (result.insertId > 0){ //New record was added
								definition.message = {info: 'success', msg: `The record was successfully added.`}
							} else { //Update or Delete
								if (definition.updateMode == 'delete'){
									definition.message = {info: 'success', msg: `The record was successfully deleted.`}
								} else { //Was an update
									definition.message = {info: 'success', msg: `The record was successfully updated.`}
								}
							}
						}
	
						//debug(1, 'definition', definition)
						return result;
					});				
				}
			}
	
			//Cleanup activities
			event.cleanup.forEach((element) => {
				commonModal_actions(definition, element, postData, result)
			});				
		});		

	})
	
}

function commonModal_actions(definition, element, postData, result){
	//debug(1, 'in commonModal_actions with element', element)
	switch (element.action){
		//Set controls
		case 'setControl_MultipleValues':
		case 'setControl_MultipleValues_EntireArray':
		case 'setControl_MultipleValues_fromParamsSingleArrayInclDataAttributes': //An array of objects is returned and needs to be iterated through. Generally for populating selects and droppable elements
		case 'setControl_MultipleValues_AtSpecificArrayIndex':
			if(element.arrayIndex >= 0){setFormElement('#' + element.id, element, result[element.arrayIndex]) } else {setFormElement('#' + element.id, element, result)}
			break;
		case 'setControl_MultipleValues_fromConstant':
			setFormElement('#' + element.id, element, window.categories[element.constantName])
			break;
		case 'setControl_SingleValue':
		case 'setControl_SingleValue_fromParamNoArray':
		case 'setControl_SingleValue_AtSpecificArrayIndex':
			if(element.arrayIndex >= 0){
				//debug(1,'res', result[element.arrayIndex])
				setFormElement('#' + element.id, element, result[element.arrayIndex][element.columnName]) 
			} else {
				setFormElement('#' + element.id, element, result[element.columnName]) }
			break;
		case 'setControl_SingleValue_AtSpecificArrayIndexFirstIndex':
			//debug(1,result[element.arrayIndex][0])
			if (typeof result[element.arrayIndex][0] !== 'undefined'){
				setFormElement('#' + element.id, element, result[element.arrayIndex][0][element.columnName])
			}
			
			break;
		case 'setControl_SingleValue_fromDefinitionIfExists':
			if (definition[element.definitionName]){setFormElement('#' + element.id, element, definition[element.definitionName])}
			break;
		case 'setControl_SingleValue_fromResultArrayWhenMatchesDefinition': //Matches a definition parameter with a row parameter and sets a control to another parameter on that row, if found.
			if (definition[element.definition]){
				result.forEach((element4) => {
					if (element4[element.definition] == definition[element.definition]){
						setFormElement('#' + element.id, element, element4[element.columnName])
					}
				})
			}
			break;
		case 'setControl_Focus':
			$('#' + element.id).focus()
			break;
		case 'setControl_MultipleValues_FromLocalStorage':
			if (localStorage.getItem(element.localStorageName) !== ''){
				var value = JSON.parse(localStorage.getItem(element.localStorageName));
			} else {
				var value = [];
			}
			
			let value2 = []
			value.forEach((element) => {
				value2.push({tag: element})
			})
			setFormElement('#' + element.id, element, value2)
			debug(1,value)


			break;

		//Set definition
		case 'setDefinition_SingleValue_ifDefintionNotAlreadySet':
			if (!definition[element.definition]){
				definition[element.definition] = getFormElement('#' + element.id, element)
			}
			break;
		case 'setDefinition_SingleValue':
			break;
		case 'setDefinitionValueFromControlWithDataAttribute':
			definition[element.definitionName] = getFormElement('#' + element.id, element)
			break;
		case 'setDefinition_SingleValue_AtSpecificArrayIndex': //Populate key ID's if they were not supplied
		case 'setDefinition_SingleValue_AtSpecificArrayIndexFirstIndex':
		case 'setDefinition_SingleValue_fromParamNoArray': //Populate key ID's if they were not supplied
		case 'setDefinition_SingleValue':
			if(element.arrayIndex){
				if(result[element.arrayIndex][0]) { definition[element.id] = result[element.arrayIndex][0][element.columnName] }
			} else {
				definition[element.definitionName] = result[element.columnName]
			}
			
			break;

		case 'setDefinition_FromResultInsert':
			if (result.insertId > 0){ definition[element.definitionName] = result.insertId }
			break;
		case 'setDefinition_SingleValue_FromConstant':
			definition[element.definitionName] = element.value;
			break;
		case 'resetDefinition':
			for (const prop of Object.getOwnPropertyNames(definition)) {
				delete definition[prop];
			  }
		break;

		case 'setLocalStorage_fromDefinition':
			localStorage.setItem(element.localStorageName, definition[element.definitionName])
			break;		

		//To server
		case 'toServer_DefinitionValue': //Set postData[element.columnName] if definition[element.definitionName] exists
			if (definition[element.definitionName]){postData[element.columnName] = definition[element.definitionName];}
			break;
		case 'toServer_ControlValue': //Set postData[element.columnName] to the value of the control specified by element.id
			postData[element.columnName] = getFormElement('#' + element.id, element)
			break;		
		case 'resetButtonClasses': //Deselect all buttons container within the element specified at element.id
			$('#' + element.id + ' button').addClass('btn-secondary').removeClass('btn-primary')
			break;
		case 'emptyControl':
		case 'setSliderDescription':
			setFormElement('#' + element.id, element, '')
			break;
		case 'moveDefinitionValue': //Move definition[element.old] to definiton[element.new]
			definition[element.new] = definition[element.old]
			delete definition[element.old]
			break;
		case 'deleteDefinitionValue':
		case 'deleteDefinition':
			delete definition[element.definitionName]
			break;
		case 'lockControls':
			modals[definition.modal].lockOnChange.forEach((element2) => { $('#' + element2).prop('disabled', true) })
			break;
		case 'unlockControls':
			modals[definition.modal].unlockOnChange.forEach((element2) => {$('#' + element2).prop('disabled', false)})	
			break;
		case 'hideControls':
			element.controls.forEach((element2) => {$('#' + element2).hide();})
			break;
		case 'addControls':
			addFormElement('#' + element.id, element)
			break;
		case 'removeControls':
			deleteFormElement('#' + element.id, element)
			break;

		//From update cleanup
		case 'returnToLastModal':
			if (breadcrumbTracker.length == 0){
				//Close the modal
				$('#mainModal').modal('hide');
			} else {
				definition = breadcrumbTracker.pop();
				commonModal(definition);
			}
			break;
		case 'modalDefinitionToBreadcrumb':
			breadcrumbTracker.push(JSON.parse(JSON.stringify(definition)))
			break;
		case 'newModal':
			definition.modal = element.modal;
		case 'reload':
			commonModal(definition);
			break;
		case 'closeModal':
			$('#mainModal').modal('hide');
			break;
		case 'reloadPage':
			pageSwitch();
			break;

		case 'setLocalStorage':

			var resultArray = [];
			getFormElement('#' + element.id, element).forEach((element2) => {
				resultArray.push(element2[element.attrName])
			})
			localStorage.setItem(element.localStorageName, JSON.stringify(resultArray));

			break;
		case 'setSessionStorageFromConstant':
			sessionStorage.setItem(element.sessionStorageName, element.value);
			break;
		case 'setSessionStorageFromDefinition':
			sessionStorage.setItem(element.sessionStorageName, definition[element.definitionName]);
			break;
		case 'launchFunction':
			window[element.functionName]()
			break;
		case 'launchFunctionWithDefinition':
			window[element.functionName].apply(null, [definition])
			break;
		case 'removeElement':
			$(`#${element.id}[data-${element.dataAttr}="${definition[element.definitionName]}"`).remove();
			break;
		case 'debug':
			debug(1, 'In switch debug with definition: ', definition)
			break;
		default:
			debug(1, `Switch default. Shouldn't make it here in commonModal_action with ${element.action} and definition`, definition)
	}

}

function prepareModal2(){																							//Name to be fixed
	$('#mainModal .modal-body').empty();
	$('#mainModal .modal-body').append('<form></form>');
	$('#mainModal .modal-footer').html('<div class="warning-holder"></div>');
	$('#mainModal').modal('show');	

}

/**
 * @description Modal for changing graph settings for the local user
 * 
 * @param {} message
 */
function settingsModal(message){
	debug(1, 'In settingsModal()')

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
	settings.forEach((element) => {
		addFormElement('#mainModal form', element);
		setFormElement('#' + element.id, element, localStorage.getItem(element.id))
	})

	//Event: Update button clicked
	$('#mainModalSubmit').unbind();
	$('#mainModalSubmit').click((event) => {

		//Gather and validate form data. Uses the same method of GraphSettings to check all 

		const settingsArr = [];

		settings.forEach((element) => {
			
			if (element.type != 'null' && element.type != 'heading'){
				debug(1, getFormElement('#' + element.id, element))
				localStorage.setItem(element.id, getFormElement('#' + element.id, element))
			}
			
		})
		debug(1, localStorage)


		pageSwitch(sessionStorage.getItem('currentPage'));
		$('#mainModal').modal('hide');
	});
}



