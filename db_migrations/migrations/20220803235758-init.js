'use strict';

var dbm;
var type;
var seed;
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

exports.up = function (db) {
  // Nothing as we just want to put a zero change in that puts migration
  // table in place
  mc.log("Initialising migrations.");
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
