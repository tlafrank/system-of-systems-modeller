#!/bin/bash

echo "SET FOREIGN_KEY_CHECKS=0; DROP SCHEMA db_sosm" | mysql
echo "CREATE DATABASE db_sosm;" | mysql