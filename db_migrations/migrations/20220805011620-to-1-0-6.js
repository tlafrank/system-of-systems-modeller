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
	mc.log("migrating to 1.0.6");
	async.series([
		db.removeForeignKey.bind(db,
			"issuesToSystemsMap", "fk_issuesToSystemsMap_interfaceIssue", { dropIndex: false }
		),
		db.addForeignKey.bind(db, "issuesToSystemsMap",
			"interfaceIssues", "fk_issuesToSystemsMap_interfaceIssue",
			{ "id_interfaceIssue": "id_interfaceIssue" },
			{ onDelete: 'CASCADE', onUpdate: "No Action" }),
		db.removeForeignKey.bind(db,
			"issuesToSystemsMap", "fk_issuesToSystemsMap_system", { dropIndex: false }
		),
		db.addForeignKey.bind(db, "issuesToSystemsMap",
			"systems", "fk_issuesToSystemsMap_system",
			{ "id_system": "id_system" },
			{ onDelete: 'CASCADE', onUpdate: "No Action" })
	], callback);
};

exports.down = function (db) {
	return null;
};

exports._meta = {
	"version": 1
};
