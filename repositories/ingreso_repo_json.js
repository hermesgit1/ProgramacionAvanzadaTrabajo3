const fs = require('fs');
const path = require('path');
const IngresoRepository = require('./ingreso_repo');
const ingresoModel = require('../models/prq_ingreso_automoviles');

function loadJSON(name) { return JSON.parse(fs.readFileSync(path.join(__dirname,'..', name),'utf8')); }
const parquesFile = 'prq_parqueo.json';
const autosFile = 'prq_automoviles.json';
const ingresosFile = 'prq_ingreso_automoviles.json';

function toDate(s) { return s ? new Date(s.replace(' ', 'T')) : null; }

class IngresoRepositoryJson extends IngresoRepository {
  async getById(id) {
    const ingresos = loadJSON(ingresosFile);
    return ingresos.find(i => i.consecutivo === Number(id)) || null;
  }

  async ObtenerPrecioPorHoraPorParqueo(id_parqueo) {
    const parques = loadJSON(parquesFile);
    const p = parques.find(x => x.id === Number(id_parqueo));
    return p ? p.precio_por_hora : null;
  }

  // tipo: string, start/end are ISO-like strings 'YYYY-MM-DD HH:mm:ss'
  async listByTypeAndDateRange(tipo, start, end, billingMode = 'proportional') {
    const ingresos = loadJSON(ingresosFile);
    const autos = loadJSON(autosFile);
    const parques = loadJSON(parquesFile);
    const startD = toDate(start);
    const endD = toDate(end);
    const results = [];
    for (const ing of ingresos) {
      const a = autos.find(x => x.id === ing.id_automovil);
      if (!a) continue;
      if (!a.tipo || !a.tipo.toLowerCase().includes((tipo||'').toLowerCase())) continue;
      const ent = toDate(ing.fecha_hora_entrada);
      if (!ent) continue;
      if (startD && ent < startD) continue;
      if (endD && ent > endD) continue;
      const parque = parques.find(p => p.id === ing.id_parqueo);
      const price = parque ? parque.precio_por_hora : null;
  const row = ingresoModel.attachComputedFields(ing, price, billingMode);
  results.push(Object.assign({ fabricante: a ? a.fabricante : null, tipo: a ? a.tipo : null }, row));
    }
    return results;
  }

  async listByProvinceAndDateRange(provincia, start, end, billingMode = 'proportional') {
    const ingresos = loadJSON(ingresosFile);
    const autos = loadJSON(autosFile);
    const parques = loadJSON(parquesFile);
    const startD = toDate(start);
    const endD = toDate(end);
    const results = [];
    for (const ing of ingresos) {
      const parque = parques.find(p => p.id === ing.id_parqueo);
      if (!parque) continue;
      if (!parque.nombre_provincia || !parque.nombre_provincia.toLowerCase().includes((provincia||'').toLowerCase())) continue;
      const ent = toDate(ing.fecha_hora_entrada);
      if (!ent) continue;
      if (startD && ent < startD) continue;
      if (endD && ent > endD) continue;
      const a = autos.find(x => x.id === ing.id_automovil);
      const price = parque.precio_por_hora;
  const row = ingresoModel.attachComputedFields(ing, price, billingMode);
  results.push(Object.assign({ fabricante: a ? a.fabricante : null, tipo: a ? a.tipo : null, provincia: parque.nombre_provincia }, row));
    }
    return results;
  }

  async create(record) {
    const file = path.join(__dirname, '..', ingresosFile);
    const rows = loadJSON(ingresosFile);
    const maxId = rows.reduce((m, r) => Math.max(m, r.consecutivo || 0), 0);
    const newId = maxId + 1;
    const now = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const toInsert = Object.assign({}, record, { consecutivo: newId, fecha_hora_entrada: record.fecha_hora_entrada || now });
    rows.push(toInsert);
    fs.writeFileSync(file, JSON.stringify(rows, null, 2), 'utf8');
    return toInsert;
  }

  async update(id, updated) {
    const file = path.join(__dirname, '..', ingresosFile);
    const rows = loadJSON(ingresosFile);
    const idx = rows.findIndex(r => r.consecutivo === Number(id));
    if (idx === -1) return null;
    rows[idx] = Object.assign({}, rows[idx], updated);
    fs.writeFileSync(file, JSON.stringify(rows, null, 2), 'utf8');
    return rows[idx];
  }

  async delete(id) {
    const file = path.join(__dirname, '..', ingresosFile);
    const rows = loadJSON(ingresosFile);
    const idx = rows.findIndex(r => r.consecutivo === Number(id));
    if (idx === -1) return false;
    rows.splice(idx, 1);
    fs.writeFileSync(file, JSON.stringify(rows, null, 2), 'utf8');
    return true;
  }
}

module.exports = IngresoRepositoryJson;
