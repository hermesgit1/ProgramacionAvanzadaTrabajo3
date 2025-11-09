// Model scaffold for prq_parqueo
module.exports = {
  tableName: 'prq_parqueo',
  columns: [
    { name: 'id', type: 'int', pk: true, autoIncrement: true },
    { name: 'nombre_provincia', type: 'varchar(100)' },
    { name: 'nombre', type: 'varchar(200)' },
    { name: 'precio_por_hora', type: 'decimal(10,2)' }
  ],
  sampleQueries: {
    selectAll: `SELECT id, nombre_provincia, nombre, precio_por_hora FROM prq_parqueo`,
    selectById: `SELECT id, nombre_provincia, nombre, precio_por_hora FROM prq_parqueo WHERE id = ?`,
    insert: `INSERT INTO prq_parqueo (nombre_provincia, nombre, precio_por_hora) VALUES (?, ?, ?)`,
    update: `UPDATE prq_parqueo SET nombre_provincia = ?, nombre = ?, precio_por_hora = ? WHERE id = ?`,
    delete: `DELETE FROM prq_parqueo WHERE id = ?`
  }
};
