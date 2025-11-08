const { createRepositories } = require('../repositories');

async function demo(source) {
  console.log('Using source:', source);
  const repos = createRepositories(source);

  console.log('\n--- Automoviles: filter by color=Blanco, year 2020-2023 ---');
  const autos = await repos.automoviles.listByFilters({ color: 'Blanco', yearMin: 2020, yearMax: 2023 });
  console.log(autos);

  console.log('\n--- Parqueos: provincia=San José, precio range 500-1500 ---');
  const parques = await repos.parqueo.listByFilters({ nombre_provincia: 'San José', precioMin: 500, precioMax: 1500 });
  console.log(parques);

  console.log('\n--- Ingresos: listByTypeAndDateRange tipo=sedán between 2025-11-08 00:00:00 and 2025-11-09 00:00:00 ---');
  const ingresosTipo = await repos.ingreso.listByTypeAndDateRange('sedán', '2025-11-08 00:00:00', '2025-11-09 00:00:00');
  console.log(ingresosTipo.slice(0,5));

  console.log('\n--- Ingresos: listByProvinceAndDateRange provincia=San José between 2025-11-08 00:00:00 and 2025-11-09 00:00:00 ---');
  const ingresosProv = await repos.ingreso.listByProvinceAndDateRange('San José', '2025-11-08 00:00:00', '2025-11-09 00:00:00');
  console.log(ingresosProv.slice(0,5));
}

(async () => {
  await demo('json');
  // to try DB (requires credentials and grants), uncomment next line
  // await demo('db');
})();
