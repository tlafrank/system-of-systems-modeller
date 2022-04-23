class Node {

	constructor(){
		this.image = 'tba.svg';
		this.name='';
		this.description = '';
		this.features = [];
		this.qtyInYears = [];
	}

	//Check that all node data is valid
	checkData(){
		let flag = true;
		this.err = [];

		if (this.type == 'Subsystem'){
			if (this.name == ""){ flag = false; this.err.push({err: 'No name provided.'})}
			if (this.image == ""){ flag = false; this.err.push({err: 'No image provided.'})}
			if (this.quantity == ""){ flag = false; this.err.push({err: 'No quantity provided.'})}
		}

		if (this.type == 'Interface'){
			if (this.name == ""){ flag = false; this.err.push({err: 'No name provided.'})}
			if (this.image == ""){ flag = false; this.err.push({err: 'No image provided.'})}
		}

		if (this.type == 'Network'){
			if (this.name == ""){ flag = false; this.err.push({err: 'No name provided.'})}
			if (this.image == ""){ flag = false; this.err.push({err: 'No image provided.'})}
		}

		if (this.type == 'Feature'){
			if (this.name == ""){ flag = false; this.err.push({err: 'No name provided.'})}
		}
		return flag;
	}

	getValidationErrors(){
		return this.err;
	}

	setDescription(desc){ 
		if (desc) {
			this.description = desc;
		} else {
			this.description = '';
		}
	}
	setName(name){ this.name = name; }


	
	/**
	 * @description Load the details into this Node object
	 * 
	 * @param  {} node
	 */
	update(node){
		this.type = node.type;

		var standardSet = () => {
			this.name = node.name;
			this.image = node.image;
			this.description = node.description;
		}

		if (node.type == 'Subsystem'){
			standardSet();
			
			this.id_subsystem = node.id_subsystem;
			this.isJoint = node.isJoint;
		}

		if (node.type == 'Interface'){
			standardSet();
			this.id_interface = node.id_interface;

			if (node.features) {
				this.features = node.features.split(',');

				//Convert array of strings to numbers
				for (var i = 0; i < this.features.length; i++){ this.features[i] = parseInt(this.features[i]) }
				//console.log('Created features array:', this.features)
			} else {
				this.features = [];
			}
		}

		if (node.type == 'SubsystemInterface'){
			this.name = node.interfaceName;
			this.image = node.interfaceImage;
			this.description = node.description;
			this.id_SIMap = node.id_SIMap;
			this.subsystemName = node.subsystemName;
			this.subsystemImage = node.subsystemImage;
			this.id_interface = node.id_interface;
			this.id_subsystem = node.id_subsystem;
			
			
			if (node.features) {
				this.features = node.features.split(',');

				//Convert array of strings to numbers
				for (var i = 0; i < this.features.length; i++){ this.features[i] = parseInt(this.features[i]) }
				//console.log('Created features array:', this.features)
			} else {
				this.features = [];
			}
			
		}

		if (node.type == 'Network'){
			standardSet();
			this.id_network = node.id_network;
			this.id_feature = node.id_feature;
			this.featureName = node.featureName;
		}
	}


	/**
	 * @description Returns the Node object for transfer to the server
	 * 
	 */
	submitToServer(){
		var data = {};

		//Validate data

		//Common fields
		data.type = this.type
		data.name = this.name;
		data.description = this.description;

		if (this.type == "Subsystem"){
			if (this.id_subsystem) { data.id_subsystem = this.id_subsystem } //Indicates this should be considered an update, not an insert
			data.quantity = this.quantity;
			data.image = this.image;
			data.isJoint = this.isJoint;
			data.qtyInYears = this.qtyInYears;
		}

		if (this.type == "Interface" ){
			if (this.id_interface) { data.id_interface = this.id_interface } //Indicates this should be considered an update, not an insert
			data.image = this.image;
			data.features = this.features;
		}

		if (this.type == "Network" ){
			if (this.id_network) { data.id_network = this.id_network } //Indicates this should be considered an update, not an insert
			data.image = this.node.image;
			data.id_feature = this.features[0];
		}

		if (this.type == "Feature" ){

		}
		
		return data;
	}

	/**
	 * @description Returns an arr of the field labels and their associated value for the current node (for the selected node details table)
	 * 
	 */
	getNodeDetails(){
		var data = [];

		if (this.type == "Subsystem"){
			data.push(
				//{ label: 'Node ID', value: this.id_subsystem },
				{ label: 'Subsystem Name', value: this.name },
				//{ label: 'Node Type', value: this.type },
				{ label: 'Quantities' },
				//{ label: 'Qty subsystems', value: this.quantity },
				{ label: 'Description', value: this.description }
			)            
		}

		if (this.type == "SubsystemInterface"){	//Removed "Interface"
			data.push(
				//{ label: 'Node ID', value: this.id_SIMap },
				{ label: 'Interface Name', value: this.name },
				{ label: 'Installed In', value: this.subsystemName },
				//{ label: 'Node Type', value: this.type },
				{ label: 'Interface Lifespan' },
				{ label: 'Description', value: this.description }
			)
		}

		if (this.type == "Network"){
			data.push(
				//{ label: 'Node ID', value: this.id_network },
				{ label: 'Network Name', value: this.name },
				{ label: 'Node Type', value: this.type },
				{ label: 'Implemented Feature', value: this.featureName },
				{ label: 'Description', value: this.description }
			)            
		}

		return data;
	}
}




