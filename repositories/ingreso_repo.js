class IngresoRepository {
  async getById(id) { throw new Error('Not implemented'); }
  async ObtenerPrecioPorHoraPorParqueo(id_parqueo) { throw new Error('Not implemented'); }
  async listByTypeAndDateRange(tipo, start, end) { throw new Error('Not implemented'); }
  async listByProvinceAndDateRange(provincia, start, end) { throw new Error('Not implemented'); }
  async create(record) { throw new Error('Not implemented'); }
  async update(id, updated) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}

module.exports = IngresoRepository;
