const ParqueoRepository = require('./parqueo_repo');
const { getConnection } = require('../utils/db');

class ParqueoRepositoryDb extends ParqueoRepository {
  async getById(id) {
    const conn = await getConnection();
    try {
      const [rows] = await conn.query('SELECT id, nombre_provincia, nombre, precio_por_hora FROM prq_parqueo WHERE id = ?', [id]);
      return rows && rows.length ? rows[0] : null;
    } finally { await conn.end(); }
  }

  // filters: { nombre_provincia, nombre, precioMin, precioMax }
  async listByFilters(filters = {}) {
    const where = [];
    const params = [];
    if (filters.nombre_provincia) { where.push('LOWER(nombre_provincia) LIKE ?'); params.push('%' + filters.nombre_provincia.toLowerCase() + '%'); }
    if (filters.nombre) { where.push('LOWER(nombre) LIKE ?'); params.push('%' + filters.nombre.toLowerCase() + '%'); }
    if (filters.precioMin != null) { where.push('precio_por_hora >= ?'); params.push(filters.precioMin); }
    if (filters.precioMax != null) { where.push('precio_por_hora <= ?'); params.push(filters.precioMax); }
    const sql = 'SELECT id, nombre_provincia, nombre, precio_por_hora FROM prq_parqueo' + (where.length ? (' WHERE ' + where.join(' AND ')) : '');
    const conn = await getConnection();
    try { const [rows] = await conn.query(sql, params); return rows; } finally { await conn.end(); }
  }

  async create(record) {
    const conn = await getConnection();
    try {
      const { nombre_provincia, nombre, precio_por_hora } = record;
      const [res] = await conn.query('INSERT INTO prq_parqueo (nombre_provincia, nombre, precio_por_hora) VALUES (?, ?, ?)', [nombre_provincia, nombre, precio_por_hora]);
      const insertId = res.insertId;
      const [rows] = await conn.query('SELECT id, nombre_provincia, nombre, precio_por_hora FROM prq_parqueo WHERE id = ?', [insertId]);
      return rows && rows.length ? rows[0] : null;
    } finally { await conn.end(); }
  }

  async update(id, updated) {
    const conn = await getConnection();
    try {
      const sets = [];
      const params = [];
      if (updated.nombre_provincia !== undefined) { sets.push('nombre_provincia = ?'); params.push(updated.nombre_provincia); }
      if (updated.nombre !== undefined) { sets.push('nombre = ?'); params.push(updated.nombre); }
      if (updated.precio_por_hora !== undefined) { sets.push('precio_por_hora = ?'); params.push(updated.precio_por_hora); }
      if (sets.length === 0) return null;
      params.push(id);
      const sql = 'UPDATE prq_parqueo SET ' + sets.join(', ') + ' WHERE id = ?';
      const [res] = await conn.query(sql, params);
      if (res.affectedRows === 0) return null;
      const [rows] = await conn.query('SELECT id, nombre_provincia, nombre, precio_por_hora FROM prq_parqueo WHERE id = ?', [id]);
      return rows && rows.length ? rows[0] : null;
    } finally { await conn.end(); }
  }

  async delete(id) {
    const conn = await getConnection();
    try { const [res] = await conn.query('DELETE FROM prq_parqueo WHERE id = ?', [id]); return res.affectedRows > 0; } finally { await conn.end(); }
  }
}

module.exports = ParqueoRepositoryDb;
