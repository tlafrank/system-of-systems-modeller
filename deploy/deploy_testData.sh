#!/bin/bash
# Script to deploy test data to SOSM.

#Execute sql 
##Remove all current data
echo "Rebuilding schema"
mysql < ../sql/deploySchema.sql

##Deploy alarm system data
echo "Deploying alarm system"
mysql < ../testData/alarmSystem.sql

#Copy images
echo "Copying images"
<<<<<<< HEAD
<<<<<<< HEAD
cp -R ../testData/images/ ../www/
=======
cp -R ../testData/images/ ../www/images/
>>>>>>> ab1c28d... Fixing sql users
=======
cp -R ../testData/images/ ../www/
>>>>>>> 680a648... Updated testdata

