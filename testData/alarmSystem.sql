#Example alarm system
USE db_sosm;


#Subsystems
INSERT INTO subsystems (name,image,tags) VALUES ('Camera', 'camera.svg', 'camera,sensor');
INSERT INTO subsystems (name,image,tags) VALUES ('Controller','controller.png', 'controller');
INSERT INTO subsystems (name,image,tags) VALUES ('Reed Switch', 'reedSwitch.png', 'switch');

#Interfaces
INSERT INTO interfaces (name, image) VALUES ('WiFi','wifi.svg');
INSERT INTO interfaces (name, image) VALUES ('Ethernet','cable.png');
INSERT INTO interfaces (name, image) VALUES ('ZigBee','controller.png');



#SIMap
INSERT INTO SIMap (id_interface, id_subsystem) VALUES ((SELECT id_interface FROM interfaces WHERE name = 'WiFi'), (SELECT id_subsystem FROM subsystems WHERE name = 'Controller'));
INSERT INTO SIMap (id_interface, id_subsystem) VALUES ((SELECT id_interface FROM interfaces WHERE name = 'Ethernet'), (SELECT id_subsystem FROM subsystems WHERE name = 'Controller'));
INSERT INTO SIMap (id_interface, id_subsystem) VALUES ((SELECT id_interface FROM interfaces WHERE name = 'ZigBee'), (SELECT id_subsystem FROM subsystems WHERE name = 'Controller'));
INSERT INTO SIMap (id_interface, id_subsystem) VALUES ((SELECT id_interface FROM interfaces WHERE name = 'Ethernet'), (SELECT id_subsystem FROM subsystems WHERE name = 'Camera'));
INSERT INTO SIMap (id_interface, id_subsystem) VALUES ((SELECT id_interface FROM interfaces WHERE name = 'ZigBee'), (SELECT id_subsystem FROM subsystems WHERE name = 'Reed Switch'));




#Features
INSERT INTO features (name) VALUES ('802.11b');
INSERT INTO features (name) VALUES ('802.11g');
INSERT INTO features (name) VALUES ('802.11n');
INSERT INTO features (name) VALUES ('ZigBee');
INSERT INTO features (name) VALUES ('100Mbps');

#Networks
INSERT INTO networks (name, image, id_feature) VALUES ('LAN', '', (SELECT id_feature FROM features WHERE name = '100Mbps'));


#SINMap



#Issues


#Quantities


