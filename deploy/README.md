# Deploy directory
This directory contains bash scripts to assist in deploying and redeploying SOSM.

## Initial requirements
The following activities are normally taken prior to being able to run the scripts located in this folder:
- Install OS to VM (tested with VirtualBox 6.1.26 and Ubuntu 20.04 Server).
  - Ensure network is configured, internet access required.
    - VirtualBox bridged adaptor seems to be a good option as it permits access from the host.
  - Install OpenSSH
  - Complete installation
- Update & upgrade
  - `sudo apt-get update`
  - `sudo apt-get upgrade`
- Switch to an SSH session.
- Clone repo to a folder in the home directory 
  - Preferred method is SSH. Makes pusihing commits easier:
    - `ssh-keygen -t ed25519 -C "Github Account Email Address"`
    - `eval "$(ssh-agent -s)"`
    - `ssh-add ~/.ssh/id_ed25519` or wherever the result of `ssh-keygen` was saved.
    - `cat ~/.ssh/id_ed25519.pub` and copy & paste the public key into Github > Settings > SSH & GPG Keys > Add new SSH keys
    - `git clone git@github.com:tlafrank/system-of-systems-modeller.git` Preferred, but requires SSH keys to be configured:
  - Alternative option is to clone using HTTPS:
    - `git clone https://github.com/tlafrank/system-of-systems-modeller`
  - Provide user execution permissions to the scripts:
    - `chmod +x ./deploy/*.sh`
- Deployment scripts are now available on the local machine to support further configuration.
    

## Deployment scripts
The following scripts have been tested with the server setup as above. The scripts included in this directory assume that this repository has been cloned into the server's directory structure (not in /var/www).

Files include:
- install_server_dependences.sh. Guides the user through installation and configuration of the required services including MySQL, NodeJS and npm.
- deploy_site.sh. After the repo is cloned `git clone git@github.com:tlafrank/system-of-systems-modeller.git`, prepares the environment for either development or production.
- deploy_database_schema.sh. Deploys or redeploys the database schema based on the config files located in ../sql/. Does not backup the database.
- backup_database_content.sh
- restore_database_content.sh

For a new installation, the above files would generally be run in order as far as necessary.

