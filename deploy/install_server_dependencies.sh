#!/bin/bash
# Install the software required on the server.
# Must be run with privileges


# Ensure server is up to date
echo "**  System is being updated"
apt-get -y update
apt-get -y upgrade
echo "System updated"

#Install MySQL
echo "**  Installing MySQL"
apt-get install -y mysql-server

#Configure MySQL
echo "**  Securing MySQL Installation"
echo "The password chosen here is the root password for the MySQL instance. It is required for configuring the database but won't be used for day-to-day operation of SOSM"
mysql_secure_installation

#Install NodeJS & NPM
apt-get install -y nodejs npm

#OPTIONAL - SAMBA access
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



