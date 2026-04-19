-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

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
-- Table `db_sosm`.`subsystems`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`subsystems` (
  `id_subsystem` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `image` VARCHAR(45) NULL,
  `class` INT NULL COMMENT 'The class that this subsystem belongs to',
  `description` LONGTEXT NULL COMMENT 'A brief description of the subsystem',
  `tags` LONGTEXT NULL,
  `reference` VARCHAR(45) NULL,
  PRIMARY KEY (`id_subsystem`))
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
-- Table `db_sosm`.`SIMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`SIMap` (
  `id_SIMap` INT NOT NULL AUTO_INCREMENT,
  `id_subsystem` INT NULL,
  `id_interface` INT NULL,
  `isProposed` TINYINT NULL,
  `description` LONGTEXT NULL,
  PRIMARY KEY (`id_SIMap`),
  INDEX `id_subsystem_idx` (`id_subsystem` ASC) VISIBLE,
  INDEX `id_interface_idx` (`id_interface` ASC) VISIBLE,
  CONSTRAINT `fk_SIMap_subsystem`
    FOREIGN KEY (`id_subsystem`)
    REFERENCES `db_sosm`.`subsystems` (`id_subsystem`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_SIMap_interface`
    FOREIGN KEY (`id_interface`)
    REFERENCES `db_sosm`.`interfaces` (`id_interface`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
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
-- Table `db_sosm`.`SINMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`SINMap` (
  `id_SINMap` INT NOT NULL AUTO_INCREMENT,
  `id_SIMap` INT NULL,
  `id_network` INT NULL,
  PRIMARY KEY (`id_SINMap`),
  INDEX `fk_id_subsystemInterface_idx` (`id_SIMap` ASC) VISIBLE,
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
-- Table `db_sosm`.`graphSettings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`graphSettings` (
  `keyName` VARCHAR(45) NOT NULL,
  `value` VARCHAR(45) NULL,
  UNIQUE INDEX `key_UNIQUE` (`keyName` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_sosm`.`parties`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`parties` (
  `id_party` INT NOT NULL,
  `name` VARCHAR(45) NULL,
  `description` LONGTEXT NULL,
  PRIMARY KEY (`id_party`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_sosm`.`issues`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`issues` (
  `id_issue` INT NOT NULL,
  `id_type` INT NULL COMMENT 'Could refer to the primary keys of SIMap, interfaces or network',
  `type` VARCHAR(45) NULL COMMENT 'SubsystemInterface,Interface,Feature,Network',
  `name` VARCHAR(45) NULL COMMENT 'A summary title of the issue',
  `severity` VARCHAR(45) NULL,
  `id_party` INT NULL COMMENT 'The PK of the party responsible for the issue',
  `issue` LONGTEXT NULL COMMENT 'THe description of the issue',
  `resolution` LONGTEXT NULL,
  `references` LONGTEXT NULL,
  PRIMARY KEY (`id_issue`),
  INDEX `id_party_idx` (`id_party` ASC) VISIBLE,
  CONSTRAINT `fk_parties_party`
    FOREIGN KEY (`id_party`)
    REFERENCES `db_sosm`.`parties` (`id_party`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_sosm`.`quantities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_sosm`.`quantities` (
  `id_quantities` INT NOT NULL AUTO_INCREMENT,
  `id_subsystem` INT NULL,
  `year` INT NULL,
  `quantity` INT NULL,
  PRIMARY KEY (`id_quantities`),
  INDEX `fk_quantities_subsystem_idx` (`id_subsystem` ASC) VISIBLE,
  CONSTRAINT `fk_quantities_subsystem`
    FOREIGN KEY (`id_subsystem`)
    REFERENCES `db_sosm`.`subsystems` (`id_subsystem`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
