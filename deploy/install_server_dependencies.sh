#!/bin/bash
# Install the software required on the server.
# Must be run with privileges


# Ensure server is up to date
echo "System being updated"
Apt-get -y update
apt-get -y upgrade
echo "System updated"

#Install MySQL
apt-get -y install mysql-server

#Install NodeJS
apt-get -y install nodejs



