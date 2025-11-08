// Model scaffold for prq_ingreso_automoviles
module.exports = {
  tableName: 'prq_ingreso_automoviles',
  columns: [
    { name: 'consecutivo', type: 'int', pk: true, autoIncrement: true },
    { name: 'id_parqueo', type: 'int' },
    { name: 'id_automovil', type: 'int' },
    { name: 'fecha_hora_entrada', type: 'datetime' },
    { name: 'fecha_hora_salida', type: 'datetime', nullable: true }
  ],
  sampleQueries: {
    selectAll: `SELECT consecutivo, id_parqueo, id_automovil, fecha_hora_entrada, fecha_hora_salida FROM prq_ingreso_automoviles`,
    selectById: `SELECT consecutivo, id_parqueo, id_automovil, fecha_hora_entrada, fecha_hora_salida FROM prq_ingreso_automoviles WHERE consecutivo = ?`,
    insert: `INSERT INTO prq_ingreso_automoviles (id_parqueo, id_automovil, fecha_hora_entrada, fecha_hora_salida) VALUES (?, ?, ?, ?)` ,
    update: `UPDATE prq_ingreso_automoviles SET id_parqueo = ?, id_automovil = ?, fecha_hora_entrada = ?, fecha_hora_salida = ? WHERE consecutivo = ?`,
    delete: `DELETE FROM prq_ingreso_automoviles WHERE consecutivo = ?`
  }
};

// Helper to attach computed fields to a row. Uses models/prq_ingreso_custom.
module.exports.attachComputedFields = function(row, pricePerHour = null, billingMode = 'proportional') {
  try {
    const IngresoCustom = require('./prq_ingreso_custom');
    const custom = new IngresoCustom(row, pricePerHour, billingMode);
    return Object.assign({}, row, custom.computed);
  } catch (err) {
    // fallback: return row with null computed fields
    return Object.assign({}, row, { durationMinutes: null, durationHours: null, amountToPay: null });
  }
};
