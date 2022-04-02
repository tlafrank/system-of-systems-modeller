#!/bin/bash


### Development environment deployment
read -n 1 -p "Do you wish to deploy a development environment only (y/Y): " devEnv
if [[ $devEnv =~ [yY] ]]; then
  #Install required packages
  npm --prefix $PWD/../www install
  
 
  #Nodemon install?

fi





### Production environment deployment (NGINX?)
# Copy the www directory to /var/www
cp -r ../www/ /var/

#Install npm dependencies
npm --prefix /var/www/ install
