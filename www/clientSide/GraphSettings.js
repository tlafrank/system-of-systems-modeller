/**
 * 
 * 
 * @author TL
 * @description Used to track the settings applied to the graph across sessions
 */
class GraphSettings{
	constructor(){
		//Setup localStorage with default values if not already populated
		//debug(1, 'In GraphSettings Class');

		//Constants
		this.graphLayoutNames = ['cose', 'breadthfirst', 'circle', 'concentric', 'grid', 'random'];
		this.defaultLandingPageOptions = ['graph', 'summary', 'issues'];

		//localStorage.clear();

		//Set default values client-side if they don't already exist
		if(!localStorage.getItem('activeYear')) { localStorage.setItem('activeYear', 2022); }
		if(!localStorage.getItem('refreshOnUpdate')) { localStorage.setItem('refreshOnUpdate', 0); }
		if(!localStorage.getItem('ignoreYears')) { localStorage.setItem('ignoreYears', 0); }
		if(!localStorage.getItem('showInterfaces')) { localStorage.setItem('showInterfaces', 1); }
		if(!localStorage.getItem('defaultLandingPage')) { localStorage.setItem('defaultLandingPage', 'graph'); }
		if(!localStorage.getItem('showIssues')) { localStorage.setItem('showIssues', 1); }
		if(!localStorage.getItem('includedFilterTag')) { localStorage.setItem('includedFilterTag', ''); }
		if(!localStorage.getItem('excludedFilterTag')) { localStorage.setItem('excludedFilterTag', ''); }
		if(!localStorage.getItem('linksAsNodes')) { localStorage.setItem('linksAsNodes', 0); }
		if(!localStorage.getItem('displaySubsystems')) { localStorage.setItem('displaySubsystems', 0); }
		if(!localStorage.getItem('pruneEdgeLinks')) { localStorage.setItem('pruneEdgeLinks', 0); }
		if(!localStorage.getItem('yearMin')) { localStorage.setItem('yearMin', 2020); }
		if(!localStorage.getItem('yearMax')) { localStorage.setItem('yearMax', 2030); }

		//Graph specific
		if(!localStorage.getItem('graphLayoutName')) { localStorage.setItem('graphLayoutName', 'cose') }
		if(!localStorage.getItem('graphLayoutRows')) { localStorage.setItem('graphLayoutRows', 5) }
		if(!localStorage.getItem('graphLayoutAnimate')) { localStorage.setItem('graphLayoutAnimate', 0) }

		//Issue specific
		if(!localStorage.getItem('severityLevel')) { localStorage.setItem('severityLevel', 0) }
		
		//debug(3,localStorage)
	}
	
	/**
	 * @description 
	 * 
	 * @returns 
	 */
	 getGraphLayout(){

		var layout = {
			name: localStorage.getItem('graphLayoutName'),
			rows: localStorage.getItem('graphLayoutRows'),
			animate: localStorage.getItem('graphLayoutAnimate'),
		}
		return layout;
	 }

	/**
	 * @description 
	 * 
	 * @returns An array containing objects which define the inputs required to update the objects
	 * values
	 */
	
	getFormControls(){
		return [
			{ type: 'heading', id: 'generalHeading', align: 'left', text: 'General Settings' },
			{ type: 'select', id: 'defaultLandingPage', label: 'Default Landing Page', value: localStorage.getItem('defaultLandingPage'), options: this.defaultLandingPageOptions },
			{ type: 'checkbox', id: 'refreshOnUpdate', label: 'Redraw the graph on update', value: localStorage.getItem('refreshOnUpdate') },
			{ type: 'number', id: 'yearMin', label: 'Minimum Year', value: localStorage.getItem('yearMin')},
			{ type: 'number', id: 'yearMax', label: 'Minimum Year', value: localStorage.getItem('yearMax')},

			

			{ type: 'heading', id: 'graphHeading', align: 'left', text: 'Graph Settings' },
			{ type: 'select', id: 'graphLayoutName', label: 'Graph Layout', value: localStorage.getItem('graphLayoutName'), options: this.graphLayoutNames },
			{ type: 'checkbox', id: 'showInterfaces', label: 'Display Interface Nodes', value: localStorage.getItem('showInterfaces') },
			{ type: 'checkbox', id: 'showIssues', label: 'Display issues on graph', value: localStorage.getItem('showIssues') },
			{ type: 'checkbox', id: 'pruneEdgeLinks', label: 'Prune links with only one interface', value: localStorage.getItem('pruneEdgeLinks') },

			{ type: 'heading', id: 'graphHeading', align: 'left', text: 'Issue Settings' },
			{ type: 'number', id: 'severityLevel', label: 'Minimum Severity to display', value: localStorage.getItem('severityLevel') },


			{ type: 'heading', id: 'graphHeading', align: 'left', text: 'Not Yet Implemented' },
			//{ type: 'checkbox', id: 'ignoreYears', label: 'Show all subsystems regardless of their active years', value: localStorage.getItem('ignoreYears') },
			
			{ type: 'checkbox', id: 'linksAsNodes', label: 'Consolidate Links as Nodes', value: localStorage.getItem('linksAsNodes') },
			{ type: 'checkbox', id: 'displaySubsystems', label: 'Display Subsystems', value: localStorage.getItem('displaySubsystems') },
		];
	}
	

	/**
	 * @description Exports the contents of this object for saving to the graphSettings
	 * table in the database.
	 * 
	 * @returns	The array of settings containing {key, value} pairs for posting to the server
	 */
	export(){

		//Iterate through the settingsArr and update the values
		for (var i = 0; i < this.settingsArr.length; i++){
			this.settingsArr[i].value = this[this.settingsArr[i].keyName]	
		}
		console.log('export ', this.settingsArr)
		return this.settingsArr;
	}
}




//Cy layout object
var cyLayout = {
	//name: 'breadthfirst',
	name: 'cose',
	rows: 5,
	animate: false,
}


/*
class GraphSettings{
	constructor(){

		this.graphLayouts = ['cose', 'breadthfirst', 'circle', 'concentric', 'grid', 'random'];
		this.settingsArr = [];

		this.settingsArr.push({keyName: 'activeYear', value: 2022})
		this.settingsArr.push({keyName: 'refreshOnUpdate', value: false})
		this.settingsArr.push({keyName: 'ignoreYears', value: false})
		this.settingsArr.push({keyName: 'showInterfaces', value: 1})
		this.settingsArr.push({keyName: 'graphLayout', value: 'cose'})
		this.settingsArr.push({keyName: 'includedFilterTag', value: ''})
		this.settingsArr.push({keyName: 'excludedFilterTag', value: ''})
		this.settingsArr.push({keyName: 'mainPage', value: 'graph'})
		this.settingsArr.push({keyName: 'showIssues', value: 1})

		this.update(this.settingsArr);

	}

	/**
	 * @description 
	 * 
	 * @returns An array containing objects which define the inputs required to update the objects
	 * values
	 */
	/*
	getFormControls(){
		return [
			{ type: 'checkbox', id: 'showInterfaces', label: 'Display Interface Nodes', value: this.showInterfaces },
			{ type: 'checkbox', id: 'refreshOnUpdate', label: 'Redraw the graph on update', value: this.refreshOnUpdate },
			{ type: 'checkbox', id: 'ignoreYears', label: 'Show all subsystems regardless of their active years', value: this.ignoreYears },
			{ type: 'select', id: 'graphLayout', label: 'Graph Layout', value: this.graphLayout, options: this.graphLayouts },
			{ type: 'number', id: 'activeYear', label: 'Active Year', value: this.activeYear },
			{ type: 'text', id: 'includedFilterTag', label: 'Include subsystems with these tags', value: this.includedFilterTag },
			{ type: 'text', id: 'excludedFilterTag', label: 'Exclude subsystems with these tags', value: this.excludedFilterTag },
			{ type: 'select', id: 'mainPage', label: 'Graph Layout', value: this.graphLayout, options: ['graph', 'summary', 'issues'] },
			{ type: 'checkbox', id: 'showIssues', label: 'Display issues on graph', value: this.showIssues },
		];
	}


    /**
     * @description Updates this object with the contents of the graphSettings table 
     * in the database.
     * 
     * @param  {} updateArr
     */
	/*
    async update(updateArr){
		
		updateArr.forEach((element) => {
			//debug(element)
			this[element.keyName] = element.value;
			//debug('updating ' + element.keyName + ' to ' + this[element.keyName])
		});
    }



	/**
	 * @description Exports the contents of this object for saving to the graphSettings
	 * table in the database.
	 * 
	 * @returns	The array of settings containing {key, value} pairs for posting to the server
	 */
	/*
	export(){

		//Iterate through the settingsArr and update the values
		for (var i = 0; i < this.settingsArr.length; i++){
			this.settingsArr[i].value = this[this.settingsArr[i].keyName]	
		}
		console.log('export ', this.settingsArr)
		return this.settingsArr;
	}

	getLayout(){
		//debug('layout called');
		let layout = {
			name: this.graphLayout,
			rows: 5,
			animate: false //Stops the cose layout from bounicing all over the place
		}

		//debug(layout)
		return layout
	}

}


//Cy styling objects
var cyStyle = [ // the stylesheet for the graph
	{
		selector: 'node',
		style: {
			'width': '100px',
			'background-width': '92px',
			'height': '100px',
			'background-height': '92px',
			'background-color': 'white',
			'background-image': 'data(filename)',
			'background-fit': 'none',
			'label': 'data(name)',
			'border-color': 'black',
			'border-width': '3px'
		}
	},
	{
		selector: '.network',
		style: {
			'width': '80px',
			'background-width': '80px',
			'height': '80px',
			'background-height': '80px',
			'border-color': 'blue',
			'shape': 'round-octagon'
		}
	},
	{
		selector: '.interface',
		style: {
			'width': '60px',
			'background-width': '52px',
			'height': '60px',
			'background-height': '52px',
			'border-color': 'black',
		}
	},

	{ selector: '.critical', style: { 'background-color': 'red' }},
	{ selector: '.warning', style: { 'background-color': '#ffcc00' }},
	{ selector: '.notice', style: { 'background-color': '#33cc33' }},



	{ selector: '.red', style: { 'line-color': 'red'	}},
	{ selector: '.blue', style: { 'line-color': 'blue'	}},
	{ selector: '.amber', style: { 'line-color': 'orange'	}},

	{
		selector: 'edge',
		style: {
			'width': 3,
			'line-color': '#000',
			'curve-style': 'bezier',
		}
	},
	{
		selector: 'edge[name]',
		style: {
			'label': 'data(name)',
			'color': 'black',
			'text-border-color': 'green',
			'text-border-opacity': 1,
			'text-border-width': 2,
			'line-color': 'orange',
			
			'text-background-padding': 1,
			'text-background-color': 'white',
			'text-background-opacity': 1,
		}
	},
	//Need to add styling for various subsystem classes
		
	{
		selector: '.class1',
		style: {
			'border-color': 'black',
		}
	},
	{
		selector: '.class2',
		style: {
			'border-color': 'orange',
		}
	},
	{
		selector: '.class3',
		style: {
			'border-color': 'purple',
		}
	},
	{
		selector: '.class4',
		style: {
			'border-color': 'green',
		}
	},

	{
		selector: '.proposed',
		style: {
			'line-style': 'dashed',
			'line-color': 'grey',
			'border-style': 'dashed',
			'border-color': 'grey',
		}
	},
];

//Cy layout object
var cyLayout = {
	//name: 'breadthfirst',
	name: 'cose',
	rows: 5,
	animate: false,
}
*/