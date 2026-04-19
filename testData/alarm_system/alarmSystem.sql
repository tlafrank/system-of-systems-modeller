#Example alarm system
USE db_sosm;


#Subsystems
INSERT INTO subsystems (name,image,tags) VALUES ('Camera', 'camera.svg', 'camera,sensor');
INSERT INTO subsystems (name,image,tags) VALUES ('Controller','controller.png', 'controller');
INSERT INTO subsystems (name,image,tags) VALUES ('Reed Switch', 'reedSwitch.png', 'switch');
INSERT INTO subsystems (name,image,tags) VALUES ('LAN Switch', 'switch.svg', 'lan');


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
INSERT INTO SIMap (id_interface, id_subsystem) VALUES ((SELECT id_interface FROM interfaces WHERE name = 'Ethernet'), (SELECT id_subsystem FROM subsystems WHERE name = 'LAN Switch'));
INSERT INTO SIMap (id_interface, id_subsystem) VALUES ((SELECT id_interface FROM interfaces WHERE name = 'Ethernet'), (SELECT id_subsystem FROM subsystems WHERE name = 'LAN Switch'));
INSERT INTO SIMap (id_interface, id_subsystem) VALUES ((SELECT id_interface FROM interfaces WHERE name = 'Ethernet'), (SELECT id_subsystem FROM subsystems WHERE name = 'LAN Switch'));
INSERT INTO SIMap (id_interface, id_subsystem) VALUES ((SELECT id_interface FROM interfaces WHERE name = 'Ethernet'), (SELECT id_subsystem FROM subsystems WHERE name = 'LAN Switch'));
INSERT INTO SIMap (id_interface, id_subsystem) VALUES ((SELECT id_interface FROM interfaces WHERE name = 'Ethernet'), (SELECT id_subsystem FROM subsystems WHERE name = 'LAN Switch'));

#Features
INSERT INTO features (name) VALUES ('802.11b');
INSERT INTO features (name) VALUES ('802.11g');
INSERT INTO features (name) VALUES ('802.11n');
INSERT INTO features (name) VALUES ('ZigBee');
INSERT INTO features (name) VALUES ('100Mbps');

#Networks
INSERT INTO networks (name, image, id_feature) VALUES ('LAN', '', (SELECT id_feature FROM features WHERE name = '100Mbps'));
INSERT INTO networks (name, image, id_feature) VALUES ('WiFi', '', (SELECT id_feature FROM features WHERE name = '802.11b'));
INSERT INTO networks (name, image, id_feature) VALUES ('ZigBee', '', (SELECT id_feature FROM features WHERE name = 'ZigBee'));


#SINMap
INSERT INTO SINMap (id_SIMap, id_network) VALUES ((SELECT id_SIMap FROM SIMap WHERE id_interface = (SELECT id_interface FROM interfaces WHERE name = 'WiFi') AND id_subsystem = (SELECT id_subsystem FROM subsystems WHERE name = 'Controller')),(SELECT id_network FROM networks WHERE name = 'WiFi'));
INSERT INTO SINMap (id_SIMap, id_network) VALUES ((SELECT id_SIMap FROM SIMap WHERE id_interface = (SELECT id_interface FROM interfaces WHERE name = 'Ethernet') AND id_subsystem = (SELECT id_subsystem FROM subsystems WHERE name = 'Controller')),(SELECT id_network FROM networks WHERE name = 'LAN'));
INSERT INTO SINMap (id_SIMap, id_network) VALUES ((SELECT id_SIMap FROM SIMap WHERE id_interface = (SELECT id_interface FROM interfaces WHERE name = 'Ethernet') AND id_subsystem = (SELECT id_subsystem FROM subsystems WHERE name = 'LAN Switch') LIMIT 1 ),(SELECT id_network FROM networks WHERE name = 'LAN'));
INSERT INTO SINMap (id_SIMap, id_network) VALUES ((SELECT id_SIMap FROM SIMap WHERE id_interface = (SELECT id_interface FROM interfaces WHERE name = 'Ethernet') AND id_subsystem = (SELECT id_subsystem FROM subsystems WHERE name = 'LAN Switch') LIMIT 1 ) + 1,(SELECT id_network FROM networks WHERE name = 'LAN'));
INSERT INTO SINMap (id_SIMap, id_network) VALUES ((SELECT id_SIMap FROM SIMap WHERE id_interface = (SELECT id_interface FROM interfaces WHERE name = 'Ethernet') AND id_subsystem = (SELECT id_subsystem FROM subsystems WHERE name = 'Camera')),(SELECT id_network FROM networks WHERE name = 'LAN'));
INSERT INTO SINMap (id_SIMap, id_network) VALUES ((SELECT id_SIMap FROM SIMap WHERE id_interface = (SELECT id_interface FROM interfaces WHERE name = 'ZigBee') AND id_subsystem = (SELECT id_subsystem FROM subsystems WHERE name = 'Reed Switch')),(SELECT id_network FROM networks WHERE name = 'ZigBee'));
INSERT INTO SINMap (id_SIMap, id_network) VALUES ((SELECT id_SIMap FROM SIMap WHERE id_interface = (SELECT id_interface FROM interfaces WHERE name = 'ZigBee') AND id_subsystem = (SELECT id_subsystem FROM subsystems WHERE name = 'Controller')),(SELECT id_network FROM networks WHERE name = 'ZigBee'));


#Issues


#Quantities
INSERT INTO quantities (id_subsystem, year, quantity) VALUES ((SELECT id_subsystem FROM subsystems WHERE name = 'Camera'), 2000, 5);
INSERT INTO quantities (id_subsystem, year, quantity) VALUES ((SELECT id_subsystem FROM subsystems WHERE name = 'Controller'), 2010, 1);
INSERT INTO quantities (id_subsystem, year, quantity) VALUES ((SELECT id_subsystem FROM subsystems WHERE name = 'Reed Switch'), 2020, 3);
INSERT INTO quantities (id_subsystem, year, quantity) VALUES ((SELECT id_subsystem FROM subsystems WHERE name = 'LAN Switch'), 2000, 1);
INSERT INTO quantities (id_subsystem, year, quantity) VALUES ((SELECT id_subsystem FROM subsystems WHERE name = 'LAN Switch'), 2000, 1);
