'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');
var async = require('async');
var Promise;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function(db) {
	var filePath = path.join(__dirname, 'sqls', '20221019222236-to-1-0-9-up.sql');
	return new Promise( function( resolve, reject ) {
	fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
		if (err) return reject(err);
		resolve(data);
	});
	})
	.then(function(data) {
		return db.runSql(data);
	})
	.then(
		console.log('test')

	)
};

exports.down = function(db, callback) {
	async.series([

		db.removeColumn.bind(db, 'SystemInterfaceToLinkMap', 'isPrimary'),

		db.renameColumn.bind(db, 'links', 'id_link', 'id_network'),
		db.renameColumn.bind(db, 'SystemInterfaceToLinkMap', 'id_link', 'id_network'),
		db.renameColumn.bind(db, 'SystemInterfaceToLinkMap', 'id_SILMap', 'id_SINMap'),
		db.renameColumn.bind(db, 'InterfaceToSystemMap', 'id_ISMap', 'id_SIMap'),
		db.renameColumn.bind(db, 'SystemInterfaceToLinkMap', 'id_ISMap', 'id_SIMap'),
		db.renameTable.bind(db, 'links', 'networks'),
		db.renameTable.bind(db, 'SystemInterfaceToLinkMap', 'SINMap'),
		db.renameTable.bind(db, 'InterfaceToSystemMap', 'SIMap'),
		db.renameTable.bind(db, 'SystemInterfaceToLinkMap', 'SINMap'),


		db.removeForeignKey.bind(db, 'technologies', 'fk_technologies_techCategory'),
		db.removeColumn.bind(db, 'technologies', 'id_techCategory'),
		db.dropTable.bind(db, 'technologyCategories', { ifExists: true } ),

		db.dropTable.bind(db, 'paramGroups', { ifExists: true } ),
		db.dropTable.bind(db, 'paramDefinitions', { ifExists: true } ),
		db.dropTable.bind(db, 'params', { ifExists: true } ),

		
	], callback);

};

exports._meta = {
	"version": 1
};
