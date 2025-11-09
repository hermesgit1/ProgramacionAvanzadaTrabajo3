const AutomovilesRepository = require('./automoviles_repo');
const { getConnection } = require('../utils/db');

class AutomovilesRepositoryDb extends AutomovilesRepository {
  async getById(id) {
    const conn = await getConnection();
    try {
      const [rows] = await conn.query('SELECT id, color, anio, fabricante, tipo FROM prq_automoviles WHERE id = ?', [id]);
      return rows && rows.length ? rows[0] : null;
    } finally {
      await conn.end();
    }
  }

  async listByFilters(filters = {}) {
    const where = [];
    const params = [];
    if (filters.color) { where.push('LOWER(color) LIKE ?'); params.push('%' + filters.color.toLowerCase() + '%'); }
    if (filters.fabricante) { where.push('LOWER(fabricante) LIKE ?'); params.push('%' + filters.fabricante.toLowerCase() + '%'); }
    if (filters.tipo) { where.push('LOWER(tipo) LIKE ?'); params.push('%' + filters.tipo.toLowerCase() + '%'); }
    if (filters.yearMin != null) { where.push('anio >= ?'); params.push(filters.yearMin); }
    if (filters.yearMax != null) { where.push('anio <= ?'); params.push(filters.yearMax); }
    const sql = 'SELECT id, color, anio, fabricante, tipo FROM prq_automoviles' + (where.length ? (' WHERE ' + where.join(' AND ')) : '') + ' ORDER BY id';
    const conn = await getConnection();
    try {
      const [rows] = await conn.query(sql, params);
      return rows;
    } finally { await conn.end(); }
  }

  async create(record) {
    const conn = await getConnection();
    try {
      const { color, anio, fabricante, tipo } = record;
      const [res] = await conn.query('INSERT INTO prq_automoviles (color, anio, fabricante, tipo) VALUES (?, ?, ?, ?)', [color, anio, fabricante, tipo]);
      const insertId = res.insertId;
      const [rows] = await conn.query('SELECT id, color, anio, fabricante, tipo FROM prq_automoviles WHERE id = ?', [insertId]);
      return rows && rows.length ? rows[0] : null;
    } finally { await conn.end(); }
  }

  async update(id, updated) {
    const conn = await getConnection();
    try {
      const sets = [];
      const params = [];
      if (updated.color !== undefined) { sets.push('color = ?'); params.push(updated.color); }
      if (updated.anio !== undefined) { sets.push('anio = ?'); params.push(updated.anio); }
      if (updated.fabricante !== undefined) { sets.push('fabricante = ?'); params.push(updated.fabricante); }
      if (updated.tipo !== undefined) { sets.push('tipo = ?'); params.push(updated.tipo); }
      if (sets.length === 0) return null;
      params.push(id);
      const sql = 'UPDATE prq_automoviles SET ' + sets.join(', ') + ' WHERE id = ?';
      const [res] = await conn.query(sql, params);
      if (res.affectedRows === 0) return null;
      const [rows] = await conn.query('SELECT id, color, anio, fabricante, tipo FROM prq_automoviles WHERE id = ?', [id]);
      return rows && rows.length ? rows[0] : null;
    } finally { await conn.end(); }
  }

  async delete(id) {
    const conn = await getConnection();
    try {
      const [res] = await conn.query('DELETE FROM prq_automoviles WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } finally { await conn.end(); }
  }
}

module.exports = AutomovilesRepositoryDb;
