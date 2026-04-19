// File: ./server/services/interfaces.service.js
const pool = require('../db/pool');
const repo = require('../models/interfaces.repo');

async function getEditView(id) {
  const [interfaces, allFeatures] = await Promise.all([
    repo.listInterfaces(),
    repo.listAllFeatures()
  ]);

  if (!id) {
    return {
      interfaces,
      interface: null,
      featuresAttached: [],
      featuresAvailable: allFeatures
    };
  }

  const entity = await repo.getInterfaceById(id);
  if (!entity) return null;

  const attached = await repo.listFeaturesForInterface(id);
  const attachedIds = new Set(attached.map(f => f.id_feature));
  const available = allFeatures.filter(f => !attachedIds.has(f.id_feature));

  return {
    interfaces,
    interface: entity,
    featuresAttached: attached,
    featuresAvailable: available
  };
}

async function upsertInterface(payload) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let id = payload.id_interface ? Number(payload.id_interface) : 0;

    if (id > 0) {
      await repo.updateInterface(conn, id, payload);
    } else {
      id = await repo.insertInterface(conn, payload);
    }

    await repo.replaceInterfaceFeatures(conn, id, payload.features || []);
    await conn.commit();

    return { id_interface: id, created: !payload.id_interface };
  } catch (e) {
    await conn.rollback();
    e.statusCode = e.statusCode || 400;
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = { getEditView, upsertInterface };
