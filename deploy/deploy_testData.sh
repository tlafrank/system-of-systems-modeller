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
cp -R ../testData/images/ ../www/

