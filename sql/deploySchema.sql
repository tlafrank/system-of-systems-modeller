-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET autocommit = 0;
-- SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

-- -----------------------------------------------------
-- Schema db_sosm
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `db_sosm` ;

-- -----------------------------------------------------
-- Schema db_sosm
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `db_sosm` DEFAULT CHARACTER SET utf8 ;
USE `db_sosm` ;

-- -----------------------------------------------------
-- Table `db_sosm`.`systems`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`systems` (
  `id_system` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `image` VARCHAR(45) NULL,
  `class` INT NULL COMMENT 'The class that this system belongs to',
  `description` LONGTEXT NULL COMMENT 'A brief description of the system',
  `reference` VARCHAR(45) NULL,
  PRIMARY KEY (`id_system`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`subsystems`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`subsystems` (
  `id_subsystem` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `description` LONGTEXT NULL COMMENT 'A brief description of the subsystem',
  PRIMARY KEY (`id_subsystem`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`features`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`features` (
  `id_feature` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `description` LONGTEXT NULL,
  PRIMARY KEY (`id_feature`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`interfaces`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`interfaces` (
  `id_interface` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `image` VARCHAR(45) NULL,
  `description` LONGTEXT NULL COMMENT 'A brief description of the interface',
  `features` LONGTEXT NULL,
  `reference` VARCHAR(45) NULL,
  PRIMARY KEY (`id_interface`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_sosm`.`networks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`networks` (
  `id_network` INT NOT NULL AUTO_INCREMENT,
  `id_feature` INT NOT NULL,
  `name` VARCHAR(45) NULL,
  `image` VARCHAR(45) NULL,
  `class` INT NULL DEFAULT 0,
  `description` LONGTEXT NULL,
  PRIMARY KEY (`id_network`),
  INDEX `fk_id_feature_idx` (`id_feature` ASC) VISIBLE,
  CONSTRAINT `fk_id_feature`
    FOREIGN KEY (`id_feature`)
    REFERENCES `db_sosm`.`features` (`id_feature`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`SSMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`SSMap` (
  `id_SSMap` INT NOT NULL AUTO_INCREMENT,
  `id_system` INT NULL,
  `id_subsystem` INT NULL,
  PRIMARY KEY (`id_SSMap`),
  INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
  INDEX `id_subsystem_idx` (`id_subsystem` ASC) VISIBLE,
  CONSTRAINT `fk_SSMap_system`
    FOREIGN KEY (`id_system`)
    REFERENCES `db_sosm`.`systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_SSMap_subsystem`
    FOREIGN KEY (`id_subsystem`)
    REFERENCES `db_sosm`.`subsystems` (`id_subsystem`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`SIMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`SIMap` (
  `id_SIMap` INT NOT NULL AUTO_INCREMENT,
  `id_system` INT NULL,
  `id_interface` INT NULL,
  `isProposed` TINYINT NULL,
  `description` LONGTEXT NULL,
  PRIMARY KEY (`id_SIMap`),
  INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
  INDEX `id_interface_idx` (`id_interface` ASC) VISIBLE,
  CONSTRAINT `fk_SIMap_system`
    FOREIGN KEY (`id_system`)
    REFERENCES `db_sosm`.`systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_SIMap_interface`
    FOREIGN KEY (`id_interface`)
    REFERENCES `db_sosm`.`interfaces` (`id_interface`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_sosm`.`SINMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`SINMap` (
  `id_SINMap` INT NOT NULL AUTO_INCREMENT,
  `id_SIMap` INT NULL,
  `id_network` INT NULL,
  PRIMARY KEY (`id_SINMap`),
  INDEX `fk_id_systemInterface_idx` (`id_SIMap` ASC) VISIBLE,
  INDEX `fk_id_network_idx` (`id_network` ASC) VISIBLE,
  CONSTRAINT `fk_SINMap_SIMap`
    FOREIGN KEY (`id_SIMap`)
    REFERENCES `db_sosm`.`SIMap` (`id_SIMap`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_SINMap_network`
    FOREIGN KEY (`id_network`)
    REFERENCES `db_sosm`.`networks` (`id_network`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`quantities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`quantities` (
  `id_quantities` INT NOT NULL AUTO_INCREMENT,
  `id_system` INT NULL,
  `year` INT NULL,
  `quantity` INT NULL,
  PRIMARY KEY (`id_quantities`),
  INDEX `fk_quantities_system_idx` (`id_system` ASC) VISIBLE,
  CONSTRAINT `fk_quantities_system`
    FOREIGN KEY (`id_system`)
    REFERENCES `db_sosm`.`systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`interfaceIssues`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`interfaceIssues` (
  `id_interfaceIssue` INT NOT NULL AUTO_INCREMENT,
  `id_interface` INT NULL,
  `name` VARCHAR(256) NULL COMMENT 'A summary title of the issue',
  `severity` INT NULL,
  `issue` LONGTEXT NULL COMMENT 'The description of the issue',
  `resolution` LONGTEXT NULL,
  PRIMARY KEY (`id_interfaceIssue`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`issuesToSystemsMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`issuesToSystemsMap` (
  `id_issuesToSystemsMap` INT NOT NULL AUTO_INCREMENT,
  `id_interfaceIssue` INT NULL,
  `id_system` INT NULL,
  PRIMARY KEY (`id_issuesToSystemsMap`),
  INDEX `id_interfaceIssue_idx` (`id_interfaceIssue` ASC) VISIBLE,
  INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
  CONSTRAINT `fk_issuesToSystemsMap_interfaceIssue`
    FOREIGN KEY (`id_interfaceIssue`)
    REFERENCES `db_sosm`.`interfaceIssues` (`id_interfaceIssue`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_issuesToSystemsMap_system`
    FOREIGN KEY (`id_system`)
    REFERENCES `db_sosm`.`systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`classes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`classes` (
  `id_class` INT NOT NULL AUTO_INCREMENT,
  `class` VARCHAR(45) NULL,
  PRIMARY KEY (`id_class`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`systemClassMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`systemClassMap` (
  `id_systemClassMap` INT NOT NULL AUTO_INCREMENT,
  `id_system` INT NULL,
  `id_class` INT NULL,
  PRIMARY KEY (`id_systemClassMap`),
  INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
  INDEX `id_class_idx` (`id_class` ASC) VISIBLE,
  CONSTRAINT `fk_systemClassMap_system`
    FOREIGN KEY (`id_system`)
    REFERENCES `db_sosm`.`systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_systemClassMap_classes`
    FOREIGN KEY (`id_class`)
    REFERENCES `db_sosm`.`classes` (`id_class`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`tags`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`tags` (
  `id_tag` INT NOT NULL AUTO_INCREMENT,
  `id_system` INT NOT NULL,
  `tag` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_tag`),
  INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
  CONSTRAINT `fk_tags_systems`
    FOREIGN KEY (`id_system`)
    REFERENCES `db_sosm`.`systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_sosm`.`dataExchanges`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`dataExchanges` (
  `id_dataExchange` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NULL,
  `description` LONGTEXT NULL COMMENT 'A brief description of the data exchange',
  PRIMARY KEY (`id_dataExchange`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
