'use strict';

var dbm;
var type;
var seed;
var aysnc = require('async');

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
	aysnc.series([
		db.addColumn.bind(db, 'systems', 'category', {
			type: 'varchar', length: 64
		}),
		db.addColumn.bind(db, 'SIMap', 'category', {
			type: 'varchar', length: 64
		}),
		db.addColumn.bind(db, 'networks', 'category', {
			type: 'varchar', length: 64
		}),
		db.removeForeignKey.bind(db, 'SINMap', 'fk_SINMap_SIMap', { dropIndex: false }),
		db.addForeignKey.bind(db, 'SINMap', 'SIMap', 'fk_SINMap_SIMap', { 'id_SIMap' : 'id_SIMap' },
			{ onDelete : 'CASCADE', onUpdate : 'No Action' })
	], callback);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
