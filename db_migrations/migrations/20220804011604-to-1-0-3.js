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
	mc.log("migrating to 1.0.3");
	async.series([
		db.dropTable.bind(db, 'systemClassMap', { ifExists: true }),
		db.dropTable.bind(db, 'classes', { ifExists: true }),
		db.removeColumn.bind(db, 'networks', 'linkColor'),
		db.removeColumn.bind(db, 'networks', 'class'),
		db.addColumn.bind(db, 'interfaceIssues', 'updateTime', {
			type: 'bigint', defaultValue: 0
		}),
		db.removeForeignKey.bind(db, 'quantities', 'fk_quantities_system', { dropIndex: false }),
		db.addForeignKey.bind(db, 'quantities', 'systems', 'id_system', { 'id_system': 'id_system' },
			{ onDelete: 'CASCADE', onUpdate: 'No Action' }),
		db.removeForeignKey.bind(db, 'tags', 'fk_tags_systems', { dropIndex: false }),
		db.runSql.bind(db, 'alter table tags drop key id_system_idx'), // not in schema update, and no standard api
		db.addForeignKey.bind(db, 'tags', 'systems', 'fk_tags_systems', { 'id_system': 'id_system' },
			{ onDelete: 'CASCADE', onUpdate: 'No Action' }),
		db.removeForeignKey.bind(db, 'OSMap', 'fk_OSMap_systems', { dropIndex: false }),
		db.addForeignKey.bind(db, 'OSMap', 'systems', 'fk_OSMap_systems', { 'id_system': 'id_system' },
			{ onDelete: 'CASCADE', onUpdate: 'No Action' })
	], callback);
};

exports.down = function(db, callback) {
	async.series([
		
	], callback);
};

exports._meta = {
	"version": 1
};
