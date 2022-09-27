#!/bin/bash
# Clone the DB for experimentation.
#set -x
set -e

ADMINUSER=$USER
ADMINPASS=$USER
: ${SRCDB:=db_sosmd}

if [ -z ${1} ]; then
    echo You must provide the name of the destination copy, e.g. db_Fred
    exit 1
fi

echo copying to ${1}

echo "drop schema ${1}" | mysql -u ${ADMINUSER} --password=${ADMINPASS} 

echo "create database ${1}" | mysql -u ${ADMINUSER} --password=${ADMINPASS} &&
   mysqldump -u ${ADMINUSER} --password=${ADMINPASS} ${SRCDB} | mysql -u ${ADMINUSER} --password=${ADMINPASS} ${1}

echo "grant all privileges on ${1}.* to 'rwUser'@'localhost'; flush privileges;" | mysql -u ${ADMINUSER} -p${ADMINPASS}
