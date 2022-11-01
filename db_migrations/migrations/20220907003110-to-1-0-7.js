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
exports.setup = function (options, seedLink) {
	dbm = options.dbmigrate;
	type = dbm.dataType;
	seed = seedLink;
};

exports.up = function (db, callback) {
	mc.log("migrating to 1.0.7");
	async.series([
		db.createTable.bind(db, 'families', {
			id_family: { type: 'int', autoIncrement: true, primaryKey: true, notNull: true },
			name: { type: 'varchar', length: 60, notNull: true },
			description: { type: 'longtext', notNull: false }
		}
		),
		db.addColumn.bind(db, 'systems', 'id_family', { type : 'int', after: 'name' }),
		db.addColumn.bind(db, 'systems', 'version', { type : 'varchar', length : 60, after: 'id_family' }),
		db.addForeignKey.bind(db, 'systems', 'families', 'fk_systems_families', { 'id_family' : 'id_family' },
			{ onDelete : 'CASCADE', onUpdate : 'No Action' }),
	], callback);
};

exports.down = function(db, callback) {
	async.series([
		db.removeForeignKey.bind(db, 'systems', 'fk_systems_families'),
		db.removeColumn.bind(db, 'systems', 'id_family'),
		db.removeColumn.bind(db, 'systems', 'version'),		
		db.dropTable.bind(db, 'families', { ifExists: true } ),

	], callback);


};

exports._meta = {
	"version": 1
};
