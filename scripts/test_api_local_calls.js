// Test the attachComputedFields helper for both billing modes without starting HTTP server
const path = require('path');
const fs = require('fs');
const ingresoModel = require(path.join('..','models','prq_ingreso_automoviles'));

function loadJSON(name) { return JSON.parse(fs.readFileSync(path.join(__dirname,'..', name),'utf8')); }
const parques = loadJSON('prq_parqueo.json');
const ingresos = loadJSON('prq_ingreso_automoviles.json');
const parkPriceById = new Map(); parques.forEach(p=>parkPriceById.set(p.id,p.precio_por_hora));

console.log('Sample results for billingMode=proportional');
ingresos.slice(0,5).forEach(r=>{
  const price = parkPriceById.get(r.id_parqueo) ?? null;
  const out = ingresoModel.attachComputedFields(r, price, 'proportional');
  console.log(JSON.stringify(out, null, 2));
});

console.log('\nSample results for billingMode=hourly_ceil');
ingresos.slice(0,5).forEach(r=>{
  const price = parkPriceById.get(r.id_parqueo) ?? null;
  const out = ingresoModel.attachComputedFields(r, price, 'hourly_ceil');
  console.log(JSON.stringify(out, null, 2));
});
