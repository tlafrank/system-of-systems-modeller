CREATE USER 'sosmUser'@'localhost' IDENTIFIED WITH authentication_plugin BY 'password';
GRANT PRIVILEGE ON sosm.* TO 'sosmUser'@'localhost';


FLUSH PRIVILEGES;
