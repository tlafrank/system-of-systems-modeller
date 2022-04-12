#!/bin/bash

### Development environment deployment
read -n 1 -p "Do you wish to deploy a development environment (y/Y): " continue
echo ""
if [[ $continue =~ [yY] ]]; then

	read -n 1 -p "Install required npm packages (y/Y): " continue
	echo ""
	if [[ $continue =~ [yY] ]]; then
		#Install required packages
		npm --prefix $PWD/../www install
  
  		#Nodemon install?
	fi
else
	#Deploy a production server (NGINX?)
	echo "Deploying a production server has not been considered at this stage."
fi

