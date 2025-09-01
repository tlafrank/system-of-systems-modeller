const db = require('./db-adapter');
const logger = require('./logger.js');

// Helpers -----------------------------------------------------------------------------

async function runOne(sql, params = []) { return db.query(sql, params);}

async function runMany(statements) {
  // statements: Array<{ sql, params }>
  const promises = statements.map(s => db.query(s.sql, s.params || []));
  return Promise.all(promises);
}

/**
 * Builds a portable clause with $1,$2,… placeholders.
 * Returns { clause: '($i,$i+1,...)', params: [...] }
 */
function inClause(startIndex, arr) {
  if (!arr || arr.length === 0) return { clause: 'IN (NULL)', params: [] }; // empty -> no match
  const placeholders = arr.map((_, i) => `$${startIndex + i}`).join(', ');
  return { clause: `(${placeholders})`, params: [...arr] };
}


// Query Builders -----------------------------------------------------------------------

//Get the list of all interfaces attached to the subsystem
function qSubsystemInterfaces(id_subsystem) {
  return {
    sql: `
      SELECT
        SIMap.id_SIMap AS id_SIMap,
        SIMap.id_interface,
        interfaces.name,
        interfaces.image
      FROM SIMap
      LEFT JOIN interfaces ON SIMap.id_interface = interfaces.id_interface
      WHERE SIMap.id_subsystem = $1
    `,
    params: [id_subsystem],
  };
}

function qBasicIssues(subtype, id) {
  const types = {
    SubsystemInterface: { sql: `SELECT * FROM issues WHERE type = 'SubsystemInterface' AND id_type = $1`, param: id },
    Interface:          { sql: `SELECT * FROM issues WHERE type = 'Interface' AND id_type = $1`,           param: id },
    Feature:            { sql: `SELECT * FROM issues WHERE type = 'Feature' AND id_type = $1`,             param: id },
    Network:            { sql: `SELECT * FROM issues WHERE type = 'Network' AND id_type = $1`,             param: id },
  };
  const t = types[subtype];
  if (!t) throw new Error(`Unsupported BasicIssues subtype: ${subtype}`);
  return { sql: t.sql, params: [t.param] };
}

function qGraphSettings() {
  return {
    sql: `
      SELECT *
      FROM graphSettings
      -- (optional) ORDER BY setting
    `,
    params: [],
  };
}

function qInterface(id) {
  return id
    ? { sql: `SELECT * FROM interfaces WHERE id_interface = $1 ORDER BY name`, params: [id] }
    : { sql: `SELECT * FROM interfaces ORDER BY name`, params: [] };
}

function qSubsystem(id) {
  return id
    ? { sql: `SELECT * FROM subsystems WHERE id_subsystem = $1 ORDER BY name`, params: [id] }
    : { sql: `SELECT * FROM subsystems ORDER BY name`, params: [] };
}

function qFeatures() {
  return {
    sql: `SELECT * FROM features ORDER BY name`,
    params: [],
  };
}

function qSubsystemInterface(id){
  return {
    sql:`
        SELECT subsystems.id_subsystem, subsystems.name AS subsystemName, subsystems.image AS subsystemImage, SIMap.id_SIMap, SIMap.isProposed, SIMap.description, interfaces.id_interface, interfaces.name AS interfaceName, interfaces.image AS interfaceImage, interfaces.features
			  FROM subsystems
        INNER JOIN SIMap ON subsystems.id_subsystem = SIMap.id_subsystem
        INNER JOIN interfaces ON SIMap.id_interface = interfaces.id_interface
        WHERE SIMap.id_SIMap = $1;
    `,
    params: [id]
  }
    
}


function qIssue(subtype, id){
  const types = {
    SubsystemInterface: {sql: `
      SELECT issues.*, interfaces.image AS interfaceImage, interfaces.name AS interfaceName, subsystems.name AS subsystemName, subsystems.image AS subsystemImage, subsystems.id_subsystem
      FROM issues
      LEFT JOIN SIMap
      ON issues.id_type = SIMap.id_SIMap
      LEFT JOIN interfaces
      ON SIMap.id_interface = interfaces.id_interface
      LEFT JOIN subsystems
      ON SIMap.id_subsystem = subsystems.id_subsystem
      WHERE id_issue = $1`, param: id},
    Interface: {sql: `SELECT * FROM issues WHERE type = 'Interface' AND id_type = $1`, param: id},
    Feature: {sql: `SELECT * FROM issues WHERE type = 'Feature' AND id_type = $1`, param: id},
    Network: {sql: `SELECT * FROM issues WHERE type = 'Network' AND id_type = $1`, param: id},
  }
  const t = types[subtype];
  if (!t) throw new Error(`Unsupported Issue subtype: ${subtype}`);
  return { sql: t.sql, params: [t.param] };
}

function qQtyYears(id){
  return {
    sql: `
      SELECT *
		  FROM quantities
		  WHERE quantities.id_subsystem = $1
		  ORDER BY quantities.year
    `,
    params: [id]
  }
}

function qParty(){
  return {
    sql: `SELECT * FROM parties`,
    params: [],
  }
}

function qNetworks(){
  return { sql: `SELECT * FROM networks ORDER BY name`, params: [] }
}

function qNetwork(id){
  return id
    ? { sql: `
          SELECT networks.*, features.name AS featureName 
          FROM networks 
          LEFT JOIN features 
          ON networks.id_feature = features.id_feature
          WHERE networks.id_network = $1
          ORDER BY networks.name`,
        params: [id] 
      }
    : { sql: `
          SELECT networks.*, features.name AS featureName 
          FROM networks 
          LEFT JOIN features 
          ON networks.id_feature = features.id_feature
          ORDER BY networks.name`,
        params: [] 
      };
}

function qCompatibleNetworks(features){
  const { clause, params } = inClause(1, features);
  return {
    sql: `SELECT * FROM networks WHERE networks.id_feature IN ${clause}`,
    params: params,
  }
}

function qAssignedNetworks(id){
  return {
    sql: `SELECT * FROM SINMap
          LEFT JOIN networks
          ON SINMap.id_network = networks.id_network
          WHERE SINMap.id_SIMap = $1`,
    params: [id],
  }
}

function qIssues(subtype, ids){                                                                           //Need to fix to handle empty arrays
  // Normalise input to array
  const arr = Array.isArray(ids) ? ids : (ids != null ? [ids] : []);

  if (arr.length === 0) {
    // No IDs provided → return a dummy query that yields 0 rows
    return { sql: `SELECT * FROM issues WHERE 1=0`, params: [] };
  }

  const { clause, params } = inClause(1, ids);

  const types = {
    SubsystemInterface: {sql: `
      SELECT subsystems.name AS subsystemName, issues.severity, interfaces.name AS interfaceName, issues.name AS issueName, issues.issue, issues.resolution, interfaces.description, issues.id_issue, subsystems.id_subsystem, SIMap.id_SIMap
      FROM issues
				LEFT JOIN SIMap
				ON issues.id_type = SIMap.id_SIMap
				LEFT JOIN interfaces
				ON SIMap.id_interface = interfaces.id_interface
				LEFT JOIN subsystems
				ON SIMap.id_subsystem = subsystems.id_subsystem
				WHERE issues.type = 'SubsystemInterface' AND id_issue IN ${clause}
				ORDER BY subsystems.name`, param: params},
    Interface: {sql: `SELECT * FROM issues WHERE type = 'Interface' AND id_type = $1`, param: params},
    Feature: {sql: `SELECT * FROM issues WHERE type = 'Feature' AND id_type = $1`, param: params},
    Network: {sql: `SELECT * FROM issues WHERE type = 'Network' AND id_type = $1`, param: params},
  }
  const t = types[subtype];
  if (!t) throw new Error(`Unsupported Issues subtype: ${subtype}`);
  return { sql: t.sql, params: t.param };
}

function qIssueImages(subtype, id){
  const types = {
    SubsystemInterface: {sql: `
      SELECT interfaces.image AS interfaceImage, interfaces.name AS interfaceName, subsystems.name AS subsystemName, subsystems.image AS subsystemImage, subsystems.id_subsystem
				FROM SIMap
				LEFT JOIN subsystems
				ON SIMap.id_subsystem = subsystems.id_subsystem
				LEFT JOIN interfaces
				ON SIMap.id_interface = interfaces.id_interface
				WHERE id_SIMap = $1`, param: id},
    Interface: {sql: `SELECT * FROM issues WHERE type = 'Interface' AND id_type = $1`, param: id},
    Feature: {sql: `SELECT * FROM issues WHERE type = 'Feature' AND id_type = $1`, param: id},
    Network: {sql: `SELECT * FROM issues WHERE type = 'Network' AND id_type = $1`, param: id},
  }
  const t = types[subtype];
  if (!t) throw new Error(`Unsupported Issues subtype: ${subtype}`);
  return { sql: t.sql, params: [t.param] };
}

function qSIImages(id){
  return {
    sql: `
      SELECT interfaces.image AS interfaceImage, interfaces.name AS interfaceName, subsystems.name AS subsystemName, subsystems.image AS subsystemImage, subsystems.id_subsystem
		  FROM SIMap
		  LEFT JOIN subsystems
		  ON SIMap.id_subsystem = subsystems.id_subsystem
		  LEFT JOIN interfaces
		  ON SIMap.id_interface = interfaces.id_interface
		  WHERE id_SIMap = $1
    `,
    params: [id]
  }
}

function qCompatibleFeatures(id){
  return {
    sql: `
      SELECT interfaces.features AS features
		  FROM SIMap
		  LEFT JOIN interfaces
		  ON SIMap.id_interface = interfaces.id_interface
		  WHERE id_SIMap = $1`,
    params: [id],
  }
}

// Switch Controller -----------------------------------------------------------------------


exports.switch = async (req, res) => {
  try {

    let stmt;            // single {sql, params}
    let stmts = null;    // or array of statements if you need to run many

    logger.debug( { body: req.body }, 'select.js Request Body');

    switch (req.body.type){
      // ***** Subsystem *****
      case 'SubsystemInterfaces':
        stmt = qSubsystemInterfaces(req.body.id_subsystem);
      break;

      // ***** Issues *****
      case 'BasicIssues':
        stmt = qBasicIssues(req.body.subtype, req.body.id_SIMap || req.body.id_interface || req.body.id_feature || req.body.id_network);
      break;

      case 'Interface':
        stmt = qInterface(req.body.id_interface);
      break;

      case 'Subsystem':
        stmt = qSubsystem(req.body.id_subsystem);
      break;

      case 'Features':
        //Get all features in alphabertical order
        //Used to populate the add/update interface and network modals  
        stmt= qFeatures();
      break;

      case 'SubsystemInterface':
        stmt = qSubsystemInterface(req.body.id_SIMap);
      break;
	    
      // ***** Graph Settings *****
      case 'graphSettings':
        stmt = qGraphSettings();
      break;

      case 'Issue':
        stmt = qIssue(req.body.subtype, req.body.id_issue || req.body.id_interface || req.body.id_feature || req.body.id_network)
      break;

      case 'Network':
        stmt = qNetwork(req.body.id_network)
      break;

      case 'CompatibleNetworks':
        //Returns the list of networks which are matched to the features implemented by the particular interface
        //From: modals.mappingModal_interface()
        stmt = qCompatibleNetworks(req.body.features);
      break;

      case 'Networks':
        stmt = qNetworks();
      break;

      case 'AssignedNetworks':
        stmt = qAssignedNetworks(req.body.id_SIMap);
      break;

      case 'Issues':
        stmt = qIssues(req.body.subtype, req.body.id_issueArr || req.body.id_interface || req.body.id_feature || req.body.id_network);
      break;

      case 'IssueImages':
        stmt = qIssueImages(req.body.subtype, req.body.id_SIMap || req.body.id_interface || req.body.id_feature || req.body.id_network);
      break;

      case 'Party':
        stmt = qParty();
      break;

      case 'QtyYears':
        stmt = qQtyYears(req.body.id_subsystem);
      break;

      case 'SIImages':
        stmt = qSIImages(req.body.id_SIMap);
      break;

      case 'CompatibleFeatures':
        stmt = qCompatibleFeatures(req.body.id_SIMap);
      break;

      default:
        return res.status(400).json({ error: `Unknown select type: ${req.body.type}` });
    }

    // Execute
    if (stmts) {
      const results = await runMany(stmts); // array of result sets
      return res.json(results);
    } else {
      const rows = await runOne(stmt.sql, stmt.params);
      return res.json(rows);
    }

  } catch (err) {
    console.error('select.switch error', err);
    return res.status(500).json({ error: 'Internal error', details: String(err.message || err) });
  }
}
