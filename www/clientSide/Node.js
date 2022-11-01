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

		if (this.type == 'System'){
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
	update(node,graphNodeId){
		this.type = node.nodeType;

		this.id = graphNodeId;

		var standardSet = () => {
			this.name = node.name;
			this.image = node.image;
			this.description = node.description;
		}

		switch (node.nodeType){
			case 'System':
			case 'Subsystem':
				standardSet();
				this.id_system = node.id_system;
				this.idNo = node.id_system;				
				break;
			case 'Interface':
				standardSet();

				this.id_interface = node.id_interface;
				this.idNo = node.id_interface;

				if (node.features) {
					this.features = node.features.split(',');

					//Convert array of strings to numbers
					for (var i = 0; i < this.features.length; i++){ this.features[i] = parseInt(this.features[i]) }
					//console.log('Created features array:', this.features)
				} else {
					this.features = [];
				}				
				break;
			case 'SystemInterface':
				this.name = node.interfaceName;
				this.image = node.interfaceImage;
				this.description = node.description;
				this.id_ISMap = node.id_ISMap;
				this.idNo = node.id_ISMap;
				this.systemName = node.systemName;
				this.systemImage = node.systemImage;
				this.id_interface = node.id_interface;
				this.id_system = node.id_system;
				
				
				if (node.features) {
					this.features = node.features.split(',');

					//Convert array of strings to numbers
					for (var i = 0; i < this.features.length; i++){ this.features[i] = parseInt(this.features[i]) }
					//console.log('Created features array:', this.features)
				} else {
					this.features = [];
				}				
				break;

			case 'Link':
				standardSet();
				this.id_link = node.id_link;
				this.idNo = node.id_link;
				this.id_feature = node.id_feature;
				this.featureName = node.featureName;
				break;
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

		if (this.type == "System"){
			if (this.id_system) { data.id_system = this.id_system } //Indicates this should be considered an update, not an insert
			data.quantity = this.quantity;
			data.image = this.image;
			data.qtyInYears = this.qtyInYears;
		}

		if (this.type == "Interface" ){
			if (this.id_interface) { data.id_interface = this.id_interface } //Indicates this should be considered an update, not an insert
			data.image = this.image;
			data.features = this.features;
		}

		if (this.type == "Network" ){
			if (this.id_link) { data.id_link = this.id_link } //Indicates this should be considered an update, not an insert
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

		if (this.type == "System"){
			data.push(
				//{ label: 'Node ID', value: this.id_system },
				{ label: 'System Name', value: this.name },
				//{ label: 'Node Type', value: this.type },
				{ label: 'Quantities' },
				//{ label: 'Qty systems', value: this.quantity },
				{ label: 'Description', value: this.description }
			)            
		}

		if (this.type == "SystemInterface"){	//Removed "Interface"
			data.push(
				//{ label: 'Node ID', value: this.id_ISMap },
				{ label: 'Interface Name', value: this.name },
				{ label: 'Installed In', value: this.systemName },
				//{ label: 'Node Type', value: this.type },
				{ label: 'Interface Lifespan' },
				{ label: 'Description', value: this.description }
			)
		}

		if (this.type == "Link"){
			data.push(
				//{ label: 'Node ID', value: this.id_link },
				{ label: 'Network Name', value: this.name },
				{ label: 'Node Type', value: this.type },
				{ label: 'Implemented Feature', value: this.featureName },
				{ label: 'Description', value: this.description }
			)            
		}

		return data;
	}
}




