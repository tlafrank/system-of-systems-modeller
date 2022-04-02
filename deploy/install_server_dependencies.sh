#!/bin/bash
# Install the software required on the server.
# Must be run with privileges

# Ensure server is up to date
read -n 1 -p "Do you wish to update the server: " continue
echo ""
if [[ $continue =~ [yY] ]]; then
  echo "**  System is being updated"
  apt-get update -y
  apt-get upgrade -y
  echo "System updated"
fi

# Configure Git
read -n 1 -p "Do you wish to configure git globally? (y/Y):" continue
echo ""
if [[ $continue =~ [yY] ]]; then
  read -p "Name (First Last): " name
  git config --global user.name "$name"
  read -p "Email: " email
  git config --global user.email "$email"
  git config pull.rebase true
  git config -l
else
  echo "You may want to configure user.name and user.email for git manually for this package"
fi

#Install MySQL
read -n 1 -p "Do you wish to install and configure MySQL? (y/Y): " continue
echo ""
if [[ $continue =~ [yY] ]]; then
  echo "**  Installing MySQL"
  apt-get install -y mysql-server

  #Configure MySQL
  echo "**  Securing MySQL Installation"
  echo "The password chosen here is the root password for the MySQL instance. It is required for configuring the database but won't be used for day-to-day operation of SOSM"
  mysql_secure_installation
fi

read -n 1 -p "Do you wish to install NodeJS and npm? (y/Y): " continue
echo ""
if [[ $continue =~ [yY] ]]; then

  #Install NodeJS & NPM
  apt-get install -y nodejs npm
fi

read -n 1 -p "Do you wish to install and configure SAMBA for the users home drive? (y/Y): " continue
echo ""
if [[ $continue =~ [yY] ]]; then
  apt-get install -y samba
  #Create user
  smbpasswd -a $USER
  smbpasswd -e $USER

  #Create share
  echo "[www]" >> /etc/samba/smb.conf
  echo "  path = $PWD/../www/" >> /etc/samba/smb.conf
  echo "  browsable = yes" >> /etc/samba/smb.conf
  #echo "  create mask = 0660" >> /etc/samba/smb.conf
  #echo "  directory mask = 0771" >> /etc/samba/smb.conf
  echo "  writable = yes" >> /etc/samba/smb.conf
  #echo "  guest ok = yes" >> /etc/samba/smb.conf
  #echo "#  valid users = " >> /etc/samba/smb.conf

  #Restart SAMBA
  systemctl restart smbd.service
fi


