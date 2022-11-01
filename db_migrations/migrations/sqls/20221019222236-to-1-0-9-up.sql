-- Various table and column renames
	ALTER TABLE networks RENAME TO links;
	ALTER TABLE links RENAME COLUMN id_network TO id_link;
	ALTER TABLE SINMap RENAME COLUMN id_network TO id_link;
	ALTER TABLE SINMap RENAME TO SystemInterfaceToLinkMap;
	ALTER TABLE SystemInterfaceToLinkMap RENAME COLUMN id_SINMap TO id_SILMap;
	ALTER TABLE SIMap RENAME TO InterfaceToSystemMap;
	ALTER TABLE InterfaceToSystemMap RENAME COLUMN id_SIMap TO id_ISMap;
	ALTER TABLE SystemInterfaceToLinkMap RENAME COLUMN id_SIMap TO id_ISMap;

-- Move the technology category from constants.js / privateConstants.js into the database
	-- Create the technologyCategories table
	CREATE TABLE IF NOT EXISTS `db_sosm`.`technologyCategories` (
		`id_techCategory` INT NOT NULL AUTO_INCREMENT,
		`name` VARCHAR(45) NULL DEFAULT NULL,
		`color` VARCHAR(45) NULL DEFAULT NULL,
		PRIMARY KEY (`id_techCategory`))
	ENGINE = InnoDB;

	-- Add the fk to the technology table
	ALTER TABLE technologies ADD COLUMN `id_techCategory` INT AFTER `name`;
	ALTER TABLE technologies ADD INDEX `fk_technologies_techCategory_idx` (`id_techCategory` ASC) VISIBLE;
	ALTER TABLE technologies ADD CONSTRAINT `fk_technologies_techCategory`
		FOREIGN KEY (`id_techCategory`)
		REFERENCES `db_sosm`.`technologyCategories` (`id_techCategory`)
		ON DELETE NO ACTION
		ON UPDATE NO ACTION;

	-- Create technologyCategories data (tailor as required)
	-- INSERT INTO technologyCategories (name,color) VALUES ('Red','red');
	-- INSERT INTO technologyCategories (name,color) VALUES ('Green','green');
	-- INSERT INTO technologyCategories (name,color) VALUES ('Blue','blue');

	-- Map technologies.category to technologyCategories (tailor as required)
	-- UPDATE technologies SET id_techCategory = (SELECT id_techCategory FROM technologyCategories WHERE name = 'Red') WHERE category = 'red' LIMIT 10
	-- UPDATE technologies SET id_techCategory = (SELECT id_techCategory FROM technologyCategories WHERE name = 'Green') WHERE category = 'green' LIMIT 10
	-- UPDATE technologies SET id_techCategory = (SELECT id_techCategory FROM technologyCategories WHERE name = 'Blue') WHERE category = 'blue' LIMIT 10



-- Add parameter tables
	CREATE TABLE IF NOT EXISTS `db_sosm`.`paramGroups` (
		`id_paramGroup` INT NOT NULL AUTO_INCREMENT,
		`name` VARCHAR(45) NULL DEFAULT NULL COMMENT  'The name of this parameter group',
		`description` LONGTEXT NULL DEFAULT NULL COMMENT  'The description of this parameter group',
		PRIMARY KEY (`id_paramGroup`))
	COMMENT 'Supports the grouping of parameters', 
	ENGINE = InnoDB;

	CREATE TABLE IF NOT EXISTS `db_sosm`.`paramDefinitions` (
		`id_paramDefinition` INT NOT NULL AUTO_INCREMENT,
		`id_paramGroup` INT NOT NULL,
		`name` VARCHAR(45) NULL DEFAULT NULL COMMENT 'The name of the parameter',
		`description` LONGTEXT NULL DEFAULT NULL COMMENT  'The descrition of the parameter',
		`paramType` VARCHAR(45) NULL DEFAULT NULL COMMENT 'The type of parameter. Boolean, freeText, singleOption, multiOption',
		`options` LONGTEXT NULL DEFAULT NULL COMMENT 'Comma separated list of the available options for this parameter',
		`applicableToSystem` BOOLEAN NULL DEFAULT 0 COMMENT 'Identifies if this parameter should be made available for assignment to a system',
		`applicableToInterface` BOOLEAN NULL DEFAULT 0 COMMENT 'Identifies if this parameter should be made available for assignment to an interface',
		`applicableToLink` BOOLEAN NULL DEFAULT 0 COMMENT 'Identifies if this parameter should be made available for assignment to a link',
		`applicableToTechnology` BOOLEAN NULL DEFAULT 0 COMMENT 'Identifies if this parameter should be made available for assignment to a technology',
		PRIMARY KEY (`id_paramDefinition`),
		INDEX `fk_params_paramGroups_idx` (`id_paramGroup` ASC) VISIBLE,
		CONSTRAINT `fk_params_paramGroups_idx`
			FOREIGN KEY (`id_paramGroup`)
			REFERENCES `db_sosm`.`paramGroups` (`id_paramGroup`)
			ON DELETE NO ACTION
			ON UPDATE NO ACTION)
	COMMENT 'Defines the parameters, their allocation to a parameter group and applicability to various components of the system', 
	ENGINE = InnoDB;

	CREATE TABLE IF NOT EXISTS `db_sosm`.`params` (
		`id_param` INT NOT NULL AUTO_INCREMENT,
		`id_paramDefinition` INT NOT NULL,
		`value` LONGTEXT NULL DEFAULT NULL COMMENT 'The value of the parameter assigned to the specific system',
		`id_system` INT NULL DEFAULT NULL COMMENT 'The foreign key for the systems table',
		`id_interface` INT NULL DEFAULT NULL COMMENT 'The foreign key for the interfaces table',
		`id_link` INT NULL DEFAULT NULL COMMENT 'The foreign key for the links table',
		`id_technology` INT NULL DEFAULT NULL COMMENT 'The foreign key for the technologies table',
		PRIMARY KEY (`id_param`),
		INDEX `fk_params_paramDefinitions_idx` (`id_paramDefinition` ASC) VISIBLE,
		INDEX `fk_paramSystemMap_systems_idx` (`id_system` ASC) VISIBLE,
		INDEX `fk_paramMap_interfaces_idx` (`id_interface` ASC) VISIBLE,
		INDEX `fk_paramMap_links_idx` (`id_link` ASC) VISIBLE,
		INDEX `fk_paramMap_technologies_idx` (`id_technology` ASC) VISIBLE,
		CONSTRAINT `fk_params_paramDefinition`
			FOREIGN KEY (`id_paramDefinition`)
			REFERENCES `db_sosm`.`paramDefinitions` (`id_paramDefinition`)
			ON DELETE NO ACTION
			ON UPDATE NO ACTION,
		CONSTRAINT `fk_paramMap_systems`
			FOREIGN KEY (`id_system`)
			REFERENCES `db_sosm`.`systems` (`id_system`)
			ON DELETE CASCADE
			ON UPDATE NO ACTION,
		CONSTRAINT `fk_paramMap_interfaces`
			FOREIGN KEY (`id_interface`)
			REFERENCES `db_sosm`.`interfaces` (`id_interface`)
			ON DELETE CASCADE
			ON UPDATE NO ACTION,
		CONSTRAINT `fk_paramMap_links`
			FOREIGN KEY (`id_link`)
			REFERENCES `db_sosm`.`links` (`id_link`)
			ON DELETE CASCADE
			ON UPDATE NO ACTION,
		CONSTRAINT `fk_paramMap_technologies`
			FOREIGN KEY (`id_technology`)
			REFERENCES `db_sosm`.`technologies` (`id_technology`)
			ON DELETE CASCADE
			ON UPDATE NO ACTION)
	COMMENT 'The values of the parameters assigned to the various components of the system',
	ENGINE = InnoDB;

-- Change SystemInterfaceToLinkMap.category to SystemInterfaceToLinkMap.isPrimary
	ALTER TABLE SystemInterfaceToLinkMap ADD COLUMN isPrimary BOOLEAN;
	UPDATE SystemInterfaceToLinkMap SET isPrimary = 1 WHERE category = 'primary' LIMIT 10000;
	UPDATE SystemInterfaceToLinkMap SET isPrimary = 0 WHERE category = 'alternate' LIMIT 10000;
	DELETE FROM SystemInterfaceToLinkMap WHERE category = 'incapable' LIMIT 10000;

