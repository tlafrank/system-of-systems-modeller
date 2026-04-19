-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: db_sosm
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `SIMap`
--

LOCK TABLES `SIMap` WRITE;
/*!40000 ALTER TABLE `SIMap` DISABLE KEYS */;
INSERT INTO `SIMap` VALUES (1,2,1,NULL,NULL),(2,2,2,NULL,NULL),(3,2,3,NULL,NULL),(4,1,2,NULL,NULL),(5,3,3,NULL,NULL),(6,4,2,NULL,NULL),(7,4,2,NULL,NULL),(8,4,2,NULL,NULL),(9,4,2,NULL,NULL),(10,4,2,NULL,NULL);
/*!40000 ALTER TABLE `SIMap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `SINMap`
--

LOCK TABLES `SINMap` WRITE;
/*!40000 ALTER TABLE `SINMap` DISABLE KEYS */;
INSERT INTO `SINMap` VALUES (1,1,2),(2,2,1),(3,6,1),(4,7,1),(5,4,1),(6,5,3),(7,3,3);
/*!40000 ALTER TABLE `SINMap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `features`
--

LOCK TABLES `features` WRITE;
/*!40000 ALTER TABLE `features` DISABLE KEYS */;
INSERT INTO `features` VALUES (1,'802.11b',NULL),(2,'802.11g',NULL),(3,'802.11n',NULL),(4,'ZigBee',NULL),(5,'100Mbps',NULL);
/*!40000 ALTER TABLE `features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `graphSettings`
--

LOCK TABLES `graphSettings` WRITE;
/*!40000 ALTER TABLE `graphSettings` DISABLE KEYS */;
/*!40000 ALTER TABLE `graphSettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `interfaces`
--

LOCK TABLES `interfaces` WRITE;
/*!40000 ALTER TABLE `interfaces` DISABLE KEYS */;
INSERT INTO `interfaces` VALUES (1,'WiFi','wifi.svg',NULL,NULL,NULL),(2,'Ethernet','cable.png',NULL,NULL,NULL),(3,'ZigBee','controller.png',NULL,NULL,NULL);
/*!40000 ALTER TABLE `interfaces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `issues`
--

LOCK TABLES `issues` WRITE;
/*!40000 ALTER TABLE `issues` DISABLE KEYS */;
/*!40000 ALTER TABLE `issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `networks`
--

LOCK TABLES `networks` WRITE;
/*!40000 ALTER TABLE `networks` DISABLE KEYS */;
INSERT INTO `networks` VALUES (1,5,'LAN','',0,NULL),(2,1,'WiFi','',0,NULL),(3,4,'ZigBee','',0,NULL);
/*!40000 ALTER TABLE `networks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `parties`
--

LOCK TABLES `parties` WRITE;
/*!40000 ALTER TABLE `parties` DISABLE KEYS */;
/*!40000 ALTER TABLE `parties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `quantities`
--

LOCK TABLES `quantities` WRITE;
/*!40000 ALTER TABLE `quantities` DISABLE KEYS */;
INSERT INTO `quantities` VALUES (1,1,2000,5),(2,2,2010,1),(3,3,2020,3),(4,4,2000,1),(5,4,2000,1);
/*!40000 ALTER TABLE `quantities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `subsystems`
--

LOCK TABLES `subsystems` WRITE;
/*!40000 ALTER TABLE `subsystems` DISABLE KEYS */;
INSERT INTO `subsystems` VALUES (1,'Camera','camera.svg',NULL,NULL,'camera,sensor',NULL),(2,'Controller','controller.png',NULL,NULL,'controller',NULL),(3,'Reed Switch','reedSwitch.png',NULL,NULL,'switch',NULL),(4,'LAN Switch','switch.svg',NULL,NULL,'lan',NULL);
/*!40000 ALTER TABLE `subsystems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'db_sosm'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-11 21:25:23
