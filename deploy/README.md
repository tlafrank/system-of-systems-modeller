# Deploy directory
This directory contains bash scripts to assist in deploying and redeploying SOSM.

Tested with Ubuntu 21.04 Server (minimal installation). The scripts included in this directory assume that this repository has been cloned into the server's directory structure and that the system is connected to the internet.

Files include:
# install_required_dependences.sh. Guides the user through installation and configuration of the required services including MySQL, NodeJS and npm.
# deploy_site.sh. Moves the www folder to /var/www, sets appropriate permissions, configures service to maintain nodeJS running.
# deploy_database_schema.sh. Deploys or redeploys the database schema based on the config files located in ../sql/. Does not backup the database.
# backup_database_content.sh
# restore_database_content.sh

For a new installation, the above files would generally be run in order as far as necessary.
