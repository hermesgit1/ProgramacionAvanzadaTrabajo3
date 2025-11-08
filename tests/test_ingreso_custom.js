const IngresoCustom = require('../models/prq_ingreso_custom');

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    console.error('FAIL:', message, 'expected:', expected, 'actual:', actual);
    process.exit(1);
  }
}

// Test 1: proportional billing
const rec1 = {
  fecha_hora_entrada: '2025-11-08 08:00:00',
  fecha_hora_salida: '2025-11-08 10:30:00'
};
const ic1 = new IngresoCustom(rec1, 1000, 'proportional');
assertEqual(ic1.durationMinutes, 150, 'durationMinutes proportional');
assertEqual(ic1.durationHours, 2.5, 'durationHours proportional');
assertEqual(ic1.amountToPay, 2500, 'amountToPay proportional');

// Test 2: hourly_ceil billing
const ic2 = new IngresoCustom(rec1, 1000, 'hourly_ceil');
assertEqual(ic2.durationMinutes, 150, 'durationMinutes hourly_ceil');
assertEqual(ic2.durationHours, 2.5, 'durationHours hourly_ceil');
assertEqual(ic2.amountToPay, 3000, 'amountToPay hourly_ceil');

// Test 3: null salida -> nulls
const recNull = { fecha_hora_entrada: '2025-11-08 08:00:00', fecha_hora_salida: null };
const ic3 = new IngresoCustom(recNull, 1000, 'proportional');
assertEqual(ic3.durationMinutes, null, 'durationMinutes null salida');
assertEqual(ic3.durationHours, null, 'durationHours null salida');
assertEqual(ic3.amountToPay, null, 'amountToPay null salida');

console.log('All IngresoCustom tests passed');
