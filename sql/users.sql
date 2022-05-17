
DROP USER IF EXISTS 'sosmUser'@'localhost';
CREATE USER 'sosmUser'@'localhost' IDENTIFIED BY 'dnRk384!djrLdo}836w:';
GRANT ALL PRIVILEGES ON db_sosm.* TO 'sosmUser'@'localhost';
FLUSH PRIVILEGES;
