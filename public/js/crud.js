// Utility functions
function formatDateTime(dt) {
    if (!dt) return '';
    return dt.substring(0, 19).replace(' ', 'T');
}

function formatMoney(amount) {
    return amount ? `₡${amount.toFixed(2)}` : '';
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la operación');
    }
    return response.json();
}

// Load select options
async function loadSelectOptions() {
    const [autos, parqueos] = await Promise.all([
        fetchJson('/api/automoviles'),
        fetchJson('/api/parqueos')
    ]);

    const autoSelect = document.getElementById('ingresoAuto');
    autoSelect.innerHTML = '<option value="">Seleccione...</option>' +
        autos.map(a => `<option value="${a.id}">${a.fabricante} ${a.tipo} (${a.color})</option>`).join('');

    const parqueoSelect = document.getElementById('ingresoParqueo');
    parqueoSelect.innerHTML = '<option value="">Seleccione...</option>' +
        parqueos.map(p => `<option value="${p.id}">${p.nombre} (${p.nombre_provincia})</option>`).join('');
}

// Automóviles CRUD
async function loadAutos(filters = {}) {
    const params = new URLSearchParams();
    if (filters.color) params.append('color', filters.color);
    if (filters.yearMin) params.append('yearMin', filters.yearMin);
    if (filters.yearMax) params.append('yearMax', filters.yearMax);
    
    const autos = await fetchJson('/api/automoviles?' + params.toString());
    const tbody = document.querySelector('#autoTable tbody');
    tbody.innerHTML = autos.map(a => `
        <tr>
            <td>${a.id}</td>
            <td>${a.color}</td>
            <td>${a.anio}</td>
            <td>${a.fabricante}</td>
            <td>${a.tipo}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editAuto(${a.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAuto(${a.id})">Borrar</button>
            </td>
        </tr>
    `).join('');
}

async function saveAuto(event) {
    event.preventDefault();
    const id = document.getElementById('autoId').value;
    const data = {
        color: document.getElementById('autoColor').value,
        anio: parseInt(document.getElementById('autoAnio').value),
        fabricante: document.getElementById('autoFabricante').value,
        tipo: document.getElementById('autoTipo').value
    };

    if (id) {
        await fetchJson(`/api/automoviles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } else {
        await fetchJson('/api/automoviles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    resetAutoForm();
    loadAutos();
}

async function editAuto(id) {
    const auto = await fetchJson(`/api/automoviles/${id}`);
    document.getElementById('autoId').value = auto.id;
    document.getElementById('autoColor').value = auto.color;
    document.getElementById('autoAnio').value = auto.anio;
    document.getElementById('autoFabricante').value = auto.fabricante;
    document.getElementById('autoTipo').value = auto.tipo;
}

async function deleteAuto(id) {
    if (!confirm('¿Está seguro de borrar este automóvil?')) return;
    await fetchJson(`/api/automoviles/${id}`, { method: 'DELETE' });
    loadAutos();
}

function resetAutoForm() {
    document.getElementById('autoForm').reset();
    document.getElementById('autoId').value = '';
}

// Parqueos CRUD
async function loadParqueos(filters = {}) {
    const params = new URLSearchParams();
    if (filters.nombre_provincia) params.append('nombre_provincia', filters.nombre_provincia);
    if (filters.precioMin) params.append('precioMin', filters.precioMin);
    if (filters.precioMax) params.append('precioMax', filters.precioMax);
    
    const parqueos = await fetchJson('/api/parqueos?' + params.toString());
    const tbody = document.querySelector('#parqueoTable tbody');
    tbody.innerHTML = parqueos.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.nombre_provincia}</td>
            <td>${p.nombre}</td>
            <td>${formatMoney(p.precio_por_hora)}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editParqueo(${p.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteParqueo(${p.id})">Borrar</button>
            </td>
        </tr>
    `).join('');
}

async function saveParqueo(event) {
    event.preventDefault();
    const id = document.getElementById('parqueoId').value;
    const data = {
        nombre_provincia: document.getElementById('parqueoProvincia').value,
        nombre: document.getElementById('parqueoNombre').value,
        precio_por_hora: parseFloat(document.getElementById('parqueoPrecio').value)
    };

    if (id) {
        await fetchJson(`/api/parqueos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } else {
        await fetchJson('/api/parqueos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    resetParqueoForm();
    loadParqueos();
    loadSelectOptions(); // Refresh select options
}

async function editParqueo(id) {
    const parqueo = await fetchJson(`/api/parqueos/${id}`);
    document.getElementById('parqueoId').value = parqueo.id;
    document.getElementById('parqueoProvincia').value = parqueo.nombre_provincia;
    document.getElementById('parqueoNombre').value = parqueo.nombre;
    document.getElementById('parqueoPrecio').value = parqueo.precio_por_hora;
}

async function deleteParqueo(id) {
    if (!confirm('¿Está seguro de borrar este parqueo?')) return;
    await fetchJson(`/api/parqueos/${id}`, { method: 'DELETE' });
    loadParqueos();
    loadSelectOptions(); // Refresh select options
}

function resetParqueoForm() {
    document.getElementById('parqueoForm').reset();
    document.getElementById('parqueoId').value = '';
}

// Ingresos CRUD
async function loadIngresos(filters = {}) {
    const params = new URLSearchParams();
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.provincia) params.append('provincia', filters.provincia);
    if (filters.start) params.append('start', filters.start.replace('T', ' '));
    if (filters.end) params.append('end', filters.end.replace('T', ' '));
    
    const ingresos = await fetchJson('/api/ingresos?' + params.toString());
    const tbody = document.querySelector('#ingresoTable tbody');
    tbody.innerHTML = ingresos.map(i => `
        <tr>
            <td>${i.consecutivo}</td>
            <td>${i.id_parqueo}</td>
            <td>${i.id_automovil}</td>
            <td>${formatDateTime(i.fecha_hora_entrada)}</td>
            <td>${formatDateTime(i.fecha_hora_salida) || '-'}</td>
            <td>${formatMoney(i.monto_a_pagar)}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editIngreso(${i.consecutivo})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteIngreso(${i.consecutivo})">Borrar</button>
            </td>
        </tr>
    `).join('');
}

async function saveIngreso(event) {
    event.preventDefault();
    const id = document.getElementById('ingresoId').value;
    const data = {
        id_parqueo: document.getElementById('ingresoParqueo').value,
        id_automovil: document.getElementById('ingresoAuto').value,
        fecha_hora_entrada: document.getElementById('ingresoEntrada').value.replace('T', ' '),
        fecha_hora_salida: document.getElementById('ingresoSalida').value ? 
            document.getElementById('ingresoSalida').value.replace('T', ' ') : null
    };

    if (id) {
        await fetchJson(`/api/ingresos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } else {
        await fetchJson('/api/ingresos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    resetIngresoForm();
    loadIngresos();
}

async function editIngreso(id) {
    const ingreso = await fetchJson(`/api/ingresos/${id}`);
    document.getElementById('ingresoId').value = ingreso.consecutivo;
    document.getElementById('ingresoParqueo').value = ingreso.id_parqueo;
    document.getElementById('ingresoAuto').value = ingreso.id_automovil;
    document.getElementById('ingresoEntrada').value = formatDateTime(ingreso.fecha_hora_entrada);
    document.getElementById('ingresoSalida').value = formatDateTime(ingreso.fecha_hora_salida);
}

async function deleteIngreso(id) {
    if (!confirm('¿Está seguro de borrar este ingreso?')) return;
    await fetchJson(`/api/ingresos/${id}`, { method: 'DELETE' });
    loadIngresos();
}

function resetIngresoForm() {
    document.getElementById('ingresoForm').reset();
    document.getElementById('ingresoId').value = '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadAutos();
    loadParqueos();
    loadIngresos();
    loadSelectOptions();

    // Set up form handlers
    document.getElementById('autoForm').addEventListener('submit', saveAuto);
    document.getElementById('parqueoForm').addEventListener('submit', saveParqueo);
    document.getElementById('ingresoForm').addEventListener('submit', saveIngreso);

    // Set up filter handlers
    document.getElementById('autoFilterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        loadAutos({
            color: document.getElementById('filterAutoColor').value,
            yearMin: document.getElementById('filterAutoYearMin').value,
            yearMax: document.getElementById('filterAutoYearMax').value
        });
    });

    document.getElementById('parqueoFilterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        loadParqueos({
            nombre_provincia: document.getElementById('filterParqueoProvincia').value,
            precioMin: document.getElementById('filterParqueoPrecioMin').value,
            precioMax: document.getElementById('filterParqueoPrecioMax').value
        });
    });

    document.getElementById('ingresoFilterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        loadIngresos({
            tipo: document.getElementById('filterIngresoTipo').value,
            provincia: document.getElementById('filterIngresoProvincia').value,
            start: document.getElementById('filterIngresoStart').value,
            end: document.getElementById('filterIngresoEnd').value
        });
    });
});