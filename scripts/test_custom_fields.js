// Test script to compute custom fields for prq_ingreso_automoviles using local JSON fixtures
const fs = require('fs');
const path = require('path');
const IngresoCustom = require(path.join('..', 'models', 'prq_ingreso_custom'));

function loadJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));
}

const parques = loadJSON('prq_parqueo.json');
const autos = loadJSON('prq_automoviles.json');
const ingresos = loadJSON('prq_ingreso_automoviles.json');

// map parqueo id => precio_por_hora
const parkPriceById = new Map();
parques.forEach(p => parkPriceById.set(p.id, p.precio_por_hora));

console.log('Testing custom fields for prq_ingreso_automoviles');
console.log('Total ingresos:', ingresos.length);

ingresos.forEach(i => {
  const price = parkPriceById.get(i.id_parqueo) ?? null;
  const custom = new IngresoCustom(i, price);
  console.log('\nConsecutivo:', i.consecutivo);
  console.log('  id_parqueo:', i.id_parqueo, 'pricePerHour:', price);
  console.log('  fecha_entrada:', i.fecha_hora_entrada, 'fecha_salida:', i.fecha_hora_salida);
  console.log('  durationMinutes:', custom.durationMinutes);
  console.log('  durationHours:', custom.durationHours);
  console.log('  amountToPay:', custom.amountToPay);
});
