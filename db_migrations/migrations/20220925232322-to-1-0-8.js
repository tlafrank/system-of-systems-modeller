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

/*
  This migration is likely to be overtaken by design changes, but is provided for
  consistency.
*/
exports.up = function(db, callback) {
  mc.log("migrating to 1.0.8");
  async.series([
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
	}})
  ], callback);
};

exports.down = function(db, callback) {

	async.series([
		db.dropTable.bind(db, 'cimMap', { ifExists: true } ),
		db.removeColumn.bind(db, 'systems', 'id_party'),
		db.dropTable.bind(db, 'parties', { ifExists: true } ),
		db.removeColumn.bind(db, 'systems', 'id_poc'),
		db.dropTable.bind(db, 'pocs', { ifExists: true } ),
  	], callback);
};

exports._meta = {
  "version": 1
};
