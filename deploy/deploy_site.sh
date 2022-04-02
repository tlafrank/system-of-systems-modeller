#!/bin/bash


### Development environment deployment



#Nodemon install?


### Production environment deployment (NGINX?)
# Copy the www directory to /var/www
cp -r ../www/ /var/

#Install npm dependencies
npm --prefix /var/www/ install
