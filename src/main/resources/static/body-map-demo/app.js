const API = '';

const state = {
    token: sessionStorage.getItem('fitcore.demo.token'),
    user: JSON.parse(sessionStorage.getItem('fitcore.demo.user') || 'null'),
    exercises: [], variants: [], filteredVariants: [], session: [], svg: null,
    showSessionStabilizers: false
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

const labels = {
    BARBELL: 'Barra', DUMBBELL: 'Mancuernas', CABLE: 'Polea', BODYWEIGHT: 'Peso corporal',
    PRONATED: 'Prono', SUPINATED: 'Supino', NEUTRAL: 'Neutro', SEMI_PRONATED: 'Semiprono', SEMI_SUPINATED: 'Semisupino', MIXED: 'Mixto', HOOK: 'Gancho', NO_SPECIFIC_GRIP: 'Sin agarre específico',
    NARROW: 'Estrecho', MEDIUM: 'Medio', WIDE: 'Ancho', NOT_APPLICABLE: 'No aplica',
    COMMON: 'Común', UNCOMMON: 'Poco común', MACHINE_DEPENDENT: 'Depende del equipamiento',
    TECHNIQUE_DEPENDENT: 'Depende de la técnica', NOT_RECOMMENDED: 'No recomendada',
    BACK_WIDTH: 'Amplitud de espalda', BACK_THICKNESS: 'Espesor de espalda', LAT_BIAS: 'Énfasis dorsal',
    UPPER_BACK_BIAS: 'Énfasis en espalda alta', BICEPS_BIAS: 'Énfasis en bíceps',
    BRACHIALIS_BRACHIORADIALIS_BIAS: 'Énfasis braquial y braquiorradial',
    CHEST_STERNAL_BIAS: 'Énfasis en pecho medio', CHEST_CLAVICULAR_BIAS: 'Énfasis en pecho superior',
    CHEST_LOWER_BIAS: 'Énfasis en pecho inferior', TRICEPS_BIAS: 'Énfasis en tríceps',
    SHOULDER_STRENGTH: 'Fuerza de hombro', SIDE_DELTS_BIAS: 'Énfasis en deltoides lateral',
    REAR_DELTS_BIAS: 'Énfasis en deltoides posterior', QUAD_BIAS: 'Énfasis en cuádriceps',
    GLUTE_BIAS: 'Énfasis en glúteo', HAMSTRING_BIAS: 'Énfasis en femoral',
    ADDUCTOR_BIAS: 'Énfasis en aductores', HIP_ABDUCTION_BIAS: 'Énfasis en abducción de cadera',
    CALF_GASTROCNEMIUS_BIAS: 'Énfasis en gastrocnemio', CALF_SOLEUS_BIAS: 'Énfasis en sóleo',
    CORE_FLEXION: 'Flexión de core', CORE_ANTI_EXTENSION: 'Anti-extensión',
    CORE_ANTI_ROTATION: 'Anti-rotación', CORE_LATERAL_STABILITY: 'Estabilidad lateral',
    POSTERIOR_CHAIN: 'Cadena posterior', GENERAL_STRENGTH: 'Fuerza general',
    MACHINE_STABILITY: 'Estabilidad guiada', UNILATERAL_STABILITY: 'Estabilidad unilateral'
};

const $ = id => document.getElementById(id);
const elements = {
    apiStatus: $('api-status'), apiStatusText: $('api-status-text'), authForm: $('auth-form'), signedUser: $('signed-user'),
    email: $('email'), password: $('password'), login: $('login-button'), register: $('register-button'), logout: $('logout-button'),
    userEmail: $('user-email'), userAvatar: $('user-avatar'), selection: $('selection-section'), exercise: $('exercise-select'),
    equipment: $('equipment-select'), gripType: $('grip-type-select'), gripWidth: $('grip-width-select'), variant: $('variant-select'),
    benchAngle: $('bench-angle-select'), trajectory: $('trajectory-select'), supportType: $('support-type-select'),
    summary: $('variant-summary'), preview: $('preview-button'), add: $('add-button'), clear: $('clear-button'), sessionList: $('session-list'),
    stage: $('body-map-stage'), loading: $('map-loading'), title: $('map-title'), subtitle: $('map-subtitle'), activeCount: $('active-count'),
    diagnostic: $('diagnostic'), toasts: $('toast-region'), sessionStabilizers: $('session-stabilizers')
};

async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (state.token) headers.Authorization = `Bearer ${state.token}`;
    const response = await fetch(`${API}${path}`, { ...options, headers });
    if (!response.ok) {
        let message = `Error ${response.status}`;
        try { message = (await response.json()).message || message; } catch (_) {}
        if (response.status === 401 || response.status === 403) setAuth(null);
        throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
}

async function loadSvg() {
    try {
        const source = await fetch('./assets/body-map.svg').then(r => { if (!r.ok) throw new Error('SVG no encontrado'); return r.text(); });
        const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
        const svg = doc.documentElement;
        svg.removeAttribute('width'); svg.removeAttribute('height'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Vista frontal y posterior del cuerpo humano');
        elements.stage.appendChild(document.importNode(svg, true));
        state.svg = elements.stage.querySelector('svg');
        const missingIds = validateSvgMap();
        if (missingIds.length) throw new Error(`IDs SVG sin encontrar: ${missingIds.join(', ')}`);
        elements.loading.remove();
        setDiagnostic(`SVG cargado · ${Object.keys(muscleSvgMap).length} códigos mapeados`, 'ok');
    } catch (error) {
        elements.loading.innerHTML = `<p>${error.message}</p>`;
        setDiagnostic(error.message, 'error');
    }
}

function validateSvgMap() {
    const expectedIds = Object.values(muscleSvgMap).flat();
    return [...new Set(expectedIds.filter(id => !state.svg.getElementById(id)))];
}

async function authenticate(mode) {
    const email = elements.email.value.trim(); const password = elements.password.value;
    if (!email || password.length < 8) return toast('Introduce un email y una contraseña de al menos 8 caracteres.', true);
    const path = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = mode === 'register' ? { name: 'Usuario Body Map', email, password, age: 25, heightCm: 175, weightKg: 75 } : { email, password };
    try {
        setApiStatus('Autenticando…', 'idle');
        const result = await api(path, { method: 'POST', body: JSON.stringify(body) });
        state.token = result.token; state.user = { id: result.userId, email: result.email };
        sessionStorage.setItem('fitcore.demo.token', state.token); sessionStorage.setItem('fitcore.demo.user', JSON.stringify(state.user));
        setAuth(state.user); await loadCatalog(); toast(mode === 'register' ? 'Cuenta creada y conectada.' : 'Sesión iniciada correctamente.');
    } catch (error) { setApiStatus('API disponible', 'ok'); toast(error.message, true); }
}

function setAuth(user) {
    state.user = user;
    if (!user) { state.token = null; sessionStorage.removeItem('fitcore.demo.token'); sessionStorage.removeItem('fitcore.demo.user'); }
    elements.authForm.hidden = !!user; elements.signedUser.hidden = !user;
    if (user) { elements.userEmail.textContent = user.email; elements.userAvatar.textContent = user.email.slice(0, 2).toUpperCase(); setApiStatus('API conectada', 'ok'); }
    else { elements.exercise.innerHTML = '<option>Inicia sesión primero</option>'; elements.exercise.disabled = true; }
    elements.selection.setAttribute('aria-disabled', String(!user));
}

async function loadCatalog() {
    try {
        state.exercises = await api('/api/exercises');
        fillSelect(elements.exercise, state.exercises.map(x => [x.code, x.name]), 'Selecciona un ejercicio');
        elements.exercise.disabled = false; setApiStatus(`${state.exercises.length} ejercicios disponibles`, 'ok');
    } catch (error) { toast(error.message, true); setApiStatus('Error de conexión', 'error'); }
}

async function onExerciseChange() {
    if (!elements.exercise.value) return resetFilters();
    try {
        state.variants = await api(`/api/exercises/${encodeURIComponent(elements.exercise.value)}/variants`);
        const equipment = unique(state.variants.map(v => v.equipment));
        const grips = unique(state.variants.map(v => v.gripType || 'NOT_APPLICABLE'));
        const widths = unique(state.variants.map(v => v.gripWidth || 'NOT_APPLICABLE'));
        const angles = unique(state.variants.map(v => v.benchAngle || 'NOT_APPLICABLE'));
        const trajectories = unique(state.variants.map(v => v.trajectory || 'NOT_APPLICABLE'));
        const supports = unique(state.variants.map(v => v.supportType || 'NOT_APPLICABLE'));
        fillSelect(elements.equipment, equipment.map(x => [x, friendly(x)]), equipment.length > 1 ? 'Cualquier equipamiento' : null);
        fillSelect(elements.gripType, grips.map(x => [x, friendly(x)]), grips.length > 1 ? 'Cualquier agarre' : null);
        fillSelect(elements.gripWidth, widths.map(x => [x, friendly(x)]), widths.length > 1 ? 'Cualquier ancho' : null);
        fillSelect(elements.benchAngle, angles.map(x => [x, friendly(x)]), angles.length > 1 ? 'Cualquier ángulo' : null);
        fillSelect(elements.trajectory, trajectories.map(x => [x, friendly(x)]), trajectories.length > 1 ? 'Cualquier trayectoria' : null);
        fillSelect(elements.supportType, supports.map(x => [x, friendly(x)]), supports.length > 1 ? 'Cualquier apoyo' : null);
        [elements.equipment, elements.gripType, elements.gripWidth, elements.benchAngle, elements.trajectory, elements.supportType]
            .forEach(el => el.disabled = el.options.length <= 1);
        applyFilters();
    } catch (error) { toast(error.message, true); }
}

function applyFilters() {
    state.filteredVariants = state.variants.filter(v =>
        (!elements.equipment.value || v.equipment === elements.equipment.value) &&
        (!elements.gripType.value || (v.gripType || 'NOT_APPLICABLE') === elements.gripType.value) &&
        (!elements.gripWidth.value || (v.gripWidth || 'NOT_APPLICABLE') === elements.gripWidth.value) &&
        (!elements.benchAngle.value || (v.benchAngle || 'NOT_APPLICABLE') === elements.benchAngle.value) &&
        (!elements.trajectory.value || (v.trajectory || 'NOT_APPLICABLE') === elements.trajectory.value) &&
        (!elements.supportType.value || (v.supportType || 'NOT_APPLICABLE') === elements.supportType.value));
    fillSelect(elements.variant, state.filteredVariants.map(v => [v.code, v.name]), state.filteredVariants.length ? null : 'Sin coincidencias');
    elements.variant.disabled = state.filteredVariants.length <= 1;
    updateVariantSummary();
}

function updateVariantSummary() {
    const variant = currentVariant(); const enabled = !!variant;
    elements.preview.disabled = !enabled; elements.add.disabled = !enabled;
    elements.summary.innerHTML = enabled
        ? `<span class="summary-icon">i</span><p><strong>${variant.name}</strong><br>${friendly(variant.equipment)} · agarre ${friendly(variant.gripType || 'NOT_APPLICABLE').toLowerCase()} · ${friendly(variant.gripWidth || 'NOT_APPLICABLE').toLowerCase()} · ${friendly(variant.primaryFocus).toLowerCase()} · ${friendly(variant.practicality).toLowerCase()}${variant.requiresCaution ? ' · requiere precaución' : ''}</p>`
        : '<span class="summary-icon">i</span><p>No existe una variante con esta combinación.</p>';
}

async function getActivations(variant) {
    return api(`/api/exercise-variants/${encodeURIComponent(variant.code)}/muscle-activations`);
}

async function previewVariant() {
    const variant = currentVariant(); if (!variant) return;
    try { const activations = await getActivations(variant); paintActivations(activations, variant.name, 'Previsualización de una variante'); }
    catch (error) { toast(error.message, true); }
}

async function addToSession() {
    const variant = currentVariant(); if (!variant) return;
    if (state.session.some(item => item.variant.code === variant.code)) return toast('Esa variante ya está en la sesión.', true);
    try {
        const activations = await getActivations(variant);
        state.session.push({ variant, activations }); renderSession(); paintSession(); toast('Ejercicio añadido a la sesión de prueba.');
    } catch (error) { toast(error.message, true); }
}

function paintSession() {
    if (!state.session.length) return paintActivations([], 'Mapa muscular', 'Las regiones se iluminarán según su nivel de activación.');
    const combined = new Map();
    state.session.flatMap(item => item.activations)
        .filter(a => state.showSessionStabilizers || a.role !== 'STABILIZER')
        .forEach(a => {
        const existing = combined.get(a.muscleCode);
        if (!existing || a.activationLevel > existing.activationLevel) combined.set(a.muscleCode, a);
    });
    const stabilizerNote = state.showSessionStabilizers ? ' · con estabilizadores' : ' · primarios y secundarios';
    paintActivations([...combined.values()], 'Activación de la sesión', `${state.session.length} ejercicio${state.session.length === 1 ? '' : 's'} combinado${state.session.length === 1 ? '' : 's'}${stabilizerNote}`);
}

function paintActivations(activations, title, subtitle) {
    if (!state.svg) return;
    state.svg.querySelectorAll('[data-fitcore-muscle]').forEach(node => { node.removeAttribute('data-fitcore-muscle'); node.removeAttribute('data-fitcore-level'); });
    const missing = [];
    activations.forEach(a => {
        const ids = muscleSvgMap[a.muscleCode] || [];
        let found = 0;
        ids.forEach(id => {
            const node = state.svg.getElementById(id);
            if (!node) return;

            found++;
            const currentLevel = Number(node.dataset.fitcoreLevel || 0);
            if (a.activationLevel > currentLevel) {
                node.dataset.fitcoreMuscle = a.muscleCode;
                node.dataset.fitcoreLevel = String(a.activationLevel);
            }
        });
        if (!found) missing.push(a.muscleCode);
    });
    elements.title.textContent = title; elements.subtitle.textContent = subtitle; elements.activeCount.textContent = String(activations.length);
    setDiagnostic(missing.length ? `Sin región SVG: ${missing.join(', ')}` : activations.length ? 'Todos los códigos tienen región SVG' : 'Esperando selección', missing.length ? 'error' : activations.length ? 'ok' : 'idle');
}

function renderSession() {
    if (!state.session.length) { elements.sessionList.innerHTML = '<div class="empty-state"><span>0</span><p>Añade ejercicios para combinar sus activaciones.</p></div>'; return; }
    elements.sessionList.innerHTML = state.session.map((item, i) => `<div class="session-item"><span class="session-index">${String(i + 1).padStart(2, '0')}</span><span><strong>${item.variant.name}</strong><small>${friendly(item.variant.gripType || 'NOT_APPLICABLE')} · ${item.activations.length} músculos</small></span><button class="remove-button" data-remove="${i}" aria-label="Eliminar ${item.variant.name}">×</button></div>`).join('');
}

function resetFilters() {
    state.variants = []; [elements.equipment, elements.gripType, elements.gripWidth, elements.benchAngle,
        elements.trajectory, elements.supportType, elements.variant].forEach(el => { el.innerHTML = ''; el.disabled = true; }); updateVariantSummary();
}
function currentVariant() { return state.filteredVariants.find(v => v.code === elements.variant.value) || state.filteredVariants[0] || null; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function friendly(value) { if (!value) return 'No aplica'; return labels[value] || value.toLowerCase().replaceAll('_', ' ').replace(/^./, c => c.toUpperCase()); }
function fillSelect(select, entries, placeholder) { select.innerHTML = ''; if (placeholder) select.add(new Option(placeholder, '')); entries.forEach(([value, text]) => select.add(new Option(text, value))); if (!placeholder && entries.length) select.value = entries[0][0]; }
function setApiStatus(text, stateName) { elements.apiStatusText.textContent = text; elements.apiStatus.dataset.state = stateName; }
function setDiagnostic(text, stateName) { elements.diagnostic.lastElementChild.textContent = text; elements.diagnostic.dataset.state = stateName; }
function toast(message, error = false) { const node = document.createElement('div'); node.className = `toast${error ? ' error' : ''}`; node.textContent = message; elements.toasts.appendChild(node); setTimeout(() => node.remove(), 3600); }

elements.login.addEventListener('click', () => authenticate('login'));
elements.register.addEventListener('click', () => authenticate('register'));
elements.logout.addEventListener('click', () => { setAuth(null); resetFilters(); state.session = []; renderSession(); paintSession(); setApiStatus('Sesión cerrada', 'idle'); });
elements.exercise.addEventListener('change', onExerciseChange);
[elements.equipment, elements.gripType, elements.gripWidth, elements.benchAngle,
    elements.trajectory, elements.supportType].forEach(el => el.addEventListener('change', applyFilters));
elements.variant.addEventListener('change', updateVariantSummary);
elements.preview.addEventListener('click', previewVariant); elements.add.addEventListener('click', addToSession);
elements.clear.addEventListener('click', () => { state.session = []; renderSession(); paintSession(); });
elements.sessionStabilizers.addEventListener('change', event => { state.showSessionStabilizers = event.target.checked; paintSession(); });
elements.sessionList.addEventListener('click', event => { const button = event.target.closest('[data-remove]'); if (!button) return; state.session.splice(Number(button.dataset.remove), 1); renderSession(); paintSession(); });

loadSvg();
if (state.user && state.token) { setAuth(state.user); loadCatalog(); } else { setAuth(null); setApiStatus('API preparada', 'ok'); }
