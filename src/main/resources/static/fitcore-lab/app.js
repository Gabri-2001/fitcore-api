const API = '';
const STORAGE_KEY = 'fitcore.lab.session.v1';
const state = {
    auth: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'),
    logs: [], variants: [], catalogPage: 0, catalogTotalPages: 0, selectedVariant: null,
    activations: [], svg: null, activePlan: null, planDays: [], currentSession: null,
    sessionExercises: [], sessionSets: new Map()
};

const muscleSvgMap = {
    PECTORAL_UPPER: ['pectoral-upper-right', 'pectoral-upper-left'],
    PECTORAL_MIDDLE: ['pectoral-middle-right', 'pectoral-middle-left'],
    PECTORAL_LOWER: ['pectoral-lower-right', 'pectoral-lower-left'],
    LATISSIMUS_DORSI: ['latissimus-dorsi-left-1', 'latissimus-dorsi-right-1', 'latissimus-dorsi-left-2', 'latissimus-dorsi-right-2', 'latissimus-dorsi-left-3', 'latissimus-dorsi-right-3'],
    TRAPEZIUS_UPPER: ['trapezius-upper-left', 'trapezius-upper-right'],
    TRAPEZIUS_MIDDLE: ['trapezius-middle-left-1', 'trapezius-middle-left-2', 'trapezius-middle-right-1', 'trapezius-middle-right-2'],
    TRAPEZIUS_LOWER: ['trapezius-lower-left', 'trapezius-lower-right'],
    RHOMBOIDS_REGION: ['trapezius-middle-left-1', 'trapezius-middle-left-2', 'trapezius-middle-right-1', 'trapezius-middle-right-2'],
    TERES_MAJOR: ['teres-major-left', 'teres-major-right'],
    INFRASPINATUS: ['infraspinatus-left-1', 'infraspinatus-right-1'],
    ERECTOR_SPINAE_LUMBAR: ['erector-spinae-lumbar-left', 'erector-spinae-lumbar-right'],
    DELTOID_ANTERIOR: ['deltoid-anterior-right', 'deltoid-anterior-left'],
    DELTOID_LATERAL: ['deltoid-lateral-right', 'deltoid-lateral-left', 'deltoid-lateral-left-2', 'deltoid-lateral-right-2'],
    DELTOID_POSTERIOR: ['deltoid-posterior-right', 'deltoid-posterior-left'],
    BICEPS_BRACHII: ['biceps-right', 'biceps-left'],
    BRACHIALIS: ['brachialis-front-left-1', 'brachialis-front-left-2', 'brachialis-front-right-1', 'brachialis-front-right-2', 'brachialis-back-left', 'brachialis-back-right'],
    BRACHIORADIALIS: ['brachioradialis-left-1', 'brachioradialis-left-2', 'brachioradialis-right-1', 'brachioradialis-right-2'],
    FOREARM_FLEXORS_REGION: ['forearm-flexors-left-1', 'forearm-flexors-left-2', 'forearm-flexors-right-1', 'forearm-flexors-right-2'],
    FOREARM_EXTENSORS_REGION: ['forearm-extensors-left-1', 'forearm-extensors-left-2', 'forearm-extensors-left-3', 'forearm-extensors-left-4', 'forearm-extensors-right-1', 'forearm-extensors-right-2', 'forearm-extensors-right-3', 'forearm-extensors-right-4'],
    TRICEPS_LONG_HEAD: ['triceps-long-head-left-1', 'triceps-long-head-right-1', 'triceps-long-head-left-2', 'triceps-long-head-right-2'],
    TRICEPS_LATERAL_HEAD: ['triceps-lateral-head-back-left', 'triceps-lateral-head-back-right', 'triceps-lateral-head-front-left', 'triceps-lateral-head-front-right'],
    TRICEPS_MEDIAL_HEAD: ['triceps-medial-head-left', 'triceps-medial-head-right'],
    RECTUS_FEMORIS: ['rectus-femoris-right', 'rectus-femoris-left'],
    VASTUS_MEDIALIS: ['vastus-medialis-right', 'vastus-medialis-left'],
    VASTUS_LATERALIS: ['vastus-lateralis-right-front', 'vastus-lateralis-left-front', 'vastus-lateralis-left-back', 'vastus-lateralis-right-back'],
    SARTORIUS: ['sartorius-left', 'sartorius-right'],
    HAMSTRINGS_REGION: ['hamstrings-left-1', 'hamstrings-left-2', 'hamstrings-right-1', 'hamstrings-right-2'],
    GLUTEUS_MAXIMUS: ['gluteus-maximus-left', 'gluteus-maximus-right'],
    GLUTEUS_MEDIUS: ['gluteus-medius-right', 'gluteus-medius-left', 'gluteus-medius-right-front', 'gluteus-medius-left-front', 'abductors-left-back', 'abductors-right-back'],
    HIP_ADDUCTORS_REGION: ['adductors-right-front', 'adductors-left-front'],
    GASTROCNEMIUS: ['gastrocnemius-left-1', 'gastrocnemius-left-2', 'gastrocnemius-right-1', 'gastrocnemius-right-2'],
    SOLEUS: ['soleus-left', 'soleus-right'],
    TIBIALIS_ANTERIOR: ['tibialis-anterior-left-front', 'tibialis-anterior-right-front'],
    PERONEALS_REGION: ['peroneals-left', 'peroneals-right'],
    RECTUS_ABDOMINIS: ['rectus-abdominis-1-right', 'rectus-abdominis-1-left', 'rectus-abdominis-2-right', 'rectus-abdominis-2-left', 'rectus-abdominis-3-right', 'rectus-abdominis-3-left', 'rectus-abdominis-4-right', 'rectus-abdominis-4-left'],
    OBLIQUES_REGION: ['obliques-serratus-4-right', 'obliques-serratus-4-left', 'obliques-serratus-5-right', 'obliques-serratus-5-left', 'obliques-serratus-6-right', 'obliques-serratus-6-left'],
    SERRATUS_ANTERIOR: ['obliques-serratus-1-right', 'obliques-serratus-1-left', 'obliques-serratus-2-right', 'obliques-serratus-2-left', 'obliques-serratus-3-right', 'obliques-serratus-3-left'],
    STERNOCLEIDOMASTOID: ['sternocleidomastoid-left-1', 'sternocleidomastoid-left-2', 'sternocleidomastoid-left-3', 'sternocleidomastoid-right-1', 'sternocleidomastoid-right-2', 'sternocleidomastoid-right-3']
};

const enums = {
    equipment: ['BARBELL','DUMBBELL','EZ_BAR','CABLE','MACHINE_SELECTORISED','MACHINE_PLATE_LOADED','SMITH_MACHINE','BODYWEIGHT','TRAP_BAR','KETTLEBELL','WEIGHT_PLATE','BENCH','BAND','MEDICINE_BALL','AB_WHEEL','WRIST_ROLLER','NONE'],
    muscles: ['CHEST','BACK','SHOULDERS','SCAPULAR','ROTATOR_CUFF','BICEPS','TRICEPS','FOREARMS','QUADRICEPS','HAMSTRINGS','GLUTES','ADDUCTORS','CALVES','CORE','NECK','FULL_BODY'],
    dayTypes: ['PUSH','PULL','LEGS','UPPER','LOWER','FULL_BODY','CARDIO','MOBILITY','REST']
};

const labels = {
    BARBELL:'Barra', DUMBBELL:'Mancuernas', EZ_BAR:'Barra Z', CABLE:'Polea', MACHINE_SELECTORISED:'Máquina de placas', MACHINE_PLATE_LOADED:'Máquina de discos', SMITH_MACHINE:'Multipower', BODYWEIGHT:'Peso corporal', TRAP_BAR:'Barra hexagonal', KETTLEBELL:'Kettlebell', WEIGHT_PLATE:'Disco', BENCH:'Banco', BAND:'Banda', MEDICINE_BALL:'Balón medicinal', AB_WHEEL:'Rueda abdominal', WRIST_ROLLER:'Rodillo de muñeca', NONE:'Sin equipamiento',
    CHEST:'Pecho', BACK:'Espalda', SHOULDERS:'Hombros', SCAPULAR:'Escápulas', ROTATOR_CUFF:'Manguito rotador', BICEPS:'Bíceps', TRICEPS:'Tríceps', FOREARMS:'Antebrazos', QUADRICEPS:'Cuádriceps', HAMSTRINGS:'Isquiotibiales', GLUTES:'Glúteos', ADDUCTORS:'Aductores', CALVES:'Gemelos', CORE:'Core', NECK:'Cuello', FULL_BODY:'Cuerpo completo',
    PRIMARY:'Primario', SECONDARY:'Secundario', STABILIZER:'Estabilizador', MUSCLE_GAIN:'Ganancia muscular', FAT_LOSS:'Pérdida de grasa', RECOMPOSITION:'Recomposición', PERFORMANCE:'Rendimiento', MAINTENANCE:'Mantenimiento',
    ON_TRACK:'En progreso', NEEDS_ADJUSTMENT:'Necesita ajuste', INSUFFICIENT_DATA:'Datos insuficientes', AHEAD:'Por delante', BEHIND:'Por detrás', ALIGNED:'Alineado', NOT_ALIGNED:'No alineado'
};

const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = days => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
const friendly = value => value == null ? '—' : (labels[value] || String(value).toLowerCase().replaceAll('_', ' ').replace(/^./, c => c.toUpperCase()));
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const optionalNumber = value => value === '' || value == null ? null : Number(value);
const formatNumber = value => Number(value || 0).toLocaleString('es-ES', { maximumFractionDigits: 1 });

class ApiError extends Error {
    constructor(message, status, payload) { super(message); this.status = status; this.payload = payload; }
}

async function api(path, options = {}, retry = true) {
    const started = performance.now();
    const method = options.method || 'GET';
    const headers = { ...(options.body ? {'Content-Type':'application/json'} : {}), ...(options.headers || {}) };
    if (state.auth?.token && options.auth !== false) headers.Authorization = `Bearer ${state.auth.token}`;
    let response;
    try {
        response = await fetch(`${API}${path}`, {...options, method, headers});
    } catch (error) {
        addLog(method, path, 'RED', performance.now() - started, error.message);
        throw new ApiError('No se pudo conectar con la API.', 0, null);
    }
    if (response.status === 401 && retry && state.auth?.refreshToken && !path.includes('/api/auth/refresh')) {
        const renewed = await refreshSession();
        if (renewed) return api(path, options, false);
    }
    let payload = null;
    if (response.status !== 204) {
        const contentType = response.headers.get('content-type') || '';
        try { payload = contentType.includes('json') ? await response.json() : await response.text(); } catch (_) { payload = null; }
    }
    addLog(method, path, response.status, performance.now() - started, payload);
    if (!response.ok) {
        const message = payload?.message || payload?.detail || payload?.errors?.map(e => e.message).join(', ') || `Error HTTP ${response.status}`;
        throw new ApiError(message, response.status, payload);
    }
    return payload;
}

async function refreshSession() {
    try {
        const response = await fetch('/api/auth/refresh', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({refreshToken:state.auth.refreshToken})});
        const payload = await response.json();
        addLog('POST', '/api/auth/refresh', response.status, 0, payload);
        if (!response.ok) throw new Error();
        setAuth({...state.auth, token:payload.token, refreshToken:payload.refreshToken || state.auth.refreshToken, expiresInSeconds:payload.expiresInSeconds});
        return true;
    } catch (_) { setAuth(null); toast('La sesión ha caducado. Vuelve a iniciar sesión.', true); return false; }
}

function addLog(method, path, status, duration, payload) {
    state.logs.unshift({time:new Date().toLocaleTimeString('es-ES'), method, path, status, duration:Math.round(duration), payload:sanitizePayload(payload)});
    state.logs = state.logs.slice(0, 60);
    renderLogs();
}

function renderLogs() {
    const container = $('request-log'); if (!container) return;
    if (!state.logs.length) { container.innerHTML = '<div class="empty-state">Las llamadas aparecerán aquí.</div>'; return; }
    container.innerHTML = state.logs.map(item => `<div class="log-entry"><span>${item.time}</span><strong>${item.method}</strong><b>${escapeHtml(item.path)}</b><span class="${Number(item.status) < 400 ? 'ok':'error'}">${item.status} · ${item.duration}ms</span></div>`).join('');
}

function sanitizePayload(payload) {
    if (payload == null || typeof payload !== 'object') return payload;
    try {
        return JSON.parse(JSON.stringify(payload, (key, value) => /token|password|authorization/i.test(key) ? '[OCULTO]' : value));
    } catch (_) { return '[Respuesta no serializable]'; }
}

function toast(message, error = false) {
    const node = document.createElement('div'); node.className = `toast ${error ? 'error':'success'}`; node.textContent = message;
    $('toast-region').appendChild(node); setTimeout(() => node.remove(), 4300);
}

function setAuth(auth) {
    state.auth = auth;
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth)); else localStorage.removeItem(STORAGE_KEY);
    const connected = !!auth;
    $('auth-form').hidden = connected; $('signed-summary').hidden = !connected; $('user-chip').hidden = !connected; $('logout-button').hidden = !connected;
    $('auth-status').textContent = connected ? 'Conectado' : 'Sin sesión'; $('auth-status').dataset.state = connected ? 'ok' : '';
    $('diag-auth').textContent = connected ? 'Sí' : 'No'; $('diag-user').textContent = connected ? `${auth.userId} · ${auth.email}` : '—';
    if (connected) {
        const initials = auth.email.slice(0, 2).toUpperCase();
        $('user-email').textContent = auth.email; $('signed-email').textContent = auth.email; $('user-avatar').textContent = initials; $('signed-avatar').textContent = initials;
    }
    if (!connected) resetUserData();
}

function resetUserData() {
    state.activePlan = null; state.currentSession = null; state.sessionExercises = []; state.sessionSets.clear();
    renderPlanMode(); renderSession();
}

async function authenticate(register = false) {
    const email = $('auth-email').value.trim(); const password = $('auth-password').value;
    if (!email || password.length < 8) return toast('Introduce email y una contraseña de al menos 8 caracteres.', true);
    const body = register ? {name:'Usuario Test Lab', email, password, age:25, heightCm:175, weightKg:75} : {email, password};
    try {
        const result = await api(`/api/auth/${register ? 'register':'login'}`, {method:'POST', body:JSON.stringify(body), auth:false});
        setAuth({token:result.token, refreshToken:result.refreshToken, userId:result.userId, email:result.email, role:result.role});
        toast(register ? 'Usuario de prueba creado.' : 'Sesión iniciada.');
        await bootstrapUserData();
    } catch (error) { toast(error.message, true); }
}

async function logout() {
    try { if (state.auth?.refreshToken) await api('/api/auth/logout', {method:'POST', body:JSON.stringify({refreshToken:state.auth.refreshToken})}); } catch (_) {}
    setAuth(null); toast('Sesión cerrada.');
}

function navigate(view) {
    document.querySelectorAll('.view').forEach(el => el.classList.toggle('is-active', el.id === `view-${view}`));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('is-active', el.dataset.view === view));
    const section = $(`view-${view}`); $('page-title').textContent = section.dataset.title; $('page-eyebrow').textContent = section.dataset.eyebrow;
    document.querySelector('.sidebar').classList.remove('is-open'); $('menu-button').setAttribute('aria-expanded', 'false');
    history.replaceState(null, '', `#${view}`); window.scrollTo({top:0, behavior:'smooth'});
    if (view === 'catalog' && state.auth && !state.variants.length) searchCatalog();
    if (view === 'progress' && state.auth) loadProgressDashboard();
    if (view === 'recommendations' && state.auth) loadRecommendations();
}

async function healthCheck() {
    const orb = $('health-orb');
    try {
        const result = await api('/actuator/health', {auth:false});
        const ok = result.status === 'UP'; orb.dataset.state = ok ? 'ok':'error'; orb.innerHTML = `<span>${escapeHtml(result.status)}</span><small>Spring Boot Actuator</small>`;
        $('connection-state').dataset.state = ok ? 'ok':'error'; $('connection-state').lastElementChild.textContent = ok ? 'API conectada':'API degradada'; $('metric-api').textContent = result.status;
    } catch (error) {
        orb.dataset.state = 'error'; orb.innerHTML = '<span>DOWN</span><small>Sin conexión</small>'; $('connection-state').dataset.state = 'error'; $('connection-state').lastElementChild.textContent = 'API sin conexión'; $('metric-api').textContent = 'DOWN';
    }
}

async function loadSvg() {
    try {
        const source = await fetch('../body-map-demo/assets/body-map.svg').then(response => { if (!response.ok) throw new Error('SVG no encontrado'); return response.text(); });
        const doc = new DOMParser().parseFromString(source, 'image/svg+xml'); const svg = doc.documentElement;
        svg.removeAttribute('width'); svg.removeAttribute('height'); svg.setAttribute('role','img'); svg.setAttribute('aria-label','Mapa muscular frontal y posterior');
        $('map-stage').replaceChildren(document.importNode(svg, true)); state.svg = $('map-stage').querySelector('svg');
        const missing = [...new Set(Object.values(muscleSvgMap).flat().filter(id => !state.svg.getElementById(id)))];
        $('map-diagnostic').textContent = missing.length ? `${missing.length} regiones SVG no encontradas` : `${Object.keys(muscleSvgMap).length} músculos mapeados`;
    } catch (error) { $('map-stage').innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
}

function fillSelect(select, values, placeholder = null) {
    select.innerHTML = placeholder == null ? '' : `<option value="">${escapeHtml(placeholder)}</option>`;
    values.forEach(value => select.add(new Option(friendly(value), value)));
}

async function searchCatalog(page = 0) {
    if (!requireAuth()) return;
    const params = new URLSearchParams({page:String(page), size:'20'});
    const q = $('catalog-query').value.trim(), equipment = $('catalog-equipment').value, muscleGroup = $('catalog-muscle').value;
    if (q) params.set('q', q); if (equipment) params.append('equipment', equipment); if (muscleGroup) params.append('muscleGroup', muscleGroup);
    params.set('includeStabilizers', String($('catalog-stabilizers').checked));
    try {
        const result = await api(`/api/exercise-variants/search?${params}`);
        state.variants = result.content || []; state.catalogPage = result.page; state.catalogTotalPages = result.totalPages;
        $('catalog-count').textContent = `${result.totalElements} resultado${result.totalElements === 1 ? '':'s'}`; $('catalog-page').textContent = `Página ${result.totalPages ? result.page + 1:0} de ${result.totalPages}`;
        $('catalog-prev').disabled = result.page <= 0; $('catalog-next').disabled = result.page + 1 >= result.totalPages;
        renderCatalog(); updateVariantDatalist(); $('metric-exercises').textContent = result.totalElements;
    } catch (error) { toast(error.message, true); }
}

function renderCatalog() {
    const container = $('catalog-results');
    if (!state.variants.length) { container.innerHTML = '<div class="empty-state">No hay variantes con estos filtros.</div>'; return; }
    container.innerHTML = state.variants.map(variant => {
        const image = variant.thumbnailUrl || variant.imageUrl;
        const thumb = image ? `<img class="exercise-thumb" src="${escapeHtml(image)}" alt="${escapeHtml(variant.imageAltText || variant.name)}">` : `<span class="exercise-thumb thumb-placeholder">${escapeHtml(variant.name.slice(0,2).toUpperCase())}</span>`;
        return `<button class="catalog-item ${state.selectedVariant?.code === variant.code ? 'is-selected':''}" data-variant="${escapeHtml(variant.code)}">${thumb}<span><strong>${escapeHtml(variant.name)}</strong><small>${friendly(variant.equipment)} · ${friendly(variant.primaryFocus)}</small><small>${escapeHtml(variant.code)}</small></span></button>`;
    }).join('');
}

async function selectVariant(code) {
    const variant = state.variants.find(item => item.code === code) || await api(`/api/exercise-variants/${encodeURIComponent(code)}`);
    state.selectedVariant = variant;
    try { state.activations = await api(`/api/exercise-variants/${encodeURIComponent(code)}/muscle-activations`); renderCatalog(); renderVariantDetail(); paintActivations(); }
    catch (error) { toast(error.message, true); }
}

function renderVariantDetail() {
    const v = state.selectedVariant;
    const activations = [...state.activations].sort((a,b) => b.activationLevel - a.activationLevel);
    $('variant-detail').innerHTML = `<p class="eyebrow">VARIANTE SELECCIONADA</p><h2>${escapeHtml(v.name)}</h2><p>${escapeHtml(v.focusDescription || 'Sin descripción técnica.')}</p>
        <dl class="detail-list"><div><dt>Código</dt><dd>${escapeHtml(v.code)}</dd></div><div><dt>Equipamiento</dt><dd>${friendly(v.equipment)}</dd></div><div><dt>Agarre</dt><dd>${friendly(v.gripType)}</dd></div><div><dt>Anchura</dt><dd>${friendly(v.gripWidth)}</dd></div><div><dt>Enfoque</dt><dd>${friendly(v.primaryFocus)}</dd></div><div><dt>Evidencia</dt><dd>${friendly(v.focusEvidenceType)} · ${friendly(v.focusEvidenceLevel)}</dd></div><div><dt>Practicidad</dt><dd>${friendly(v.practicality)}</dd></div></dl>
        <div class="section-heading"><div><p class="eyebrow">ACTIVACIONES</p><h2>${activations.length} músculos</h2></div></div><div class="activation-list">${activations.map(a => `<div class="activation"><div><strong>${escapeHtml(a.muscleName)}</strong><span>${friendly(a.role)} · ${a.activationLevel}/5</span></div><small>${friendly(a.confidence)} · ${friendly(a.evidenceType)}</small><span class="activation-bar"><i style="width:${a.activationLevel * 20}%"></i></span></div>`).join('')}</div>`;
    $('map-title').textContent = v.name; $('map-subtitle').textContent = `${friendly(v.equipment)} · ${friendly(v.gripType)} · ${friendly(v.gripWidth)}`;
}

function paintActivations() {
    if (!state.svg) return;
    state.svg.querySelectorAll('[data-fitcore-role]').forEach(node => node.removeAttribute('data-fitcore-role'));
    const showStabilizers = $('map-stabilizers').checked; const missing = [];
    state.activations.filter(a => showStabilizers || a.role !== 'STABILIZER').forEach(activation => {
        let found = false;
        (muscleSvgMap[activation.muscleCode] || []).forEach(id => { const node = state.svg.getElementById(id); if (node) { found = true; const priority = {STABILIZER:1,SECONDARY:2,PRIMARY:3}; const old = node.dataset.fitcoreRole; if (!old || priority[activation.role] > priority[old]) node.dataset.fitcoreRole = activation.role; } });
        if (!found) missing.push(activation.muscleCode);
    });
    $('map-diagnostic').textContent = missing.length ? `Sin región directa: ${missing.join(', ')}` : `${state.activations.filter(a => showStabilizers || a.role !== 'STABILIZER').length} músculos visibles`;
}

function updateVariantDatalist() {
    $('variant-codes').innerHTML = state.variants.map(v => `<option value="${escapeHtml(v.code)}">${escapeHtml(v.name)}</option>`).join('');
}

function addPlanDay(source = null) {
    state.planDays.push(source ? {
        id: source.id, name:source.name, dayType:source.dayType, exercises:(source.exercises || []).map(x => ({id:x.id, exerciseVariantCode:x.exerciseVariantCode, sets:x.sets, reps:x.reps, restSeconds:x.restSeconds}))
    } : {name:`Día ${state.planDays.length + 1}`, dayType:'FULL_BODY', exercises:[]});
    renderPlanDays();
}

function renderPlanDays() {
    const container = $('plan-days');
    if (!state.planDays.length) { container.innerHTML = '<div class="empty-state large">Añade al menos un día para empezar a diseñar el plan.</div>'; return; }
    container.innerHTML = state.planDays.map((day, dayIndex) => `<article class="day-card" data-day="${dayIndex}"><div class="day-head"><input value="${escapeHtml(day.name)}" data-day-name aria-label="Nombre del día"><select data-day-type aria-label="Tipo de día">${enums.dayTypes.map(t => `<option ${t===day.dayType?'selected':''}>${t}</option>`).join('')}</select><button class="text-button danger" data-remove-day>Eliminar día</button></div><div class="day-exercises">${day.exercises.map((exercise,index) => exerciseEditor(exercise,index)).join('')}</div><div class="day-foot"><small>${day.exercises.length} ejercicio${day.exercises.length===1?'':'s'}</small><button class="button button-secondary" data-add-plan-exercise>+ Ejercicio</button></div></article>`).join('');
}

function exerciseEditor(exercise, index) {
    return `<div class="exercise-editor" data-exercise="${index}"><div class="drag-actions"><button data-move="-1" aria-label="Subir">↑</button><button data-move="1" aria-label="Bajar">↓</button></div><label>Variante<input data-exercise-code list="variant-codes" value="${escapeHtml(exercise.exerciseVariantCode || '')}" placeholder="Código exacto"></label><label>Series<input data-exercise-sets type="number" min="1" value="${exercise.sets || 3}"></label><label>Reps<input data-exercise-reps type="number" min="1" value="${exercise.reps || 10}"></label><label>Descanso (s)<input data-exercise-rest type="number" min="0" value="${exercise.restSeconds ?? 90}"></label><button class="text-button danger remove-exercise" data-remove-exercise>Quitar</button></div>`;
}

function syncPlanEditor() {
    document.querySelectorAll('.day-card').forEach(card => {
        const d = state.planDays[Number(card.dataset.day)]; d.name = card.querySelector('[data-day-name]').value; d.dayType = card.querySelector('[data-day-type]').value;
        card.querySelectorAll('.exercise-editor').forEach(row => { const e = d.exercises[Number(row.dataset.exercise)]; e.exerciseVariantCode = row.querySelector('[data-exercise-code]').value.trim(); e.sets = Number(row.querySelector('[data-exercise-sets]').value); e.reps = Number(row.querySelector('[data-exercise-reps]').value); e.restSeconds = Number(row.querySelector('[data-exercise-rest]').value); });
    });
}

function planPayload() {
    syncPlanEditor();
    return {name:$('plan-name').value.trim(), description:$('plan-description').value.trim() || null, days:state.planDays.map((day,di) => ({name:day.name, dayOrder:di+1, dayType:day.dayType, exercises:day.exercises.map((e,ei) => ({exerciseVariantCode:e.exerciseVariantCode, sets:e.sets, reps:e.reps, restSeconds:e.restSeconds, exerciseOrder:ei+1}))}))};
}

async function savePlan() {
    if (!requireAuth()) return; const payload = planPayload();
    if (!payload.name || !payload.days.length || payload.days.some(d => !d.name || d.exercises.some(e => !e.exerciseVariantCode || e.sets < 1 || e.reps < 1))) return toast('Completa el nombre, los días y todos los ejercicios.', true);
    try {
        const body = state.activePlan ? {...payload, effectiveDate:$('plan-date').value} : {...payload, startDate:$('plan-date').value};
        const path = state.activePlan ? `/api/users/${state.auth.userId}/workout-plans/${state.activePlan.id}` : `/api/users/${state.auth.userId}/workout-plans`;
        const result = await api(path, {method:state.activePlan?'PUT':'POST', body:JSON.stringify(body)});
        toast(state.activePlan ? 'Nueva revisión del plan creada.' : 'Plan creado correctamente.');
        state.activePlan = result; await loadActivePlan();
    } catch (error) { toast(error.message, true); }
}

async function loadActivePlan(silent = false) {
    if (!state.auth) return;
    try {
        const summary = await api(`/api/users/${state.auth.userId}/workout-plans/active`);
        const plan = await api(`/api/users/${state.auth.userId}/workout-plans/${summary.id}/detail`);
        state.activePlan = plan; $('plan-name').value = plan.name; $('plan-description').value = plan.description || ''; $('plan-date').value = today(); state.planDays = [];
        (plan.days || []).forEach(day => addPlanDay(day)); renderPlanMode(); fillSessionDays(); $('metric-plan').textContent = `v${plan.version}`;
        if (!silent) toast('Plan activo cargado.');
    } catch (error) {
        if (error.status === 404) { state.activePlan = null; state.planDays = []; addPlanDay(); renderPlanMode(); fillSessionDays(); $('metric-plan').textContent = 'Ninguno'; if (!silent) toast('Aún no existe un plan activo.'); }
        else if (!silent) toast(error.message, true);
    }
}

function renderPlanMode() {
    const box = $('plan-version'); if (!box) return;
    box.innerHTML = state.activePlan ? `<span>Modo revisión</span><strong>Versión ${state.activePlan.version}</strong><small>Al guardar se creará la versión ${state.activePlan.version + 1}</small>` : '<span>Modo</span><strong>Nuevo plan</strong><small>Se creará la versión 1</small>';
}

function fillSessionDays() {
    const select = $('session-day'); select.innerHTML = '<option value="">Sesión libre</option>';
    (state.activePlan?.days || []).forEach(day => select.add(new Option(`${day.dayOrder}. ${day.name}`, day.id)));
}

async function startSession() {
    if (!requireAuth()) return;
    const body = {workoutDayId:optionalNumber($('session-day').value), sessionDate:$('session-date').value, sessionCategory:$('session-category').value, sessionIntensity:$('session-intensity').value, durationMinutes:null, notes:$('session-notes').value.trim() || null, estimatedTotalCaloriesBurned:null};
    try { state.currentSession = await api(`/api/users/${state.auth.userId}/workout-sessions`, {method:'POST', body:JSON.stringify(body)}); localStorage.setItem('fitcore.lab.currentSession', state.currentSession.id); toast('Sesión iniciada.'); await loadSessionExercises(); }
    catch (error) { toast(error.message, true); }
}

async function restoreSession() {
    const id = localStorage.getItem('fitcore.lab.currentSession'); if (!id || !state.auth) return;
    try { const session = await api(`/api/users/${state.auth.userId}/workout-sessions/${id}`); if (session.status === 'IN_PROGRESS') { state.currentSession = session; await loadSessionExercises(); } else localStorage.removeItem('fitcore.lab.currentSession'); }
    catch (_) { localStorage.removeItem('fitcore.lab.currentSession'); }
}

async function addSessionExercise() {
    if (!state.currentSession) return; const code = $('session-variant').value.trim(); if (!code) return toast('Indica el código de una variante.', true);
    try { await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/exercises`, {method:'POST', body:JSON.stringify({workoutExerciseId:null, exerciseVariantCode:code, completed:false, performedSets:0, performedReps:0, performedWeightKg:null, performedDurationMinutes:null, estimatedCaloriesBurned:null, notes:null})}); $('session-variant').value=''; await loadSessionExercises(); toast('Ejercicio añadido.'); }
    catch (error) { toast(error.message, true); }
}

async function loadSessionExercises() {
    if (!state.currentSession) return renderSession();
    try {
        state.sessionExercises = await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/exercises`);
        const entries = await Promise.all(state.sessionExercises.map(async exercise => [exercise.id, await api(`/api/users/${state.auth.userId}/workout-session-exercises/${exercise.id}/sets`)]));
        state.sessionSets = new Map(entries); renderSession();
    } catch (error) { toast(error.message, true); }
}

function renderSession() {
    const active = state.currentSession?.status === 'IN_PROGRESS'; $('session-start').disabled = active; $('session-complete').disabled = !active; $('session-cancel').disabled = !active; $('session-delete').disabled = !active; $('session-add-exercise').disabled = !active;
    $('session-status').textContent = state.currentSession ? friendly(state.currentSession.status) : 'Sin iniciar'; $('session-status').dataset.state = state.currentSession?.status || '';
    const container = $('session-exercises'); if (!state.sessionExercises.length) { container.innerHTML = `<div class="empty-state large">${active ? 'Añade el primer ejercicio de la sesión.':'Inicia una sesión para registrar ejercicios y series.'}</div>`; return; }
    container.innerHTML = state.sessionExercises.map(exercise => {
        const sets = state.sessionSets.get(exercise.id) || []; const next = sets.length ? Math.max(...sets.map(s => s.setNumber)) + 1 : 1;
        return `<article class="session-card" data-session-exercise="${exercise.id}"><div class="session-card-head"><div><h3>${escapeHtml(exercise.exerciseVariantCode)}</h3><small>${exercise.extra ? 'Ejercicio extra':'Procedente del plan'} · ${sets.length} series</small></div><div class="button-row"><span class="status-pill" data-state="${exercise.completed?'COMPLETED':''}">${exercise.completed?'Completado':'En curso'}</span><button class="text-button danger" data-remove-session-exercise>Quitar</button></div></div><table class="set-table"><thead><tr><th>Serie</th><th>Peso kg</th><th>Reps</th><th>RIR</th><th>RPE</th><th>Hecha</th><th></th></tr></thead><tbody>${sets.map(set => `<tr><td>${set.setNumber}</td><td>${formatNumber(set.weight)}</td><td>${set.reps ?? '—'}</td><td>${set.rir ?? '—'}</td><td>${set.rpe ?? '—'}</td><td>${set.completed?'✓':'—'}</td><td><button class="text-button danger" data-delete-set="${set.id}">×</button></td></tr>`).join('')}<tr class="new-set"><td><input data-set-number type="number" min="1" value="${next}" aria-label="Número de serie"></td><td><input data-set-weight type="number" min="0" step="0.25" aria-label="Peso"></td><td><input data-set-reps type="number" min="0" value="10" aria-label="Repeticiones"></td><td><input data-set-rir type="number" min="0" max="10" value="2" aria-label="RIR"></td><td><input data-set-rpe type="number" min="0" max="10" step="0.5" aria-label="RPE"></td><td><input class="set-complete" data-set-complete type="checkbox" checked aria-label="Completada"></td><td><button class="button button-primary" data-add-set>+</button></td></tr></tbody></table><div class="session-card-foot"><small>1RM estimado calculado por el backend</small><button class="text-button" data-complete-exercise>${exercise.completed?'Reabrir':'Marcar ejercicio completo'}</button></div></article>`;
    }).join('');
}

async function addSet(card) {
    const exerciseId = Number(card.dataset.sessionExercise); const body = {setNumber:Number(card.querySelector('[data-set-number]').value), weight:optionalNumber(card.querySelector('[data-set-weight]').value), reps:optionalNumber(card.querySelector('[data-set-reps]').value), rir:optionalNumber(card.querySelector('[data-set-rir]').value), rpe:optionalNumber(card.querySelector('[data-set-rpe]').value), completed:card.querySelector('[data-set-complete]').checked, notes:null};
    try { await api(`/api/users/${state.auth.userId}/workout-session-exercises/${exerciseId}/sets`, {method:'POST', body:JSON.stringify(body)}); await loadSessionExercises(); toast('Serie registrada.'); }
    catch (error) { toast(error.message, true); }
}

async function toggleSessionExercise(exerciseId) {
    const exercise = state.sessionExercises.find(e => e.id === exerciseId); const sets = state.sessionSets.get(exerciseId) || [];
    const body = {completed:!exercise.completed, performedSets:sets.filter(s=>s.completed).length, performedReps:sets.reduce((sum,s)=>sum+(s.reps||0),0), performedWeightKg:sets.length ? Math.max(...sets.map(s=>Number(s.weight||0))) : null, performedDurationMinutes:exercise.performedDurationMinutes, estimatedCaloriesBurned:exercise.estimatedCaloriesBurned, notes:exercise.notes};
    try { await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/exercises/${exerciseId}`, {method:'PUT', body:JSON.stringify(body)}); await loadSessionExercises(); }
    catch (error) { toast(error.message, true); }
}

async function finishSession(action) {
    if (!state.currentSession) return;
    try { state.currentSession = await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/${action}`, {method:'POST'}); localStorage.removeItem('fitcore.lab.currentSession'); renderSession(); toast(action === 'complete' ? 'Entrenamiento completado.':'Sesión cancelada.'); await loadOverview(); }
    catch (error) { toast(error.message, true); }
}

async function deleteSession() {
    if (!await confirmAction('Eliminar sesión', 'La sesión y sus registros se eliminarán de forma permanente.')) return;
    try { await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}`, {method:'DELETE'}); state.currentSession=null; state.sessionExercises=[]; state.sessionSets.clear(); localStorage.removeItem('fitcore.lab.currentSession'); renderSession(); toast('Sesión eliminada.'); }
    catch (error) { toast(error.message, true); }
}

async function loadProgressDashboard() {
    await Promise.allSettled([loadStats(), loadProgressHistory()]);
}

async function loadStats() {
    if (!requireAuth()) return;
    try {
        const stats = await api(`/api/users/${state.auth.userId}/training-statistics?from=${$('stats-from').value}&to=${$('stats-to').value}`); const c = stats.current || {}; const cmp = stats.comparison || {};
        $('stat-workouts').textContent = c.workouts ?? 0; $('stat-duration').textContent = `${formatNumber(c.durationMinutes)} min`; $('stat-volume').textContent = `${formatNumber(c.totalVolume)} kg`; $('stat-sets').textContent = c.completedSets ?? 0;
        $('stat-workouts-change').textContent = changeLabel(cmp.workoutsChangePercent); $('stat-duration-change').textContent = changeLabel(cmp.durationChangePercent); $('stat-volume-change').textContent = changeLabel(cmp.volumeChangePercent); $('stat-sets-change').textContent = changeLabel(cmp.completedSetsChangePercent);
        renderDistribution(stats.muscleDistribution || []); renderGoalAssessment(stats.goalProgress); $('metric-workouts').textContent = c.workouts ?? 0;
    } catch (error) { if (error.status !== 404) toast(error.message, true); }
}

function changeLabel(value) { return value == null ? 'Sin periodo anterior' : `${Number(value)>=0?'↑':'↓'} ${Math.abs(Number(value)).toFixed(1)}% frente al periodo anterior`; }
function renderDistribution(items) { $('muscle-distribution').innerHTML = items.length ? items.map(item => `<div class="distribution-row"><strong>${friendly(item.muscleGroup)}</strong><span class="distribution-track"><i style="width:${Math.min(100,Number(item.distributionPercent||0))}%"></i></span><span>${formatNumber(item.distributionPercent)}%</span></div>`).join('') : '<div class="empty-state">Completa sesiones para ver datos.</div>'; }
function renderGoalAssessment(goal) {
    if (!goal?.goalType) { $('goal-status').textContent='Sin objetivo'; $('goal-status').dataset.state=''; $('goal-assessment').innerHTML='<div class="empty-state">Crea un objetivo y registra mediciones para comparar tu entrenamiento con la meta.</div>'; return; }
    const score = Number(goal.targetCompletionPercent ?? goal.trainingAdherencePercent ?? 0); $('goal-status').textContent=friendly(goal.status); $('goal-status').dataset.state=goal.trainingAligned?'ok':'error';
    $('goal-assessment').innerHTML = `<div class="goal-score"><div class="score-ring"><strong>${formatNumber(score)}%</strong></div><div><strong>${friendly(goal.goalType)}</strong><p>${friendly(goal.summaryKey)}</p><small>Confianza: ${friendly(goal.confidence)} · Entrenamiento ${goal.trainingAligned?'alineado':'no alineado'}</small></div></div><div class="goal-signals">${(goal.signals||[]).map(s=>`<div class="goal-signal"><strong>${friendly(s.code)}</strong><span>${friendly(s.status)} · ${formatNumber(s.value)}</span></div>`).join('')}</div>`;
}

async function saveGoal(event) {
    event.preventDefault(); if (!requireAuth()) return;
    const body = {goalType:$('goal-type').value, targetCalories:null, targetProtein:null, targetCarbs:null, targetFats:null, reviewFrequencyDays:7, startDate:today(), targetWeightKg:optionalNumber($('goal-weight').value), targetBodyFatPercentage:optionalNumber($('goal-fat').value), targetMuscleMassKg:optionalNumber($('goal-muscle').value), targetDate:$('goal-target-date').value || null, targetTrainingDaysPerWeek:Number($('goal-days').value), priorityMuscleGroups:[...$('goal-groups').selectedOptions].map(o=>o.value)};
    try { await api(`/api/users/${state.auth.userId}/goal-profiles`, {method:'POST', body:JSON.stringify(body)}); toast('Objetivo guardado como nueva versión.'); await loadStats(); }
    catch (error) { toast(error.message, true); }
}

async function saveProgress(event) {
    event.preventDefault(); if (!requireAuth()) return;
    const body = {recordDate:$('progress-date').value, weightKg:optionalNumber($('progress-weight').value), bodyFatPercentage:optionalNumber($('progress-fat').value), muscleMassKg:optionalNumber($('progress-muscle').value), notes:$('progress-notes').value.trim() || null};
    if (body.weightKg == null && body.bodyFatPercentage == null && body.muscleMassKg == null) return toast('Introduce al menos una medición.', true);
    try { await api(`/api/users/${state.auth.userId}/progress-records`, {method:'POST', body:JSON.stringify(body)}); toast('Medición guardada.'); await loadProgressDashboard(); }
    catch (error) { toast(error.message, true); }
}

async function loadProgressHistory() {
    if (!state.auth) return;
    try { const records = await api(`/api/users/${state.auth.userId}/progress-records?from=${daysAgo(180)}&to=${today()}`); $('progress-history').innerHTML = records.slice(-4).reverse().map(r=>`<div class="history-row"><strong>${r.recordDate}</strong><span>${r.weightKg ?? '—'} kg · ${r.bodyFatPercentage ?? '—'}% grasa</span></div>`).join(''); }
    catch (_) {}
}

async function loadRecommendations() {
    if (!requireAuth()) return; const status = $('recommendation-filter').value;
    try { const result = await api(`/api/users/${state.auth.userId}/training-recommendations${status?`?status=${status}`:''}`); renderRecommendations(result); }
    catch (error) { toast(error.message, true); }
}

function renderRecommendations(items) {
    const container=$('recommendation-list'); if (!items.length) { container.innerHTML='<div class="empty-state large">Aún no hay recomendaciones para este filtro.</div>'; return; }
    container.innerHTML=items.map(r=>{const date=new Date(`${r.recommendationDate}T00:00:00`);return `<article class="recommendation-card" data-recommendation="${r.id}"><div class="recommendation-date"><strong>${date.getDate()}</strong><small>${date.toLocaleDateString('es-ES',{month:'short'}).toUpperCase()}</small></div><div><div class="button-row"><h3>${friendly(r.recommendationType)}</h3><span class="status-pill" data-state="${r.status}">${friendly(r.status)}</span></div><p>${escapeHtml(r.reason)}</p><div class="recommendation-deltas">${r.proposedSetsChange!=null?`<span>Series ${signed(r.proposedSetsChange)}</span>`:''}${r.proposedRepsChange!=null?`<span>Reps ${signed(r.proposedRepsChange)}</span>`:''}${r.proposedCardioChangeMinutes!=null?`<span>Cardio ${signed(r.proposedCardioChangeMinutes)} min</span>`:''}</div></div><div class="recommendation-actions">${r.status==='PENDING'?'<button class="button button-primary" data-decision="accept">Aceptar</button><button class="button button-secondary" data-decision="reject">Rechazar</button>':''}</div></article>`}).join('');
}
const signed = value => Number(value)>0?`+${value}`:value;
async function generateRecommendation() { if (!requireAuth()) return; try { await api(`/api/users/${state.auth.userId}/training-recommendations/generate`,{method:'POST'});toast('Recomendación generada.');await loadRecommendations();}catch(error){toast(error.message,true);} }
async function decideRecommendation(id, decision) { try { await api(`/api/users/${state.auth.userId}/training-recommendations/${id}/${decision}`,{method:'POST'});toast(`Recomendación ${decision==='accept'?'aceptada':'rechazada'}.`);await loadRecommendations();}catch(error){toast(error.message,true);} }

function requireAuth() { if (state.auth) return true; toast('Inicia sesión para usar esta sección.', true); navigate('overview'); return false; }
function confirmAction(title, message) { const dialog=$('confirm-dialog'); $('confirm-title').textContent=title; $('confirm-message').textContent=message; dialog.showModal(); return new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true})); }

async function loadOverview() {
    if (!state.auth) return;
    try { const variants = await api('/api/exercise-variants/search?page=0&size=1'); $('metric-exercises').textContent=variants.totalElements; } catch (_) {}
    await Promise.allSettled([loadActivePlan(true), loadStats()]);
}

async function bootstrapUserData() {
    await Promise.allSettled([searchCatalog(), loadOverview(), restoreSession(), loadRecommendations(), loadProgressHistory()]);
}

function bindEvents() {
    document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.go)));
    document.querySelectorAll('.nav-item').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.view)));
    $('menu-button').addEventListener('click',()=>{const sidebar=document.querySelector('.sidebar');sidebar.classList.toggle('is-open');$('menu-button').setAttribute('aria-expanded',String(sidebar.classList.contains('is-open')));});
    $('auth-form').addEventListener('submit',event=>{event.preventDefault();authenticate(false);}); $('register-button').addEventListener('click',()=>authenticate(true)); $('logout-button').addEventListener('click',logout);
    $('health-check').addEventListener('click',healthCheck); $('catalog-search').addEventListener('click',()=>searchCatalog(0)); $('catalog-query').addEventListener('keydown',e=>{if(e.key==='Enter')searchCatalog(0);});
    $('catalog-clear').addEventListener('click',()=>{$('catalog-query').value='';$('catalog-equipment').value='';$('catalog-muscle').value='';$('catalog-stabilizers').checked=false;searchCatalog(0);});
    $('catalog-prev').addEventListener('click',()=>searchCatalog(state.catalogPage-1)); $('catalog-next').addEventListener('click',()=>searchCatalog(state.catalogPage+1)); $('catalog-results').addEventListener('click',e=>{const item=e.target.closest('[data-variant]');if(item)selectVariant(item.dataset.variant);}); $('map-stabilizers').addEventListener('change',paintActivations);
    $('add-day').addEventListener('click',()=>addPlanDay()); $('plan-load').addEventListener('click',()=>loadActivePlan()); $('plan-save').addEventListener('click',savePlan);
    $('plan-days').addEventListener('click',e=>{const card=e.target.closest('.day-card');if(!card)return;const di=Number(card.dataset.day);if(e.target.closest('[data-remove-day]')){syncPlanEditor();state.planDays.splice(di,1);renderPlanDays();}else if(e.target.closest('[data-add-plan-exercise]')){syncPlanEditor();state.planDays[di].exercises.push({exerciseVariantCode:'',sets:3,reps:10,restSeconds:90});renderPlanDays();}else if(e.target.closest('[data-remove-exercise]')){syncPlanEditor();state.planDays[di].exercises.splice(Number(e.target.closest('.exercise-editor').dataset.exercise),1);renderPlanDays();}else if(e.target.closest('[data-move]')){syncPlanEditor();const row=e.target.closest('.exercise-editor'),from=Number(row.dataset.exercise),to=from+Number(e.target.dataset.move);if(to>=0&&to<state.planDays[di].exercises.length){const [item]=state.planDays[di].exercises.splice(from,1);state.planDays[di].exercises.splice(to,0,item);renderPlanDays();}}});
    $('session-start').addEventListener('click',startSession); $('session-add-exercise').addEventListener('click',addSessionExercise); $('session-refresh').addEventListener('click',loadSessionExercises); $('session-complete').addEventListener('click',()=>finishSession('complete')); $('session-cancel').addEventListener('click',()=>finishSession('cancel')); $('session-delete').addEventListener('click',deleteSession);
    $('session-exercises').addEventListener('click',async e=>{const card=e.target.closest('.session-card');if(!card)return;const id=Number(card.dataset.sessionExercise);if(e.target.closest('[data-add-set]'))await addSet(card);else if(e.target.closest('[data-complete-exercise]'))await toggleSessionExercise(id);else if(e.target.closest('[data-delete-set]')){try{await api(`/api/users/${state.auth.userId}/workout-session-exercises/${id}/sets/${e.target.dataset.deleteSet}`,{method:'DELETE'});await loadSessionExercises();}catch(error){toast(error.message,true);}}else if(e.target.closest('[data-remove-session-exercise]')){try{await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/exercises/${id}`,{method:'DELETE'});await loadSessionExercises();}catch(error){toast(error.message,true);}}});
    $('stats-load').addEventListener('click',loadStats); $('goal-form').addEventListener('submit',saveGoal); $('progress-form').addEventListener('submit',saveProgress);
    $('recommendation-generate').addEventListener('click',generateRecommendation); $('recommendation-filter').addEventListener('change',loadRecommendations); $('recommendation-list').addEventListener('click',e=>{const button=e.target.closest('[data-decision]'),card=e.target.closest('[data-recommendation]');if(button&&card)decideRecommendation(card.dataset.recommendation,button.dataset.decision);});
    $('log-clear').addEventListener('click',()=>{state.logs=[];renderLogs();}); $('log-copy').addEventListener('click',async()=>{await navigator.clipboard.writeText(JSON.stringify(state.logs,null,2));toast('Registro copiado.');});
}

async function init() {
    $('plan-date').value=today(); $('session-date').value=today(); $('progress-date').value=today(); $('stats-from').value=daysAgo(29); $('stats-to').value=today(); $('goal-target-date').value=daysAgo(-90);
    fillSelect($('catalog-equipment'),enums.equipment,'Todo'); fillSelect($('catalog-muscle'),enums.muscles,'Todos'); fillSelect($('goal-groups'),enums.muscles); bindEvents(); setAuth(state.auth); addPlanDay(); await Promise.all([loadSvg(),healthCheck()]);
    navigate(location.hash.slice(1) && $(`view-${location.hash.slice(1)}`) ? location.hash.slice(1) : 'overview');
    if (state.auth) await bootstrapUserData();
}

init();
