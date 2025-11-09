const express = require('express');
const path = require('path');
const { createRepositories } = require('../repositories');
const ingresoModel = require('../models/prq_ingreso_automoviles');

const app = express();
const port = 3000;

// Use JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve OpenAPI/Swagger JSON so the static swagger UI can load it
app.get('/swagger.json', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '..', 'swagger.json'));
    } catch (err) {
        console.error('Error sending swagger.json:', err);
        res.status(500).json({ error: 'Could not load swagger.json' });
    }
});

// Create repositories (default to JSON for safety)
const useDb = process.env.USE_DB === 'true';
console.log('Creating repositories with source:', useDb ? 'db' : 'json');
const repos = createRepositories(useDb ? 'db' : 'json');

// Automoviles API endpoints
app.get('/api/automoviles', async (req, res) => {
    try {
        console.log('GET /api/automoviles - filters:', req.query);
        const filters = {};
        if (req.query.color) filters.color = req.query.color;
        if (req.query.yearMin) filters.yearMin = parseInt(req.query.yearMin);
        if (req.query.yearMax) filters.yearMax = parseInt(req.query.yearMax);
        if (req.query.fabricante) filters.fabricante = req.query.fabricante;
        if (req.query.tipo) filters.tipo = req.query.tipo;
        const autos = await repos.automoviles.listByFilters(filters);
        console.log('Found automoviles:', autos);
        res.json(autos);
    } catch (err) {
        console.error('Error in GET /api/automoviles:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/automoviles', async (req, res) => {
    try {
        const auto = await repos.automoviles.create(req.body);
        res.json(auto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/automoviles/:id', async (req, res) => {
    try {
        const auto = await repos.automoviles.update(req.params.id, req.body);
        if (!auto) return res.status(404).json({ error: 'Not found' });
        res.json(auto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/automoviles/:id', async (req, res) => {
    try {
        const success = await repos.automoviles.delete(req.params.id);
        if (!success) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get by id
app.get('/api/automoviles/:id', async (req, res) => {
    try {
        const auto = await repos.automoviles.getById(req.params.id);
        if (!auto) return res.status(404).json({ error: 'Not found' });
        res.json(auto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Parqueo API endpoints
app.get('/api/parqueos', async (req, res) => {
    try {
        const filters = {};
        if (req.query.nombre_provincia) filters.nombre_provincia = req.query.nombre_provincia;
        if (req.query.nombre) filters.nombre = req.query.nombre;
        if (req.query.precioMin) filters.precioMin = parseFloat(req.query.precioMin);
        if (req.query.precioMax) filters.precioMax = parseFloat(req.query.precioMax);
        const parqueos = await repos.parqueo.listByFilters(filters);
        res.json(parqueos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/parqueos', async (req, res) => {
    try {
        const parqueo = await repos.parqueo.create(req.body);
        res.json(parqueo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/parqueos/:id', async (req, res) => {
    try {
        const parqueo = await repos.parqueo.update(req.params.id, req.body);
        if (!parqueo) return res.status(404).json({ error: 'Not found' });
        res.json(parqueo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/parqueos/:id', async (req, res) => {
    try {
        const success = await repos.parqueo.delete(req.params.id);
        if (!success) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get by id
app.get('/api/parqueos/:id', async (req, res) => {
    try {
        const p = await repos.parqueo.getById(req.params.id);
        if (!p) return res.status(404).json({ error: 'Not found' });
        res.json(p);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ingreso API endpoints
app.get('/api/ingresos', async (req, res) => {
    try {
        const now = new Date().toISOString().replace('T', ' ').substr(0, 19);
        const start = req.query.start || '2020-01-01 00:00:00';
        const end = req.query.end || now;
        let ingresos;
        if (req.query.tipo) {
            ingresos = await repos.ingreso.listByTypeAndDateRange(req.query.tipo, start, end);
        } else if (req.query.provincia) {
            ingresos = await repos.ingreso.listByProvinceAndDateRange(req.query.provincia, start, end);
        } else {
            ingresos = await repos.ingreso.listByTypeAndDateRange('', start, end);
        }
        res.json(ingresos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get by id
app.get('/api/ingresos/:id', async (req, res) => {
    try {
        const ingreso = await repos.ingreso.getById(req.params.id);
        if (!ingreso) return res.status(404).json({ error: 'Not found' });
        // attach computed fields when possible
        try {
            const parqueo = await repos.parqueo.getById(ingreso.id_parqueo);
            const precio = parqueo ? parqueo.precio_por_hora : null;
            ingresoModel.attachComputedFields(ingreso, precio, 'proportional');
        } catch (e) {
            // ignore compute errors
        }
        res.json(ingreso);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ingresos', async (req, res) => {
    try {
        const ingreso = await repos.ingreso.create(req.body);
        res.json(ingreso);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/ingresos/:id', async (req, res) => {
    try {
        const ingreso = await repos.ingreso.update(req.params.id, req.body);
        if (!ingreso) return res.status(404).json({ error: 'Not found' });
        
        // Attach computed fields for response
        try {
            const parqueo = await repos.parqueo.getById(ingreso.id_parqueo);
            const precio = parqueo ? parqueo.precio_por_hora : null;
            const ingresoWithComputed = ingresoModel.attachComputedFields(ingreso, precio, 'proportional');
            res.json(ingresoWithComputed);
        } catch (e) {
            console.error('Error computing fields:', e);
            res.json(ingreso);
        }
    } catch (err) {
        console.error('Error updating ingreso:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/ingresos/:id', async (req, res) => {
    try {
        const success = await repos.ingreso.delete(req.params.id);
        if (!success) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`CRUD server running at http://localhost:${port}`);
    console.log(`Using ${process.env.USE_DB === 'true' ? 'DB' : 'JSON'} data source`);
});