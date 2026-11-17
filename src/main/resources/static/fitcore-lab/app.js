const API = '';
const STORAGE_KEY = 'fitcore.lab.session.v1';
const SESSION_STARTED_KEY = 'fitcore.lab.session.startedAt';
const state = {
    auth: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'),
    logs: [], exercises: [], variants: [], catalogExercises: [], selectedExercise: null,
    selectedVariant: null, variantConfiguration: {}, activations: [], svg: null,
    activePlan: null, planDays: [], currentSession: null,
    sessionExercises: [], sessionSets: new Map(), sessionStartedAt: Number(localStorage.getItem(SESSION_STARTED_KEY)) || null,
    sessionTimer: null, sessionPicker: {exercise:null, configuration:{}}, sessionActivations: new Map(),
    sessionPrevious: new Map(), restEditorExerciseId: null, rpeTarget: null,
    restTimer: {exerciseId:null, exerciseName:'', remaining:0, total:0, running:false, interval:null}
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
    BARBELL:'Barra', DUMBBELL:'Mancuernas', EZ_BAR:'Barra Z', CABLE:'Polea', MACHINE_SELECTORISED:'Máquina de placas', MACHINE_PLATE_LOADED:'Máquina de discos', SMITH_MACHINE:'Multipower', BODYWEIGHT:'Peso corporal', TRAP_BAR:'Barra hexagonal', KETTLEBELL:'Pesa rusa', WEIGHT_PLATE:'Disco', BENCH:'Banco', BAND:'Banda', MEDICINE_BALL:'Balón medicinal', AB_WHEEL:'Rueda abdominal', WRIST_ROLLER:'Rodillo de muñeca', NONE:'Sin equipamiento',
    CHEST:'Pecho', BACK:'Espalda', SHOULDERS:'Hombros', SCAPULAR:'Escápulas', ROTATOR_CUFF:'Manguito rotador', BICEPS:'Bíceps', TRICEPS:'Tríceps', FOREARMS:'Antebrazos', QUADRICEPS:'Cuádriceps', HAMSTRINGS:'Isquiotibiales', GLUTES:'Glúteos', ADDUCTORS:'Aductores', CALVES:'Gemelos', CORE:'Zona media', NECK:'Cuello', FULL_BODY:'Cuerpo completo',
    PRIMARY:'Primario', SECONDARY:'Secundario', STABILIZER:'Estabilizador', MUSCLE_GAIN:'Ganancia muscular', FAT_LOSS:'Pérdida de grasa', RECOMPOSITION:'Recomposición corporal', PERFORMANCE:'Rendimiento', MAINTENANCE:'Mantenimiento',
    PRONATED:'Prono', SUPINATED:'Supino', NEUTRAL:'Neutro', SEMI_NEUTRAL:'Semineutro', SEMI_PRONATED:'Semiprono', SEMI_SUPINATED:'Semisupino', MIXED:'Mixto', HOOK:'Gancho', NO_SPECIFIC_GRIP:'Sin agarre específico',
    NARROW:'Estrecha', MEDIUM:'Media', WIDE:'Ancha', NOT_APPLICABLE:'No aplica', NO_ATTACHMENT:'Sin accesorio', STRAIGHT_BAR:'Barra recta', EZ_BAR_ATTACHMENT:'Barra Z', ROPE:'Cuerda', V_BAR:'Barra en V', D_HANDLE:'Asa individual', LAT_BAR:'Barra de jalón', MAG_GRIP:'Agarre ergonómico', ANKLE_STRAP:'Tobillera',
    FLAT:'Plano', LOW_INCLINE:'Inclinación baja', INCLINE:'Inclinado', HIGH_INCLINE:'Inclinación alta', DECLINE:'Declinado', UPRIGHT:'Vertical',
    STANDING:'De pie', SEATED:'Sentado', SUPINE:'Tumbado boca arriba', PRONE:'Tumbado boca abajo', CHEST_SUPPORTED:'Pecho apoyado', BENT_OVER:'Inclinado hacia delante', INCLINE_PRONE:'Boca abajo en banco inclinado', KNEELING:'De rodillas', HALF_KNEELING:'Una rodilla apoyada', HANGING:'Suspendido', QUADRUPED:'Cuadrupedia', SIDE_LYING:'Tumbado de lado',
    TO_CHEST:'Hacia el pecho', TO_UPPER_CHEST:'Hacia la parte alta del pecho', TO_HIP:'Hacia la cadera', TO_ABDOMEN:'Hacia el abdomen', TO_FACE:'Hacia la cara', LOW_TO_HIGH:'De abajo hacia arriba', HIGH_TO_LOW:'De arriba hacia abajo', ARC:'En arco', OVERHEAD:'Sobre la cabeza', DOWNWARD:'Descendente', UPWARD:'Ascendente', HORIZONTAL:'Horizontal', ROTATIONAL:'Rotacional',
    FREE:'Libre', UNSUPPORTED:'Sin apoyo', BENCH_SUPPORTED:'Apoyado en banco', MACHINE_SUPPORTED:'Apoyado en máquina', FLOOR_SUPPORTED:'Apoyado en el suelo',
    CONVENTIONAL:'Convencional', SUMO:'Sumo', SPLIT:'Posición dividida', STAGGERED:'Posición escalonada', FEET_NARROW:'Pies juntos', FEET_MEDIUM:'Pies a anchura media', FEET_WIDE:'Pies separados',
    ARMS_BY_SIDES:'Brazos a los lados', ARMS_IN_FRONT:'Brazos al frente', ARMS_OVERHEAD:'Brazos sobre la cabeza', ARMS_BEHIND_TORSO:'Brazos detrás del torso', ABDUCTED:'Brazos separados',
    MID:'Media', EXTENDED:'Extendidas', SLIGHTLY_FLEXED:'Ligeramente flexionadas', FLEXED:'Flexionadas', DYNAMIC:'Dinámica', ISOMETRIC:'Isométrica', ECCENTRIC_EMPHASIS:'Énfasis excéntrico',
    COMMON:'Común', UNCOMMON:'Poco común', MACHINE_DEPENDENT:'Depende de la máquina', TECHNIQUE_DEPENDENT:'Depende de la técnica', NOT_RECOMMENDED:'No recomendado',
    DIRECT_EMG:'EMG directo', INDIRECT_EMG_FROM_SIMILAR_EXERCISE:'EMG indirecto de ejercicio similar', BIOMECHANICAL_INFERENCE:'Inferencia biomecánica', ANATOMICAL_CONSENSUS:'Consenso anatómico', VISUAL_APPROXIMATION:'Aproximación visual', REVIEW_REQUIRED:'Pendiente de revisión',
    PEER_REVIEWED:'Revisión científica', ANATOMICAL_REFERENCE:'Referencia anatómica', PROFESSIONAL_REFERENCE:'Referencia profesional', LEGACY_SEED:'Dato heredado', REVIEW:'En revisión', HIGH:'Alta', LOW_MEDIUM:'Baja-media', LOW:'Baja',
    BACK_WIDTH:'Amplitud de espalda', BACK_THICKNESS:'Densidad de espalda', LAT_BIAS:'Énfasis dorsal', UPPER_BACK_BIAS:'Énfasis en espalda alta', SCAPULAR_CONTROL:'Control escapular', BICEPS_BIAS:'Énfasis en bíceps', BRACHIALIS_BRACHIORADIALIS_BIAS:'Énfasis en braquial y braquiorradial', GRIP_STRENGTH:'Fuerza de agarre', CHEST_STERNAL_BIAS:'Énfasis en pecho medio', CHEST_CLAVICULAR_BIAS:'Énfasis en pecho superior', CHEST_LOWER_BIAS:'Énfasis en pecho inferior', TRICEPS_BIAS:'Énfasis en tríceps', SHOULDER_STRENGTH:'Fuerza de hombro', SIDE_DELTS_BIAS:'Énfasis en deltoides lateral', REAR_DELTS_BIAS:'Énfasis en deltoides posterior', QUAD_BIAS:'Énfasis en cuádriceps', GLUTE_BIAS:'Énfasis en glúteo', HAMSTRING_BIAS:'Énfasis en isquiotibiales', ADDUCTOR_BIAS:'Énfasis en aductores', HIP_ABDUCTION_BIAS:'Énfasis en abductores', CALF_GASTROCNEMIUS_BIAS:'Énfasis en gastrocnemio', CALF_SOLEUS_BIAS:'Énfasis en sóleo', CORE_FLEXION:'Flexión del abdomen', CORE_ANTI_EXTENSION:'Antiextensión del abdomen', CORE_ANTI_ROTATION:'Antirrotación del abdomen', CORE_LATERAL_STABILITY:'Estabilidad lateral', POSTERIOR_CHAIN:'Cadena posterior', GENERAL_STRENGTH:'Fuerza general', MACHINE_STABILITY:'Estabilidad guiada', UNILATERAL_STABILITY:'Estabilidad unilateral',
    STRENGTH:'Fuerza', CARDIO:'Cardio', MOBILITY:'Movilidad', SPORT_SPECIFIC:'Específico del deporte', HYPERTROPHY:'Hipertrofia', ENDURANCE:'Resistencia', MODERATE:'Moderada', VERY_HIGH:'Muy alta',
    HORIZONTAL_PUSH:'Empuje horizontal', VERTICAL_PUSH:'Empuje vertical', HORIZONTAL_PULL:'Tirón horizontal', VERTICAL_PULL:'Tirón vertical', SQUAT:'Sentadilla', HIP_HINGE:'Bisagra de cadera', LUNGE:'Zancada', HIP_EXTENSION:'Extensión de cadera', HIP_ABDUCTION:'Abducción de cadera', HIP_ADDUCTION:'Aducción de cadera', KNEE_EXTENSION:'Extensión de rodilla', KNEE_FLEXION:'Flexión de rodilla', ELBOW_FLEXION:'Flexión de codo', ELBOW_EXTENSION:'Extensión de codo', SHOULDER_ABDUCTION:'Abducción de hombro', SHOULDER_FLEXION:'Flexión de hombro', SHOULDER_HORIZONTAL_ABDUCTION:'Abducción horizontal de hombro', SHOULDER_EXTERNAL_ROTATION:'Rotación externa de hombro', SCAPULAR_ELEVATION:'Elevación escapular', SCAPULAR_RETRACTION_DEPRESSION:'Retracción y depresión escapular', ANKLE_PLANTAR_FLEXION:'Flexión plantar', ANKLE_DORSIFLEXION:'Flexión dorsal del tobillo', TRUNK_FLEXION:'Flexión del tronco', HIP_TRUNK_FLEXION:'Flexión de cadera y tronco', TRUNK_ROTATION:'Rotación del tronco', ANTI_EXTENSION:'Antiextensión', ANTI_ROTATION:'Antirrotación', ANTI_LATERAL_FLEXION:'Antiflexión lateral', CARRY:'Transporte de carga', ISOLATION:'Aislamiento',
    BILATERAL:'Bilateral', UNILATERAL:'Unilateral', ALTERNATING:'Alterna', ISO_LATERAL:'Iso-lateral',
    PUSH:'Empuje', PULL:'Tirón', LEGS:'Piernas', UPPER:'Tren superior', LOWER:'Tren inferior', REST:'Descanso',
    IN_PROGRESS:'En curso', COMPLETED:'Completada', CANCELLED:'Cancelada', PENDING:'Pendiente', ACCEPTED:'Aceptada', REJECTED:'Rechazada', EXPIRED:'Caducada',
    CALORIE_ADJUSTMENT:'Ajuste de calorías', CARDIO_ADJUSTMENT:'Ajuste de cardio', TRAINING_VOLUME_ADJUSTMENT:'Ajuste del volumen de entrenamiento', RECOVERY_ADJUSTMENT:'Ajuste de recuperación', MIXED_ADJUSTMENT:'Ajuste combinado',
    APPROACHING:'Acercándose al objetivo', ON_TRACK:'En progreso', NEEDS_ATTENTION:'Necesita atención', NEEDS_ADJUSTMENT:'Necesita ajuste', INSUFFICIENT_DATA:'Datos insuficientes', POSITIVE:'Positiva', NEUTRAL:'Neutral', NEGATIVE:'Negativa', UNKNOWN:'Desconocida', AHEAD:'Por delante', BEHIND:'Por detrás', ALIGNED:'Alineado', NOT_ALIGNED:'No alineado',
    TRAINING_ADHERENCE:'Constancia de entrenamiento', BODY_FAT_TREND:'Evolución de la grasa corporal', WEIGHT_TREND:'Evolución del peso', MUSCLE_MASS_TREND:'Evolución de la masa muscular', WEIGHT_STABILITY:'Estabilidad del peso', BODY_FAT_PERCENTAGE:'Porcentaje de grasa corporal', WEIGHT_KG:'Peso', MUSCLE_MASS_KG:'Masa muscular',
    ACTIVE_GOAL_REQUIRED:'Necesitas un objetivo activo', PREVIOUS_TRAINING_PERIOD_REQUIRED:'Se necesita un periodo de entrenamiento anterior', TWO_BODY_MEASUREMENTS_REQUIRED:'Se necesitan al menos dos mediciones corporales', BODY_FAT_MEASUREMENTS_RECOMMENDED:'Se recomiendan mediciones de grasa corporal', MUSCLE_MASS_MEASUREMENTS_RECOMMENDED:'Se recomiendan mediciones de masa muscular', BODY_FAT_AND_MUSCLE_MASS_MEASUREMENTS_REQUIRED:'Se necesitan mediciones de grasa y masa muscular', WEIGHT_MEASUREMENTS_REQUIRED:'Se necesitan mediciones de peso',
    'goal.progress.no-active-goal':'No hay un objetivo activo', 'goal.progress.insufficient-measurements':'Faltan mediciones para evaluar el progreso', 'goal.progress.insufficient-training':'Faltan entrenamientos completados', 'goal.progress.on-track':'El entrenamiento avanza según el objetivo', 'goal.progress.approaching':'Te estás acercando a tu objetivo', 'goal.progress.needs-attention':'Conviene revisar el plan y la evolución'
};

const recommendationReasons = {
    'Training adherence is below 50%; review schedule feasibility and recovery before adding volume.':'La constancia de entrenamiento está por debajo del 50 %; revisa la viabilidad del horario y la recuperación antes de añadir volumen.',
    'Training adherence is acceptable but the measured outcome is not moving toward the active goal.':'La constancia de entrenamiento es aceptable, pero las mediciones no avanzan hacia el objetivo activo.',
    'Current training is aligned with the active goal; maintain volume and progress repetitions gradually.':'El entrenamiento actual está alineado con el objetivo activo; mantén el volumen y aumenta las repeticiones de forma gradual.'
};

const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = days => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
const friendly = value => value == null ? '—' : (labels[value] || String(value).toLowerCase().replaceAll('_', ' ').replace(/^./, c => c.toUpperCase()));
const variantValue = (key, value) => {
    if (key === 'gripType' && value === 'NEUTRAL') return 'Neutro';
    if (key === 'gripWidth') return {NARROW:'Cerrada', MEDIUM:'Media', WIDE:'Abierta'}[value] || friendly(value);
    return friendly(value);
};
const localizeText = value => String(value ?? '').replaceAll('Chin-up', 'Dominada supina').replaceAll('chin-up', 'dominada supina').replaceAll('pull-up', 'dominada');
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
        const ok = result.status === 'UP'; const statusText = ok ? 'OPERATIVA':'DEGRADADA'; orb.dataset.state = ok ? 'ok':'error'; orb.innerHTML = `<span>${statusText}</span><small>Comprobación del servicio</small>`;
        $('connection-state').dataset.state = ok ? 'ok':'error'; $('connection-state').lastElementChild.textContent = ok ? 'API conectada':'API degradada'; $('metric-api').textContent = ok ? 'Operativa':'Degradada';
    } catch (error) {
        orb.dataset.state = 'error'; orb.innerHTML = '<span>NO DISPONIBLE</span><small>Sin conexión</small>'; $('connection-state').dataset.state = 'error'; $('connection-state').lastElementChild.textContent = 'API sin conexión'; $('metric-api').textContent = 'No disponible';
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
        await renderSessionMiniMap();
    } catch (error) { $('map-stage').innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
}

function fillSelect(select, values, placeholder = null) {
    select.innerHTML = placeholder == null ? '' : `<option value="">${escapeHtml(placeholder)}</option>`;
    values.forEach(value => select.add(new Option(friendly(value), value)));
}

const variantConfigFields = [
    {key:'equipment', label:'Material o equipo', always:true},
    {key:'gripType', label:'Tipo de agarre', empty:['NO_SPECIFIC_GRIP']},
    {key:'gripWidth', label:'Apertura del agarre', empty:['NOT_APPLICABLE']},
    {key:'attachmentType', label:'Barra o accesorio', empty:['NO_ATTACHMENT','NOT_APPLICABLE']},
    {key:'benchAngle', label:'Ángulo del banco', empty:['NOT_APPLICABLE']},
    {key:'bodyPosition', label:'Posición corporal', empty:['NOT_APPLICABLE']},
    {key:'trajectory', label:'Trayectoria', empty:['NOT_APPLICABLE']},
    {key:'supportType', label:'Tipo de apoyo', empty:['NOT_APPLICABLE']},
    {key:'stanceType', label:'Colocación de los pies', empty:['NOT_APPLICABLE']},
    {key:'footPlacement', label:'Posición de los pies', empty:['NOT_APPLICABLE']},
    {key:'kneePosition', label:'Posición de las rodillas', empty:['NOT_APPLICABLE']},
    {key:'shoulderPosition', label:'Posición de los brazos', empty:['NOT_APPLICABLE']},
    {key:'contractionType', label:'Tipo de contracción', empty:['NOT_APPLICABLE']},
    {key:'laterality', label:'Ejecución', empty:['NOT_APPLICABLE']}
];

async function searchCatalog() {
    if (!requireAuth()) return;
    const params = new URLSearchParams({page:'0', size:'100'});
    const q = $('catalog-query').value.trim(), equipment = $('catalog-equipment').value, muscleGroup = $('catalog-muscle').value;
    if (q) params.set('q', q); if (equipment) params.append('equipment', equipment); if (muscleGroup) params.append('muscleGroup', muscleGroup);
    params.set('includeStabilizers', String($('catalog-stabilizers').checked));
    try {
        if (!state.exercises.length || !state.variants.length) {
            [state.exercises, state.variants] = await Promise.all([api('/api/exercises'), api('/api/exercise-variants')]);
            updateVariantDatalist();
        }
        const result = await api(`/api/exercise-variants/search?${params}`);
        const matchingVariants = result.content || [];
        const allowedExerciseCodes = new Set(matchingVariants.map(variant => variant.exerciseCode));
        state.catalogVariantCounts = matchingVariants.reduce((counts, variant) => counts.set(variant.exerciseCode, (counts.get(variant.exerciseCode) || 0) + 1), new Map());
        state.catalogExercises = state.exercises.filter(exercise => allowedExerciseCodes.has(exercise.code));
        $('catalog-count').textContent = `${state.catalogExercises.length} ejercicio${state.catalogExercises.length === 1 ? '':'s'}`;
        $('catalog-page').textContent = `${matchingVariants.length} configuraciones disponibles`;
        renderCatalog(); if (state.currentSession) renderSession(); $('metric-exercises').textContent = state.exercises.length;
    } catch (error) { toast(error.message, true); }
}

function renderCatalog() {
    const container = $('catalog-results');
    if (!state.catalogExercises.length) { container.innerHTML = '<div class="empty-state">No hay ejercicios con estos filtros.</div>'; return; }
    container.innerHTML = state.catalogExercises.map(exercise => {
        const variants = state.variants.filter(variant => variant.exerciseCode === exercise.code);
        const representative = variants.find(variant => variant.thumbnailUrl || variant.imageUrl) || variants[0];
        const image = representative?.thumbnailUrl || representative?.imageUrl;
        const variantCount = state.catalogVariantCounts?.get(exercise.code) || variants.length;
        const thumb = image ? `<img class="exercise-thumb" src="${escapeHtml(image)}" alt="${escapeHtml(representative.imageAltText || exercise.name)}">` : `<span class="exercise-thumb thumb-placeholder">${escapeHtml(exercise.name.slice(0,2).toUpperCase())}</span>`;
        return `<button class="catalog-item ${state.selectedExercise?.code === exercise.code ? 'is-selected':''}" data-exercise="${escapeHtml(exercise.code)}">${thumb}<span><strong>${escapeHtml(exercise.name)}</strong><small>${friendly(exercise.mainMuscleGroup)} · ${variantCount} configuraci${variantCount === 1 ? 'ón':'ones'}</small><small>${friendly(exercise.exerciseCategory)} · ${friendly(exercise.movementPattern)}</small></span></button>`;
    }).join('');
}

async function selectExercise(code) {
    state.selectedExercise = state.exercises.find(exercise => exercise.code === code);
    state.variantConfiguration = {};
    state.activations = [];
    renderCatalog();
    await previewConfiguredVariant();
}

function resolveVariantForExercise(exercise, configuration) {
    const variants = state.variants.filter(variant => variant.exerciseCode === exercise?.code);
    let candidates = variants;
    const controls = [];
    variantConfigFields.forEach(field => {
        const allValues = [...new Set(variants.map(variant => variant[field.key]).filter(Boolean))];
        const meaningful = allValues.filter(value => !(field.empty || []).includes(value));
        if (!field.always && !meaningful.length) return;
        const availableValues = [...new Set(candidates.map(variant => variant[field.key]).filter(Boolean))];
        let selected = configuration[field.key];
        if (!availableValues.includes(selected)) selected = availableValues[0];
        configuration[field.key] = selected;
        controls.push({...field, values:availableValues, selected});
        candidates = candidates.filter(variant => variant[field.key] === selected);
    });
    const selectedVariant = candidates.find(variant => variant.code === configuration.variantCode) || candidates[0] || variants[0];
    configuration.variantCode = selectedVariant?.code;
    return {controls, candidates, selectedVariant};
}

function resolveConfiguredVariant() {
    const result = resolveVariantForExercise(state.selectedExercise, state.variantConfiguration);
    const selectedVariant = result.selectedVariant;
    state.selectedVariant = selectedVariant;
    return result;
}

async function previewConfiguredVariant() {
    const {selectedVariant} = resolveConfiguredVariant();
    if (!selectedVariant) return;
    state.activations = [];
    renderVariantDetail();
    const requestedCode = selectedVariant.code;
    try {
        const activations = await api(`/api/exercise-variants/${encodeURIComponent(requestedCode)}/muscle-activations`);
        if (state.selectedVariant?.code !== requestedCode) return;
        state.activations = activations;
        renderVariantDetail(); paintActivations();
    } catch (error) { toast(error.message, true); }
}

function renderVariantDetail() {
    const exercise = state.selectedExercise;
    const {controls, candidates, selectedVariant:v} = resolveConfiguredVariant();
    if (!exercise || !v) return;
    const activations = [...state.activations].sort((a,b) => b.activationLevel - a.activationLevel);
    const controlHtml = controls.map(control => `<label>${control.label}<select data-variant-config="${control.key}" ${control.values.length === 1 ? 'disabled':''}>${control.values.map(value => `<option value="${value}" ${value === control.selected ? 'selected':''}>${variantValue(control.key, value)}</option>`).join('')}</select></label>`).join('');
    const finalChoice = candidates.length > 1 ? `<label>Configuración concreta<select data-variant-code>${candidates.map(variant => `<option value="${variant.code}" ${variant.code === v.code ? 'selected':''}>${escapeHtml(variant.name)}</option>`).join('')}</select></label>` : '';
    $('variant-detail').innerHTML = `<p class="eyebrow">CONFIGURAR EJERCICIO</p><h2>${escapeHtml(exercise.name)}</h2><p>${escapeHtml(exercise.description || 'Selecciona cómo vas a realizar el ejercicio.')}</p>
        <div class="variant-configurator">${controlHtml}${finalChoice}</div>
        <div class="resolved-variant"><span>Configuración resultante</span><strong>${escapeHtml(v.name)}</strong><small>${escapeHtml(localizeText(v.focusDescription || 'Sin descripción técnica.'))}</small></div>
        <dl class="detail-list"><div><dt>Enfoque principal</dt><dd>${friendly(v.primaryFocus)}</dd></div>${v.secondaryFocus ? `<div><dt>Enfoque secundario</dt><dd>${friendly(v.secondaryFocus)}</dd></div>`:''}<div><dt>Evidencia</dt><dd>${friendly(v.focusEvidenceType)} · ${friendly(v.focusEvidenceLevel)}</dd></div><div><dt>Uso habitual</dt><dd>${friendly(v.practicality)}</dd></div></dl>
        <div class="section-heading"><div><p class="eyebrow">ACTIVACIONES</p><h2>${activations.length ? `${activations.length} músculos`:'Cargando…'}</h2></div></div><div class="activation-list">${activations.map(a => `<div class="activation"><div><strong>${escapeHtml(a.muscleName)}</strong><span>${friendly(a.role)} · nivel ${a.activationLevel}/5</span></div><small>Confianza ${friendly(a.confidence).toLowerCase()} · ${friendly(a.evidenceType)}</small><span class="activation-bar"><i style="width:${a.activationLevel * 20}%"></i></span></div>`).join('')}</div>`;
    $('map-title').textContent = v.name; $('map-subtitle').textContent = `${friendly(v.equipment)} · ${variantValue('gripType', v.gripType)} · ${friendly(v.gripWidth)}`;
}

function paintActivations() {
    if (!state.svg) return;
    state.svg.querySelectorAll('[data-fitcore-role]').forEach(node => node.removeAttribute('data-fitcore-role'));
    const showStabilizers = $('map-stabilizers').checked; const missing = [];
    state.activations.filter(a => showStabilizers || a.role !== 'STABILIZER').forEach(activation => {
        let found = false;
        (muscleSvgMap[activation.muscleCode] || []).forEach(id => { const node = state.svg.getElementById(id); if (node) { found = true; const priority = {STABILIZER:1,SECONDARY:2,PRIMARY:3}; const old = node.dataset.fitcoreRole; if (!old || priority[activation.role] > priority[old]) node.dataset.fitcoreRole = activation.role; } });
        if (!found) missing.push(activation.muscleName);
    });
    $('map-diagnostic').textContent = missing.length ? `Sin región directa: ${missing.join(', ')}` : `${state.activations.filter(a => showStabilizers || a.role !== 'STABILIZER').length} músculos visibles`;
}

function updateVariantDatalist() {
    renderSessionExerciseResults();
}

function variantOptions(selectedCode) {
    const groups = state.exercises.map(exercise => ({exercise, variants:state.variants.filter(variant => variant.exerciseCode === exercise.code)})).filter(group => group.variants.length);
    return `<option value="">Selecciona una configuración</option>${groups.map(group => `<optgroup label="${escapeHtml(group.exercise.name)}">${group.variants.map(variant => `<option value="${escapeHtml(variant.code)}" ${variant.code === selectedCode ? 'selected':''}>${escapeHtml(variant.name)}</option>`).join('')}</optgroup>`).join('')}`;
}

function variantName(code) {
    return state.variants.find(variant => variant.code === code)?.name || 'Ejercicio';
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
    container.innerHTML = state.planDays.map((day, dayIndex) => `<article class="day-card" data-day="${dayIndex}"><div class="day-head"><input value="${escapeHtml(day.name)}" data-day-name aria-label="Nombre del día"><select data-day-type aria-label="Tipo de día">${enums.dayTypes.map(t => `<option value="${t}" ${t===day.dayType?'selected':''}>${friendly(t)}</option>`).join('')}</select><button class="text-button danger" data-remove-day>Eliminar día</button></div><div class="day-exercises">${day.exercises.map((exercise,index) => exerciseEditor(exercise,index)).join('')}</div><div class="day-foot"><small>${day.exercises.length} ejercicio${day.exercises.length===1?'':'s'}</small><button class="button button-secondary" data-add-plan-exercise>+ Ejercicio</button></div></article>`).join('');
}

function exerciseEditor(exercise, index) {
    return `<div class="exercise-editor" data-exercise="${index}"><div class="drag-actions"><button data-move="-1" aria-label="Subir">↑</button><button data-move="1" aria-label="Bajar">↓</button></div><label>Ejercicio y configuración<select data-exercise-code>${variantOptions(exercise.exerciseVariantCode)}</select></label><label>Series<input data-exercise-sets type="number" min="1" value="${exercise.sets || 3}"></label><label>Repeticiones<input data-exercise-reps type="number" min="1" value="${exercise.reps || 10}"></label><label>Descanso (s)<input data-exercise-rest type="number" min="0" value="${exercise.restSeconds ?? 90}"></label><button class="text-button danger remove-exercise" data-remove-exercise>Quitar</button></div>`;
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
    const select = $('session-day');

    const chosen =
        state.currentSession?.workoutDayId
        ?? select.value;

    select.innerHTML =
        '<option value="">Sesión libre</option>';

    (state.activePlan?.days || []).forEach(day => {
        select.add(
            new Option(
                `${day.dayOrder}. ${day.name}`,
                day.id
            )
        );
    });

    if (
        chosen != null &&
        [...select.options].some(
            option => option.value === String(chosen)
        )
    ) {
        select.value = String(chosen);
    }

    if (
        state.currentSession?.status === 'IN_PROGRESS'
    ) {
        syncSessionHeader();
    }
}


function currentSessionDayLabel() {
    const id = state.currentSession?.workoutDayId;

    if (id == null || id === '') {
        return 'Sesión libre';
    }

    const dayOption = [
        ...$('session-day').options
    ].find(
        option => option.value === String(id)
    );

    return dayOption?.textContent || 'Día del plan';
}


async function startSession() {
    if (!requireAuth()) return;
    const body = {workoutDayId:optionalNumber($('session-day').value), sessionDate:$('session-date').value, sessionCategory:$('session-category').value, sessionIntensity:$('session-intensity').value, durationMinutes:null, notes:$('session-notes').value.trim() || null, estimatedTotalCaloriesBurned:null};
    try {
        state.currentSession = await api(`/api/users/${state.auth.userId}/workout-sessions`, {method:'POST', body:JSON.stringify(body)});
        state.currentSession.workoutDayId ??= body.workoutDayId;
        state.sessionStartedAt = Date.now();
        localStorage.setItem('fitcore.lab.currentSession', state.currentSession.id);
        localStorage.setItem(SESSION_STARTED_KEY, state.sessionStartedAt);
        toast('Sesión iniciada.'); await loadSessionExercises();
    }
    catch (error) { toast(error.message, true); }
}

async function restoreSession() {
    const id = localStorage.getItem('fitcore.lab.currentSession'); if (!id || !state.auth) return;
    try { const session = await api(`/api/users/${state.auth.userId}/workout-sessions/${id}`); if (session.status === 'IN_PROGRESS') { state.currentSession = session; state.sessionStartedAt ||= Date.now(); localStorage.setItem(SESSION_STARTED_KEY, state.sessionStartedAt); await loadSessionExercises(); } else clearSessionStorage(); }
    catch (_) { clearSessionStorage(); }
}

async function addSessionExercise() {
    if (!state.currentSession) return;
    const {selectedVariant} = resolveVariantForExercise(state.sessionPicker.exercise, state.sessionPicker.configuration);
    if (!selectedVariant) return toast('Selecciona un ejercicio y su configuración.', true);
    try {
        await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/exercises`, {method:'POST', body:JSON.stringify({workoutExerciseId:null, exerciseVariantCode:selectedVariant.code, completed:false, performedSets:0, performedReps:0, performedWeightKg:null, performedDurationMinutes:null, estimatedCaloriesBurned:null, notes:null})});
        $('exercise-picker-dialog').close(); state.sessionPicker = {exercise:null, configuration:{}}; await loadSessionExercises(); toast('Ejercicio añadido al entrenamiento.');
    }
    catch (error) { toast(error.message, true); }
}


function currentSessionMetaLabel() {
    const session = state.currentSession;

    if (!session) return '';

    const dateValue = String(
        session.sessionDate ||
        $('session-date').value ||
        ''
    ).slice(0, 10);

    const dateLabel =
        /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
            ? dateValue.split('-').reverse().join('/')
            : 'Sin fecha';

    const category = friendly(
        session.sessionCategory ||
        $('session-category').value
    );

    const intensity = friendly(
        session.sessionIntensity ||
        $('session-intensity').value
    );

    return `${dateLabel} · ${category} · ${intensity}`;
}


function syncSessionHeader() {
    const active =
        state.currentSession?.status === 'IN_PROGRESS';

    $('session-heading').textContent = active
        ? currentSessionDayLabel()
        : 'Tu sesión';

    $('session-meta-summary').textContent = active
        ? currentSessionMetaLabel()
        : '';

    $('session-meta-summary').hidden = !active;
}


function openSessionSettings() {
    const session = state.currentSession;

    if (session?.status !== 'IN_PROGRESS') {
        return;
    }

    // Fecha
    $('session-edit-date').value = String(
        session.sessionDate ||
        $('session-date').value ||
        ''
    ).slice(0, 10);

    // Categoría
    $('session-edit-category').value =
        session.sessionCategory ||
        $('session-category').value;

    // Intensidad
    $('session-edit-intensity').value =
        session.sessionIntensity ||
        $('session-intensity').value;

    // Notas
    $('session-edit-notes').value =
        session.notes ??
        $('session-notes').value;

    // Día del plan
    $('session-edit-day').value =
        currentSessionDayLabel();

    // Mostrar ventana modal
    $('session-settings-dialog').showModal();
}


async function saveSessionSettings(event) {
    event.preventDefault();

    if (
        state.currentSession?.status !== 'IN_PROGRESS'
    ) {
        return;
    }

    const form = $('session-settings-form');

    if (!form.reportValidity()) {
        return;
    }

    // Datos actualizados
    const updated = {
        sessionDate: $('session-edit-date').value,

        sessionCategory:
        $('session-edit-category').value,

        sessionIntensity:
        $('session-edit-intensity').value,

        durationMinutes: null,

        notes:
            $('session-edit-notes').value.trim(),

        estimatedTotalCaloriesBurned: null
    };

    const saveButton = $('session-settings-save');

    saveButton.disabled = true;

    try {
        // Guardar en el servidor
        const response = await api(
            `/api/users/${state.auth.userId}` +
            `/workout-sessions/${state.currentSession.id}`,
            {
                method: 'PATCH',
                body: JSON.stringify(updated)
            }
        );

        // Si la respuesta es 204 o no contiene
        // datos, conservar los valores enviados.
        const server =
            response &&
            typeof response === 'object'
                ? response
                : {};

        // Actualizar estado local
        state.currentSession = {
            ...state.currentSession,

            sessionDate:
                server.sessionDate ??
                updated.sessionDate,

            sessionCategory:
                server.sessionCategory ??
                updated.sessionCategory,

            sessionIntensity:
                server.sessionIntensity ??
                updated.sessionIntensity,

            notes:
                server.notes ??
                updated.notes
        };

        // Sincronizar formulario original
        $('session-date').value =
            state.currentSession.sessionDate.slice(0, 10);

        $('session-category').value =
            state.currentSession.sessionCategory;

        $('session-intensity').value =
            state.currentSession.sessionIntensity;

        $('session-notes').value =
            state.currentSession.notes ?? '';

        // Actualizar el resumen superior
        syncSessionHeader();

        // Cerrar configuración
        $('session-settings-dialog').close();

        toast(
            'Configuración de la sesión guardada.'
        );

    } catch (error) {
        toast(error.message, true);

    } finally {
        saveButton.disabled = false;
    }
}


async function openExercisePicker() {
    if (!state.currentSession) return;
    try {
        if (!state.exercises.length || !state.variants.length) [state.exercises, state.variants] = await Promise.all([api('/api/exercises'), api('/api/exercise-variants')]);
        state.sessionPicker = {exercise:null, configuration:{}};
        $('session-exercise-query').value = ''; $('session-exercise-equipment').value = ''; $('session-exercise-muscle').value = '';
        renderSessionExerciseResults(); renderSessionExerciseConfig(); $('exercise-picker-dialog').showModal();
    } catch (error) { toast(error.message, true); }
}

function filteredSessionExercises() {
    const query = $('session-exercise-query')?.value.trim().toLocaleLowerCase('es') || '';
    const equipment = $('session-exercise-equipment')?.value || '';
    const muscle = $('session-exercise-muscle')?.value || '';
    return state.exercises.filter(exercise => {
        const variants = state.variants.filter(variant => variant.exerciseCode === exercise.code);
        return (!query || `${exercise.name} ${exercise.description || ''}`.toLocaleLowerCase('es').includes(query))
            && (!equipment || variants.some(variant => variant.equipment === equipment))
            && (!muscle || exercise.mainMuscleGroup === muscle);
    });
}

function exerciseThumb(exercise, cssClass = 'exercise-thumb') {
    const variants = state.variants.filter(variant => variant.exerciseCode === exercise?.code);
    const representative = variants.find(variant => variant.thumbnailUrl || variant.imageUrl) || variants[0];
    const image = representative?.thumbnailUrl || representative?.imageUrl;
    return image ? `<img class="${cssClass}" src="${escapeHtml(image)}" alt="${escapeHtml(representative.imageAltText || exercise.name)}">` : `<span class="${cssClass} thumb-placeholder">${escapeHtml((exercise?.name || 'FC').slice(0,2).toUpperCase())}</span>`;
}

function renderSessionExerciseResults() {
    const container = $('session-exercise-results'); if (!container) return;
    const exercises = filteredSessionExercises();
    $('session-exercise-count').textContent = `${exercises.length} ejercicio${exercises.length === 1 ? '' : 's'}`;
    container.innerHTML = exercises.length ? exercises.map(exercise => {
        const count = state.variants.filter(variant => variant.exerciseCode === exercise.code).length;
        return `<button class="picker-exercise ${state.sessionPicker.exercise?.code === exercise.code ? 'is-selected':''}" data-session-exercise-code="${escapeHtml(exercise.code)}">${exerciseThumb(exercise)}<span><strong>${escapeHtml(exercise.name)}</strong><small>${friendly(exercise.mainMuscleGroup)} · ${count} configuraci${count === 1 ? 'ón':'ones'}</small></span><i>›</i></button>`;
    }).join('') : '<div class="empty-state">No hay ejercicios con estos filtros.</div>';
}

function renderSessionExerciseConfig() {
    const container = $('session-exercise-config'); const exercise = state.sessionPicker.exercise;
    if (!exercise) { container.innerHTML = '<div class="empty-state">Selecciona un ejercicio para configurar cómo vas a realizarlo.</div>'; $('session-add-exercise').disabled = true; return; }
    const {controls, selectedVariant} = resolveVariantForExercise(exercise, state.sessionPicker.configuration);
    const visibleControls = controls.filter(control => control.values.length > 1 || ['equipment','attachmentType'].includes(control.key));
    const fields = visibleControls.map(control => `<label>${control.label}<select data-session-variant-config="${control.key}" ${control.values.length === 1 ? 'disabled':''}>${control.values.map(value => `<option value="${value}" ${value === control.selected ? 'selected':''}>${variantValue(control.key, value)}</option>`).join('')}</select></label>`).join('');
    container.innerHTML = `<div class="picker-selected">${exerciseThumb(exercise, 'picker-selected-thumb')}<div><p class="eyebrow">CONFIGURACIÓN</p><h3>${escapeHtml(exercise.name)}</h3><small>${escapeHtml(exercise.description || 'Concreta la ejecución para esta sesión.')}</small></div></div><div class="picker-variant-fields">${fields}</div>${selectedVariant ? `<div class="resolved-variant"><span>Variante que se registrará</span><strong>${escapeHtml(selectedVariant.name)}</strong><small>${escapeHtml(localizeText(selectedVariant.focusDescription || 'Configuración válida para este ejercicio.'))}</small></div>` : ''}`;
    $('session-add-exercise').disabled = !selectedVariant;
}

async function loadSessionExercises() {
    if (!state.currentSession) return renderSession();
    try {
        state.sessionExercises = await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/exercises`);
        const details = await Promise.all(state.sessionExercises.map(async exercise => {
            const [sets, previous] = await Promise.all([
                api(`/api/users/${state.auth.userId}/workout-session-exercises/${exercise.id}/sets`),
                api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/exercises/${exercise.id}/previous-performance`)
            ]);
            return {id:exercise.id, sets, previous};
        }));
        state.sessionSets = new Map(details.map(item => [item.id, item.sets]));
        state.sessionPrevious = new Map(details.map(item => [item.id, item.previous]));
        renderSession();
        await renderSessionMiniMap();
    } catch (error) { toast(error.message, true); }
}

function renderSession() {
    const active =
        state.currentSession?.status === 'IN_PROGRESS';

    // Activar diseño compacto
    $('view-training').classList.toggle(
        'session-running',
        active
    );

    // Mostrar botón de edición
    $('session-edit-settings').hidden = !active;

    // Cerrar configuración si finaliza la sesión
    if (
        !active &&
        $('session-settings-dialog').open
    ) {
        $('session-settings-dialog').close();
    }

    // Estados de los botones
    $('session-start').disabled = active;

    $('session-complete').disabled = !active;

    $('session-cancel').disabled = !active;

    $('session-delete').disabled = !active;

    $('open-exercise-picker').disabled = !active;

    $('session-muscles').disabled =
        !state.sessionExercises.length;

    // Estado de la sesión
    $('session-status').textContent =
        state.currentSession
            ? friendly(state.currentSession.status)
            : 'Sin iniciar';

    $('session-status').dataset.state =
        state.currentSession?.status || '';

    // Actualizar cabecera
    syncSessionHeader();

    // Actualizar métricas y temporizador
    renderSessionSummary();
    manageSessionTimer(active);
    const container = $('session-exercises'); if (!state.sessionExercises.length) { container.innerHTML = `<div class="empty-state large">${active ? 'Añade el primer ejercicio de la sesión.':'Inicia una sesión para registrar ejercicios y series.'}</div>`; void renderSessionMiniMap(); return; }
    container.innerHTML = state.sessionExercises.map(exercise => {
        const sets = state.sessionSets.get(exercise.id) || [];
        const previous = state.sessionPrevious.get(exercise.id) || {sessionDate:null, sets:[]};
        const previousByNumber = new Map((previous.sets || []).map(set => [set.setNumber, set]));
        const next = sets.length ? Math.max(...sets.map(set => set.setNumber)) + 1 : 1;
        const variant = state.variants.find(item => item.code === exercise.exerciseVariantCode);
        const base = state.exercises.find(item => item.code === variant?.exerciseCode);
        const exerciseName = base?.name || variantName(exercise.exerciseVariantCode);
        const completed = sets.length > 0 && sets.every(set => set.completed);
        const rest = sessionRestSeconds(exercise);
        const chips = variantConfigurationChips(variant);
        const lastSet = sets.at(-1);
        const firstSuggestion = previousByNumber.get(next);
        const suggestedWeight = lastSet?.weight ?? firstSuggestion?.weight ?? '';
        const suggestedReps = lastSet?.reps ?? firstSuggestion?.reps ?? '';
        const suggestedRir = '';
        const setRows = sets.map(set => {
            const prior = previousByNumber.get(set.setNumber);
            const effectiveRpe = set.rpe ?? rpeFromRir(set.rir);
            return `<tr data-set-row="${set.id}" class="${set.completed ? 'is-complete':''}">
                <td><span class="set-number">${set.setNumber}</span><input data-set-number type="hidden" value="${set.setNumber}"></td>
                <td class="previous-performance">${previousSetLabel(prior)}</td>
                <td><input data-set-weight data-numeric-mode="decimal" type="number" inputmode="decimal" min="0" step="0.25" value="${set.weight ?? ''}" aria-label="Peso de la serie ${set.setNumber}"></td>
                <td><input data-set-reps data-numeric-mode="integer" type="number" inputmode="numeric" min="0" step="1" value="${set.reps ?? ''}" aria-label="Repeticiones de la serie ${set.setNumber}"></td>
                <td><input data-set-rir data-numeric-mode="integer" data-numeric-max="10" type="number" inputmode="numeric" min="0" max="10" step="1" value="${set.rir ?? ''}" aria-label="RIR de la serie ${set.setNumber}"></td>
                <td>${rpeControl(effectiveRpe, `RPE de la serie ${set.setNumber}`, set.rpe == null && effectiveRpe != null)}</td>
                <td><label class="complete-check"><input data-set-complete type="checkbox" ${set.completed ? 'checked':''}><span>✓</span></label></td>
                <td><button class="text-button" data-save-set="${set.id}">Guardar</button><button class="text-button danger" data-delete-set="${set.id}" aria-label="Eliminar serie ${set.setNumber}">×</button></td>
            </tr>`;
        }).join('');
        return `<article class="session-card" data-session-exercise="${exercise.id}" data-exercise-name="${escapeHtml(exerciseName)}">
            <div class="session-card-head"><div class="session-exercise-identity">${base ? exerciseThumb(base, 'session-exercise-thumb') : '<span class="session-exercise-thumb thumb-placeholder">FC</span>'}<div><div class="session-title-line"><h3>${escapeHtml(exerciseName)}</h3><span class="status-pill" data-state="${completed?'COMPLETED':''}">${completed?'Completado':'En curso'}</span></div><div class="configuration-chips">${chips.map(chip => `<span>${escapeHtml(chip)}</span>`).join('')}</div><small>${escapeHtml(variant?.name || variantName(exercise.exerciseVariantCode))}</small></div></div><button class="icon-button danger" data-remove-session-exercise aria-label="Quitar ejercicio">×</button></div>
            <div class="exercise-tools"><button class="rest-setting" data-edit-rest><span>⏱ Descanso</span><strong>${formatDuration(rest)}</strong><small>Modificar</small></button><span>Series registradas: <strong>${sets.length}</strong></span><span>Anterior: <strong>${previous.sessionDate ? new Date(`${previous.sessionDate}T00:00:00`).toLocaleDateString('es-ES') : 'Sin registros'}</strong></span></div>
            <div class="set-table-wrap"><table class="set-table"><thead><tr><th>Serie</th><th>Anterior</th>

<th>
    <span class="set-help-label">
        Peso (kg)
        <button type="button"
                class="set-help-icon"
                data-training-help="weight"
                aria-label="Información sobre el peso">
            i
        </button>
    </span>
</th>

<th>Reps</th>

<th>
    <span class="set-help-label">
        RIR
        <button type="button"
                class="set-help-icon"
                data-training-help="rir"
                aria-label="¿Qué significa RIR?">
            i
        </button>
    </span>
</th>

<th>
    <span class="set-help-label">
        RPE
        <button type="button"
                class="set-help-icon"
                data-training-help="rpe"
                aria-label="¿Qué significa RPE?">
            i
        </button>
    </span>
</th>

            <th>Hecha</th><th>Acciones</th></tr></thead><tbody>${setRows}<tr class="new-set">
                <td><span class="set-number">${next}</span><input data-set-number type="hidden" value="${next}"></td>
                <td class="previous-performance">${previousSetLabel(previousByNumber.get(next))}</td>
                <td><input data-set-weight data-numeric-mode="decimal" type="number" inputmode="decimal" min="0" step="0.25" value="${suggestedWeight}" aria-label="Peso de la nueva serie"></td>
                <td><input data-set-reps data-numeric-mode="integer" type="number" inputmode="numeric" min="0" step="1" value="${suggestedReps}" aria-label="Repeticiones de la nueva serie"></td>
                <td><input data-set-rir data-numeric-mode="integer" data-numeric-max="10" type="number" inputmode="numeric" min="0" max="10" step="1" value="${suggestedRir}" aria-label="RIR de la nueva serie"></td>
                <td>${rpeControl(null, 'RPE de la nueva serie', false)}</td><td><span class="pending-set" title="La serie se crea sin completar">Pendiente</span></td>
                <td><button class="button button-primary add-set-button" data-add-set>+ Añadir serie</button></td>
            </tr></tbody></table></div><div class="session-card-foot"><small>Al marcar una serie como hecha se guardará y comenzará el descanso.</small><strong>${sets.filter(set => set.completed).length}/${sets.length || 0} series completadas</strong></div>
        </article>`;
    }).join('');
}

function previousSetLabel(set) {
    if (!set || (set.weight == null && set.reps == null)) return '<span aria-label="Sin registro anterior">—</span>';
    const weight = set.weight == null ? '—' : `${formatNumber(set.weight)} kg`;
    const reps = set.reps == null ? '—' : set.reps;
    return `<strong>${weight} × ${reps}</strong>`;
}


function rpeColor(value) {
    if (
        value === null ||
        value === '' ||
        !Number.isFinite(Number(value))
    ) return '';

    const stops = [
        [0.00, [55, 190, 104]],  // Verde
        [0.35, [200, 213, 40]],  // Verde amarillento
        [0.58, [255, 195, 41]],  // Amarillo
        [0.80, [255, 122, 37]],  // Naranja
        [1.00, [239, 53, 48]]    // Rojo
    ];

    const position = Math.max(
        0,
        Math.min(1, Number(value) / 10)
    );

    for (let i = 1; i < stops.length; i++) {
        const [end, to] = stops[i];

        if (position <= end) {
            const [start, from] = stops[i - 1];
            const fraction =
                (position - start) / (end - start);

            const rgb = from.map((channel, j) =>
                Math.round(
                    channel +
                    (to[j] - channel) * fraction
                )
            );

            return `rgb(${rgb.join(', ')})`;
        }
    }

    return 'rgb(239, 53, 48)';
}

function paintRpeButton(button, value) {
    if (!button) return;

    const color = rpeColor(value);

    if (color) {
        button.style.setProperty(
            '--rpe-color',
            color
        );
    } else {
        button.style.removeProperty('--rpe-color');
    }
}

function rpeControl(value, label, automatic = false) {
    const display = value == null
        ? 'RPE'
        : formatNumber(value);

    const mode = automatic
        ? 'automático desde RIR'
        : 'manual';

    const color = rpeColor(value);

    const colorStyle = color
        ? ` style="--rpe-color: ${color}"`
        : '';

    return `
        <button
            type="button"
            class="rpe-button ${value == null ? '' : 'has-value'} ${automatic ? 'is-auto' : 'is-manual'}"
            data-rpe-picker
            ${colorStyle}
            aria-label="${escapeHtml(label)}"
            title="RPE ${mode}"
        >${display}</button>
        <input
            data-set-rpe
            type="hidden"
            value="${value ?? ''}"
        >
    `;
}


function rpeFromRir(rir) {
    if (rir == null || rir === '') return null;
    const numeric = Number(rir);
    return Number.isFinite(numeric) && numeric >= 0 && numeric <= 10 ? 10 - numeric : null;
}

function syncRpeFromRir(input) {
    if (!input.matches('[data-set-rir]')) return;
    const digits = input.value.replace(/\D/g, '').slice(0, 2);
    input.value = digits === '' ? '' : String(Math.min(10, Number(digits)));
    const cell = input.closest('tr')?.querySelector('[data-set-rpe]')?.closest('td');
    if (!cell) return;
    const value = rpeFromRir(input.value);
    const hidden = cell.querySelector('[data-set-rpe]');
    const button = cell.querySelector('[data-rpe-picker]');
    hidden.value = value ?? '';
    button.textContent = value == null ? 'RPE' : formatNumber(value);
    button.classList.toggle('has-value', value != null);
    button.classList.toggle('is-auto', value != null);
    button.classList.remove('is-manual');
    paintRpeButton(button, value);
    button.title = value == null ? 'Seleccionar RPE manualmente' : 'RPE automático desde RIR';
}

function variantConfigurationChips(variant) {
    if (!variant) return [];
    return [friendly(variant.equipment), ...variantConfigFields.slice(1).filter(field => variant[field.key] && !(field.empty || []).includes(variant[field.key])).slice(0,3).map(field => variantValue(field.key, variant[field.key]))];
}

function sessionRestSeconds(exercise) {
    return exercise.restSeconds ?? 90;
}

function formatDuration(seconds) { const value = Math.max(0, Number(seconds) || 0); return `${Math.floor(value / 60)}:${String(value % 60).padStart(2,'0')}`; }

function sessionElapsedSeconds() { return state.sessionStartedAt ? Math.max(0, Math.floor((Date.now() - state.sessionStartedAt) / 1000)) : 0; }


/* ========================================
   FITCORE - VOLUMEN DE ENTRENAMIENTO
   ======================================== */

function calculateSessionVolume() {
    let volumeGrams = 0;
    let totalReps = 0;
    let completedSets = 0;
    let setsWithoutVolume = 0;

    // Recorrer TODOS los ejercicios de la sesión
    for (const sets of state.sessionSets.values()) {

        for (const set of sets || []) {

            // Solo cuentan las series completadas
            if (set.completed !== true) continue;

            completedSets++;

            const reps =
                set.reps == null || set.reps === ''
                    ? null
                    : Number(set.reps);

            const weight =
                set.weight == null || set.weight === ''
                    ? null
                    : Number(set.weight);

            const validReps =
                reps !== null &&
                Number.isSafeInteger(reps) &&
                reps >= 0;

            const validWeight =
                weight !== null &&
                Number.isFinite(weight) &&
                weight >= 0;

            // Contar repeticiones completadas
            if (validReps) {
                totalReps += reps;
            }

            // Calcular el volumen de la serie
            if (validReps && validWeight) {

                // Convertir a gramos para evitar
                // errores de precisión decimal
                const weightGrams = Math.round(
                    weight * 1000
                );

                volumeGrams += weightGrams * reps;

            } else {
                // Serie completada sin datos
                // suficientes para calcular volumen
                setsWithoutVolume++;
            }
        }
    }

    return {
        volumeKg: volumeGrams / 1000,
        totalReps,
        completedSets,
        setsWithoutVolume
    };
}


/* ACTUALIZAR EL PANEL DE ENTRENAMIENTO */

function renderSessionSummary() {

    const result = calculateSessionVolume();

    // Duración
    $('session-duration').textContent =
        formatDuration(sessionElapsedSeconds());

    // Volumen total en kg
    $('session-volume').textContent =
        `${result.volumeKg.toLocaleString('es-ES', {
            maximumFractionDigits: 2
        })} kg`;

    // Número de series completadas
    $('session-series').textContent =
        result.completedSets;

    // Repeticiones totales
    const repsElement = $('session-volume-reps');

    if (repsElement) {
        repsElement.textContent =
            `${result.totalReps} reps` +
            (result.setsWithoutVolume
                ? ' · parcial'
                : '');
    }

    // Avisar si hay series sin datos de carga
    $('session-volume').title =
        result.setsWithoutVolume > 0
            ? `Volumen parcial: ${result.setsWithoutVolume} serie(s) completada(s) sin peso o repeticiones registrados.`
            : 'Volumen de carga: suma de peso × repeticiones de todas las series completadas.';
}


function manageSessionTimer(active) {
    if (active && !state.sessionTimer) state.sessionTimer = setInterval(() => { if ($('session-duration')) $('session-duration').textContent = formatDuration(sessionElapsedSeconds()); }, 1000);
    if (!active && state.sessionTimer) { clearInterval(state.sessionTimer); state.sessionTimer = null; }
}

async function addSet(card) {
    const exerciseId = Number(card.dataset.sessionExercise);
    try {
        const currentRows = [...card.querySelectorAll('[data-set-row]')].map(row => ({id:row.dataset.setRow, body:setBody(row)}));
        const newSet = setBody(card.querySelector('.new-set'));
        await Promise.all(currentRows.map(set => api(`/api/users/${state.auth.userId}/workout-session-exercises/${exerciseId}/sets/${set.id}`, {method:'PUT', body:JSON.stringify(set.body)})));
        await api(`/api/users/${state.auth.userId}/workout-session-exercises/${exerciseId}/sets`, {method:'POST', body:JSON.stringify(newSet)});
        await loadSessionExercises();
        toast(currentRows.length ? 'Serie añadida y cambios guardados.':'Serie registrada.');
    }
    catch (error) { toast(error.message, true); }
}


async function updateSet(
    card,
    row,
    setId,
    startRest = false
) {
    const exerciseId = Number(
        card.dataset.sessionExercise
    );

    const checkbox = row.querySelector(
        '[data-set-complete]'
    );

    // Datos originales de las series
    const originalSets =
        state.sessionSets.get(exerciseId) || [];

    const previousSet = originalSets.find(
        set => String(set.id) === String(setId)
    );

    let saved = false;

    try {
        // Leer peso, repeticiones, RIR, RPE y Hecha
        const body = setBody(row);

        // Actualizar temporalmente la serie
        // para calcular el volumen al instante
        if (previousSet) {

            const updatedSets = originalSets.map(
                set =>
                    String(set.id) === String(setId)
                        ? { ...set, ...body }
                        : set
            );

            state.sessionSets.set(
                exerciseId,
                updatedSets
            );

            // Recalcular inmediatamente
            renderSessionSummary();
        }

        row.classList.toggle(
            'is-complete',
            body.completed
        );

        // Evitar clics repetidos mientras se guarda
        if (checkbox) {
            checkbox.disabled = true;
        }

        // Guardar el cambio en la API
        await api(
            `/api/users/${state.auth.userId}` +
            `/workout-session-exercises/${exerciseId}` +
            `/sets/${setId}`,
            {
                method: 'PUT',
                body: JSON.stringify(body)
            }
        );

        saved = true;

        const exercise = state.sessionExercises.find(
            item => item.id === exerciseId
        );

        // Iniciar descanso si se acaba de completar
        if (body.completed && startRest && exercise) {
            startRestTimer(
                exercise,
                card.dataset.exerciseName
            );
        }

        // Sincronizar con los datos reales del servidor
        await loadSessionExercises();

        toast(
            body.completed && startRest
                ? 'Serie completada. Volumen actualizado.'
                : 'Serie actualizada.'
        );

    } catch (error) {

        // Si falla el guardado, recuperar los datos
        // que había antes de marcar/desmarcar
        if (!saved) {

            state.sessionSets.set(
                exerciseId,
                originalSets
            );

            if (checkbox) {
                checkbox.checked =
                    previousSet?.completed === true;

                row.classList.toggle(
                    'is-complete',
                    checkbox.checked
                );
            }

            renderSessionSummary();
        }

        toast(error.message, true);

    } finally {

        if (checkbox && checkbox.isConnected) {
            checkbox.disabled = false;
        }
    }
}


function setBody(container) {
    const completion = container.querySelector('[data-set-complete]');
    return {
        setNumber:requiredInteger(container.querySelector('[data-set-number]').value, 'El número de serie', 1),
        weight:validatedNumericValue(container.querySelector('[data-set-weight]'), 'El peso', false, 0),
        reps:validatedNumericValue(container.querySelector('[data-set-reps]'), 'Las repeticiones', true, 0),
        rir:validatedNumericValue(container.querySelector('[data-set-rir]'), 'El RIR', true, 0, 10),
        rpe:optionalNumber(container.querySelector('[data-set-rpe]').value),
        completed:completion ? completion.checked : false,
        notes:null
    };
}

function requiredInteger(rawValue, label, minimum) {
    if (!/^\d+$/.test(String(rawValue))) throw new Error(`${label} debe ser un número entero.`);
    const value = Number(rawValue);
    if (value < minimum) throw new Error(`${label} debe ser ${minimum} o superior.`);
    return value;
}

function validatedNumericValue(input, label, integer, minimum, maximum = null) {
    const rawValue = input.value.trim();
    if (rawValue === '') return null;
    const pattern = integer ? /^\d+$/ : /^\d+(?:\.\d+)?$/;
    if (!pattern.test(rawValue)) throw new Error(`${label} solo admite ${integer ? 'números enteros' : 'números'}.`);
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < minimum || (maximum != null && value > maximum)) {
        const range = maximum == null ? `${minimum} o superior` : `entre ${minimum} y ${maximum}`;
        throw new Error(`${label} debe estar ${range}.`);
    }
    return value;
}

function blockInvalidNumericKey(event) {
    const input = event.target.closest('[data-numeric-mode]');
    if (!input || event.ctrlKey || event.metaKey || event.altKey) return;
    const allowedControlKeys = ['Backspace','Delete','Tab','Enter','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
    if (allowedControlKeys.includes(event.key) || /^\d$/.test(event.key)) return;
    if (input.dataset.numericMode === 'decimal' && event.key === '.' && !input.value.includes('.')) return;
    event.preventDefault();
}

function blockInvalidNumericInsert(event) {
    const input = event.target.closest('[data-numeric-mode]');
    if (!input || !event.inputType?.startsWith('insert') || event.data == null) return;
    const allowed = input.dataset.numericMode === 'decimal' ? /^[0-9.]+$/ : /^\d+$/;
    if (!allowed.test(event.data)) event.preventDefault();
}

function blockInvalidNumericPaste(event) {
    const input = event.target.closest('[data-numeric-mode]');
    if (!input) return;
    const pasted = event.clipboardData?.getData('text').trim() || '';
    const allowed = input.dataset.numericMode === 'decimal' ? /^\d+(?:\.\d+)?$/ : /^\d+$/;
    const maximum = optionalNumber(input.dataset.numericMax);
    if (!allowed.test(pasted) || (maximum != null && Number(pasted) > maximum)) {
        event.preventDefault();
        toast(maximum == null ? 'Ese campo solo admite números.' : `Ese campo admite valores de 0 a ${maximum}.`, true);
    }
}

function openRestEditor(card) {
    const exerciseId = Number(card.dataset.sessionExercise);
    const exercise = state.sessionExercises.find(item => item.id === exerciseId);
    if (!exercise) return;
    state.restEditorExerciseId = exerciseId;
    $('rest-exercise-name').textContent = card.dataset.exerciseName;
    $('rest-minutes').value = Math.floor(sessionRestSeconds(exercise) / 60);
    $('rest-seconds').value = sessionRestSeconds(exercise) % 60;
    $('rest-settings-dialog').showModal();
}

async function saveRestSettings(event) {
    event.preventDefault();
    const minutes = Math.max(0, Number($('rest-minutes').value) || 0);
    const seconds = Math.max(0, Number($('rest-seconds').value) || 0);
    const restSeconds = Math.min(3600, minutes * 60 + seconds);
    try {
        await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/exercises/${state.restEditorExerciseId}/rest`, {method:'PATCH', body:JSON.stringify({restSeconds})});
        $('rest-settings-dialog').close();
        await loadSessionExercises();
        toast(`Descanso actualizado a ${formatDuration(restSeconds)}.`);
    } catch (error) { toast(error.message, true); }
}

function openRpeEditor(button) {
    state.rpeTarget = button.closest('td');
    const value = optionalNumber(state.rpeTarget.querySelector('[data-set-rpe]').value) ?? 8;
    $('rpe-value').value = value;
    updateRpePreview(value);
    $('rpe-dialog').showModal();
}

function updateRpePreview(value) {
    const numeric = Number(value);
    $('rpe-score').textContent = formatNumber(numeric);
    $('rpe-description').textContent = numeric >= 10 ? 'Esfuerzo máximo · no podrías hacer más repeticiones' : numeric >= 9 ? 'Muy exigente · quedaría aproximadamente 1 repetición' : numeric >= 8 ? 'Exigente · quedarían unas 2 repeticiones' : numeric >= 7 ? 'Moderado · quedarían unas 3 repeticiones' : numeric >= 6 ? 'Cómodo · quedarían 4 o más repeticiones' : 'Muy suave · esfuerzo de recuperación o calentamiento';
}

function applyRpeValue() {
    if (!state.rpeTarget) return $('rpe-dialog').close();
    const value = Number($('rpe-value').value);
    state.rpeTarget.querySelector('[data-set-rpe]').value = value;
    const button = state.rpeTarget.querySelector('[data-rpe-picker]');
    button.textContent = formatNumber(value);
    button.classList.add('has-value');
    button.classList.remove('is-auto');
    button.classList.add('is-manual');
    paintRpeButton(button, value);
    button.title = 'RPE seleccionado manualmente';
    $('rpe-dialog').close();
}

function startRestTimer(exercise, exerciseName) {
    const duration = sessionRestSeconds(exercise);
    if (duration <= 0) return toast('Descanso desactivado para este ejercicio.');
    clearRestTimerInterval();
    Object.assign(state.restTimer, {exerciseId:exercise.id, exerciseName:exerciseName || 'Ejercicio', remaining:duration, total:duration, running:true});
    state.restTimer.interval = setInterval(() => {
        if (!state.restTimer.running) return;
        state.restTimer.remaining = Math.max(0, state.restTimer.remaining - 1);
        renderRestTimer();
        if (state.restTimer.remaining === 0) completeRestTimer();
    }, 1000);
    renderRestTimer();
}

function clearRestTimerInterval() {
    if (state.restTimer.interval) clearInterval(state.restTimer.interval);
    state.restTimer.interval = null;
}

function renderRestTimer() {
    const panel = $('rest-timer');
    if (!panel) return;
    const active = state.restTimer.exerciseId != null;
    panel.hidden = !active;
    document.body.classList.toggle('resting', active);
    if (!active) return;
    $('rest-timer-exercise').textContent = state.restTimer.exerciseName;
    $('rest-timer-value').textContent = formatDuration(state.restTimer.remaining);
    $('rest-timer-toggle').textContent = state.restTimer.running ? 'Pausar' : 'Continuar';
    const percent = state.restTimer.total ? (state.restTimer.remaining / state.restTimer.total) * 100 : 0;
    panel.style.setProperty('--rest-progress', `${percent}%`);
}

function toggleRestTimer() {
    if (state.restTimer.exerciseId == null) return;
    state.restTimer.running = !state.restTimer.running;
    renderRestTimer();
}

function adjustRestTimer(seconds) {
    if (state.restTimer.exerciseId == null) return;
    state.restTimer.remaining = Math.max(0, state.restTimer.remaining + seconds);
    state.restTimer.total = Math.max(state.restTimer.total, state.restTimer.remaining);
    renderRestTimer();
    if (state.restTimer.remaining === 0) completeRestTimer();
}

function stopRestTimer() {
    clearRestTimerInterval();
    Object.assign(state.restTimer, {exerciseId:null, exerciseName:'', remaining:0, total:0, running:false});
    renderRestTimer();
}

function completeRestTimer() {
    clearRestTimerInterval();
    state.restTimer.running = false;
    renderRestTimer();
    $('rest-finished-exercise').textContent = state.restTimer.exerciseName;
    if (!$('rest-finished-dialog').open) $('rest-finished-dialog').showModal();
    playRestAlert();
    if (navigator.vibrate) navigator.vibrate([180, 100, 180]);
    toast('Descanso terminado. Puedes comenzar la siguiente serie.');
}

function playRestAlert() {
    try {
        const audio = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.frequency.value = 880; gain.gain.value = 0.08;
        oscillator.connect(gain); gain.connect(audio.destination); oscillator.start();
        setTimeout(() => { oscillator.stop(); audio.close(); }, 450);
    } catch (_) {}
}

async function combinedSessionActivations() {
    await Promise.all(state.sessionExercises.map(async exercise => { if (!state.sessionActivations.has(exercise.exerciseVariantCode)) state.sessionActivations.set(exercise.exerciseVariantCode, await api(`/api/exercise-variants/${encodeURIComponent(exercise.exerciseVariantCode)}/muscle-activations`)); }));
    const priority = {SECONDARY:1, PRIMARY:2}; const combined = new Map();
    state.sessionExercises.forEach(exercise => {
        const completedSets = (state.sessionSets.get(exercise.id) || []).filter(set => set.completed).length;
        (state.sessionActivations.get(exercise.exerciseVariantCode) || []).filter(item => item.role !== 'STABILIZER').forEach(item => {
            const previous = combined.get(item.muscleCode); combined.set(item.muscleCode, {...item, role:!previous || priority[item.role] > priority[previous.role] ? item.role : previous.role, sets:(previous?.sets || 0) + completedSets});
        });
    });
    return combined;
}

function paintSessionActivations(svg, combined) {
    svg.querySelectorAll('[data-fitcore-role]').forEach(node => node.removeAttribute('data-fitcore-role'));
    [...combined.values()].forEach(item => (muscleSvgMap[item.muscleCode] || []).forEach(id => { const node = svg.querySelector(`[id="${id}"]`); if (node) node.dataset.fitcoreRole = item.role; }));
}


async function renderSessionMiniMap() {
    const stage = $('session-muscle-mini');

    if (!stage || !state.svg) return;

    // Clonar el mapa anatómico original
    const clone = state.svg.cloneNode(true);

    // Eliminar dimensiones fijas
    clone.removeAttribute('width');
    clone.removeAttribute('height');

    // Mantener las proporciones y mostrarlo entero
    clone.setAttribute(
        'preserveAspectRatio',
        'xMidYMid meet'
    );

    clone.style.width = '100%';
    clone.style.height = '100%';
    clone.style.transform = 'none';

    // Limpiar selecciones anteriores del catálogo
    paintSessionActivations(clone, new Map());

    // Colorear los músculos de la sesión
    if (state.sessionExercises.length) {
        try {
            const combined =
                await combinedSessionActivations();

            paintSessionActivations(clone, combined);
        } catch (error) {
            console.warn(
                'No se pudieron cargar las activaciones:',
                error
            );
        }
    }

    // Insertar miniatura actualizada
    stage.replaceChildren(clone);
}


async function showSessionMuscles() {
    if (!state.sessionExercises.length || !state.svg) return;
    const dialog = $('session-muscle-dialog'); dialog.showModal(); $('session-muscle-list').innerHTML = '<div class="empty-state">Calculando la distribución…</div>';
    try {
        const priority = {SECONDARY:1, PRIMARY:2};
        const combined = await combinedSessionActivations();
        const clone = state.svg.cloneNode(true); paintSessionActivations(clone, combined);
        $('session-muscle-map').replaceChildren(clone);
        const muscles = [...combined.values()].sort((a,b) => priority[b.role] - priority[a.role] || b.sets - a.sets);
        $('session-muscle-list').innerHTML = muscles.length ? muscles.map(item => `<div class="session-muscle-row"><i class="${item.role.toLowerCase()}"></i><div><strong>${escapeHtml(item.muscleName)}</strong><small>${friendly(item.role)}</small></div><span>${item.sets} series</span></div>`).join('') : '<div class="empty-state">Registra series para ver la distribución.</div>';
    } catch (error) { $('session-muscle-list').innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
}

async function finishSession(action) {
    if (!state.currentSession) return;
    try {
        if (action === 'complete') await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}`, {method:'PATCH', body:JSON.stringify({sessionDate:null, sessionCategory:null, sessionIntensity:null, durationMinutes:Math.max(1, Math.ceil(sessionElapsedSeconds()/60)), notes:null, estimatedTotalCaloriesBurned:null})});
        state.currentSession = await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/${action}`, {method:'POST'}); clearSessionStorage(); renderSession(); toast(action === 'complete' ? 'Entrenamiento completado.':'Sesión cancelada.'); await loadOverview();
    }
    catch (error) { toast(error.message, true); }
}

function clearSessionStorage() { localStorage.removeItem('fitcore.lab.currentSession'); localStorage.removeItem(SESSION_STARTED_KEY); state.sessionStartedAt = null; stopRestTimer(); }

async function deleteSession() {
    if (!await confirmAction('Eliminar sesión', 'La sesión y sus registros se eliminarán de forma permanente.')) return;
    try { await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}`, {method:'DELETE'}); state.currentSession=null; state.sessionExercises=[]; state.sessionSets.clear(); clearSessionStorage(); renderSession(); toast('Sesión eliminada.'); }
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
    container.innerHTML=items.map(r=>{const date=new Date(`${r.recommendationDate}T00:00:00`);return `<article class="recommendation-card" data-recommendation="${r.id}"><div class="recommendation-date"><strong>${date.getDate()}</strong><small>${date.toLocaleDateString('es-ES',{month:'short'}).toUpperCase()}</small></div><div><div class="button-row"><h3>${friendly(r.recommendationType)}</h3><span class="status-pill" data-state="${r.status}">${friendly(r.status)}</span></div><p>${escapeHtml(recommendationReasons[r.reason] || r.reason)}</p><div class="recommendation-deltas">${r.proposedSetsChange!=null?`<span>Series ${signed(r.proposedSetsChange)}</span>`:''}${r.proposedRepsChange!=null?`<span>Reps ${signed(r.proposedRepsChange)}</span>`:''}${r.proposedCardioChangeMinutes!=null?`<span>Cardio ${signed(r.proposedCardioChangeMinutes)} min</span>`:''}</div></div><div class="recommendation-actions">${r.status==='PENDING'?'<button class="button button-primary" data-decision="accept">Aceptar</button><button class="button button-secondary" data-decision="reject">Rechazar</button>':''}</div></article>`}).join('');
}
const signed = value => Number(value)>0?`+${value}`:value;
async function generateRecommendation() { if (!requireAuth()) return; try { await api(`/api/users/${state.auth.userId}/training-recommendations/generate`,{method:'POST'});toast('Recomendación generada.');await loadRecommendations();}catch(error){toast(error.message,true);} }
async function decideRecommendation(id, decision) { try { await api(`/api/users/${state.auth.userId}/training-recommendations/${id}/${decision}`,{method:'POST'});toast(`Recomendación ${decision==='accept'?'aceptada':'rechazada'}.`);await loadRecommendations();}catch(error){toast(error.message,true);} }

function requireAuth() { if (state.auth) return true; toast('Inicia sesión para usar esta sección.', true); navigate('overview'); return false; }
function confirmAction(title, message) { const dialog=$('confirm-dialog'); $('confirm-title').textContent=title; $('confirm-message').textContent=message; dialog.showModal(); return new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true})); }

async function loadOverview() {
    if (!state.auth) return;
    try { if (!state.exercises.length) state.exercises = await api('/api/exercises'); $('metric-exercises').textContent=state.exercises.length; } catch (_) {}
    await Promise.allSettled([loadActivePlan(true), loadStats()]);
}

async function bootstrapUserData() {
    await Promise.allSettled([searchCatalog(), loadOverview(), restoreSession(), loadRecommendations(), loadProgressHistory()]);
}

/* INFORMACIÓN DE PESO, RIR Y RPE */

const TRAINING_HELP = {
    weight: {
        title: '¿Qué peso debo introducir?',
        paragraphs: [
            'Registra el peso total externo utilizado en cada repetición.',

            'MANCUERNAS: Si utilizas dos mancuernas de 15 kg al mismo tiempo, introduce 30 kg.',

            'BARRAS: Suma el peso de la barra y todos los discos. Ejemplo: barra de 20 kg + dos discos de 15 kg = 50 kg.',

            'EJERCICIOS UNILATERALES: Si utilizas una sola mancuerna, registra su peso y las repeticiones realizadas por ambos lados en total.',

            'MÁQUINAS: Introduce la carga indicada en la máquina. Procura comparar el progreso usando la misma máquina.'
        ]
    },

    rir: {
        title: '¿Qué es el RIR?',
        paragraphs: [
            'RIR significa Repeticiones en Reserva.',

            'Indica cuántas repeticiones más crees que podrías hacer al terminar la serie, manteniendo una técnica correcta.',

            'RIR 0: No podrías hacer otra repetición completa.',

            'RIR 2: Podrías hacer aproximadamente 2 más.',

            'RIR 4: Podrías hacer aproximadamente 4 más.',

            'Cuanto menor sea el RIR, más cerca estarás del fallo muscular.'
        ]
    },

    rpe: {
        title: '¿Qué es el RPE?',
        paragraphs: [
            'RPE significa Índice de Esfuerzo Percibido.',

            'Se utiliza para expresar lo exigente que ha sido una serie. En FitCore se representa de 0 a 10.',

            'RPE 10: Esfuerzo máximo; no podrías completar otra repetición.',

            'RPE 9: Podrías hacer aproximadamente 1 repetición más.',

            'RPE 8: Podrías hacer aproximadamente 2 repeticiones más.',

            'RPE 7: Podrías hacer aproximadamente 3 repeticiones más.',

            'En ejercicios de fuerza, FitCore estima RPE = 10 - RIR. Es una aproximación, especialmente útil en las series más exigentes.'
        ]
    }
};

function showTrainingHelp(button) {
    const popover = $('training-help-popover');
    const topic = button.dataset.trainingHelp;
    const info = TRAINING_HELP[topic];

    if (!popover || !info) return;

    const wasSameOpen =
        popover.matches(':popover-open') &&
        popover.dataset.topic === topic;

    if (popover.matches(':popover-open')) {
        popover.hidePopover();
    }

    if (wasSameOpen) return;

    $('training-help-title').textContent = info.title;

    const paragraphs = info.paragraphs.map(text => {
        const p = document.createElement('p');
        p.textContent = text;
        return p;
    });

    $('training-help-content').replaceChildren(...paragraphs);

    popover.dataset.topic = topic;
    popover.showPopover();

    // Posicionar sobre la tabla, sin que se recorte
    const rect = button.getBoundingClientRect();
    const size = popover.getBoundingClientRect();

    const left = Math.max(
        12,
        Math.min(
            rect.left + rect.width / 2 - size.width / 2,
            window.innerWidth - size.width - 12
        )
    );

    let top = rect.bottom + 10;

    if (top + size.height > window.innerHeight - 12) {
        top = rect.top - size.height - 10;
    }

    popover.style.left = `${left}px`;
    popover.style.top = `${Math.max(12, top)}px`;
}


function bindEvents() {
    document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.go)));
    document.querySelectorAll('.nav-item').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.view)));
    $('menu-button').addEventListener('click',()=>{const sidebar=document.querySelector('.sidebar');sidebar.classList.toggle('is-open');$('menu-button').setAttribute('aria-expanded',String(sidebar.classList.contains('is-open')));});
    $('auth-form').addEventListener('submit',event=>{event.preventDefault();authenticate(false);}); $('register-button').addEventListener('click',()=>authenticate(true)); $('logout-button').addEventListener('click',logout);
    $('health-check').addEventListener('click',healthCheck); $('catalog-search').addEventListener('click',()=>searchCatalog(0)); $('catalog-query').addEventListener('keydown',e=>{if(e.key==='Enter')searchCatalog(0);});
    $('catalog-clear').addEventListener('click',()=>{$('catalog-query').value='';$('catalog-equipment').value='';$('catalog-muscle').value='';$('catalog-stabilizers').checked=false;searchCatalog(0);});
    $('catalog-results').addEventListener('click',e=>{const item=e.target.closest('[data-exercise]');if(item)selectExercise(item.dataset.exercise);});
    $('variant-detail').addEventListener('change',e=>{const field=e.target.closest('[data-variant-config]'), finalChoice=e.target.closest('[data-variant-code]');if(field){state.variantConfiguration[field.dataset.variantConfig]=field.value;state.variantConfiguration.variantCode=null;previewConfiguredVariant();}else if(finalChoice){state.variantConfiguration.variantCode=finalChoice.value;previewConfiguredVariant();}});
    $('map-stabilizers').addEventListener('change',paintActivations);
    $('add-day').addEventListener('click',()=>addPlanDay()); $('plan-load').addEventListener('click',()=>loadActivePlan()); $('plan-save').addEventListener('click',savePlan);
    $('plan-days').addEventListener('click',e=>{const card=e.target.closest('.day-card');if(!card)return;const di=Number(card.dataset.day);if(e.target.closest('[data-remove-day]')){syncPlanEditor();state.planDays.splice(di,1);renderPlanDays();}else if(e.target.closest('[data-add-plan-exercise]')){syncPlanEditor();state.planDays[di].exercises.push({exerciseVariantCode:'',sets:3,reps:10,restSeconds:90});renderPlanDays();}else if(e.target.closest('[data-remove-exercise]')){syncPlanEditor();state.planDays[di].exercises.splice(Number(e.target.closest('.exercise-editor').dataset.exercise),1);renderPlanDays();}else if(e.target.closest('[data-move]')){syncPlanEditor();const row=e.target.closest('.exercise-editor'),from=Number(row.dataset.exercise),to=from+Number(e.target.dataset.move);if(to>=0&&to<state.planDays[di].exercises.length){const [item]=state.planDays[di].exercises.splice(from,1);state.planDays[di].exercises.splice(to,0,item);renderPlanDays();}}});

    /* =====================================
       EVENTOS DE CONFIGURACIÓN DE SESIÓN
       ===================================== */

// Abrir ventana
    $('session-edit-settings').addEventListener(
        'click',
        openSessionSettings
    );

// Guardar configuración
    $('session-settings-form').addEventListener(
        'submit',
        saveSessionSettings
    );

// Cerrar desde X o botón Cerrar
    [
        'session-settings-close',
        'session-settings-dismiss'
    ].forEach(id => {

        $(id).addEventListener('click', () => {
            $('session-settings-dialog').close();
        });

    });

// Cancelar entrenamiento
    $('session-settings-cancel-workout').addEventListener(
        'click',
        async () => {

            const confirmed = await confirmAction(
                'Cancelar sesión',
                'Se cancelará el entrenamiento en curso. ¿Quieres continuar?'
            );

            if (!confirmed) return;

            await finishSession('cancel');
        }
    );

// Eliminar entrenamiento
    $('session-settings-delete-workout').addEventListener(
        'click',
        deleteSession
    );

    $('session-start').addEventListener('click',startSession); $('session-add-exercise').addEventListener('click',addSessionExercise); $('open-exercise-picker').addEventListener('click',openExercisePicker); $('session-refresh').addEventListener('click',loadSessionExercises); $('session-complete').addEventListener('click',()=>finishSession('complete')); $('session-cancel').addEventListener('click',()=>finishSession('cancel')); $('session-delete').addEventListener('click',deleteSession); $('session-muscles').addEventListener('click',showSessionMuscles);
    ['session-exercise-query','session-exercise-equipment','session-exercise-muscle'].forEach(id => $(id).addEventListener(id === 'session-exercise-query' ? 'input' : 'change', renderSessionExerciseResults));
    $('session-exercise-results').addEventListener('click',e=>{const item=e.target.closest('[data-session-exercise-code]');if(!item)return;state.sessionPicker={exercise:state.exercises.find(exercise=>exercise.code===item.dataset.sessionExerciseCode),configuration:{}};renderSessionExerciseResults();renderSessionExerciseConfig();});
    $('session-exercise-config').addEventListener('change',e=>{const field=e.target.closest('[data-session-variant-config]');if(!field)return;state.sessionPicker.configuration[field.dataset.sessionVariantConfig]=field.value;state.sessionPicker.configuration.variantCode=null;renderSessionExerciseConfig();});
    document.querySelectorAll('[data-close-picker]').forEach(button=>button.addEventListener('click',()=>$('exercise-picker-dialog').close())); document.querySelectorAll('[data-close-muscles]').forEach(button=>button.addEventListener('click',()=>$('session-muscle-dialog').close()));
    document.querySelectorAll('[data-close-rest]').forEach(button=>button.addEventListener('click',()=>$('rest-settings-dialog').close())); document.querySelectorAll('[data-close-rpe]').forEach(button=>button.addEventListener('click',()=>$('rpe-dialog').close()));
    $('session-exercises').addEventListener('click',async e=>{const card=e.target.closest('.session-card');if(!card)return;const id=Number(card.dataset.sessionExercise);if(e.target.closest('[data-edit-rest]'))openRestEditor(card);else if(e.target.closest('[data-rpe-picker]'))openRpeEditor(e.target.closest('[data-rpe-picker]'));else if(e.target.closest('[data-add-set]'))await addSet(card);else if(e.target.closest('[data-save-set]')){const button=e.target.closest('[data-save-set]');await updateSet(card,button.closest('[data-set-row]'),button.dataset.saveSet);}else if(e.target.closest('[data-delete-set]')){try{await api(`/api/users/${state.auth.userId}/workout-session-exercises/${id}/sets/${e.target.closest('[data-delete-set]').dataset.deleteSet}`,{method:'DELETE'});await loadSessionExercises();}catch(error){toast(error.message,true);}}else if(e.target.closest('[data-remove-session-exercise]')){try{await api(`/api/users/${state.auth.userId}/workout-sessions/${state.currentSession.id}/exercises/${id}`,{method:'DELETE'});await loadSessionExercises();}catch(error){toast(error.message,true);}}});
    $('session-exercises').addEventListener('change',async e=>{const completion=e.target.closest('[data-set-complete]');if(!completion)return;const row=completion.closest('[data-set-row]'),card=completion.closest('.session-card');await updateSet(card,row,row.dataset.setRow,completion.checked);});
    $('session-exercises').addEventListener('keydown',blockInvalidNumericKey);
    $('session-exercises').addEventListener('beforeinput',blockInvalidNumericInsert);
    $('session-exercises').addEventListener('paste',blockInvalidNumericPaste);
    $('session-exercises').addEventListener('input',e=>syncRpeFromRir(e.target));
    $('rest-settings-form').addEventListener('submit',saveRestSettings);
    document.querySelectorAll('[data-rest-preset]').forEach(button=>button.addEventListener('click',()=>{const total=Number(button.dataset.restPreset);$('rest-minutes').value=Math.floor(total/60);$('rest-seconds').value=total%60;}));
    $('rpe-value').addEventListener('input',e=>updateRpePreview(e.target.value)); $('rpe-apply').addEventListener('click',applyRpeValue);
    $('rest-timer-toggle').addEventListener('click',toggleRestTimer); $('rest-timer-minus').addEventListener('click',()=>adjustRestTimer(-15)); $('rest-timer-plus').addEventListener('click',()=>adjustRestTimer(15)); $('rest-timer-skip').addEventListener('click',completeRestTimer);
    $('rest-finished-close').addEventListener('click',()=>{ $('rest-finished-dialog').close(); stopRestTimer(); });
    $('stats-load').addEventListener('click',loadStats); $('goal-form').addEventListener('submit',saveGoal); $('progress-form').addEventListener('submit',saveProgress);
    $('recommendation-generate').addEventListener('click',generateRecommendation); $('recommendation-filter').addEventListener('change',loadRecommendations); $('recommendation-list').addEventListener('click',e=>{const button=e.target.closest('[data-decision]'),card=e.target.closest('[data-recommendation]');if(button&&card)decideRecommendation(card.dataset.recommendation,button.dataset.decision);});
    $('log-clear').addEventListener('click',()=>{state.logs=[];renderLogs();}); $('log-copy').addEventListener('click',async()=>{await navigator.clipboard.writeText(JSON.stringify(state.logs,null,2));toast('Registro copiado.');});

    /* Abrir información al pulsar los iconos */
    $('session-exercises').addEventListener('click', event => {
        const button = event.target.closest(
            '[data-training-help]'
        );

        if (!button) return;

        event.preventDefault();
        showTrainingHelp(button);
    });

    /* Cerrar la ventana de información */
    $('training-help-close').addEventListener('click', () => {
        $('training-help-popover').hidePopover();
    });

}

async function init() {
    $('plan-date').value=today(); $('session-date').value=today(); $('progress-date').value=today(); $('stats-from').value=daysAgo(29); $('stats-to').value=today(); $('goal-target-date').value=daysAgo(-90);
    fillSelect($('catalog-equipment'),enums.equipment,'Todo'); fillSelect($('catalog-muscle'),enums.muscles,'Todos'); fillSelect($('session-exercise-equipment'),enums.equipment,'Todo el equipamiento'); fillSelect($('session-exercise-muscle'),enums.muscles,'Todos los músculos'); fillSelect($('goal-groups'),enums.muscles); bindEvents(); setAuth(state.auth); addPlanDay(); renderSession(); await Promise.all([loadSvg(),healthCheck()]);
    navigate(location.hash.slice(1) && $(`view-${location.hash.slice(1)}`) ? location.hash.slice(1) : 'overview');
    if (state.auth) await bootstrapUserData();
}

init();
