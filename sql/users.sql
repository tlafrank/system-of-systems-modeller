
DROP USER IF EXISTS 'sosmUser'@'localhost';
CREATE USER 'sosmUser'@'localhost' IDENTIFIED BY 'dnRk384!djrLdo}836w:';
GRANT ALL PRIVILEGES ON db_sosm.* TO 'sosmUser'@'localhost';
FLUSH PRIVILEGES;


-- Add user with rw access to any db_xxx database.
DROP USER IF EXISTS 'rwUser'@'localhost';
CREATE USER 'rwUser'@'localhost' IDENTIFIED BY 'rwUser:';
-- Alternative password, given MySQL password policy settings
-- CREATE USER 'rwUser'@'localhost' IDENTIFIED BY 'rwUse#dfk*jsde#5o45:';
GRANT ALL PRIVILEGES ON `db\_%`.* TO 'rwUser'@'localhost';



FLUSH PRIVILEGES;
