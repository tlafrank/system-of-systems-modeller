CREATE USER 'sosmUser'@'localhost' IDENTIFIED WITH authentication_plugin BY 'password';
GRANT PRIVILEGE ON sosm.* TO 'sosmUser'@'localhost';


# A temporary user used for deploying the database
CREATE USER 'sosmDeployer'@'localhost' IDENTIFIED BY 'dfsa4352fsafy53efdsg4et';
GRANT PRIVILEGE ON sosm.* TO 'sosmDeployer'@'localhost';


FLUSH PRIVILEGES;
