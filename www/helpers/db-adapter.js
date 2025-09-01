'use strict';

const dialect = (process.env.DB_DIALECT || 'mysql').toLowerCase();
const isProd = process.env.NODE_ENV === 'production';
//let driver, pool;

if (dialect === 'postgres') {         //postgres isn't fitted with loggin yet.
  const { Pool } = require('pg');
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: false,
  });

  module.exports = {
    async query(sql, params=[]) { 
      const r = await pool.query(sql, params);
      return r.rows;
    },
    async tx(fn) { 
      const c = await pool.connect();
      try { 
        await c.query('BEGIN');
        const q = (sql, params = []) => c.query(sql, params).then(r => r.rows);
        const res = await fn(q);
        return res;
      } catch (e) {
        try { await c.query('ROLLBACK'); } catch {}
        throw e;
      } finally {
        c.realease();
      }
    }
  }
} else {
  const mysql = require('mysql2/promise');

  //For logging and sql query formatting
  const mysqlFmt = require('mysql2'); // non-promise version has .format()
  //const { format: sqlFormat } = require('sql-formatter'); // dev pretty           --Need to uninstall sql-formatter
  const logger = require('./logger.js');

  const isProd = process.env.NODE_ENV === 'production';
  function presentSql(sql) { return String(sql || '').replace(/\s+/g, ' ').trim(); }

  // Convert $1, $2, ... to ? for MySQL
  function pgToMysql(sqlText) {
    return String(sqlText).replace(/\$(\d+)/g, '?');
  }

  
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: false,
  });

  module.exports = {
    async query(sqlText, params = []) {
      const sql = pgToMysql(sqlText);

      //Logging
      const rendered = mysqlFmt.format(sql, params);
      logger.debug({sql: presentSql(rendered) }, 'DB Query');

      const [rows] = await pool.query(sql, params);
      return rows;
    },
    async tx(fn) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const q = async (sqlText, params = []) => {
          const sql = pgToMysql(sqlText);
          const [rows] = await conn.query(sql, params);
          return rows;
        };
        const res = await fn(q);
        await conn.commit();
        return res;
      } catch (e) {
        try { await conn.rollback(); } catch {}
        throw e;
      } finally {
        conn.release();
      }
    },
    async upsertUser(user) {
      await pool.query(
        `INSERT INTO users(id,email,name) VALUES(?,?,?)
         ON DUPLICATE KEY UPDATE email=VALUES(email), name=VALUES(name)`,
        [user.id, user.email, user.name]
      );
    },
  };
}

