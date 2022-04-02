class NodeModal {

	constructor(type, existingNode){
		console.log('new NodeModal')
		if (existingNode){ 
			//Modal is in edit mode
			this.node = existingNode;
			this.existing = true;
		} else {
			//Modal is in new node/feature mode
			this.node = new Node();
			this.existing = false;
		}
		this.node.type = type;
	}

	isNew(){
		if (this.existing){
			return false;
		} else {
			return true;
		}
	}



	//Returns the fields required for the update/add node modal based on the type of node or feature
	getNodeModal(){
		var data = [];
		
		//Common fields at the beginning of the form
		data.push(
			{ type: 'text', id: 'nodeModalname', label: 'Name', value: this.node.name, columnName: 'name' },
		)

		//Interface node specific
		if (this.node.type == "Interface" ){
			data.push(
				{ type: 'img', id: 'nodeModalimage', image: this.node.image, columnName: 'image'},
				{ type: 'select', id: 'nodeModalFeaturesAvailable', label: 'Available Features', columnName: 'id_feature', selectType: 'featuresAvailable', multiple: true, toServer: false},
				{ type: 'button', id: 'nodeModalFeaturesAddButton', label: 'Attach Feature', fromId: 'nodeModalFeaturesAvailable', toId: 'nodeModalFeaturesAttached'},
				{ type: 'button', id: 'nodeModalFeaturesRemoveButton', label: 'Unattach Feature', fromId: 'nodeModalFeaturesAttached', toId: 'nodeModalFeaturesAvailable'},
				{ type: 'select', id: 'nodeModalFeaturesAttached', label: 'Attached Features', selectType: 'featuresAttached', multiple: true, toServer: true},
				{ type: 'end', available: 'nodeModalFeaturesAvailable', attached: 'nodeModalFeaturesAttached'},
				{ type: 'button-swapOptions', id: 'nodeModalFeaturesAddButton', fromId: 'nodeModalFeaturesAvailable', toId: 'nodeModalFeaturesAttached'},
				{ type: 'button-swapOptions', id: 'nodeModalFeaturesRemoveButton', fromId: 'nodeModalFeaturesAttached', toId: 'nodeModalFeaturesAvailable'},
			)
		}

		//Network node specific
		if (this.node.type == "Network" ){
			data.push(
				{ type: 'img', id: 'nodeModalimage', image: this.node.image, columnName: 'image'},
				{ type: 'select', id: 'nodeModalFeature', label: 'Associated Feature', columnName: 'id_feature', multiple: false, toServer: true},
				{ type: 'end', available: 'nodeModalFeature'},
			)
		}

		//Common fields at the end of the form
		data.push(
			{ type: "textarea", id: 'nodeModaldescription', label: 'Description', value: this.node.description, columnName: 'description' },
		)
		return data;
	}

	//Checks which select box this particular feature should reside in
	matchFeature(testFeature){

		if (this.node.type == 'Interface'){
			//Check if the feature should be available or attached
			if (this.node.features.includes(testFeature)) { //Feature is attached
				return false;
			} else { //Feature is available
				return true;
			}
		} else {
			return true;
		}
	}
}

