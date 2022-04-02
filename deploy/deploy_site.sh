#!/bin/bash

# Copy the www directory to /var/www
cp -r ../www/ /var/

#Install npm dependencies
npm --prefix /var/www/ install

#Nodemon install?


#Option for production environment (NGINX?)
