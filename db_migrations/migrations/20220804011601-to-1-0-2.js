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
	mc.log("migrating to 1.0.2");
	// Table alterations
	async.series([
		db.dropTable.bind(db, 'SSMap', { ifExists: true }),
		//  db.removeForeignKey.bind(db, 'SINMap', 'fk_SINMap_SIMap', { dropIndex: false }),
		//  db.dropTable.bind(db, 'SIMap', { ifExists: true } ),
		db.dropTable.bind(db, 'subsystems', { ifExists: true }),
		db.dropTable.bind(db, 'SMap', { ifExists: true }),
		db.dropTable.bind(db, 'OSMap', { ifExists: true }), // populated table so need to modify not drop
		//  db.removeColumn.bind(db, 'OSMap', 'quantity'), // may also need an alteration to foriegn key to cascade
		db.dropTable.bind(db, 'OMap', { ifExists: true }), // Populated table and modifications not needed
		db.dropTable.bind(db, 'organisation', { ifExists: true }), // populated table and modifications not needed
		db.createTable.bind(db, 'SMap', {
			id_SMap: { type: 'int', autoIncrement: true, notNull: true, primaryKey: true },
			parent: {
				type: 'int', notNull: true, foreignKey: {
					name: 'fk_SMap_system_parent', table: 'systems', mapping: 'id_system',
					rules: { onDelete: 'No Action', onUpdate: 'No Action' }
				}
			},
			child: {
				type: 'int', notNull: true, foreignKey: {
					name: 'fk_SMap_system_child', table: 'systems', mapping: 'id_system',
					rules: { onDelete: 'CASCADE', onUpdate: 'No Action' }
				}
			}
		}),
		db.createTable.bind(db, 'organisation', {
			id_organisation: { type: 'int', notNull: true, autoIncrement: true, primaryKey: true },
			name: { type: 'varchar', length: 200 },
		}),
		db.createTable.bind(db, 'OMap', {
			id_OMap : { type:'int', notNull: true, autoIncrement: true, primaryKey: true },
			parent : { type:'int', notNull: true, foreignKey: {
				name: 'fk_OMap_organisation_parent', table: 'organisation', mapping: 'id_organisation',
				rules: { onDelete : 'No Action', onUpdate: 'No action' }
			}},
			child : { type:'int', notNull: true, foreignKey: {
				name:  'fk_OMap_organisation_child', table: 'organisation', mapping: 'id_organisation',
				rules: { onDelete : 'CASCADE', onUpdate: 'No action' }
			}}
		}),

		db.createTable.bind(db, 'OSMap', {
			id_OSMap : { type: 'int', notNull: true, autoIncrement: true, primaryKey: true },
			id_organisation: { type: 'int', notNull: true, foreignKey: { 
				name: 'fk_OSMap_organisation', table: 'organisation', mapping: 'id_organisation', 
				rules: { onDelete: 'No Action', onUpdate: 'No Action'}
				}
			},
			id_system: {
				type: 'int', notNull: true, foreignKey: {
					name: 'fk_OSMap_systems', table: 'systems', mapping: 'id_system',
					rules: { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
				}
			},
			quantity: { type: 'int', default: 0 },
		}),
		db.addColumn.bind(db, 'SIMap', 'name', { type: 'varchar', length: 45, defaultValue: '' }),
		db.addColumn.bind(db, 'networks', 'linkColor', { type: 'VARCHAR', length : 45, defaultValue: 'blue'  }),
		db.addColumn.bind(db, 'technologies', 'category', { type: 'VARCHAR', length : 45, defaultValue: '' }),
		db.addColumn.bind(db, 'systems', 'updateTime', { type: 'bigint', defaultValue: 0 }),
		db.addColumn.bind(db, 'systems', 'isSubsystem', { type: 'boolean', defaultValue: false, after: 'image' }),
		db.addColumn.bind(db, 'systems', 'distributedSubsystem', { type: 'boolean', defaultValue: false, after: 'isSubsystem'}),
		db.addColumn.bind(db, 'interfaces', 'updateTime', { type: 'bigint', defaultValue: 0 }),
	], callback);
};

exports.down = function(db, callback) {
	console.log('start')
	console.log(callback)
	async.series([

		db.removeColumn.bind(db, 'interfaces', 'updateTime'),
		db.removeColumn.bind(db, 'systems', 'distributedSubsystem'),
		db.removeColumn.bind(db, 'systems', 'isSubsystem'),
		db.removeColumn.bind(db, 'systems', 'updateTime'),
		db.removeColumn.bind(db, 'technologies', 'category'),
		db.removeColumn.bind(db, 'networks', 'linkColor'),

		db.dropTable.bind(db, 'OSMap', { ifExists: true } ),
		db.dropTable.bind(db, 'OMap', { ifExists: true } ),
		db.dropTable.bind(db, 'organisation', { ifExists: true } ),
		db.dropTable.bind(db, 'SMap', { ifExists: true } ),


		//Re-create the subsystems and SSMap tables
		db.createTable.bind(db, 'subsystems', {
			id_subsystem: { type: 'int', auto_increment: true, notNull: true, primaryKey: true },
			name: { type: 'VARCHAR', lenght: 45, comment: 'A brief description of the subsystem' },
			description: { type: 'LONGTEXT' }
		}),




		db.createTable.bind(db, 'SSMap', {
			id_SSMap: { type: 'int', auto_increment: true, notNull: true, primaryKey: true },
			id_system: { type: 'int', notNull: false, foreignKey: {
				name: 'fk_SSMap_system', table: 'systems', mapping: 'id_system',
				rules: { onDelete: 'No Action', onUpdate: 'No Action'}
				},
			},
			id_subsystem: { type: 'int', notNull: false, foreignKey: {
				name: 'fk_SSMap_subsystem', table: 'subsystems', mapping: 'id_subsystem',
				rules: { onDelete: 'No Action', onUpdate: 'No Action'}
				},
			},
		}),

		
//db.dropTable.bind(db, 'table', { ifExists: true } ),
//db.removeColumn.bind(db, 'table', 'column'),

  	], callback);
};

exports._meta = {
	"version": 1
};
