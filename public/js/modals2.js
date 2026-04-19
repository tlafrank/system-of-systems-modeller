

//******************************** Supporting Modals ****************************************




/**
 * @description 
 * 
 * @param  {} callingModal
 * @param  {} initialIcon
 * @param  {} callback
 */
function selectIconModal(callingModal, initialIcon, callback) {
  // Prepare modal
  const supportBody = document.querySelector('#supportModal .modal-body');
  const supportFooter = document.querySelector('#supportModal .modal-footer');
  if (supportBody) supportBody.innerHTML = '';
  if (supportFooter) supportFooter.innerHTML = '<div class="warning-holder"></div>';

  // Buttons
  addButton('#supportModal .modal-footer', { type: 'submit', id: 'supportModalSubmit', label: 'Select Icon' });

  // Swap modals (Bootstrap 5 API)
  const calling = typeof callingModal === 'string' ? document.querySelector(callingModal) : callingModal;
  const supportEl = document.getElementById('supportModal');
  const callingInst = calling ? bootstrap.Modal.getOrCreateInstance(calling) : null;
  const supportInst = bootstrap.Modal.getOrCreateInstance(supportEl);
  callingInst && callingInst.hide();
  supportInst.show();

  // Load images
  fetch('images.json')
    .then(r => r.json())
    .then(list => {
      list.forEach(name => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secondary m-2';
        btn.dataset.image = name;
        btn.innerHTML = `<img src="${imagePath + name}" width="100" height="100"><br>${name}`;

        btn.addEventListener('click', () => {
          // reset all
          supportBody.querySelectorAll('button').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-secondary');
          });
          // select this
          btn.classList.remove('btn-secondary');
          btn.classList.add('btn-primary');
        });

        supportBody.appendChild(btn);
      });
    });

  // Submit
  const submitBtn = document.getElementById('supportModalSubmit');
  submitBtn.replaceWith(submitBtn.cloneNode(true)); // remove old listeners
  document.getElementById('supportModalSubmit').addEventListener('click', () => {
    const selected = supportBody.querySelector('button.btn-primary');
    supportInst.hide();
    callingInst && callingInst.show();
    callback(selected ? selected.dataset.image : initialIcon);
  });
}




/**
 * Handles the two different variants of the mappingModal.
 * 
 */
function mappingModal(modalSetup) {
  debug('In mappingModal()');

  // Cleanup
  const empty = sel => { const el = document.querySelector(sel); if (el) el.innerHTML = ''; };
  empty('#mappingModalContainer');
  empty('#interfacesToSubsystemModalNetworksContainer');
  empty('#interfacesToSubsystemModalContainer');
  empty('#mappingModalImageContainer');

  const delBtn = document.getElementById('mappingModalDeleteButton');
  if (delBtn) {
    delBtn.replaceWith(delBtn.cloneNode(true));
    document.getElementById('mappingModalDeleteButton').disabled = true;
  }

  // Prepare titles/buttons
  document.querySelector('#mappingModal .modal-title').textContent = modalSetup.title1;
  document.getElementById('mappingModalTitle2').textContent = modalSetup.title2;
  document.getElementById('mappingModalTitle3').textContent = modalSetup.title3;
  document.getElementById('mappingModalAddButton').innerHTML = modalSetup.addButtonText; // :contentReference[oaicite:24]{index=24}

  // Branch
  if (selectedNode.type === 'Subsystem') {
    mappingModal_subsystem();
    mappingModal_addButton();
  }
  if (selectedNode.type === 'SubsystemInterface') {
    mappingModal_interface();
    mappingModal_addButton();
  } // :contentReference[oaicite:25]{index=25}

  // Show
  bootstrap.Modal.getOrCreateInstance(document.getElementById('mappingModal')).show(); // :contentReference[oaicite:26]{index=26}
}





/**
 *CFD
 
 Handle the 'Assign Networks to Subsystem Interfaces' modal
 * 
 * 
 */
function mappingModal_interface() {
  debug('In mappingModal_interface()');

  // Images & labels
  installedInModalInsert('#mappingModalImageContainer',
    { name: selectedNode.name,      image: selectedNode.image },
    { name: selectedNode.subsystemName, image: selectedNode.subsystemImage }
  ); // :contentReference[oaicite:27]{index=27}

  // Compatible networks (populate select)
  fetch('/select.json', {
    method: 'POST',
    body: new URLSearchParams({ type: 'CompatibleNetworks', features: selectedNode.features })
  })
  .then(r => r.json())
  .then(result => {
    const sel = document.getElementById('mappingModalSelect');
    result.forEach(el => sel.insertAdjacentHTML('beforeend', `<option data-id="${el.id_network}">${el.name}</option>`));
  }); // :contentReference[oaicite:28]{index=28}

  // Already assigned networks (render removable buttons)
  fetch('/select.json', {
    method: 'POST',
    body: new URLSearchParams({ type: 'AssignedNetworks', id_SIMap: selectedNode.id_SIMap })
  })
  .then(r => r.json())
  .then(result => {
    const holder = document.getElementById('mappingModalContainer');
    const delBtn = document.getElementById('mappingModalDeleteButton');
    const warn   = document.getElementById('mappingModalWarning');

    result.forEach(el => {
      const imageButton = nodeSelectButton(el.id_SINMap, el.image, el.name);
      imageButton.addEventListener('click', () => {
        // visual select
        holder.querySelectorAll('button').forEach(b => {
          b.classList.remove('btn-primary'); b.classList.add('btn-secondary');
        });
        imageButton.classList.remove('btn-secondary'); imageButton.classList.add('btn-primary');
        warn && warn.classList.add('d-none');

        const id_SINMap = imageButton.getAttribute('data-id');
        // enable delete and wire it
        delBtn.disabled = false;
        delBtn.replaceWith(delBtn.cloneNode(true));
        document.getElementById('mappingModalDeleteButton').addEventListener('click', () => {
          fetch('/update.json', {
            method: 'POST',
            body: new URLSearchParams({ type: 'DeleteAssignedNetwork', id_SINMap })
          }).then(() => mappingModal_interface());
        });
      });
      holder.appendChild(imageButton);
    });
  }); // :contentReference[oaicite:29]{index=29}
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

function uploadSettings() {
  debug('In uploadSettings()');

  const params = new URLSearchParams();
  params.set('type', 'Settings');
  // keep using your exporter so payload matches previous behavior
  params.set('settings', JSON.stringify(graphSettings.export()));

  return fetch('update.json', { method: 'POST', body: params })
    .then(r => r.json())
    .then(result => {
      console.log('Passed to update.json: Settings');
      console.log('Response:', result);
      if (result && result.msg) {
        // server signaled an error; surface it to caller
        throw new Error(String(result.msg));
      }
      // success path (you previously just commented out close/reload)
      return result;
    });
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