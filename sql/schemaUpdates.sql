

	-- Schema Update: Nested systems
	USE db_sosm;

	DROP TABLE IF EXISTS SSMap, subsystems, SMap, OSMap, OMap, organisation;

	CREATE TABLE IF NOT EXISTS `db_sosm`.`SMap` (
		`id_SMap` INT NOT NULL AUTO_INCREMENT,
		`parent` INT NOT NULL,
		`child` INT NOT NULL,
		PRIMARY KEY (`id_SMap`),
		INDEX `id_parent_idx` (`parent` ASC) VISIBLE,
		INDEX `id_child_idx` (`child` ASC) VISIBLE,
		CONSTRAINT `fk_SMap_system_parent`
			FOREIGN KEY (`parent`)
			REFERENCES `db_sosm`.`systems` (`id_system`)
			ON DELETE NO ACTION
			ON UPDATE NO ACTION,
		CONSTRAINT `fk_SMap_system_child`
			FOREIGN KEY (`child`)
			REFERENCES `db_sosm`.`systems` (`id_system`)
			ON DELETE CASCADE
			ON UPDATE NO ACTION)
	ENGINE = InnoDB;


	CREATE TABLE IF NOT EXISTS `db_sosm`.`organisation` (
		`id_organisation` INT NOT NULL AUTO_INCREMENT,
		`name` VARCHAR(200),
		PRIMARY KEY (`id_organisation`))
	ENGINE = InnoDB;

	CREATE TABLE IF NOT EXISTS `db_sosm`.`OMap` (
		`id_OMap` INT NOT NULL AUTO_INCREMENT,
		`parent` INT NOT NULL,
		`child` INT NOT NULL,
		PRIMARY KEY (`id_OMap`),
		INDEX `id_organisation_parent_idx` (`parent` ASC) VISIBLE,
		INDEX `id_organisation_child_idx` (`child` ASC) VISIBLE,
		CONSTRAINT `fk_OMap_organisation_parent`
			FOREIGN KEY (`parent`)
			REFERENCES `db_sosm`.`organisation` (`id_organisation`)
			ON DELETE NO ACTION
			ON UPDATE NO ACTION,
		CONSTRAINT `fk_OMap_organisation_child`
			FOREIGN KEY (`child`)
			REFERENCES `db_sosm`.`organisation` (`id_organisation`)
			ON DELETE CASCADE
			ON UPDATE NO ACTION)
	ENGINE = InnoDB;

	CREATE TABLE IF NOT EXISTS `db_sosm`.`OSMap` (
		`id_OSMap` INT NOT NULL AUTO_INCREMENT,
		`id_organisation` INT NOT NULL,
		`id_system` INT NOT NULL,
		`quantity` INT DEFAULT 0,
		PRIMARY KEY (`id_OSMap`),
		INDEX `id_organisation_idx` (`id_organisation` ASC) VISIBLE,
		INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
		CONSTRAINT `fk_OSMap_organisation`
			FOREIGN KEY (`id_organisation`)
			REFERENCES `db_sosm`.`organisation` (`id_organisation`)
			ON DELETE NO ACTION
			ON UPDATE NO ACTION,
		CONSTRAINT `fk_OSMap_systems`
			FOREIGN KEY (`id_system`)
			REFERENCES `db_sosm`.`systems` (`id_system`)
			ON DELETE NO ACTION
			ON UPDATE NO ACTION)
	ENGINE = InnoDB;

	ALTER TABLE SIMap ADD COLUMN name VARCHAR(45) AFTER isProposed;
	ALTER TABLE networks ADD COLUMN linkColor VARCHAR(45) AFTER image;
	ALTER TABLE technologies ADD COLUMN category VARCHAR(45) AFTER name;

-- V1.0.2 (See package.json)
	ALTER TABLE systems ADD COLUMN updateTime BIGINT;
	ALTER TABLE interfaces ADD COLUMN updateTime BIGINT;
	ALTER TABLE systems ADD COLUMN isSubsystem BOOLEAN;
	ALTER TABLE systems ADD COLUMN isSubsystem BOOLEAN AFTER image;
	ALTER TABLE systems ADD COLUMN distributedSubsystem BOOLEAN AFTER isSubsystem;

-- V1.0.3 (See package.json)
	DROP TABLE systemClassMap;
	DROP TABLE classes;
	ALTER TABLE networks DROP COLUMN `linkColor`;
	ALTER TABLE networks DROP COLUMN `class`;
	ALTER TABLE interfaceIssues ADD COLUMN updateTime BIGINT;

	ALTER TABLE quantities DROP CONSTRAINT `fk_quantities_system`;
	ALTER TABLE quantities ADD CONSTRAINT `fk_quantities_system`
		FOREIGN KEY (`id_system`)
		REFERENCES `db_sosm`.`systems` (`id_system`)
		ON DELETE CASCADE
		ON UPDATE NO ACTION;

	ALTER TABLE tags DROP CONSTRAINT `fk_tags_systems`;
	ALTER TABLE tags ADD CONSTRAINT `fk_tags_systems`
		FOREIGN KEY (`id_system`)
		REFERENCES `db_sosm`.`systems` (`id_system`)
		ON DELETE CASCADE
		ON UPDATE NO ACTION;

	ALTER TABLE OSMap DROP CONSTRAINT `fk_OSMap_systems`;
	ALTER TABLE OSMap ADD CONSTRAINT `fk_OSMap_systems`
		FOREIGN KEY (`id_system`)
		REFERENCES `db_sosm`.`systems` (`id_system`)
		ON DELETE CASCADE
		ON UPDATE NO ACTION;

-- V1.0.4 (See package.json)
	ALTER TABLE systems ADD COLUMN category VARCHAR(64) AFTER image;
	ALTER TABLE SIMap ADD COLUMN category VARCHAR(64);
	ALTER TABLE networks ADD COLUMN category VARCHAR(64) AFTER image;


	ALTER TABLE SINMap DROP CONSTRAINT `fk_SINMap_SIMap`;
	ALTER TABLE SINMap ADD CONSTRAINT `fk_SINMap_SIMap`
		FOREIGN KEY (`id_SIMap`)
		REFERENCES `db_sosm`.`SIMap` (`id_SIMap`)
		ON DELETE CASCADE
		ON UPDATE NO ACTION;


-- V1.0.5 (See package.json)
	-- Introduction of AMap table (Association) to map the critical assocations across the system
	CREATE TABLE IF NOT EXISTS `db_sosm`.`AMap` (
	`id_AMap` INT NOT NULL AUTO_INCREMENT,
	`source` INT NOT NULL,
	`destination` INT NOT NULL,
	PRIMARY KEY (`id_AMap`),
	INDEX `from_idx` (`source` ASC) VISIBLE,
	INDEX `to_idx` (`destination` ASC) VISIBLE,
	CONSTRAINT `fk_AMap_systems_source`
		FOREIGN KEY (`source`)
		REFERENCES `db_sosm`.`systems` (`id_system`)
		ON DELETE CASCADE
		ON UPDATE NO ACTION,
	CONSTRAINT `fk_AMap_systems_destination`
		FOREIGN KEY (`destination`)
		REFERENCES `db_sosm`.`systems` (`id_system`)
		ON DELETE CASCADE
		ON UPDATE NO ACTION)
	ENGINE = InnoDB;


-- V1.0.6 (See package.json)
	ALTER TABLE issuesToSystemsMap DROP CONSTRAINT `fk_issuesToSystemsMap_interfaceIssue`;
	ALTER TABLE issuesToSystemsMap ADD CONSTRAINT `fk_issuesToSystemsMap_interfaceIssue`
		FOREIGN KEY (`id_interfaceIssue`)
		REFERENCES `db_sosm`.`interfaceIssues` (`id_interfaceIssue`)
		ON DELETE CASCADE
		ON UPDATE NO ACTION;

	ALTER TABLE issuesToSystemsMap DROP CONSTRAINT `fk_issuesToSystemsMap_system`;
	ALTER TABLE issuesToSystemsMap ADD CONSTRAINT `fk_issuesToSystemsMap_system`
		FOREIGN KEY (`id_system`)
		REFERENCES `db_sosm`.`systems` (`id_system`)
		ON DELETE CASCADE
		ON UPDATE NO ACTION;


-- V1.0.7 (See package.json)
	-- Add a new table to capture the family that a system belongs to
	CREATE TABLE IF NOT EXISTS `db_sosm`.`families` (
		`id_family` INT NOT NULL AUTO_INCREMENT,
		`name` VARCHAR(60) NOT NULL,
		`description` LONGTEXT NULL COMMENT 'A brief description of the family',
		PRIMARY KEY (`id_family`))
	ENGINE = InnoDB;

	-- Provide the link between the system and the families table
	ALTER TABLE systems ADD COLUMN `id_family` INT AFTER name;
	ALTER TABLE systems ADD INDEX `id_family_idx` (`id_family` ASC) VISIBLE;
	ALTER TABLE systems ADD	CONSTRAINT `fk_systems_families`
		FOREIGN KEY (`id_family`)
		REFERENCES `db_sosm`.`families` (`id_family`)
		ON DELETE SET NULL
		ON UPDATE NO ACTION;

	-- Add a version column to the system
	ALTER TABLE systems ADD COLUMN `version` VARCHAR(60) AFTER `id_family`;

	
-- V1.0.8 (See package.json)
	-- Added the CIM mapping table
		CREATE TABLE IF NOT EXISTS `db_sosm`.`cimMap` (
			`id_cimMap` INT NOT NULL AUTO_INCREMENT,
			`id_system` INT NOT NULL,
			`cimName` VARCHAR(60) NOT NULL,
			`updateTime` BIGINT,
			PRIMARY KEY (`id_cimMap`),
			INDEX `id_cimMap_idx` (`id_cimMap` ASC) VISIBLE,
			INDEX `id_system_idx` (`id_system` ASC) VISIBLE,
			CONSTRAINT `fk_cimMap_systems`
				FOREIGN KEY (`id_system`)
				REFERENCES `db_sosm`.`systems` (`id_system`)
				ON DELETE CASCADE
				ON UPDATE NO ACTION)	
		ENGINE = InnoDB;

	-- Added the parties table
		--The parties table lists the department responsible for the system
		CREATE TABLE IF NOT EXISTS `db_sosm`.`parties` (
			`id_party` INT NOT NULL AUTO_INCREMENT,
			`name` VARCHAR(60) NOT NULL,
			`description` LONGTEXT NULL COMMENT 'A brief description of the party',
			`updateTime` BIGINT,
			PRIMARY KEY (`id_party`))
		ENGINE = InnoDB;

	-- Map the system to the party
		ALTER TABLE systems ADD COLUMN `id_responsibleParty` INT AFTER `reference`;
		ALTER TABLE systems ADD INDEX `id_responsibleParty_idx` (`id_responsibleParty` ASC) VISIBLE;
		ALTER TABLE systems ADD CONSTRAINT `fk_systems_parties`
			FOREIGN KEY (`id_responsibleParty`)
			REFERENCES `db_sosm`.`parties` (`id_party`)
			ON DELETE SET NULL
			ON UPDATE NO ACTION;

	-- Add a POC details table
		CREATE TABLE IF NOT EXISTS `db_sosm`.`poc` (
			`id_poc` INT NOT NULL AUTO_INCREMENT,
			`name` VARCHAR(60) NOT NULL,
			`email` VARCHAR(128),
			`updateTime` BIGINT,
			PRIMARY KEY (`id_poc`))
		ENGINE = InnoDB;

	-- Map the POC tables to the system
		ALTER TABLE systems ADD COLUMN `id_poc` INT AFTER `id_responsibleParty`;
		ALTER TABLE systems ADD INDEX `id_poc_idx` (`id_poc` ASC) VISIBLE;
		ALTER TABLE systems ADD CONSTRAINT `fk_systems_poc`
			FOREIGN KEY (`id_poc`)
			REFERENCES `db_sosm`.`poc` (`id_poc`)
			ON DELETE SET NULL
			ON UPDATE NO ACTION;

-- 1.0.9 (See package.json)
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
		--Create the technologyCategories table
		CREATE TABLE IF NOT EXISTS `db_sosm`.`technologyCategories` (
			`id_techCategory` INT NOT NULL AUTO_INCREMENT,
			`name` VARCHAR(45) NULL DEFAULT NULL,
			`colour` VARCHAR(45) NULL DEFAULT NULL,
			PRIMARY KEY (`id_techCategory`))
		ENGINE = InnoDB;

		--Add the fk to the technology table
		ALTER TABLE technologies ADD COLUMN `id_techCategory` INT AFTER `name`;
		ALTER TABLE technologies ADD INDEX `fk_technologies_techCategory_idx` (`id_techCategory` ASC) VISIBLE;
		ALTER TABLE technologies ADD CONSTRAINT `fk_technologies_techCategory`
			FOREIGN KEY (`id_techCategory`)
			REFERENCES `db_sosm`.`technologyCategories` (`id_techCategory`)
			ON DELETE NO ACTION
			ON UPDATE NO ACTION;

		-- Create technologyCategories data (tailor as required)
		INSERT INTO technologyCategories (name,color) VALUES ('Red','red');
		INSERT INTO technologyCategories (name,color) VALUES ('Green','green');
		INSERT INTO technologyCategories (name,color) VALUES ('Blue','blue');

		-- Map technologies.category to technologyCategories (tailor as required)
		UPDATE technologies SET id_techCategory = (SELECT id_techCategory FROM technologyCategories WHERE name = 'Red') WHERE category = 'red' LIMIT 10
		UPDATE technologies SET id_techCategory = (SELECT id_techCategory FROM technologyCategories WHERE name = 'Green') WHERE category = 'green' LIMIT 10
		UPDATE technologies SET id_techCategory = (SELECT id_techCategory FROM technologyCategories WHERE name = 'Blue') WHERE category = 'blue' LIMIT 10

		-- Remove the technologies.category
		ALTER TABLE technologies DROP COLUMN category;

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

	--Change SystemInterfaceToLinkMap.category to SystemInterfaceToLinkMap.isPrimary
		ALTER TABLE SystemInterfaceToLinkMap ADD COLUMN isPrimary BOOLEAN;
		UPDATE SystemInterfaceToLinkMap SET isPrimary = 1 WHERE category = 'primary' LIMIT 1000;
		UPDATE SystemInterfaceToLinkMap SET isPrimary = 0 WHERE category = 'alternate' LIMIT 1000;
		DELETE FROM SystemInterfaceToLinkMap WHERE category = 'incapable' LIMIT 1000;
		--Make sure all categories have moved over before deleting the original column
		ALTER TABLE SystemInterfaceToLinkMap DROP COLUMN category;




-- TBA
-- Remove AMap table, as it should be able to be derived from data which already exists. Must replace serverSide/graph.js 'LinksForAssociatedSystems' first.