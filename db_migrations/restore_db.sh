#!/bin/bash
# Restore a DB dump
set -e


ADMINUSER=${USER}
ADMINPASS=${USER}


if [ -z ${1} ] || [ -z ${2} ]; then
    echo "usage: $0 <dst_db> <db_dump_file>"
    exit 1
fi

echo restoring to ${1}

echo "drop schema ${1}" | mysql -u ${ADMINUSER} --password=${ADMINPASS} 

echo "create database ${1}" | mysql -u ${ADMINUSER} --password=${ADMINPASS} &&
   cat ${2} | mysql -u ${ADMINUSER} --password=${ADMINPASS} ${1}

echo "grant all privileges on ${1}.* to 'rwUser'@'%'; flush privileges;" | mysql -u ${ADMINUSER} -p${ADMINPASS}
