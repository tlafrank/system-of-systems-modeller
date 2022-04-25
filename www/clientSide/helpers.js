
/**
 * @description  
 * 
 */
function nodeSelectButton(id, image, name){
    var element = document.createElement('button');
    $(element).addClass('btn btn-secondary m-2');
    element.setAttribute('data-id', id);
    $(element).html(`<img src="./images/${image}" width="100" height="100"><br>${name}`);

    return element;
}

/**
 * @description Adds a button with image into the DOM at $selector
 * 
 */
function addIconButton($selector, image, name, data){

	if (data){
		var formElement = `<button class="btn btn-secondary m-2" data-${data.name}="${data.value}">`;
	} else {
		var formElement = '<button class="btn btn-secondary m-2">';
	}
	
	formElement += `<img src="./images/${image}" width="100" height="100"><br>${name}</button>`

	$($selector).append(formElement);
}


/**
 * @description Create a table based on the node selected
 * 
 */
function nodeTable($selector, node){
	debug('nodeTable()');
	debug(node);

	var responseString = '<table id="nodeDetailsTable" class="table table-sm mx-1"><tbody>';

	graphTable[node.type].forEach((element) => {
		if (element.columnName){
			switch (element.type){
				case 'link':
					if (node[element.columnName] == undefined || node[element.columnName] == ''){
						responseString += `<tr><th scope="row" class="text-secondary">${element.label}</th><td class="text-right">No Record</td></tr>`
					} else {
						responseString += `<tr><th scope="row" class="text-secondary">${element.label}</th><td class="text-right"><a target="_blank" href="${getReferenceURL(node[element.columnName])}">${node[element.columnName]}</a></td></tr>`
					}
					
				break;
				default:
					responseString += `<tr><th scope="row" class="text-secondary">${element.label}</th><td class="text-right">${node[element.columnName]}</td></tr>`
			}
			
		} else {
			//Separator
			
		}
	})

	responseString += `</tbody></table>`

	$($selector).replaceWith(responseString);
}




/**
 * @description Console logging helper
 * 
 * handle multiple paramaters, perhaps debug levels too
 */
function debug(...msg){
	if (debugOn) {
		for (var i = 0; i < msg.length; i++){
			console.log(msg[i]);
		}
	}
}


/**
 * @description Button background toggling function
 * 
 */
function toggleButton($selector){
	if ($($selector).hasClass('btn-primary')){
		$($selector).addClass('btn-secondary').removeClass('btn-primary')
	} else (
		$($selector).addClass('btn-primary').removeClass('btn-secondary')
	)
}


/**
 * @description Adds a button to the modal at $selector
 * 
 * @param  {} selector
 * @param  {type, id, label} button
 */
function addButton($selector, button){
	switch (button.type){
		case 'submit':
			$($selector).append(`<button id="${button.id}" type="button" class="btn btn-primary">${button.label}</button>`);
			break;
		case 'delete':
			$($selector).append(`<button id="${button.id}" type="button" class="btn btn-danger">${button.label}</button>`);
			break;
		case 'close':
			$($selector).append(`<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`);
			break;
		case 'info':
			$($selector).append(`<button id="${button.id}" type="button" class="btn btn-info">${button.label}</button>`);
			break;
  	}
}


/**
 * @description Gets the value of form element specified at selector
 * 
 * @param  {} $selector
 * @param  {} properties
 */
function getFormElement($selector, properties){
	switch (properties.type){
		case 'select':
			if (properties.dataAttr){
				return $($selector + ' option:selected').attr(`data-${properties.dataAttr}`)
			} else {
				return $($selector + ' option:selected').val();
			}

			
			break;

		case 'number':
		case 'year':		
		case 'textarea':
		case 'text':
			return $($selector).val()
		break;

		case 'checkbox':
			if ($($selector).prop("checked")){
				return 1;
			} else {
				return 0;
			}
		break;
		case 'img':
			var path = $($selector).attr('src');
			return path.substr(path.lastIndexOf('/') + 1)
		break;
		case 'radio':
			//debug(`${$selector} [name=${properties.id}]:checked`);
			return $(`${$selector} [name=${properties.id}]:checked`).attr(`data-${properties.columnName}`);
		
		case 'trafficLightRadio':
			//Set focus to the current severity level
			return $($selector + ' button.btn-primary').attr('data-severity')


		break;
		default:
			debug(`Switch default, shouldn't make it here in helpers.getFormElement() due to ${properties.type}`)
	}
}



/**
 * @description Sets the value of the form element provided at selector
 * 
 * @param  {} selector
 * @param  {} properties
 * @param  {} value
 */
function setFormElement($selector, properties, value){
	switch (properties.type){
		case 'select':
			if (value == '')
			$($selector).empty();
			break;

		case 'number':

		break;
		case 'heading':
			$($selector).text(value)
		break;
		case 'textarea':
		case 'text':
			$($selector).val(value)
			break;
		case 'year':

			break;
		case 'checkbox':
			if (value == 1){
				$($selector).prop("checked", true);
			} else {
				$($selector).prop("checked", false);
			}
			break;
		case 'img':
			if (value == '') { value = 'tba.svg'}
			$($selector).attr('src', imagePath + value)
		break;
		case 'trafficLightRadio':
			//Set focus to the current severity level
			$($selector + ' button')
				.removeClass('btn-primary')
				.addClass('btn-light')

			switch (value){
				case 'critical':
					$($selector + ' button[data-severity="critical"')
						.addClass('btn-primary')
						.removeClass('btn-light')
				break;
				case 'warning':
					$($selector + ' button[data-severity="warning"')
						.addClass('btn-primary')
						.removeClass('btn-light')
				break;
				case 'notice':
					$($selector + ' button[data-severity="notice"')
						.addClass('btn-primary')
						.removeClass('btn-light')
				break;
				default:
					debug('setFormElement switch default trafficLightRadio should not make it here due to value of ' + value)
			}

		break;

		default:
			debug(`Switch default, shouldn't make it here in helpers.setFormElement() due to '${properties.type}'`)
	}
}


/**
 * @description Inserts form elements into the DOM.
 * 
 * @param  {type, id, label, value, options{} } properties
 */
function addFormElement(selector, properties){

	var formElement = '';

	switch (properties.type){
		case 'select':
			formElement += `<div class="form-group"><label for="${properties.id}">${properties.label}</label>`;
			if (properties.multiple){
				formElement += `<select id="${properties.id}" multiple rows="10" class="form-control">`;
			} else {
				formElement += `<select id="${properties.id}" class="form-control">`;
			}

			if (properties.options) {
				properties.options.forEach((element) => {
					debug(properties.value +  ' ' + element)
					if (properties.value == element){
						debug('Match')
						formElement += `<option selected>${element}</option>`;
					} else {
						formElement += `<option>${element}</option>`;
					}
					
				})
			}
			formElement += `</select></div>`;
		break;
		case 'option':
			//Load options into the select identified by selector
			if (properties.data){
				debug(properties.data.name)
				$(selector).append(`<option data-${properties.data.name}="${properties.data.value}">${properties.label}</option>`)
			} else {
				$(selector).append(`<option>${properties.label}</option>`)
			}
			
		break;
		case 'number':
			formElement += `<div class="form-group">`;
			formElement += `<label for="${properties.id}">${properties.label}</label>`;
			if (properties.value){
				formElement += `<input id="${properties.id}" type="number" class="form-control" value="${properties.value}">`;
			} else {
				formElement += `<input id="${properties.id}" type="number" class="form-control" value="">`;
			}
			
			formElement += `</div>`;
		break;
		case 'text':
			formElement += `<label for="${properties.id}">${properties.label}</label>`;
			formElement += `<div class="input-group mb-3">`;
			
			if (properties.value){
				if(properties.append){
					formElement += `<input id="${properties.id}" type="text" class="form-control" aria-describedby="${properties.append.id}" value="${properties.value}">`;
					formElement += `<div class="input-group-append"><span class="input-group-text" id="${properties.append.id}">${properties.append.label}</span></div>`;
				} else {
					formElement += `<input id="${properties.id}" type="text" class="form-control" value="${properties.value}">`;
				}
				
			} else {
				if(properties.append){
					formElement += `<input id="${properties.id}" type="text" class="form-control" aria-describedby="${properties.append.id}" value="">`;
					formElement += `<div class="input-group-append"><span class="input-group-text" id="${properties.append.id}">${properties.append.label}</span></div>`;
				} else {
					formElement += `<input id="${properties.id}" type="text" class="form-control" value="">`;
				}
			}
			//Append any inputs to the text box

			formElement += `</div>`;
		break;
		case 'year':
			formElement += `<div class="form-group">`;
			formElement += `<label for="${properties.id}">${properties.label}</label>`;
			formElement += `<input id="${properties.id}" type="number" class="form-control" min="2000" max="2099" value="">`;
			formElement += `</div>`;
		break;
		case 'checkbox':
			formElement += `<div class="form-group">`;
			formElement += `<div class="form-check">`;
			if (properties.value == 1){
				formElement += `<input id="${properties.id}" type="checkbox" class="form-check-input" checked>`;
			} else {
				formElement += `<input id="${properties.id}" type="checkbox" class="form-check-input">`;
			}
			formElement += `<label for="${properties.id}" class="form-check-label">${properties.label}</label>`;
			formElement += `</div></div>`;
		break;
		case 'button':
			//formElement += `<div class="form-group">`;
			formElement += `<button id="${properties.id}" class="btn btn-info">${properties.label}</button>`
			//formElement += `</div>`;
		break;
		case 'img':
			formElement += `<div class="text-center">`;
			formElement += `<img id="${properties.id}" src="${imagePath}tba.svg" width="200px" height="200px">`;
			//formElement += `<button id="${properties.id}Button" type="button" class="btn btn-primary mx-2">Assign Icon</button>`;			//Need to work on this to make it more generic
			formElement += `</div>`
		break;
		case 'textarea':
			formElement += `<div class="form-group">`;
			formElement += `<label for="${properties.id}">${properties.label}</label>`;
			formElement += `<textarea id="${properties.id}" class="form-control" rows="4"></textarea>`;
			formElement += `</div>`
		break;
		case 'radioOld':
			formElement += `<div id="${properties.id}" class="form-group">`;

			properties.options.forEach((element) => {
				formElement += `<div class="form-check form-check-inline">`;
				formElement += `<input class="form-check-input" type="radio" name="${properties.id}" id="${properties.id}_${element}" value="${element}" data-severity="${element.toLowerCase()}">`;
				formElement += `<label class="form-check-label" for="${properties.id}_${element}">${element}</label>`;
				formElement += `</div>`;
			})
			formElement += `</div>`;
		break;
		case 'radio':
		case 'trafficLightRadio':
			formElement += `<div id="${properties.id}" class="btn-group">`;

			formElement += `<button class="btn btn-light mx-2" data-severity="critical"><img src="./assets/critical.png" width="30px"><br>Critical</button>`
			formElement += `<button class="btn btn-light mx-2" data-severity="warning"><img src="./assets/warning.png" width="30px"><br>Warning</button>`
			formElement += `<button class="btn btn-light mx-2" data-severity="notice"><img src="./assets/notice.png" width="30px"><br>Notice</button>`

			formElement += `</div>`;
		break;

		case 'buttons':
			formElement += `<div class="row justify-content-left">`;
			properties.buttons.forEach((element) => {

				formElement += `<div class="col-6 my-2"><button id="${element.id}" class="btn btn-info btn-block">${element.label}</button></div>`
			})
			formElement += `</div>`;
		break;

		case 'note':
			formElement += `<p>${properties.text}</p>`;
		break;
		case 'heading':
			formElement += `<h5`;
			if (properties.id){	formElement += ` id="${properties.id}"` }
			if (properties.align){	formElement += ` class="text-${properties.align}"` }
			formElement += `>`;
			if (properties.text){ formElement += properties.text }
			formElement += `</h5>`;
		break;
		case 'container':
			formElement += `<div id="${properties.id}"></div>`;
		break;
		default:
			debug(`Switch default, shouldn't make it here in helpers.addFormElement() with ${properties.type}`)

	}

	//Insert the element into the DOM
	$(selector).append(formElement);
}


/**
 * @description Validates a form control and returns the value.
 * 
 * @param  {} selector
 * @param  {type, id, label, value, options{} } properties
 */
function validate(selector, properties){
	switch (properties.type){
		case 'select':

			break;

		case 'number':
			var value = $(selector).val();
			if (typeof value == 'number'){
				return value;
			}
			break;
		case 'year':
			var value = $(selector).val();
			if (value > 1980 && value < 2100){
				return value;
			}

			break;
			
		case 'text':

			break;
		case 'checkbox':

			break;
		default:
			return {msg: 'Value was wrong'};
	}
}

/**
 * @description  
 * 
 */
function addQuantityFormControl(selector, index, details, after){
	var html = `<div id="inputDiv_${index}" class="form-row my-2">
		<div class="col">
			<input id="formYears_${index}" type="number" class="form-control" value="${details.year}">
		</div>
		<div class="col">
			<input id="formQuantity_${index}" type="number" class="form-control" value="${details.quantity}">
		</div>
	</div>`
	if (after) {
		$(html).insertAfter(selector);
	} else {
		$(selector).append(html);
	}
}


/**
 * @description Creates an event handler for the buttons which swap options between two selects
 * 
 * @param  {} buttonSelector
 * @param  {} sourceSelector
 * @param  {} destinationSelector
 */
function swapSelectOptions(buttonSelector, sourceSelector, destinationSelector){

	//Event: Inserted button click
	$(buttonSelector).unbind();
	$(buttonSelector).click(() => {

		var selectedItems = $(`${sourceSelector} option:selected`);
		if (selectedItems.length > 0){
			$(destinationSelector).append($(selectedItems).clone())
			$(selectedItems).remove();
		}
	})
}


/**
 * @description Add badge elements to the DOM at $selector
 * 
 * @param  {} $selector
 * @param  {type, msg} badge
 */
 function addBadge($selector, badge){
	switch (badge.info){
		case 'success':
			$($selector).append(`<span class="badge rounded-pill bg-success text-white">${badge.msg}</span>`);
		break;
	  	
		case 'warning':
			$($selector).append(`<span class="badge rounded-pill bg-warning">${badge.msg}</span>`);
		break;
		case 'error':
		case 'failure':
			$($selector).append(`<span class="badge rounded-pill bg-danger text-white">${badge.msg}</span>`);
		break;
	}
}



/**
 * @description  
 * 
 */
async function populateSelect(selector, postData, dataAttributeName, callback){

	
	await $.post('select.json', postData, async (result) => {
		debug('Passed to select.json: ', postData);
		debug('Response: ', result)

		//Check the result
		if (result.msg){
			//An error was passed

		} else {
			
			result.forEach((element) => {
				if (dataAttributeName.length > 0){
					addFormElement(selector, {type: 'option', label: element.name, data: { name: dataAttributeName, value: element[dataAttributeName]}})
				} else {
					addFormElement(selector, {type: 'option', label: element.name})
				}
			})
			//setTimeout(function(){ debug("timeout completed"); }, 3000);


			if (callback) { callback() };
			
		}
	})
}

/**
 * @description Returns the URL to enable the user to quickly bring up related documents. Can
 * be changed to an Objective reference.
 * 
 * @param  {} $selector
 * @param  {type, msg} badge
 */
function getReferenceURL(reference){
	return `./assets/${reference}`
}

/**
 * @description  
 * 
 */
 const graphTable = {
	Subsystem: [
		{ label: 'Subsystem Name', type: 'text', columnName: 'name' },
		{ label: 'Quantities', type: 'text', columnName: '' },
		{ label: 'Block Diagram', type: 'link', columnName: 'reference'},
		{ label: 'Description', type: 'text', columnName: 'description' },
		
	],
	SubsystemInterface: [
		{ label: 'Interface Name', type: 'text', columnName: 'interfaceName' },
		{ label: 'Installed In', type: 'text', columnName: 'subsystemName' },
		{ label: 'Description', type: 'text', columnName: 'description' },	
	],
	Network: [
		{ label: 'Network Name', type: 'text', columnName: 'name' },
		{ label: 'Description', type: 'text', columnName: 'description' },	
	],
}