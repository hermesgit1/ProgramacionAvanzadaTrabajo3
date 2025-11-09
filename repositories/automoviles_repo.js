// Base interface / abstract for Automoviles repository
class AutomovilesRepository {
  async getById(id) { throw new Error('Not implemented'); }
  async listByFilters(filters) { throw new Error('Not implemented'); }
  async create(record) { throw new Error('Not implemented'); }
  async update(id, updated) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}

module.exports = AutomovilesRepository;
