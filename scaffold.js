// scaffold.js — prints a scaffold summary for PRQ tables
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');

function isPrqFile(name) {
  return name.toLowerCase().startsWith('prq_') && name.toLowerCase().endsWith('.js');
}

console.log('Scanning models for PRQ tables in', modelsDir);

const files = fs.readdirSync(modelsDir).filter(isPrqFile);
if (files.length === 0) {
  console.log('No PRQ model files found.');
  process.exit(0);
}

files.forEach(file => {
  const model = require(path.join(modelsDir, file));
  console.log('\n-- Model:', file);
  console.log('Table name:', model.tableName);
  console.log('Columns:');
  model.columns.forEach(c => console.log(' -', c.name, c.type, c.pk ? '(PK)' : '', c.autoIncrement ? '(AUTO_INC)' : '', c.nullable ? '(NULLABLE)' : ''));
  console.log('Sample queries:');
  Object.keys(model.sampleQueries).forEach(k => console.log('  ', k, ':', model.sampleQueries[k]));
});

console.log('\nScaffold complete — PRQ models are ready in the models/ directory.');
