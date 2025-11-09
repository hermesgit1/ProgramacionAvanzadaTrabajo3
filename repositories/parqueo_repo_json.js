const fs = require('fs');
const path = require('path');
const ParqueoRepository = require('./parqueo_repo');

function loadParques() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'prq_parqueo.json'), 'utf8'));
}

function approxMatch(value, pattern) {
  if (!pattern) return true;
  if (!value) return false;
  return value.toString().toLowerCase().includes(pattern.toString().toLowerCase());
}

class ParqueoRepositoryJson extends ParqueoRepository {
  async getById(id) {
    const parques = loadParques();
    return parques.find(p => p.id === Number(id)) || null;
  }

  // filters: { nombre_provincia, nombre, precioMin, precioMax }
  async listByFilters(filters = {}) {
    const parques = loadParques();
    return parques.filter(p => {
      if (filters.nombre_provincia && !approxMatch(p.nombre_provincia, filters.nombre_provincia)) return false;
      if (filters.nombre && !approxMatch(p.nombre, filters.nombre)) return false;
      if (filters.precioMin != null && p.precio_por_hora < filters.precioMin) return false;
      if (filters.precioMax != null && p.precio_por_hora > filters.precioMax) return false;
      return true;
    });
  }

  async create(record) {
    const parques = loadParques();
    const maxId = parques.reduce((m, p) => Math.max(m, p.id || 0), 0);
    const nextId = maxId + 1;
    const newRec = Object.assign({ id: nextId }, record);
    parques.push(newRec);
    fs.writeFileSync(path.join(__dirname, '..', 'prq_parqueo.json'), JSON.stringify(parques, null, 2), 'utf8');
    return newRec;
  }

  async update(id, updated) {
    const parques = loadParques();
    const idx = parques.findIndex(p => p.id === Number(id));
    if (idx === -1) return null;
    parques[idx] = Object.assign({}, parques[idx], updated, { id: parques[idx].id });
    fs.writeFileSync(path.join(__dirname, '..', 'prq_parqueo.json'), JSON.stringify(parques, null, 2), 'utf8');
    return parques[idx];
  }

  async delete(id) {
    let parques = loadParques();
    const orig = parques.length;
    parques = parques.filter(p => p.id !== Number(id));
    if (parques.length === orig) return false;
    fs.writeFileSync(path.join(__dirname, '..', 'prq_parqueo.json'), JSON.stringify(parques, null, 2), 'utf8');
    return true;
  }
}

module.exports = ParqueoRepositoryJson;
