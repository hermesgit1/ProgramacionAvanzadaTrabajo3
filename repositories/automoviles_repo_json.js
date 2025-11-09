const fs = require('fs');
const path = require('path');
const AutomovilesRepository = require('./automoviles_repo');

function loadAutos() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'prq_automoviles.json'), 'utf8'));
}

function approxMatch(value, pattern) {
  if (!pattern) return true;
  if (!value) return false;
  return value.toString().toLowerCase().includes(pattern.toString().toLowerCase());
}

class AutomovilesRepositoryJson extends AutomovilesRepository {
  async getById(id) {
    const autos = loadAutos();
    return autos.find(a => a.id === Number(id)) || null;
  }

  // filters: { color, yearMin, yearMax, fabricante, tipo }
  async listByFilters(filters = {}) {
    const autos = loadAutos();
    return autos.filter(a => {
      if (filters.color && !approxMatch(a.color, filters.color)) return false;
      if (filters.fabricante && !approxMatch(a.fabricante, filters.fabricante)) return false;
      if (filters.tipo && !approxMatch(a.tipo, filters.tipo)) return false;
      if (filters.yearMin != null && a.anio < filters.yearMin) return false;
      if (filters.yearMax != null && a.anio > filters.yearMax) return false;
      return true;
    });
  }

  async create(record) {
    const autos = loadAutos();
    const maxId = autos.reduce((m, a) => Math.max(m, a.id || 0), 0);
    const nextId = maxId + 1;
    const newRec = Object.assign({ id: nextId }, record);
    autos.push(newRec);
    fs.writeFileSync(path.join(__dirname, '..', 'prq_automoviles.json'), JSON.stringify(autos, null, 2), 'utf8');
    return newRec;
  }

  async update(id, updated) {
    const autos = loadAutos();
    const idx = autos.findIndex(a => a.id === Number(id));
    if (idx === -1) return null;
    autos[idx] = Object.assign({}, autos[idx], updated, { id: autos[idx].id });
    fs.writeFileSync(path.join(__dirname, '..', 'prq_automoviles.json'), JSON.stringify(autos, null, 2), 'utf8');
    return autos[idx];
  }

  async delete(id) {
    let autos = loadAutos();
    const origLen = autos.length;
    autos = autos.filter(a => a.id !== Number(id));
    if (autos.length === origLen) return false;
    fs.writeFileSync(path.join(__dirname, '..', 'prq_automoviles.json'), JSON.stringify(autos, null, 2), 'utf8');
    return true;
  }
}

module.exports = AutomovilesRepositoryJson;
