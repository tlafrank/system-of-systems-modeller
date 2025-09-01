// www/helpers/update.js
'use strict';

const db = require('./db-adapter'); // adapter supports $n → ? on MySQL-like backends
const logger = require('./logger');

// Debug ----------------------------------------------------------------------
let debugOn = true;                     // flip to true or wire to process.env.DEBUG_SQL
const debug = (...a) => { if (debugOn) console.log('[update]', ...a); };

// Helpers --------------------------------------------------------------------
const runOne  = (sql, params = []) => { return db.query(sql, params); };
const runMany = (stmts = []) => Promise.all(stmts.map(s => runOne(s.sql, s.params || [])));

const tx = (fn) => db.tx(fn); // thin wrapper for symmetry with select.js’ helpers

// Query Builders --------------------------------------------------------------

// Subsystems
function qUpsertSubsystem(b) {
  if (b.id_subsystem > 0) {
    return {
      sql: `
        UPDATE subsystems
           SET name=$1, image=$2, description=$3, tags=$4, reference=$5
         WHERE id_subsystem=$6
      `,
      params: [b.name, b.image ?? null, b.description ?? null, b.tags ?? null, b.reference ?? null, b.id_subsystem],
    };
  }
  return {
    sql: `
      INSERT INTO subsystems (name, image, description, tags, reference)
      VALUES ($1,$2,$3,$4,$5)
    `,
    params: [b.name, b.image ?? null, b.description ?? null, b.tags ?? null, b.reference ?? null],
  };
}

// Interfaces
function qUpsertInterface(b) {
  if (b.id_interface > 0) {
    return {
      sql: `
        UPDATE interfaces
           SET name=$1, image=$2, description=$3, features=$4
         WHERE id_interface=$5
      `,
      params: [
        b.name,
        b.image ?? null,
        b.description ?? null,
        b.features ? String(b.features) : null, // CSV as per existing schema
        b.id_interface,
      ],
    };
  }
  return {
    sql: `
      INSERT INTO interfaces (name, image, description, features)
      VALUES ($1,$2,$3,$4)
    `,
    params: [b.name, b.image ?? null, b.description ?? null, b.features ? String(b.features) : null],
  };
}

function qDeleteInterface(id_interface) {
  return { sql: `DELETE FROM interfaces WHERE id_interface=$1`, params: [id_interface] };
}

// SIMap
function qMapInterfaceToSubsystem(id_interface, id_subsystem) {
  return { sql: `INSERT INTO SIMap (id_interface, id_subsystem) VALUES ($1,$2)`, params: [id_interface, id_subsystem] };
}
function qDeleteInterfaceFromSubsystem(id_SIMap) {
  return { sql: `DELETE FROM SIMap WHERE id_SIMap=$1`, params: [id_SIMap] };
}
function qUpdateSIMap(b) {
  return {
    sql: `UPDATE SIMap SET isProposed=$1, description=$2 WHERE id_SIMap=$3`,
    params: [b.isProposed ? 1 : 0, b.description ?? null, b.id_SIMap],
  };
}

// Networks
function qUpsertNetwork(b) {
  if (b.id_network > 0) {
    return {
      sql: `
        UPDATE networks
           SET name=$1, image=$2, description=$3, id_feature=$4
         WHERE id_network=$5
      `,
      params: [b.name, b.image ?? null, b.description ?? null, b.id_feature ?? null, b.id_network],
    };
  }
  return {
    sql: `
      INSERT INTO networks (name, image, description, id_feature)
      VALUES ($1,$2,$3,$4)
    `,
    params: [b.name, b.image ?? null, b.description ?? null, b.id_feature ?? null],
  };
}
function qUpdateNetworkFeature(id_network, id_feature) {
  return { sql: `UPDATE networks SET id_feature=$1 WHERE id_network=$2`, params: [id_feature ?? null, id_network] };
}

// SINMap (network↔SI)
function qMapNetworkToSI(id_SIMap, id_network) {
  return { sql: `INSERT INTO SINMap (id_SIMap, id_network) VALUES ($1,$2)`, params: [id_SIMap, id_network] };
}
function qDeleteNetworkFromSI(id_SINMap) {
  return { sql: `DELETE FROM SINMap WHERE id_SINMap=$1`, params: [id_SINMap] };
}

// Features
function qUpsertFeature(b) {
  if (b.id_feature) {
    return {
      sql: `UPDATE features SET name=$1, description=$2 WHERE id_feature=$3`,
      params: [b.name, b.description ?? null, b.id_feature],
    };
  }
  return { sql: `INSERT INTO features (name, description) VALUES ($1,$2)`, params: [b.name, b.description ?? null] };
}
function qDeleteFeature(id_feature) {
  return { sql: `DELETE FROM features WHERE id_feature=$1`, params: [id_feature] };
}

// Quantities (multi-row) → transaction
async function tReplaceQuantities(b) {
  return tx(async (q) => {
    await q(`DELETE FROM quantities WHERE id_subsystem=$1`, [b.id_subsystem]);
    for (const el of b.years || []) {
      await q(`INSERT INTO quantities (id_subsystem, year, quantity) VALUES ($1,$2,$3)`, [b.id_subsystem, el.year, el.quantity]);
    }
    return { ok: true };
  });
}

// Graph settings (multi-row) → transaction
async function tReplaceGraphSettings(settings) {
  return tx(async (q) => {
    await q(`TRUNCATE TABLE graphSettings`, []);
    for (const s of settings || []) {
      await q(`INSERT INTO graphSettings (keyName, value) VALUES ($1,$2)`, [s.keyName, s.value]);
    }
    return { ok: true };
  });
}

// Issues (SubsystemInterface)
function qUpsertIssueSubsystemInterface(b) {
  if (b.id_issue > 0) {
    return {
      sql: `
        UPDATE issues
           SET type='SubsystemInterface',
               id_type=$1, name=$2, severity=$3, issue=$4, resolution=$5
         WHERE id_issue=$6
      `,
      params: [b.id_SIMap, b.name, b.severity, b.issue ?? null, b.resolution ?? null, b.id_issue],
    };
  }
  return {
    sql: `
      INSERT INTO issues (type, id_type, name, severity, issue, resolution)
      VALUES ('SubsystemInterface', $1, $2, $3, $4, $5)
    `,
    params: [b.id_SIMap, b.name, b.severity, b.issue ?? null, b.resolution ?? null],
  };
}

// Controller (arranged like select.js) ---------------------------------------

exports.switch = async (req, res) => {
  try {
    const t = req.body.type;
    logger.debug( { body: req.body }, 'update.js Request Body');

    let stmt = null;       // single { sql, params }
    let stmts = null;      // array for batched work
    let thunk = null;      // function to run (transactions / complex flows)

    switch (t) {
      // Subsystem
      case 'Subsystem':
        stmt = qUpsertSubsystem(req.body);
        break;

      // Interface CRUD
      case 'Interface':
        stmt = qUpsertInterface(req.body);
        break;

      case 'InterfaceDelete':
        stmt = qDeleteInterface(req.body.id_interface);
        break;

      // Subsystem ↔ Interface mapping
      case 'InterfaceToSubsystem':
        stmt = qMapInterfaceToSubsystem(req.body.id_interface, req.body.id_subsystem);
        break;

      case 'DeleteInterfaceFromSubsystem':
        stmt = qDeleteInterfaceFromSubsystem(req.body.id_SIMap);
        break;

      case 'UpdateSIMap':
        stmt = qUpdateSIMap(req.body);
        break;

      // Network CRUD + mapping
      case 'Network':
        stmt = qUpsertNetwork(req.body);
        break;

      case 'NetworkFeature':
        stmt = qUpdateNetworkFeature(req.body.id_network, req.body.id_feature ?? null);
        break;

      case 'NetworkToSubsystemInterface':
        stmt = qMapNetworkToSI(req.body.id_SIMap, req.body.id_network);
        break;

      case 'DeleteNetworkFromInterface':
        stmt = qDeleteNetworkFromSI(req.body.id_SINMap);
        break;

      // Features
      case 'Feature':
        stmt = qUpsertFeature(req.body);
        break;

      case 'DeleteFeature':
        stmt = qDeleteFeature(req.body.id_feature);
        break;

      // Quantities (multi)
      case 'QtyYears':
        thunk = () => tReplaceQuantities(req.body);
        break;

      // Settings (multi)
      case 'Settings':
        thunk = () => tReplaceGraphSettings(req.body.settings || []);
        break;

      // Issues
      case 'Issue':
        switch (req.body.subtype) {
          case 'SubsystemInterface':
            stmt = qUpsertIssueSubsystemInterface(req.body);
            break;
          default:
            return res.status(400).json({ ok: false, error: `Unknown Issue subtype: ${req.body.subtype}` });
        }
        break;

      default:
        return res.status(400).json({ ok: false, error: `Unknown update type: ${t}` });
    }

    if (thunk) {
      const result = await thunk();
      return res.json({ ok: true, result });
    }
    if (stmts) {
      const result = await runMany(stmts);
      return res.json({ ok: true, result });
    }
    if (stmt) {
      const result = await runOne(stmt.sql, stmt.params);
      return res.json({ ok: true, result });
    }

    return res.status(500).json({ ok: false, error: 'No operation resolved' });
  } catch (err) {
    console.error('update.switch error', err);
    return res.status(500).json({ ok: false, error: 'There was an error executing the update' });
  }
};
