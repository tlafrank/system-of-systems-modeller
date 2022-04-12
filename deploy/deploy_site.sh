#!/bin/bash


### Development environment deployment
read -n 1 -p "Do you wish to deploy a development environment only (y/Y): " continue
echo ""
if [[ $continue =~ [yY] ]]; then

	read -n 1 -p "Install required npm packages (y/Y): " continue
	echo ""
	if [[ $continue =~ [yY] ]]; then
		#Install required packages
		npm --prefix $PWD/../www install
  
  		#Nodemon install?
	fi
	
	read -n 1 -p "Do you wish to deploy the database schema and create users (y/Y): " continue
	echo ""
	if [[ $continue =~ [yY] ]]; then
		#Deploy the database
		mysql < ../sql/deploySchema.sql
		if [[ $? == 0 ]]; then
			echo "Schema deployed successfully"
		else
			echo "There may have been a problem deploying the schema"
		fi
	
		#Create users
		## Creates users with appropriate privileges based on ./sql/users.sql
		mysql < ../sql/users.sql
		if [[ $? == 0 ]]; then
			echo "Note that you may need to add a 'bind-address' entry to '/etc/mysql/mysql.conf.d/mysqld.cnf' and create an appropriate MySQL user if you intend to remotely administer this database."
		else
			echo "Creating mysql users may have failed. Check above."
		fi

	fi
fi


### Production environment deployment (NGINX?)
#read -n 1 -p "Do you wish to deploy a development environment only (y/Y): " continue
#if [[ $continue =~ [yY] ]]; then

	# Copy the www directory to /var/www
	#cp -r ../www/ /var/

	#Install npm dependencies
	#npm --prefix /var/www/ install
#fi
