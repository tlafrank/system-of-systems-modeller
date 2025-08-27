
DROP USER 'sosmUser'@'localhost';
CREATE USER 'sosmUser'@'%' IDENTIFIED BY 'dnRk384!djrLdo}836w:';
GRANT ALL PRIVILEGES ON db_sosm.* TO 'sosmUser'@'%';
FLUSH PRIVILEGES;
