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

/*
  This migration is likely to be overtaken by design changes, but is provided for
  consistency.
*/
exports.up = function(db, callback) {
  aysnc.series([
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
    // Differs from schema update file by keeping to developing style guide.
    db.addColumn.bind(db, 'systems', 'id_party',
      { type : 'int', foreignKey : { 
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
      { type : 'int', foreignKey : { 
        name : 'fk_systems_pocs', table : 'pocs', mapping : 'id_poc',
        rules : { onDelete : 'SET NULL', onUpdate : 'No Action' }
      }})
  ], callback);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
