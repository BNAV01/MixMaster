-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: localhost    Database: sisRecomendaciones
-- ------------------------------------------------------
-- Server version	8.0.40-0ubuntu0.24.04.1

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
-- Table structure for table `cocteles`
--

DROP TABLE IF EXISTS `cocteles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cocteles` (
  `id_coctel` int NOT NULL AUTO_INCREMENT,
  `nombre_coctel` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_coctel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cocteles`
--

LOCK TABLES `cocteles` WRITE;
/*!40000 ALTER TABLE `cocteles` DISABLE KEYS */;
/*!40000 ALTER TABLE `cocteles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredientes`
--

DROP TABLE IF EXISTS `ingredientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredientes` (
  `id_ingrediente` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_ingrediente`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredientes`
--

LOCK TABLES `ingredientes` WRITE;
/*!40000 ALTER TABLE `ingredientes` DISABLE KEYS */;
INSERT INTO `ingredientes` VALUES (1,'Azúcar'),(2,'Lima');
/*!40000 ALTER TABLE `ingredientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredientes_coctel`
--

DROP TABLE IF EXISTS `ingredientes_coctel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredientes_coctel` (
  `id_preparacion_coctel` int NOT NULL AUTO_INCREMENT,
  `cantidad` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_coctel` int DEFAULT NULL,
  `id_ingrediente` int DEFAULT NULL,
  `id_licor` int DEFAULT NULL,
  PRIMARY KEY (`id_preparacion_coctel`),
  KEY `FK24jagvh33qb5vnf5x4gnn03m2` (`id_coctel`),
  KEY `FKsa268hgyt7ona3i13n9mdn1sx` (`id_ingrediente`),
  KEY `FKlokxcl0imvxypgi35xvo2hkxc` (`id_licor`),
  CONSTRAINT `FK24jagvh33qb5vnf5x4gnn03m2` FOREIGN KEY (`id_coctel`) REFERENCES `cocteles` (`id_coctel`),
  CONSTRAINT `FKlokxcl0imvxypgi35xvo2hkxc` FOREIGN KEY (`id_licor`) REFERENCES `licores` (`id_licor`),
  CONSTRAINT `FKsa268hgyt7ona3i13n9mdn1sx` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id_ingrediente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredientes_coctel`
--

LOCK TABLES `ingredientes_coctel` WRITE;
/*!40000 ALTER TABLE `ingredientes_coctel` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingredientes_coctel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `licor_ingredientes`
--

DROP TABLE IF EXISTS `licor_ingredientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `licor_ingredientes` (
  `id_preparacion_licor` int NOT NULL AUTO_INCREMENT,
  `id_ingrediente` int DEFAULT NULL,
  `id_licor` int DEFAULT NULL,
  PRIMARY KEY (`id_preparacion_licor`),
  KEY `FKcumbxdax94bcjmltsemt8e7oa` (`id_ingrediente`),
  KEY `FKk91r59c3ecg7tlg7s4tdcmpb7` (`id_licor`),
  CONSTRAINT `FKcumbxdax94bcjmltsemt8e7oa` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id_ingrediente`),
  CONSTRAINT `FKk91r59c3ecg7tlg7s4tdcmpb7` FOREIGN KEY (`id_licor`) REFERENCES `licores` (`id_licor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `licor_ingredientes`
--

LOCK TABLES `licor_ingredientes` WRITE;
/*!40000 ALTER TABLE `licor_ingredientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `licor_ingredientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `licores`
--

DROP TABLE IF EXISTS `licores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `licores` (
  `id_licor` int NOT NULL AUTO_INCREMENT,
  `nombre_licor` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_licor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `licores`
--

LOCK TABLES `licores` WRITE;
/*!40000 ALTER TABLE `licores` DISABLE KEYS */;
/*!40000 ALTER TABLE `licores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias`
--

DROP TABLE IF EXISTS `preferencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferencias` (
  `id_preferencia` int NOT NULL AUTO_INCREMENT,
  `id_coctel` int DEFAULT NULL,
  `id_licor` int DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_preferencia`),
  KEY `FK71smckekmmhscagdpabys7o32` (`id_coctel`),
  KEY `FKnoup8vsyhtnwi0rq6gxgqxe3e` (`id_licor`),
  KEY `FKep1x24eha07ucjdn2aksj2fhf` (`id_usuario`),
  CONSTRAINT `FK71smckekmmhscagdpabys7o32` FOREIGN KEY (`id_coctel`) REFERENCES `cocteles` (`id_coctel`),
  CONSTRAINT `FKep1x24eha07ucjdn2aksj2fhf` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `FKnoup8vsyhtnwi0rq6gxgqxe3e` FOREIGN KEY (`id_licor`) REFERENCES `licores` (`id_licor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias`
--

LOCK TABLES `preferencias` WRITE;
/*!40000 ALTER TABLE `preferencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `preferencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `activo` bit(1) DEFAULT NULL,
  `apellidom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellidop` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clave` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creacion` datetime(6) DEFAULT NULL,
  `fecha_nacimiento` datetime(6) NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rut` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `UKkfsp0s1tflm1cwlj8idhqsad0` (`email`),
  UNIQUE KEY `UKmqv9n7jm52dyd64ue73hmilqe` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,_binary '','López','García','$2y$10$B/1.GxYZGFi...','juan.garcia@gmail.com','2024-10-01 14:35:22.123456','1990-05-14 00:00:00.000000','Juan','12345678-9','+56912345678'),(2,_binary '\0','Rodríguez','Pérez','$2y$10$A/2.HyXZGKi...','maria.perez@gmail.com','2024-10-01 15:20:10.654321','1985-08-20 00:00:00.000000','Maria','98765432-1','+56987654321'),(3,_binary '','Fernández','Soto','$2y$10$C/3.JzYZHLi...','carlos.soto@gmail.com','2024-10-02 08:45:30.789012','1979-12-25 00:00:00.000000','Carlos','11223344-5','+56911223344'),(4,_binary '','Martínez','Gómez','$2y$10$D/4.KxYZIMi...','ana.gomez@gmail.com','2024-10-02 10:15:50.345678','1992-03-17 00:00:00.000000','Ana','55667788-9','+56955667788'),(5,_binary '\0','Torres','Díaz','$2y$10$E/5.LyYZJNl...','laura.diaz@gmail.com','2024-10-03 09:50:25.567890','1987-07-13 00:00:00.000000','Laura','66554433-2','+56966554433');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `valoraciones`
--

DROP TABLE IF EXISTS `valoraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `valoraciones` (
  `id_valoracion` int NOT NULL AUTO_INCREMENT,
  `comentario` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_valoracion` datetime(6) DEFAULT NULL,
  `valoracion` int NOT NULL,
  `id_coctel` int DEFAULT NULL,
  `id_licor` int DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_valoracion`),
  KEY `FK80w4q6vv46vfsd0ffed5oewnj` (`id_coctel`),
  KEY `FKjtuqvxbpopf306y9iff2x1if9` (`id_licor`),
  KEY `FK9skwrk3lcm0o3eux9yhci571s` (`id_usuario`),
  CONSTRAINT `FK80w4q6vv46vfsd0ffed5oewnj` FOREIGN KEY (`id_coctel`) REFERENCES `cocteles` (`id_coctel`),
  CONSTRAINT `FK9skwrk3lcm0o3eux9yhci571s` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `FKjtuqvxbpopf306y9iff2x1if9` FOREIGN KEY (`id_licor`) REFERENCES `licores` (`id_licor`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valoraciones`
--

LOCK TABLES `valoraciones` WRITE;
/*!40000 ALTER TABLE `valoraciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `valoraciones` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-20 23:01:25
