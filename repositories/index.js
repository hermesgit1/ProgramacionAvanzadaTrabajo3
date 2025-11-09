const AutomovilesRepositoryJson = require('./automoviles_repo_json');
const AutomovilesRepositoryDb = require('./automoviles_repo_db');
const ParqueoRepositoryJson = require('./parqueo_repo_json');
const ParqueoRepositoryDb = require('./parqueo_repo_db');
const IngresoRepositoryJson = require('./ingreso_repo_json');
const IngresoRepositoryDb = require('./ingreso_repo_db');

function createRepositories(source = 'json') {
  if (source === 'db') {
    return {
      automoviles: new AutomovilesRepositoryDb(),
      parqueo: new ParqueoRepositoryDb(),
      ingreso: new IngresoRepositoryDb()
    };
  }
  return {
    automoviles: new AutomovilesRepositoryJson(),
    parqueo: new ParqueoRepositoryJson(),
    ingreso: new IngresoRepositoryJson()
  };
}

module.exports = { createRepositories };
