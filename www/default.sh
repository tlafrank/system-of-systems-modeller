#!/bin/bash

export SOSM_USER=sosmUser
export SOSM_DB=db_sosm
export SOSM_PASS=dnRk384!djrLdo}836w:


if [ -z "$1" ]
then
  read -p "Which port would you like to start the server on (Above 3000 recommended): " port
else
  port="$1"
fi

export SOSM_PORT=$port

echo "Starting SOSM with main DB ($SOSM_USER - $SOSM_DB - $SOSM_PORT)"

#nodejs app.js

#Nodemon automattically reloads the nodeJS server on changes to web apps files
nodemon www/app.js
