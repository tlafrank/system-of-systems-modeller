'use strict';

var dbm;20803235759
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

//Deploys the initial schema
exports.up = function(db) {
  var filePath = path.join(__dirname, 'sqls', '20220803235759-to-1-0-1-up.sql');
  return new Promise( function( resolve, reject ) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
      if (err) return reject(err);
      console.log('received data: ' + data);

      resolve(data);
    });
  })
  .then(function(data) {
    return db.runSql(data);
  });
};

exports.down = function(db, callback) {
	async.series([
		db.dropTable.bind(db, 'dataExchanges', { ifExists: true } ),
		db.dropTable.bind(db, 'tags', { ifExists: true } ),
		db.dropTable.bind(db, 'systemClassMap', { ifExists: true } ),
		db.dropTable.bind(db, 'classes', { ifExists: true } ),
		db.dropTable.bind(db, 'issuesToSystemsMap', { ifExists: true } ),
		db.dropTable.bind(db, 'interfaceIssues', { ifExists: true } ),
		db.dropTable.bind(db, 'quantities', { ifExists: true } ),
		db.dropTable.bind(db, 'TIMap', { ifExists: true } ),
		db.dropTable.bind(db, 'SINMap', { ifExists: true } ),
		db.dropTable.bind(db, 'SIMap', { ifExists: true } ),
		db.dropTable.bind(db, 'SSMap', { ifExists: true } ),
		db.dropTable.bind(db, 'networks', { ifExists: true } ),
		db.dropTable.bind(db, 'interfaces', { ifExists: true } ),
		db.dropTable.bind(db, 'technologies', { ifExists: true } ),		
		db.dropTable.bind(db, 'subsystems', { ifExists: true } ),
		db.dropTable.bind(db, 'systems', { ifExists: true } ),
  	], callback);
};



exports._meta = {
  "version": 1
};
