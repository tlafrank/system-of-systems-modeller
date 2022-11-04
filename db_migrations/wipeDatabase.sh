#!/bin/bash
# assumes you are running as root

: ${DST_DB:=db_sosm}

echo "SET FOREIGN_KEY_CHECKS=0; DROP SCHEMA ${DST_DB}" | mysql
echo "CREATE DATABASE ${DST_DB};" | mysql