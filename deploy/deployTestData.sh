#!/bin/bash
# Script to deploy test data to SOSM.

# Move to directory so relative references all work.
cd $(dirname $(readlink -f $0))

# Check the user is going to be able to execute mysql to the server.
if ! `mysql >/dev/null 2>&1 <<EOF
exit
EOF`;
then
    echo Need to operate as user who can connect to the DB, e.g. sudo this script.
    exit 1
fi

#Execute sql 
##Remove all current data
echo "Rebuilding schema"
mysql < ../sql/deploySchema.sql

##Deploy alarm system data
echo "Deploying alarm system"
mysql < ../testData/alarmSystem.sql

#Copy images
echo "Copying images"
cp -R ../testData/images/ ../www/


