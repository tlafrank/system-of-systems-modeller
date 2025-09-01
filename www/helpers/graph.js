'use strict';
const db = require('./db-adapter');   // single import
const logger = require('./logger.js');
const Subsystem = require('./Subsystem');

// helpers
const runOne  = (sql, params=[]) => { return db.query(sql, params); };

const runMany = (stmts) => Promise.all(stmts.map(s => db.query(s.sql, s.params || [])));

/**
 * Builds a portable IN (...) clause with $1,$2,… placeholders.
 * Returns { clause: 'IN ($i,$i+1,...)', params: [...] }
 */
function inClause(startIndex, arr) {
  if (!arr || arr.length === 0) return { clause: 'IN (NULL)', params: [] }; // empty -> no match
  const placeholders = arr.map((_, i) => `$${startIndex + i}`).join(', ');
  return { clause: `IN (${placeholders})`, params: [...arr] };
}


// Switch Controller -----------------------------------------------------------------------

exports.switch = (req, res) => {
  
  logger.debug( { body: req.body }, 'graph.js Request Body');

  const subsystemsArr = [];
  const subsystemsIdArr = [];
  let quantities = [];
  let interfacesArr = [];
  const SIIdArr = [];
  const networksArr = [];
  const statsObj = {};

  // ---------------------- Step 1: subsystems + quantities ------------------

  (async () => {
    // Subsystems with optional tag filters
    const filters = [];
    const params  = [];

    if (req.body.includedFilterTag) {
      params.push(`%${req.body.includedFilterTag}%`);
      filters.push(`tags LIKE $${params.length}`);
    }
    if (req.body.excludedFilterTag) {
      params.push(`%${req.body.excludedFilterTag}%`);
      filters.push(`tags NOT LIKE $${params.length}`);
    }

    const subsystemsSQL = `
      SELECT id_subsystem, name, image, tags
      FROM subsystems
      ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
    `;

    const quantitiesSQL = `SELECT * FROM quantities ORDER BY id_subsystem`;

    const [subsRows, qtyRows] = await runMany([
      { sql: subsystemsSQL, params },
      { sql: quantitiesSQL, params: [] },
    ]);

    // Build Subsystem objects and attach per-year quantities
    subsRows.forEach((row) => {
      quantities = [];
      for (let i = 0; i < qtyRows.length; i++) {
        if (qtyRows[i].id_subsystem === row.id_subsystem) {
          quantities.push({ year: qtyRows[i].year, quantity: qtyRows[i].quantity });
        }
      }
      subsystemsArr.push(new Subsystem(row, quantities, req.body.showInterfaces));
    });

    // Prune subsystems not present in the requested year
    for (let i = 0; i < subsystemsArr.length; i++) {
      if (subsystemsArr[i].presentInYear(req.body.year)) {
        subsystemsIdArr.push(subsystemsArr[i].id_subsystem);
      } else {
        subsystemsArr.splice(i, 1);
        i--;
      }
    }

    if (subsystemsIdArr.length === 0) {
      // No subsystems in this year, so null response
      return res.json({ data: {} });
    }

    // ---------------------- Step 2: interfaces & SIMap ---------------------

    // All generic interfaces (for counts later)
    // SIMap for only the selected subsystems
    const { clause, params: inParams } = inClause(1, subsystemsIdArr);

    const interfacesSQL = `SELECT * FROM interfaces`;
    const siSQL = `
      SELECT
        SIMap.id_SIMap,
        SIMap.id_subsystem,
        interfaces.id_interface,
        interfaces.name,
        interfaces.image,
        SIMap.isProposed
      FROM SIMap
      LEFT JOIN interfaces ON interfaces.id_interface = SIMap.id_interface
      WHERE SIMap.id_subsystem ${clause}
      ORDER BY SIMap.id_subsystem
    `;

    const [interfacesRows, siRows] = await runMany([
      { sql: interfacesSQL, params: [] },
      { sql: siSQL, params: inParams },
    ]);

    // Build the in-memory interface table used for stats
    interfacesArr = interfacesRows.map((r) => ({
      id_interface: r.id_interface,
      name: r.name,
      quantity: 0,
      subsystems: [],
    }));

    // Attach each SI to its subsystem, and tally interface quantities for this year
    siRows.forEach((si) => {
      SIIdArr.push(si.id_SIMap);

      for (let i = 0; i < subsystemsArr.length; i++) {
        const sub = subsystemsArr[i];
        if (sub.id_subsystem === si.id_subsystem) {
          sub.interfaces.push({
            id_SIMap: si.id_SIMap,
            id_interface: si.id_interface,
            name: si.name,
            image: si.image,
            isProposed: si.isProposed,
            networks: [],
            issues: [],
          });

          // bump interface totals
          for (let j = 0; j < interfacesArr.length; j++) {
            if (interfacesArr[j].id_interface === si.id_interface) {
              interfacesArr[j].quantity += sub.qtySubsystemsThisYear;
              interfacesArr[j].subsystems.push(si.id_subsystem);
              break;
            }
          }
        }
      }
    });

    // prune interfaces with zero quantity for this year
    for (let i = 0; i < interfacesArr.length; i++) {
      if (interfacesArr[i].quantity === 0) {
        interfacesArr.splice(i, 1);
        i--;
      }
    }

    // ---------------------- Step 3: SINMap → networks ----------------------

    const { clause: sinClause, params: sinParams } = inClause(1, SIIdArr);
    const sinSQL = `
      SELECT SINMap.id_SIMap, SINMap.id_network, networks.name, networks.image
      FROM SINMap
      LEFT JOIN networks ON SINMap.id_network = networks.id_network
      WHERE SINMap.id_SIMap ${sinClause}
    `;

    const sinRows = await runOne(sinSQL, sinParams);

    // attach networks to each SI
    sinRows.forEach((row) => {
      let usedInYear = false;

      for (let i = 0; i < subsystemsArr.length; i++) {
        const sub = subsystemsArr[i];
        for (let j = 0; j < sub.interfaces.length; j++) {
          const si = sub.interfaces[j];
          if (si.id_SIMap === row.id_SIMap) {
            si.networks.push({ id_network: row.id_network });
            usedInYear = true;
          }
        }
      }

      if (usedInYear) {
        networksArr.push({ id_network: row.id_network, name: row.name, image: row.image });
      }
    });

    // ---------------------- Step 4: issues for SubsystemInterface ----------

    if (SIIdArr.length === 0) {
      // (unlikely if we got here) but handle gracefully
      return finishAndRespond();
    }

    const { clause: issuesClause, params: issuesParams } = inClause(1, SIIdArr);
    const issuesSQL = `
      SELECT subsystems.id_subsystem, issues.*
      FROM issues
      LEFT JOIN SIMap   ON SIMap.id_SIMap = issues.id_type
      LEFT JOIN subsystems ON SIMap.id_subsystem = subsystems.id_subsystem
      WHERE issues.id_type ${issuesClause}
        AND issues.type = 'SubsystemInterface'
    `;

    const issuesRows = await runOne(issuesSQL, issuesParams);

    // attach issues to the matching SI objects
    subsystemsArr.forEach((sub) => {
      sub.interfaces.forEach((si) => {
        issuesRows.forEach((iss) => {
          if (iss.id_subsystem === sub.id_subsystem && iss.id_type === si.id_SIMap) {
            si.issues.push({ severity: iss.severity, name: iss.name });
          }
        });
      });
    });

    // stats
    statsObj.issues = { subsystemInterfaces: issuesRows.map((r) => r.id_issue) };
    statsObj.interfaceCounts = interfacesArr;

    // ---------------------- Step 5: build response -------------------------

    return finishAndRespond();

    // ---------------------- helpers ---------------------------------------

    function finishAndRespond() {
      const responseArr = [];

      // network nodes
      networksArr.forEach((n) => {
        responseArr.push({
          group: 'nodes',
          data: {
            id: 'node_n_' + n.id_network,
            id_network: n.id_network,
            nodeType: 'Network',
            name: n.name,
            filename: './images/' + n.image,
          },
          classes: 'network',
        });
      });

      // subsystem nodes + edges from the Subsystem class
      subsystemsArr.forEach((sub) => {
        responseArr.push(...sub.getCyObject());
      });

      return res.send([responseArr, statsObj]);
    }
  })().catch((err) => {
    console.error(err);
    if (err && err.msg === 'No subsystems') {
      return res.json({ data: {} });
    }
    return res.json({ err: 'There was an error executing the query' });
  });
};

