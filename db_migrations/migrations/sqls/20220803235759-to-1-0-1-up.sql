-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET autocommit = 0;
-- SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

-- -----------------------------------------------------
-- Table `systems`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `systems` (
  `id_system` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `image` VARCHAR(45) NULL,
  `class` INT NULL COMMENT 'The class that this system belongs to',
  `description` LONGTEXT NULL COMMENT 'A brief description of the system',
  `reference` VARCHAR(45) NULL,
  PRIMARY KEY (`id_system`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `subsystems`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `subsystems` (
  `id_subsystem` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `description` LONGTEXT NULL COMMENT 'A brief description of the subsystem',
  PRIMARY KEY (`id_subsystem`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `technologies`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `technologies` (
  `id_technology` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `description` LONGTEXT NULL,
  PRIMARY KEY (`id_technology`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `interfaces`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `interfaces` (
  `id_interface` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `image` VARCHAR(45) NULL,
  `description` LONGTEXT NULL COMMENT 'A brief description of the interface',
  `reference` VARCHAR(45) NULL,
  PRIMARY KEY (`id_interface`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `networks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networks` (
  `id_network` INT NOT NULL AUTO_INCREMENT,
  `id_technology` INT NOT NULL,
  `name` VARCHAR(45) NULL,
  `designation` VARCHAR(45) NULL,
  `image` VARCHAR(45) NULL,
  `class` INT NULL DEFAULT 0,
  `description` LONGTEXT NULL,
  PRIMARY KEY (`id_network`),
  INDEX `fk_id_technology_idx` (`id_technology` ASC) VISIBLE,
  CONSTRAINT `fk_id_technology`
    FOREIGN KEY (`id_technology`)
    REFERENCES `technologies` (`id_technology`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `SSMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `SSMap` (
  `id_SSMap` INT NOT NULL AUTO_INCREMENT,
  `id_system` INT NULL,
  `id_subsystem` INT NULL,
  PRIMARY KEY (`id_SSMap`),
  INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
  INDEX `id_subsystem_idx` (`id_subsystem` ASC) VISIBLE,
  CONSTRAINT `fk_SSMap_system`
    FOREIGN KEY (`id_system`)
    REFERENCES `systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_SSMap_subsystem`
    FOREIGN KEY (`id_subsystem`)
    REFERENCES `subsystems` (`id_subsystem`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `SIMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `SIMap` (
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
    REFERENCES `systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_SIMap_interface`
    FOREIGN KEY (`id_interface`)
    REFERENCES `interfaces` (`id_interface`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `SINMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `SINMap` (
  `id_SINMap` INT NOT NULL AUTO_INCREMENT,
  `id_SIMap` INT NULL,
  `id_network` INT NULL,
  `category` VARCHAR(45),
  PRIMARY KEY (`id_SINMap`),
  INDEX `fk_id_systemInterface_idx` (`id_SIMap` ASC) VISIBLE,
  INDEX `fk_id_network_idx` (`id_network` ASC) VISIBLE,
  CONSTRAINT `fk_SINMap_SIMap`
    FOREIGN KEY (`id_SIMap`)
    REFERENCES `SIMap` (`id_SIMap`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_SINMap_network`
    FOREIGN KEY (`id_network`)
    REFERENCES `networks` (`id_network`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `TIMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `TIMap` (
  `id_TIMap` INT NOT NULL AUTO_INCREMENT,
  `id_interface` INT NULL,
  `id_technology` INT NULL,
  PRIMARY KEY (`id_TIMap`),
  INDEX `id_interface_idx` (`id_interface` ASC) VISIBLE,
  INDEX `id_technologies_idx` (`id_technology` ASC) VISIBLE,
  CONSTRAINT `fk_TIMap_interface`
    FOREIGN KEY (`id_interface`)
    REFERENCES `interfaces` (`id_interface`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TIMap_technology`
    FOREIGN KEY (`id_technology`)
    REFERENCES `technologies` (`id_technology`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `quantities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `quantities` (
  `id_quantities` INT NOT NULL AUTO_INCREMENT,
  `id_system` INT NULL,
  `year` INT NULL,
  `quantity` INT NULL,
  PRIMARY KEY (`id_quantities`),
  INDEX `fk_quantities_system_idx` (`id_system` ASC) VISIBLE,
  CONSTRAINT `fk_quantities_system`
    FOREIGN KEY (`id_system`)
    REFERENCES `systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `interfaceIssues`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `interfaceIssues` (
  `id_interfaceIssue` INT NOT NULL AUTO_INCREMENT,
  `id_interface` INT NULL,
  `name` VARCHAR(256) NULL COMMENT 'A summary title of the issue',
  `severity` INT NULL,
  `issue` LONGTEXT NULL COMMENT 'The description of the issue',
  `resolution` LONGTEXT NULL,
  PRIMARY KEY (`id_interfaceIssue`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `issuesToSystemsMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `issuesToSystemsMap` (
  `id_issuesToSystemsMap` INT NOT NULL AUTO_INCREMENT,
  `id_interfaceIssue` INT NULL,
  `id_system` INT NULL,
  PRIMARY KEY (`id_issuesToSystemsMap`),
  INDEX `id_interfaceIssue_idx` (`id_interfaceIssue` ASC) VISIBLE,
  INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
  CONSTRAINT `fk_issuesToSystemsMap_interfaceIssue`
    FOREIGN KEY (`id_interfaceIssue`)
    REFERENCES `interfaceIssues` (`id_interfaceIssue`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_issuesToSystemsMap_system`
    FOREIGN KEY (`id_system`)
    REFERENCES `systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `classes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id_class` INT NOT NULL AUTO_INCREMENT,
  `class` VARCHAR(45) NULL,
  PRIMARY KEY (`id_class`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `systemClassMap`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `systemClassMap` (
  `id_systemClassMap` INT NOT NULL AUTO_INCREMENT,
  `id_system` INT NULL,
  `id_class` INT NULL,
  PRIMARY KEY (`id_systemClassMap`),
  INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
  INDEX `id_class_idx` (`id_class` ASC) VISIBLE,
  CONSTRAINT `fk_systemClassMap_system`
    FOREIGN KEY (`id_system`)
    REFERENCES `systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_systemClassMap_classes`
    FOREIGN KEY (`id_class`)
    REFERENCES `classes` (`id_class`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `tags`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tags` (
  `id_tag` INT NOT NULL AUTO_INCREMENT,
  `id_system` INT NOT NULL,
  `tag` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_tag`),
  INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
  CONSTRAINT `fk_tags_systems`
    FOREIGN KEY (`id_system`)
    REFERENCES `systems` (`id_system`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `dataExchanges`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dataExchanges` (
  `id_dataExchange` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NULL,
  `description` LONGTEXT NULL COMMENT 'A brief description of the data exchange',
  PRIMARY KEY (`id_dataExchange`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
