class System {

    constructor(systemRow, quantitiesRows, showInterfaces){
		
		this.id_system = systemRow.id_system;
		this.name = systemRow.name;
		this.image = systemRow.image;
		this.qtyYears = [];
		this.qtySystemsThisYear = 0;
		this.interfaces = [];
		this.showInterfaces = showInterfaces;

		//Make the years/qty array
		for (var i = 0; i < 100; i++){
			this.qtyYears.push({ year: 2000 + i });
		}

		//Populate the years/qty array with data from quantitiesRow
		quantitiesRows.forEach((element) => {
			this.qtyYears[element.year - 2000].quantity = element.quantity;
		})

		//Complete the years/qty array
		var lastQuantity = 0;
		for (var i = 0; i < this.qtyYears.length; i++){
			if (this.qtyYears[i].quantity === undefined){
				this.qtyYears[i].quantity = lastQuantity;
			} else {
				lastQuantity = this.qtyYears[i].quantity;
			}
		}
    }

	
	/**
	 * @description Returns the classes to apply to the system node
	 * 
	 * 
	 */
	getSystemCyClasses(){
		var classString = 'system';
		//Handle classes (class1, class2, etc)

		return classString;
	}

	getInterfaceClasses(iface){
		var classString = 'interface';
		var severity = '';

		if (iface.isProposed){
			classString += ' proposed';
		}

		if (iface.issues.length > 0){

			iface.issues.forEach((element) => {
				switch (element.severity){
					case 'critical':
						severity = 'critical'
					break;
					case 'warning':
						if (severity != 'critical'){
							severity = 'warning'
						}
					break;
					case 'notice':
						if (severity != 'critical' || severity != 'warning'){
							severity = 'notice'
						}
					break;
					
				}
			

			})
			classString += ' ' + severity;

		}

		return classString;
	}

	getSystemToSIClasses(iface){
		var classString = '';
		
		if (iface.isProposed){
			classString += ' proposed'
		}

		return classString
	}

	/**
	 * @description Determines if this system exists in the focus year
	 * 
	 * @param  {} year
	 */
	presentInYear(year){
		if (this.qtyYears[year-2000].quantity > 0){
			this.qtySystemsThisYear = this.qtyYears[year-2000].quantity;
			return true;
		} else {
			return false;
		}
	}


	

	getCyObject(){

		var returnArr = []

		//System node
		returnArr.push({
			group: 'nodes',
			data: {
				id: 'node_s_' + this.id_system,
				idNo: this.id_system,
				id_system: this.id_system,
				nodeType: 'System',
				name: this.name,
				filename: './images/' + this.image,
			},
			classes: this.getSystemCyClasses()
		})

		if(this.showInterfaces == true){
			//System interface nodes and their edges with the system
			this.interfaces.forEach((element) => {
				//this.debug(element)
				//Add interface node
				returnArr.push({
					group: 'nodes',
					data: {
						id: 'node_si_' + element.id_SIMap,
						idNo: this.id_SIMap,
						id_system: this.id_system,
						id_SIMap: element.id_SIMap,
						nodeType: 'SystemInterface',
						name: element.name,
						filename: './images/' + element.image,
					},
					classes: this.getInterfaceClasses(element)
				})

				//Add S-SI edge
				returnArr.push({
					group: 'edges',
					data: {
						id: 'edge_s_si_' + element.id_SIMap,
						idNo: element.id_SIMap,
						source: 'node_s_' + this.id_system,
						target: 'node_si_' + element.id_SIMap,
					},
					classes: this.getSystemToSIClasses(element)
				})

				//Network edges
				element.networks.forEach((element2) => {
					//this.debug('network edge')
					returnArr.push({
						group: 'edges',
						data: {
							id: 'edge_si_' + element.id_SIMap + '_n_' + element2.id_network,
							idNo: element2.id_network,
							id_network: element2.id_network,
							source: 'node_si_' + element.id_SIMap,
							target: 'node_n_' + element2.id_network,
							name: 'IF001',
						},
						classes: 'blue'
					})
				})
			})

		} else {
			//System to network edges
			this.interfaces.forEach((element) => {
				//this.debug('element')
				//this.debug(element)
				
				element.networks.forEach((element2) => {
					//this.debug('element2')
					//this.debug(element2)
					returnArr.push({
						group: 'edges',
						data: {
							id: 'edge_s_' + this.id_system + '_n_' + element2.id_network,
							idNo: element2.id_network,
							id_network: element2.id_network,
							source: 'node_s_' + this.id_system,
							target: 'node_n_' + element2.id_network,
						},
						classes: 'orange'
					})
				})

			})

		}




		return returnArr;
	}

	debug(msg){
		console.log(msg);
	}
}

module.exports = System;
