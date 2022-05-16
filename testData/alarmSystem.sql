USE db_sosm;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Data for table 'systems'
LOCK TABLES `systems` WRITE;
/*!40000 ALTER TABLE `systems` DISABLE KEYS */;
INSERT INTO `systems` VALUES (1,"Camera","camera.svg",NULL,"",""),(2,"Controller","controller.png",NULL,"Controller for the alarm system",""),(3,"LAN Switch","tba.svg",NULL,"",""),(4,"Reed Switch","tba.svg",NULL,"","");
/*!40000 ALTER TABLE `systems` ENABLE KEYS */;
UNLOCK TABLES;

-- Table 'subsystems' contains no data.

-- Data for table 'technologies'
LOCK TABLES `technologies` WRITE;
/*!40000 ALTER TABLE `technologies` DISABLE KEYS */;
INSERT INTO `technologies` VALUES (1,"ZigBee",""),(2,"802.11b",""),(3,"802.11g",""),(4,"802.11n",""),(5,"Ethernet",""),(6,"2-Wire Switch","");
/*!40000 ALTER TABLE `technologies` ENABLE KEYS */;
UNLOCK TABLES;

-- Data for table 'interfaces'
LOCK TABLES `interfaces` WRITE;
/*!40000 ALTER TABLE `interfaces` DISABLE KEYS */;
INSERT INTO `interfaces` VALUES (1,"WiFi","tba.svg","",NULL),(2,"Ethernet","tba.svg","",NULL),(3,"ZigBee","tba.svg","",NULL),(4,"2-Wire","tba.svg","",NULL);
/*!40000 ALTER TABLE `interfaces` ENABLE KEYS */;
UNLOCK TABLES;

-- Data for table 'networks'
LOCK TABLES `networks` WRITE;
/*!40000 ALTER TABLE `networks` DISABLE KEYS */;
INSERT INTO `networks` VALUES (1,5,"LAN","","tba.svg",0,""),(2,2,"WiFi","","tba.svg",0,""),(3,1,"ZigBee","","tba.svg",0,""),(4,6,"2-Wire","","tba.svg",0,"");
/*!40000 ALTER TABLE `networks` ENABLE KEYS */;
UNLOCK TABLES;

-- Table 'SSMap' contains no data.

-- Data for table 'SIMap'
LOCK TABLES `SIMap` WRITE;
/*!40000 ALTER TABLE `SIMap` DISABLE KEYS */;
INSERT INTO `SIMap` VALUES (2,3,2,NULL,NULL),(3,3,2,NULL,NULL),(4,3,2,NULL,NULL),(5,3,2,NULL,NULL),(6,3,2,NULL,NULL),(7,1,1,NULL,NULL),(8,2,2,NULL,NULL),(9,2,1,NULL,NULL),(10,2,3,NULL,NULL),(11,4,4,NULL,NULL),(12,2,4,NULL,NULL);
/*!40000 ALTER TABLE `SIMap` ENABLE KEYS */;
UNLOCK TABLES;

-- Data for table 'SINMap'
LOCK TABLES `SINMap` WRITE;
/*!40000 ALTER TABLE `SINMap` DISABLE KEYS */;
INSERT INTO `SINMap` VALUES (1,7,2,"primary"),(3,2,1,"primary"),(4,3,1,"primary"),(5,4,1,"primary"),(6,5,1,"primary"),(7,6,1,"primary"),(8,8,1,"primary"),(9,9,2,"primary"),(10,10,3,"primary"),(11,11,4,"primary"),(12,12,4,"primary");
/*!40000 ALTER TABLE `SINMap` ENABLE KEYS */;
UNLOCK TABLES;

-- Data for table 'TIMap'
LOCK TABLES `TIMap` WRITE;
/*!40000 ALTER TABLE `TIMap` DISABLE KEYS */;
INSERT INTO `TIMap` VALUES (1,1,2),(2,1,3),(3,1,4),(4,2,5),(5,3,1),(6,4,6);
/*!40000 ALTER TABLE `TIMap` ENABLE KEYS */;
UNLOCK TABLES;

-- Data for table 'quantities'
LOCK TABLES `quantities` WRITE;
/*!40000 ALTER TABLE `quantities` DISABLE KEYS */;
INSERT INTO `quantities` VALUES (1,2,2020,20),(4,3,2020,3),(5,4,2020,20),(6,1,2020,20),(7,1,2021,30),(8,1,2022,55),(9,1,2023,70),(10,1,2024,95);
/*!40000 ALTER TABLE `quantities` ENABLE KEYS */;
UNLOCK TABLES;

-- Data for table 'interfaceIssues'
LOCK TABLES `interfaceIssues` WRITE;
/*!40000 ALTER TABLE `interfaceIssues` DISABLE KEYS */;
INSERT INTO `interfaceIssues` VALUES (1,1,"Easily bypassed",3,"Uses a simple +5V/0V circuit, which can be easily bypassed.","Upgrade to a rolling code receiver/transmitter at the switch as an upgraded security option.");
/*!40000 ALTER TABLE `interfaceIssues` ENABLE KEYS */;
UNLOCK TABLES;

-- Table 'issuesToSystemsMap' contains no data.

-- Table 'classes' contains no data.

-- Table 'systemClassMap' contains no data.

-- Data for table 'tags'
LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (3,1,"camera"),(4,1,"sensor"),(5,2,"controller"),(6,3,"lan"),(7,4,"switch");
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

-- Table 'dataExchanges' contains no data.


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;