// File: ./server/models/interfaces.repo.js
const pool = require('../db/pool');

async function listInterfaces() {
  const [rows] = await pool.query('SELECT id_interface, name FROM interfaces ORDER BY name');
  return rows;
}

async function getInterfaceById(id) {
  const [rows] = await pool.query(
    'SELECT id_interface, name, image, description FROM interfaces WHERE id_interface = ?',
    [id]
  );
  return rows[0] || null;
}

async function listAllFeatures() {
  const [rows] = await pool.query('SELECT id_feature, name FROM features ORDER BY name');
  return rows;
}

async function listFeaturesForInterface(id) {
  const [rows] = await pool.query(
    `SELECT f.id_feature, f.name
     FROM interface_features ife
     JOIN features f ON f.id_feature = ife.id_feature
     WHERE ife.id_interface = ?
     ORDER BY f.name`,
    [id]
  );
  return rows;
}

async function insertInterface(conn, dto) {
  const [res] = await conn.query(
    'INSERT INTO interfaces (name, image, description) VALUES (?, ?, ?)',
    [dto.name, dto.image ?? null, dto.description ?? null]
  );
  return res.insertId;
}

async function updateInterface(conn, id, dto) {
  await conn.query(
    'UPDATE interfaces SET name = ?, image = ?, description = ? WHERE id_interface = ?',
    [dto.name, dto.image ?? null, dto.description ?? null, id]
  );
}

async function replaceInterfaceFeatures(conn, id, featureIds) {
  await conn.query('DELETE FROM interface_features WHERE id_interface = ?', [id]);
  if (featureIds?.length) {
    const values = featureIds.map(fid => [id, fid]);
    await conn.query('INSERT INTO interface_features (id_interface, id_feature) VALUES ?', [values]);
  }
}

module.exports = {
  listInterfaces,
  getInterfaceById,
  listAllFeatures,
  listFeaturesForInterface,
  insertInterface,
  updateInterface,
  replaceInterfaceFeatures
};
