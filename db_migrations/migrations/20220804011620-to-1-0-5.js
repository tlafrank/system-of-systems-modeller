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
	mc.log("migrating to 1.0.5");
	async.series([
		db.createTable.bind(db, 'AMap', {
			id_AMap: { type: 'int', autoIncrement: true, primaryKey: true, notNull: true },
			source: {
				type: 'int', notNull: true, foreignKey: {
					name: 'fk_AMap_systems_source', table: 'systems', mapping: 'id_system', rules: {
						onDelete: 'CASCADE', onUpdate: 'No Action'
					}
				}
			},
			destination: {
				type: 'int', notNull: true, foreignKey: {
					name: 'fk_AMap_systems_destination', table: 'systems', mapping: 'id_system', rules: {
						onDelete: 'CASCADE', onUpdate: 'No Action'
					}
				}
			}
		})
	], callback);
};

exports.down = function(db, callback) {
	async.series([

	], callback);
};

exports._meta = {
	"version": 1
};
