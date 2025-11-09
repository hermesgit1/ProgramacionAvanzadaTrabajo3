const IngresoRepository = require('./ingreso_repo');
const { getConnection } = require('../utils/db');
const ingresoModel = require('../models/prq_ingreso_automoviles');

function formatDateTime(dt) {
  if (!dt) return null;
  return dt.toISOString().replace('T',' ').slice(0,19);
}

class IngresoRepositoryDb extends IngresoRepository {
  async getById(id) {
    const conn = await getConnection();
    try {
      const [rows] = await conn.query('SELECT consecutivo, id_parqueo, id_automovil, fecha_hora_entrada, fecha_hora_salida FROM prq_ingreso_automoviles WHERE consecutivo = ?', [id]);
      return rows && rows.length ? rows[0] : null;
    } finally { await conn.end(); }
  }

  async ObtenerPrecioPorHoraPorParqueo(id_parqueo) {
    const conn = await getConnection();
    try {
      const [rows] = await conn.query('SELECT precio_por_hora FROM prq_parqueo WHERE id = ?', [id_parqueo]);
      return rows && rows.length ? rows[0].precio_por_hora : null;
    } finally { await conn.end(); }
  }

  async listByTypeAndDateRange(tipo, start, end, billingMode = 'proportional') {
    const conn = await getConnection();
    try {
      const [rows] = await conn.query(`
        SELECT i.consecutivo, i.id_parqueo, i.id_automovil, i.fecha_hora_entrada, i.fecha_hora_salida, p.precio_por_hora, a.fabricante, a.tipo
        FROM prq_ingreso_automoviles i
        JOIN prq_automoviles a ON a.id = i.id_automovil
        LEFT JOIN prq_parqueo p ON p.id = i.id_parqueo
        WHERE LOWER(a.tipo) LIKE ? AND i.fecha_hora_entrada BETWEEN ? AND ?
        ORDER BY i.consecutivo
      `, ['%'+tipo.toLowerCase()+'%', start, end]);
      return rows.map(r => ingresoModel.attachComputedFields({
        consecutivo: r.consecutivo,
        id_parqueo: r.id_parqueo,
        id_automovil: r.id_automovil,
        fecha_hora_entrada: formatDateTime(r.fecha_hora_entrada),
        fecha_hora_salida: formatDateTime(r.fecha_hora_salida)
      }, r.precio_por_hora ?? null, billingMode));
    } finally { await conn.end(); }
  }

  async listByProvinceAndDateRange(provincia, start, end, billingMode = 'proportional') {
    const conn = await getConnection();
    try {
      const [rows] = await conn.query(`
        SELECT i.consecutivo, i.id_parqueo, i.id_automovil, i.fecha_hora_entrada, i.fecha_hora_salida, p.precio_por_hora, p.nombre_provincia, a.fabricante, a.tipo
        FROM prq_ingreso_automoviles i
        JOIN prq_parqueo p ON p.id = i.id_parqueo
        JOIN prq_automoviles a ON a.id = i.id_automovil
        WHERE LOWER(p.nombre_provincia) LIKE ? AND i.fecha_hora_entrada BETWEEN ? AND ?
        ORDER BY i.consecutivo
      `, ['%'+provincia.toLowerCase()+'%', start, end]);
      return rows.map(r => Object.assign({ fabricante: r.fabricante, tipo: r.tipo, provincia: r.nombre_provincia }, ingresoModel.attachComputedFields({
        consecutivo: r.consecutivo,
        id_parqueo: r.id_parqueo,
        id_automovil: r.id_automovil,
        fecha_hora_entrada: formatDateTime(r.fecha_hora_entrada),
        fecha_hora_salida: formatDateTime(r.fecha_hora_salida)
      }, r.precio_por_hora ?? null, billingMode)));
    } finally { await conn.end(); }
  }

  async create(record) {
    const conn = await getConnection();
    try {
      const [res] = await conn.execute(
        'INSERT INTO prq_ingreso_automoviles (id_parqueo, id_automovil, fecha_hora_entrada, fecha_hora_salida) VALUES (?, ?, ?, ?)',
        [record.id_parqueo, record.id_automovil, record.fecha_hora_entrada || null, record.fecha_hora_salida || null]
      );
      const insertedId = res.insertId;
      return await this.getById(insertedId);
    } finally { await conn.end(); }
  }

  async update(id, updated) {
    const conn = await getConnection();
    try {
      await conn.execute(
        'UPDATE prq_ingreso_automoviles SET id_parqueo = ?, id_automovil = ?, fecha_hora_entrada = ?, fecha_hora_salida = ? WHERE consecutivo = ?',
        [updated.id_parqueo, updated.id_automovil, updated.fecha_hora_entrada || null, updated.fecha_hora_salida || null, id]
      );
      return await this.getById(id);
    } finally { await conn.end(); }
  }

  async delete(id) {
    const conn = await getConnection();
    try {
      const [res] = await conn.execute('DELETE FROM prq_ingreso_automoviles WHERE consecutivo = ?', [id]);
      return res.affectedRows && res.affectedRows > 0;
    } finally { await conn.end(); }
  }
}

module.exports = IngresoRepositoryDb;
