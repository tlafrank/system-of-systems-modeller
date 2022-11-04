'use strict';

var dbm;
var type;
var seed;
var async = require('async');
var mc = require('../migrate-common.js');

/**
	* We receive the dbmigrate dependency from dbmigrate initially.
	* This enables us to not have to rely on NODE_PATH.
	*/
exports.setup = function(options, seedLink) {
	dbm = options.dbmigrate;
	type = dbm.dataType;
	seed = seedLink;
};

exports.up = function(db, callback) {
	mc.log("migrating to 1.0.10");
	async.series([

		db.dropTable.bind(db, 'cimMap', { ifExists: true } ),
		db.removeForeignKey.bind(db, 'systems', 'fk_systems_parties'),
		db.removeColumn.bind(db, 'systems', 'id_party'),
		db.dropTable.bind(db, 'parties', { ifExists: true } ),
		db.removeForeignKey.bind(db, 'systems', 'fk_systems_pocs'),
		db.removeColumn.bind(db, 'systems', 'id_poc'),
		db.dropTable.bind(db, 'pocs', { ifExists: true } ),

		//Add the ability to define parameters for subsystems
		db.addColumn.bind(db, 'paramDefinitions', 'applicableToSubsystem', {type: 'INT', after: 'applicableToSystem', defaultValue: 0, notNull: true}),

		db.createTable.bind(db, 'exports',{
			id_export : { type: 'int', autoIncrement: true, primaryKey: true, notNull: true },
			name : { type: 'VARCHAR', length: 45, notNull : true },
			exportFormat: { type: 'VARCHAR', length: 45, notNull : true },
			exportObject: { type: 'JSON'}
		}),

		//Updates to allow the tracking of when certain records were updated
		db.addColumn.bind(db, 'links', 'updateTime', { type: 'bigint', after: 'description', defaultValue: 0 }),


	], callback)

	console.log('notes test here')

};

exports.down = function(db,callback) {
	async.series([
		
		db.addColumn.bind(db, 'SystemInterfaceToLinkMap', 'category', {type: 'VARCHAR', length : 45}),
		db.addColumn.bind(db, 'technologies', 'category', {type: 'VARCHAR', length : 45, defaultValue: '' }),

		db.createTable.bind(db, 'cimMap', {
			id_cimMap : { type : 'int', notNull : true, autoIncrement : true, primaryKey : true },
			id_system : { type : 'int', notNull : true, foreignKey : {
			name : 'fk_cimMap_system', table : 'systems', mapping : 'id_system',
			rules : { onDelete : 'CASCADE', onUpdate : 'No Action'}
			}},
			cimName : { type : 'varchar', length : 60, notNull : true },
			updateTime : { type : 'bigint'}
		}),

		db.createTable.bind(db, 'parties', {
			id_party : { type : 'int', notNull : true, autoIncrement : true, primaryKey : true },
			name : { type : 'varchar', length : 60, notNull : true },
			description : { type : 'longtext' },
			updateTime : { type : 'bigint'}
		  }),
		  db.addColumn.bind(db, 'systems', 'id_party',
			  { type : 'int', after: 'reference', foreignKey : { 
			  name : 'fk_systems_parties', table : 'parties', mapping : 'id_party',
			  rules : { onDelete : 'CASCADE', onUpdate : 'No Action' }
		  }}),
		  db.createTable.bind(db, 'pocs', {
			  id_poc : { type : 'int', notNull : true, autoIncrement : true, primaryKey : true },
			  name : { type : 'varchar', length : 60, notNull : true },
			  email : { type : 'varchar', length : 60 },
			  updateTime : { type : 'bigint'}
		  }),
		  db.addColumn.bind(db, 'systems', 'id_poc',
			  { type : 'int', after: 'id_party', foreignKey : { 
			  name : 'fk_systems_pocs', table : 'pocs', mapping : 'id_poc',
			  rules : { onDelete : 'SET NULL', onUpdate : 'No Action' }
		  }}),

		  db.removeColumn.bind(db, 'paramDefinitions', 'applicableToSubsystem'),
		  db.dropTable.bind(db, 'exports', { ifExists: true } ),

		  db.removeColumn.bind(db, 'links', 'updateTime'),
		  

	], callback)
};

exports._meta = {
	"version": 1
};
