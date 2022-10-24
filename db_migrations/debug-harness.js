/*
    Debug harness, so execute your migrations up to the one you want to test:
    $ SRCDB=db_sosm ./clone_db.sh db_mig_test && ./db-m up -c 8
    Then you can all this with debugging set
    $ NODE_PATH=../www/node_modules nodejs --inspect-brk debug-harness.js
    Then use your chrome (or similar) browser to go to:
    chrome://inspect/#devices
    and you can debug the latest migration.
    It can worth using:
    ...
    debugger;
    ...
    To ensure you break at somewhere in your script because of the framework
    around db-migrate.
*/
var DBMigrate = require('db-migrate');

//getting an instance of dbmigrate
var dbmigrate = DBMigrate.getInstance(true);

//execute any of the API methods
dbmigrate.up();