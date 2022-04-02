# Deploy directory
This directory contains bash scripts to assist in deploying and redeploying SOSM.

## Initial requirements
The following activities are normally taken prior to being able to run the scripts located in this folder:
- Install OS to VM (tested with VirtualBox 6.1.26 and Ubuntu 21.04 Server).
- Ensure network is configured, internet access required.
- Install OpenSSH
- Update & upgrade
- Install git
- Clone into repo 
 - `git clone https://github.com/tlafrank/system-of-systems-modeller`


## Deployment scripts
The following scripts have been tested with the server setup as above. The scripts included in this directory assume that this repository has been cloned into the server's directory structure (not in /var/www).

Files include:
- install_required_dependences.sh. Guides the user through installation and configuration of the required services including MySQL, NodeJS and npm.
- deploy_site.sh. Moves the www folder to /var/www, sets appropriate permissions, configures service to maintain nodeJS running.
- deploy_database_schema.sh. Deploys or redeploys the database schema based on the config files located in ../sql/. Does not backup the database.
- backup_database_content.sh
- restore_database_content.sh

For a new installation, the above files would generally be run in order as far as necessary.

