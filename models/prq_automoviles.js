// Model scaffold for prq_automoviles
module.exports = {
  tableName: 'prq_automoviles',
  columns: [
    { name: 'id', type: 'int', pk: true, autoIncrement: true },
    { name: 'color', type: 'varchar(50)' },
    { name: 'anio', type: 'int' },
    { name: 'fabricante', type: 'varchar(100)' },
    { name: 'tipo', type: "enum('sedán','4x4','moto')" }
  ],
  sampleQueries: {
    selectAll: `SELECT id, color, anio, fabricante, tipo FROM prq_automoviles`,
    selectById: `SELECT id, color, anio, fabricante, tipo FROM prq_automoviles WHERE id = ?`,
    insert: `INSERT INTO prq_automoviles (color, anio, fabricante, tipo) VALUES (?, ?, ?, ?)` ,
    update: `UPDATE prq_automoviles SET color = ?, anio = ?, fabricante = ?, tipo = ? WHERE id = ?`,
    delete: `DELETE FROM prq_automoviles WHERE id = ?`
  }
};
