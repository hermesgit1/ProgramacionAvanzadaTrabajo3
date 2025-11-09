// Lightweight local HTTP API that serves ingresos with computed fields.
// If USE_DB=true it will attempt to query the DB using stored secret; otherwise it uses JSON fixtures.
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const ingresoModel = require(path.join('..','models','prq_ingreso_automoviles'));
const { getConnection } = require(path.join('..','utils','db'));

const PORT = process.env.PORT || 3000;

function loadJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));
}

const parques = loadJSON('prq_parqueo.json');
const ingresos = loadJSON('prq_ingreso_automoviles.json');

const parkPriceById = new Map();
parques.forEach(p => parkPriceById.set(p.id, p.precio_por_hora));

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

async function fetchIngresosFromDb(billingMode) {
  // Fetch ingresos and join parqueo price from DB; return rows array
  const conn = await getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT i.consecutivo, i.id_parqueo, i.id_automovil, i.fecha_hora_entrada, i.fecha_hora_salida, p.precio_por_hora
      FROM prq_ingreso_automoviles i
      LEFT JOIN prq_parqueo p ON p.id = i.id_parqueo
      ORDER BY i.consecutivo
    `);
    // Attach computed fields
    return rows.map(r => {
      const price = r.precio_por_hora ?? null;
      // r is a RowDataPacket; convert fecha fields to strings if needed
      return ingresoModel.attachComputedFields({
        consecutivo: r.consecutivo,
        id_parqueo: r.id_parqueo,
        id_automovil: r.id_automovil,
        fecha_hora_entrada: r.fecha_hora_entrada ? r.fecha_hora_entrada.toISOString().replace('T',' ').slice(0,19) : null,
        fecha_hora_salida: r.fecha_hora_salida ? r.fecha_hora_salida.toISOString().replace('T',' ').slice(0,19) : null
      }, price, billingMode);
    });
  } finally {
    await conn.end();
  }
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '/';
  const useDb = (process.env.USE_DB === 'true');

  if (pathname === '/ingresos' && req.method === 'GET') {
    const billingMode = parsed.query.billingMode || 'proportional';
    if (useDb) {
      try {
        const rows = await fetchIngresosFromDb(billingMode);
        return sendJson(res, 200, rows);
      } catch (err) {
        console.error('DB error, falling back to JSON fixtures:', err.message || err);
        // fallback to JSON
      }
    }
    const rows = ingresos.map(r => {
      const price = parkPriceById.get(r.id_parqueo) ?? null;
      return ingresoModel.attachComputedFields(r, price, billingMode);
    });
    return sendJson(res, 200, rows);
  }

  const ingresoIdMatch = pathname.match(/^\/ingresos\/(\d+)$/);
  if (ingresoIdMatch && req.method === 'GET') {
    const id = Number(ingresoIdMatch[1]);
    if (useDb) {
      try {
        const conn = await getConnection();
        try {
          const [rows] = await conn.query('SELECT i.consecutivo, i.id_parqueo, i.id_automovil, i.fecha_hora_entrada, i.fecha_hora_salida, p.precio_por_hora FROM prq_ingreso_automoviles i LEFT JOIN prq_parqueo p ON p.id = i.id_parqueo WHERE i.consecutivo = ?', [id]);
          if (!rows || rows.length === 0) return sendJson(res, 404, { error: 'Not found' });
          const r = rows[0];
          const out = ingresoModel.attachComputedFields({
            consecutivo: r.consecutivo,
            id_parqueo: r.id_parqueo,
            id_automovil: r.id_automovil,
            fecha_hora_entrada: r.fecha_hora_entrada ? r.fecha_hora_entrada.toISOString().replace('T',' ').slice(0,19) : null,
            fecha_hora_salida: r.fecha_hora_salida ? r.fecha_hora_salida.toISOString().replace('T',' ').slice(0,19) : null
          }, r.precio_por_hora ?? null, parsed.query.billingMode || 'proportional');
          return sendJson(res, 200, out);
        } finally { await conn.end(); }
      } catch (err) {
        console.error('DB error for single ingreso, falling back to JSON:', err.message || err);
        // fallback
      }
    }
    const row = ingresos.find(r => r.consecutivo === id);
    if (!row) return sendJson(res, 404, { error: 'Not found' });
    const price = parkPriceById.get(row.id_parqueo) ?? null;
    const billingMode = parsed.query.billingMode || 'proportional';
    const out = ingresoModel.attachComputedFields(row, price, billingMode);
    return sendJson(res, 200, out);
  }

  // default
  sendJson(res, 404, { error: 'Endpoint not found. Use /ingresos or /ingresos/:id' });
});

server.listen(PORT, () => {
  console.log(`API local server running on http://localhost:${PORT} (USE_DB=${process.env.USE_DB || 'false'})`);
  console.log('Endpoints: GET /ingresos?billingMode=proportional|hourly_ceil  and  /ingresos/:id');
});
