const API = '';
const STORAGE_KEY = 'fitcore.lab.session.v1';
const SESSION_STARTED_KEY = 'fitcore.lab.session.startedAt';
const state = {
    auth: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'),
    logs: [], exercises: [], variants: [], catalogExercises: [], selectedExercise: null,
    catalogPage: 0, catalogTotalPages: 0, catalogRequestId: 0,
    selectedVariant: null, variantConfiguration: {}, activations: [], svg: null,
    activePlan: null, planDays: [], selectedPlanDayIndex: 0, currentSession: null,
    sessionExercises: [], sessionSets: new Map(), sessionStartedAt: Number(localStorage.getItem(SESSION_STARTED_KEY)) || null,
    sessionTimer: null, sessionPicker: {exercise:null, configuration:{}}, sessionActivations: new Map(),
    pickerMode: 'session', planPickerDayIndex: null, planPickerAction: 'add',
    planPickerExerciseIndex: null, planPickerExerciseCode: null,
    planAdvancedConfig: null, pickerConfigOpen: false, pickerConfigMoreOpen: false,
    pickerDraft: null, pickerGroupCodes: null,
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
    BACK_WIDTH:'Amplitud de espalda', BACK_THICKNESS:'Densidad de espalda', LAT_BIAS:'Énfasis dorsal', UPPER_BACK_BIAS:'Énfasis en espalda alta', SCAPULAR_CONTROL:'Control escapular', ROTATOR_CUFF_EXTERNAL_ROTATION:'Rotación externa del manguito', ROTATOR_CUFF_INTERNAL_ROTATION:'Rotación interna del manguito', BICEPS_BIAS:'Énfasis en bíceps', BRACHIALIS_BRACHIORADIALIS_BIAS:'Énfasis en braquial y braquiorradial', GRIP_STRENGTH:'Fuerza de agarre', WRIST_FLEXORS_BIAS:'Énfasis en flexores de muñeca', WRIST_EXTENSORS_BIAS:'Énfasis en extensores de muñeca', FOREARM_PRONATION:'Pronación de antebrazo', FOREARM_SUPINATION:'Supinación de antebrazo', CHEST_STERNAL_BIAS:'Énfasis en pecho medio', CHEST_CLAVICULAR_BIAS:'Énfasis en pecho superior', CHEST_LOWER_BIAS:'Énfasis en pecho inferior', TRICEPS_BIAS:'Énfasis en tríceps', SHOULDER_STRENGTH:'Fuerza de hombro', SIDE_DELTS_BIAS:'Énfasis en deltoides lateral', REAR_DELTS_BIAS:'Énfasis en deltoides posterior', QUAD_BIAS:'Énfasis en cuádriceps', GLUTE_BIAS:'Énfasis en glúteo', HAMSTRING_BIAS:'Énfasis en isquiotibiales', ADDUCTOR_BIAS:'Énfasis en aductores', HIP_ABDUCTION_BIAS:'Énfasis en abductores', CALF_GASTROCNEMIUS_BIAS:'Énfasis en gastrocnemio', CALF_SOLEUS_BIAS:'Énfasis en sóleo', CORE_FLEXION:'Flexión del abdomen', CORE_ANTI_EXTENSION:'Antiextensión del abdomen', CORE_ANTI_ROTATION:'Antirrotación del abdomen', CORE_LATERAL_STABILITY:'Estabilidad lateral', POSTERIOR_CHAIN:'Cadena posterior', GENERAL_STRENGTH:'Fuerza general', MACHINE_STABILITY:'Estabilidad guiada', UNILATERAL_STABILITY:'Estabilidad unilateral',
    STRENGTH:'Fuerza', CARDIO:'Cardio', MOBILITY:'Movilidad', SPORT_SPECIFIC:'Específico del deporte', HYPERTROPHY:'Hipertrofia', ENDURANCE:'Resistencia', MODERATE:'Moderada', VERY_HIGH:'Muy alta',
    HORIZONTAL_PUSH:'Empuje horizontal', VERTICAL_PUSH:'Empuje vertical', HORIZONTAL_PULL:'Tirón horizontal', VERTICAL_PULL:'Tirón vertical', SQUAT:'Sentadilla', HIP_HINGE:'Bisagra de cadera', LUNGE:'Zancada', HIP_EXTENSION:'Extensión de cadera', HIP_ABDUCTION:'Abducción de cadera', HIP_ADDUCTION:'Aducción de cadera', KNEE_EXTENSION:'Extensión de rodilla', KNEE_FLEXION:'Flexión de rodilla', ELBOW_FLEXION:'Flexión de codo', ELBOW_EXTENSION:'Extensión de codo', SHOULDER_ABDUCTION:'Abducción de hombro', SHOULDER_FLEXION:'Flexión de hombro', SHOULDER_HORIZONTAL_ABDUCTION:'Abducción horizontal de hombro', SHOULDER_EXTERNAL_ROTATION:'Rotación externa de hombro', SCAPULAR_ELEVATION:'Elevación escapular', SCAPULAR_RETRACTION_DEPRESSION:'Retracción y depresión escapular', SCAPULAR_PROTRACTION:'Protracción escapular', SCAPULAR_UPWARD_ROTATION:'Rotación ascendente de escápula', SHOULDER_INTERNAL_ROTATION:'Rotación interna de hombro', ANKLE_PLANTAR_FLEXION:'Flexión plantar', ANKLE_DORSIFLEXION:'Flexión dorsal del tobillo', TRUNK_FLEXION:'Flexión del tronco', HIP_TRUNK_FLEXION:'Flexión de cadera y tronco', TRUNK_ROTATION:'Rotación del tronco', ANTI_EXTENSION:'Antiextensión', ANTI_ROTATION:'Antirrotación', ANTI_LATERAL_FLEXION:'Antiflexión lateral', CARRY:'Transporte de carga', ISOLATION:'Aislamiento', WRIST_FLEXION:'Flexión de muñeca', WRIST_EXTENSION:'Extensión de muñeca', FOREARM_ROTATION:'Rotación de antebrazo', WRIST_FLEXION_EXTENSION:'Flexoextensión de muñeca', GRIP_ISOMETRIC:'Agarre isométrico',
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
    if (key === 'benchAngle') return FitCoreVariantUI.angleLabel(value);
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
    state.activePlan = null; state.planDays = []; state.selectedPlanDayIndex = 0; state.currentSession = null; state.sessionExercises = []; state.sessionSets.clear();
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
    if (view === 'plans' && state.svg) {
        void renderPlanMusclePreview();
    }
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


        void renderPlanMusclePreview();

        if ($('plan-muscle-dialog')?.open) {
            void renderPlanMuscleDialog();
        }


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

async function searchCatalog(page = 0) {
    if (!requireAuth()) return;
    // La API pagina variantes, no ejercicios. La navegación permite ver todas
    // las coincidencias sin truncar el catálogo a los primeros 100 resultados.
    const requestId = ++state.catalogRequestId;
    const safePage = Math.max(0, Number(page) || 0);
    const params = new URLSearchParams({page: String(safePage), size: '50'});
    const q = $('catalog-query').value.trim();
    const equipment = $('catalog-equipment').value;
    const muscleGroup = $('catalog-muscle').value;
    if (q) params.set('q', q);
    if (equipment) params.append('equipment', equipment);
    if (muscleGroup) params.append('muscleGroup', muscleGroup);
    params.set('includeStabilizers', String($('catalog-stabilizers').checked));

    try {
        if (!state.exercises.length || !state.variants.length) {
            [state.exercises, state.variants] = await Promise.all([
                api('/api/exercises'), api('/api/exercise-variants')
            ]);
            updateVariantDatalist();
        }
        const result = await api(`/api/exercise-variants/search?${params}`);
        if (requestId !== state.catalogRequestId) return;

        const matchingVariants = result.content || [];
        const allowedExerciseCodes = new Set(matchingVariants.map(variant => variant.exerciseCode));
        state.catalogVariantCounts = matchingVariants.reduce(
            (counts, variant) => counts.set(variant.exerciseCode, (counts.get(variant.exerciseCode) || 0) + 1),
            new Map()
        );
        state.catalogExercises = state.exercises.filter(exercise => allowedExerciseCodes.has(exercise.code));
        state.catalogPage = result.page ?? safePage;
        state.catalogTotalPages = result.totalPages ?? 0;
        const totalVariants = result.totalElements ?? matchingVariants.length;
        $('catalog-count').textContent = `${state.catalogExercises.length} ejercicios en esta página`;
        $('catalog-page').textContent = `${totalVariants} configuraciones coincidentes`;
        renderCatalog();
        renderCatalogPagination();
        if (state.currentSession) renderSession();
        $('metric-exercises').textContent = state.exercises.length;
    } catch (error) {
        if (requestId === state.catalogRequestId) toast(error.message, true);
    }
}

function renderCatalogPagination() {
    const pager = $('catalog-pagination');
    const total = state.catalogTotalPages;
    pager.hidden = total <= 1;
    $('catalog-page-indicator').textContent = `Página ${state.catalogPage + 1} de ${Math.max(1, total)}`;
    $('catalog-prev').disabled = state.catalogPage <= 0;
    $('catalog-next').disabled = state.catalogPage >= total - 1;
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
    state.variantConfiguration = configurationFromVariant(
        defaultVariantForExercise(state.selectedExercise)
    );
    state.activations = [];
    renderCatalog();
    await previewConfiguredVariant();
}

function resolveVariantForExercise(exercise, configuration, allowedVariants = null) {
    const variants = allowedVariants || orderedVariantsForExercise(exercise);
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

function orderedVariantsForExercise(exercise) {
    return state.variants
        .filter(variant => variant.exerciseCode === exercise?.code)
        .sort((left, right) => String(left.code).localeCompare(String(right.code), 'en'));
}

function defaultVariantForExercise(exercise) {
    const variants = orderedVariantsForExercise(exercise);
    return variants.find(variant =>
        variant.isDefault === true ||
        variant.defaultVariant === true ||
        variant.default === true
    ) || variants[0] || null;
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
        <section class="activation-section"><div class="activation-section-heading"><div><p class="eyebrow">ACTIVACIONES</p><h2>${activations.length ? `${activations.length} músculos`:'Cargando…'}</h2></div>${activations.length ? '<span>Ordenadas por participación</span>' : ''}</div><div class="activation-list">${activations.map(a => `<article class="activation" data-role="${escapeHtml(a.role)}"><div class="activation-head"><div class="activation-muscle"><i aria-hidden="true"></i><strong>${escapeHtml(a.muscleName)}</strong></div><span class="activation-role">${friendly(a.role)}</span></div><div class="activation-metrics"><span><b>${a.activationLevel}/5</b> nivel</span><span>Confianza <b>${friendly(a.confidence).toLowerCase()}</b></span></div><span class="activation-bar" role="meter" aria-label="Nivel de activación de ${escapeHtml(a.muscleName)}" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${a.activationLevel}"><i style="width:${a.activationLevel * 20}%"></i></span><small class="activation-evidence">${friendly(a.evidenceType)}</small></article>`).join('')}</div></section>`;
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
    if ($('plan-days')) renderPlanDays();
}

function variantOptions(selectedCode) {
    const groups = state.exercises.map(exercise => ({exercise, variants:state.variants.filter(variant => variant.exerciseCode === exercise.code)})).filter(group => group.variants.length);
    return `<option value="">Selecciona una configuración</option>${groups.map(group => `<optgroup label="${escapeHtml(group.exercise.name)}">${group.variants.map(variant => `<option value="${escapeHtml(variant.code)}" ${variant.code === selectedCode ? 'selected':''}>${escapeHtml(variant.name)}</option>`).join('')}</optgroup>`).join('')}`;
}

function variantName(code) {
    return state.variants.find(variant => variant.code === code)?.name || 'Ejercicio';
}

function addPlanDay(source = null) {
    syncPlanEditor();
    state.planDays.push(source ? {
        id: source.id, name:source.name, dayType:source.dayType, exercises:(source.exercises || []).map(x => ({id:x.id, exerciseVariantCode:x.exerciseVariantCode, sets:x.sets, reps:x.reps, restSeconds:x.restSeconds}))
    } : {name:'Nueva sesión', dayType:'FULL_BODY', exercises:[]});
    state.selectedPlanDayIndex = state.planDays.length - 1;
    renderPlanMode();
}


function openPlanNewDayDialog() {
    syncPlanEditor();

    $('plan-new-day-name').value =
        `Día ${state.planDays.length + 1}`;

    $('plan-new-day-type').value = 'FULL_BODY';

    $('plan-new-day-dialog').showModal();
    $('plan-new-day-name').focus();
}

function submitPlanNewDay(event) {
    event.preventDefault();

    const name =
        $('plan-new-day-name').value.trim();

    const dayType =
        $('plan-new-day-type').value;

    if (!name || !enums.dayTypes.includes(dayType)) {
        return toast(
            'Indica un nombre y un tipo de día válido.',
            true
        );
    }

    addPlanDay({
        name,
        dayType,
        exercises: []
    });

    $('plan-new-day-dialog').close();

    toast(
        `Día «${name}» añadido al plan. Recuerda guardar el plan.`
    );
}


function planDayIcon(dayType) {
    const paths = {
        PUSH:'<path d="M4 9v6m16-6v6M7 7v10m10-10v10M7 12h10"/>',
        PULL:'<path d="M5 8h11m0 0-3-3m3 3-3 3M19 16H8m0 0 3-3m-3 3 3 3"/>',
        LEGS:'<path d="M8 3h5l-1 7 4 8-3 3-5-8-2 6H3l2-9Z"/>',
        LOWER:'<path d="M8 3h5l-1 7 4 8-3 3-5-8-2 6H3l2-9Z"/>',
        UPPER:'<path d="M5 7 9 4h6l4 3 2 6-3 1-2-4v10H8V10l-2 4-3-1Z"/>',
        FULL_BODY:'<path d="M12 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-4 7 4-2 4 2 3 5-2 1-2-3v8h-2v-6h-2v6H9v-8l-2 3-2-1Z"/>',
        CARDIO:'<path d="M3 13h4l2-5 4 10 2-5h6"/>',
        MOBILITY:'<path d="M5 15c3-8 11-8 14 0M8 18h8M12 4v4"/>',
        REST:'<path d="M6 18h12M8 18V9h8v9M9 6h6"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[dayType] || paths.FULL_BODY}</svg>`;
}

function renderPlanHeader() {
    const days = state.planDays.length;
    const name = $('plan-name')?.value.trim() || state.activePlan?.name || 'Mi plan FitCore';
    const description = $('plan-description')?.value.trim() || 'Configura los días y ejercicios de tu próxima rutina.';
    $('plan-summary-title').textContent = `${name} · ${days} ${days === 1 ? 'día' : 'días'}`;
    $('plan-summary-description').textContent = description;
    $('plan-summary-status').textContent = state.activePlan ? `Plan activo · Versión ${state.activePlan.version}` : 'Nuevo plan · Versión 1';
    $('plan-save').querySelector('span').textContent = state.activePlan ? 'Guardar nueva versión' : 'Guardar plan';
}


function renderPlanDayTabs() {
    const container = $('plan-day-tabs');

    container.innerHTML = state.planDays.map((day, index) => `
        <button
            type="button"
            class="plan-day-tab ${index === state.selectedPlanDayIndex ? 'is-selected' : ''}"
            data-select-plan-day="${index}"
            aria-pressed="${index === state.selectedPlanDayIndex}">

            <span class="plan-day-tab-icon">
                ${planDayIcon(day.dayType)}
            </span>

            <span class="plan-day-tab-text">
                <small>Día ${index + 1}</small>
                <strong>
                    ${escapeHtml(day.name || friendly(day.dayType))}
                </strong>
                <em>
                    ${day.exercises.length} ejercicio${day.exercises.length === 1 ? '' : 's'}
                </em>
            </span>

            <span
                class="plan-day-grip"
                aria-hidden="true"
                title="Arrastrar para ordenar los días">
                ⠿
            </span>
        </button>
    `).join('') + `
        <button
            class="plan-day-add"
            id="add-day"
            type="button">
            <span>＋</span>
            <strong>Añadir día</strong>
        </button>
    `;
}


function renderPlanDays() {
    const container = $('plan-days');
    if (!state.planDays.length) {
        container.innerHTML = '<div class="empty-state large plan-empty"><strong>Tu plan todavía no tiene días</strong><span>Añade el primero para empezar a organizar tu rutina.</span><button class="button button-primary" data-empty-add-day>+ Añadir día</button></div>';
        renderPlanDayTabs();
        renderPlanHeader();
        return;
    }
    state.selectedPlanDayIndex = Math.min(Math.max(0, state.selectedPlanDayIndex), state.planDays.length - 1);
    const dayIndex = state.selectedPlanDayIndex;
    const day = state.planDays[dayIndex];
    const totalSets = day.exercises.reduce((total, exercise) => total + (Number(exercise.sets) || 0), 0);
    container.innerHTML = `<article class="plan-day-editor" data-day="${dayIndex}">
        <header class="plan-day-editor-head">

<div class="plan-day-title">

    <span>Día ${dayIndex + 1}</span>

    <h3>
        ${escapeHtml(day.name || friendly(day.dayType))}
    </h3>

    <span class="plan-day-type-badge">
        ${planDayIcon(day.dayType)}
        ${escapeHtml(friendly(day.dayType))}
    </span>

</div>


<!-- MAPA MUSCULAR HORIZONTAL -->
<div class="plan-day-muscle-area">

    <button
        type="button"
        class="plan-day-muscle-button"
        id="plan-day-muscle-open"
        aria-label="Ver análisis muscular del día"
        aria-haspopup="dialog"
        aria-controls="plan-muscle-dialog">

        <!-- IZQUIERDA: CUERPOS ANATÓMICOS -->
        <span
            id="plan-day-muscle-mini"
            class="plan-day-muscle-mini"
            aria-hidden="true">
            ◉
        </span>

        <!-- DERECHA: MÚSCULOS TRABAJADOS -->
        <span class="plan-day-muscle-copy">

            <strong class="plan-day-muscle-title">
                Músculos trabajados
            </strong>

            <span
                id="plan-day-muscle-list"
                class="plan-day-muscle-list"
                aria-hidden="true">
                <span class="plan-day-muscle-empty">
                    Sin ejercicios
                </span>
            </span>

            <small id="plan-day-muscle-caption">
                0 músculos previstos
            </small>

        </span>

    </button>

</div>

<!-- BOTONES A LA DERECHA -->
<div class="plan-day-controls">

    <button
        type="button"
        class="button button-secondary"
        data-configure-plan-day>
        ⚙ Configurar día
    </button>

    <button
        type="button"
        class="button button-primary"
        data-add-plan-exercise>
        ＋ Añadir ejercicio
    </button>

</div>


        </header>
        <div class="plan-exercise-table">
            <div class="plan-exercise-columns" aria-hidden="true"><span>Ejercicio</span><span>Series</span><span>Reps</span><span>Descanso</span><span>Acciones</span></div>
            <div class="day-exercises">${day.exercises.length ? day.exercises.map((exercise,index) => exerciseEditor(exercise,index)).join('') : '<div class="plan-day-no-exercises"><strong>Aún no hay ejercicios en este día</strong><span>Añade un ejercicio y ajusta después su configuración técnica si lo necesitas.</span></div>'}</div>
        </div>
        <footer class="plan-day-summary"><span>${planDayIcon(day.dayType)}<strong>Resumen del día</strong></span><b>${day.exercises.length} ejercicio${day.exercises.length === 1 ? '' : 's'} / ${totalSets} series planificadas</b></footer>
    </article>`;
    renderPlanDayTabs();
    renderPlanHeader();
    void renderPlanMusclePreview();
}


/* =============================================
   FITCORE - DRAG AND DROP DE PLANES
   ============================================= */

let planDragState = null;
let suppressPlanDragClickUntil = 0;


// Detectar cuándo empieza un arrastre
function startPlanDrag(event) {
    if (
        event.pointerType === 'mouse' &&
        event.button !== 0
    ) return;

    const grip = event.target.closest(
        '.plan-day-grip, .plan-exercise-grip'
    );

    if (!grip || !grip.closest('#view-plans')) return;
    if (planDragState) return;

    const isDay = grip.classList.contains(
        'plan-day-grip'
    );

    const item = grip.closest(
        isDay ? '.plan-day-tab' : '.exercise-editor'
    );

    const list = item?.parentElement;

    if (!item || !list) return;

    event.preventDefault();

    planDragState = {
        pointerId: event.pointerId,
        isDay,
        item,
        list,
        startX: event.clientX,
        startY: event.clientY,
        active: false,
        ghost: null,
        dayIndex: state.selectedPlanDayIndex
    };

    window.addEventListener(
        'pointermove',
        movePlanDrag,
        { passive: false }
    );

    window.addEventListener(
        'pointerup',
        finishPlanDrag
    );

    window.addEventListener(
        'pointercancel',
        cancelPlanDrag
    );
}


// Mover el elemento mientras se arrastra
function movePlanDrag(event) {
    const drag = planDragState;

    if (!drag || event.pointerId !== drag.pointerId) {
        return;
    }

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.active) {
        if (Math.hypot(dx, dy) < 6) return;

        // Guardar los campos antes de cambiar el DOM
        syncPlanEditor();

        const rect = drag.item.getBoundingClientRect();
        const ghost = drag.item.cloneNode(true);

        ghost.classList.add('plan-drag-ghost');
        ghost.setAttribute('aria-hidden', 'true');
        ghost.tabIndex = -1;

        Object.assign(ghost.style, {
            position: 'fixed',
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            margin: '0',
            pointerEvents: 'none',
            zIndex: '99999'
        });

        document.body.appendChild(ghost);

        drag.ghost = ghost;
        drag.item.classList.add(
            'plan-drag-placeholder'
        );

        drag.active = true;

        document.body.classList.add(
            'plan-is-dragging'
        );
    }

    event.preventDefault();

    drag.ghost.style.transform =
        `translate3d(${dx}px, ${dy}px, 0)`;

    // Desplazamiento automático
    if (drag.isDay) {
        const bounds =
            drag.list.getBoundingClientRect();

        if (event.clientX < bounds.left + 45) {
            drag.list.scrollLeft -= 15;
        }

        if (event.clientX > bounds.right - 45) {
            drag.list.scrollLeft += 15;
        }

    } else {
        if (event.clientY < 65) {
            window.scrollBy(0, -14);
        }

        if (
            event.clientY >
            window.innerHeight - 65
        ) {
            window.scrollBy(0, 14);
        }
    }

    // Localizar el elemento sobre el que soltaremos
    const selector = drag.isDay
        ? '.plan-day-tab'
        : '.exercise-editor';

    const over = document.elementFromPoint(
        event.clientX,
        event.clientY
    )?.closest(selector);

    if (
        !over ||
        over === drag.item ||
        over.parentElement !== drag.list
    ) return;

    const rect = over.getBoundingClientRect();

    const before = drag.isDay
        ? event.clientX < rect.left + rect.width / 2
        : event.clientY < rect.top + rect.height / 2;

    drag.list.insertBefore(
        drag.item,
        before ? over : over.nextSibling
    );
}


// Limpiar el estado del arrastre
function cleanupPlanDrag() {
    const drag = planDragState;

    if (!drag) return;

    drag.ghost?.remove();

    drag.item.classList.remove(
        'plan-drag-placeholder'
    );

    document.body.classList.remove(
        'plan-is-dragging'
    );

    planDragState = null;

    window.removeEventListener(
        'pointermove',
        movePlanDrag
    );

    window.removeEventListener(
        'pointerup',
        finishPlanDrag
    );

    window.removeEventListener(
        'pointercancel',
        cancelPlanDrag
    );
}


// Aplicar el nuevo orden al soltar
function finishPlanDrag(event) {
    const drag = planDragState;

    if (!drag || event.pointerId !== drag.pointerId) {
        return;
    }

    cleanupPlanDrag();

    if (!drag.active) return;

    suppressPlanDragClickUntil =
        performance.now() + 350;

    // Obtener el orden nuevo desde el DOM
    const selector = drag.isDay
        ? '.plan-day-tab'
        : '.exercise-editor';

    const attribute = drag.isDay
        ? 'selectPlanDay'
        : 'exercise';

    const order = [
        ...drag.list.querySelectorAll(
            `:scope > ${selector}`
        )
    ].map(element =>
        Number(element.dataset[attribute])
    );

    const changed = order.some(
        (oldIndex, newIndex) => oldIndex !== newIndex
    );

    if (changed) {
        if (drag.isDay) {

            // Reordenar días
            const original = [...state.planDays];

            const selectedDay =
                original[state.selectedPlanDayIndex];

            state.planDays = order.map(
                index => original[index]
            );

            // Mantener seleccionado el mismo día
            state.selectedPlanDayIndex =
                state.planDays.indexOf(selectedDay);

        } else {

            // Reordenar ejercicios del día
            const day =
                state.planDays[drag.dayIndex];

            const original = [...day.exercises];

            day.exercises = order.map(
                index => original[index]
            );
        }

        toast(
            'Orden actualizado. Pulsa «Guardar plan» para conservarlo.'
        );
    }

    // Actualizar la interfaz
    renderPlanMode();
}


// Cancelar el arrastre
function cancelPlanDrag(event) {
    if (
        !planDragState ||
        event.pointerId !== planDragState.pointerId
    ) return;

    cleanupPlanDrag();

    renderPlanMode();
}


// Evitar clics accidentales después de arrastrar
function suppressClickAfterPlanDrag(event) {
    if (
        performance.now() >=
        suppressPlanDragClickUntil
    ) return;

    if (!event.target.closest(
        '.plan-day-tab, .exercise-editor'
    )) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    suppressPlanDragClickUntil = 0;
}


function planStepper(field, value, min, suffix, label) {
    return `<div class="plan-stepper" data-plan-stepper><button type="button" data-step-field="${field}" data-step="-1" aria-label="Reducir ${label}">−</button><input data-exercise-${field} type="number" min="${min}" value="${Number(value)}" aria-label="${label}"><span>${suffix}</span><button type="button" data-step-field="${field}" data-step="1" aria-label="Aumentar ${label}">＋</button></div>`;
}

function exerciseEditor(exercise, index) {
    const variant = state.variants.find(item => item.code === exercise.exerciseVariantCode);
    const base = state.exercises.find(item => item.code === variant?.exerciseCode);
    const title = variant ? FitCoreVariantUI.variantTitle(base, variant) : base?.name || 'Selecciona un ejercicio';
    const details = variant
        ? variantConfigurationChips(variant).slice(0, 4).join(' · ')
        : 'Elige una configuración del catálogo';
    const thumb = base ? exerciseThumb(base, 'plan-exercise-thumb') : '<span class="plan-exercise-thumb thumb-placeholder">FC</span>';
    const menuId = `plan-exercise-actions-${state.selectedPlanDayIndex}-${index}`;
    return `<div class="exercise-editor" data-exercise="${index}">

<div class="plan-order-controls" aria-label="Reordenar ejercicio">
    <span
        class="plan-exercise-grip"
        aria-hidden="true"
        title="Arrastrar para ordenar ejercicios">
        ⠿
    </span>
<button type="button" data-move="-1" aria-label="Subir ejercicio">↑</button><button type="button" data-move="1" aria-label="Bajar ejercicio">↓</button></div>
        <div class="plan-exercise-identity">${thumb}<div><input data-exercise-code type="hidden" value="${escapeHtml(exercise.exerciseVariantCode || '')}"><strong class="plan-exercise-name">${escapeHtml(title)}</strong><small>${escapeHtml(details)}</small></div></div>
        ${planStepper('sets', exercise.sets || 3, 1, '', 'series')}
        ${planStepper('reps', exercise.reps || 10, 1, '', 'repeticiones')}
        ${planStepper('rest', exercise.restSeconds ?? 90, 0, 's', 'segundos de descanso')}
        <div class="plan-row-menu">
            <button class="plan-row-actions" type="button" data-plan-row-menu-toggle aria-haspopup="menu" aria-expanded="false" aria-controls="${menuId}" aria-label="Acciones para ${escapeHtml(title)}">•••</button>
            <div class="plan-row-action-menu" id="${menuId}" role="menu" hidden>
                <button type="button" role="menuitem" data-plan-exercise-action="replace"><span aria-hidden="true">⇄</span><span><strong>Intercambiar ejercicio</strong><small>Elegir otro ejercicio del catálogo</small></span></button>
                <button type="button" role="menuitem" data-plan-exercise-action="configure"><span aria-hidden="true">⚙</span><span><strong>Modificar configuración</strong><small>Cambiar agarre, material o apertura</small></span></button>
                <button type="button" role="menuitem" class="is-danger" data-plan-exercise-action="delete"><span aria-hidden="true">×</span><span><strong>Eliminar ejercicio</strong><small>Quitar del día de entrenamiento</small></span></button>
            </div>
        </div>
    </div>`;
}

function closePlanRowMenus({restoreFocus = false} = {}) {
    document.querySelectorAll('.plan-row-action-menu:not([hidden])').forEach(menu => {
        menu.hidden = true;
        menu.removeAttribute('style');
        const trigger = menu.closest('.plan-row-menu')?.querySelector('[data-plan-row-menu-toggle]');
        trigger?.setAttribute('aria-expanded', 'false');
        if (restoreFocus) trigger?.focus();
    });
}

function togglePlanRowMenu(button) {
    const menu = button.closest('.plan-row-menu')?.querySelector('.plan-row-action-menu');
    if (!menu) return;

    const shouldOpen = menu.hidden;
    closePlanRowMenus();
    if (!shouldOpen) return;

    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');

    const triggerRect = button.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const left = Math.max(12, Math.min(window.innerWidth - menuRect.width - 12, triggerRect.right - menuRect.width));
    const fitsBelow = triggerRect.bottom + menuRect.height + 10 <= window.innerHeight;
    const top = fitsBelow
        ? triggerRect.bottom + 7
        : Math.max(12, triggerRect.top - menuRect.height - 7);

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.querySelector('[role="menuitem"]')?.focus();
}

function configurationFromVariant(variant) {
    if (!variant) return {};
    const configuration = {variantCode: variant.code};
    variantConfigFields.forEach(field => {
        if (variant[field.key] != null) configuration[field.key] = variant[field.key];
    });
    return configuration;
}

async function removePlanExercise(dayIndex, exerciseIndex) {
    syncPlanEditor();
    const day = state.planDays[dayIndex];
    const exercise = day?.exercises[exerciseIndex];
    if (!exercise) return;

    const variant = state.variants.find(item => item.code === exercise.exerciseVariantCode);
    const confirmed = await confirmAction(
        'Eliminar ejercicio',
        `¿Quieres quitar «${variant?.name || 'este ejercicio'}» del día?`
    );
    if (!confirmed) return;

    day.exercises.splice(exerciseIndex, 1);
    state.selectedPlanDayIndex = dayIndex;
    renderPlanMode();
    toast('Ejercicio eliminado del borrador. Guarda el plan para conservar el cambio.');
}

function syncPlanEditor() {
    const card = document.querySelector('.plan-day-editor');
    if (!card) return;
    const day = state.planDays[Number(card.dataset.day)];
    if (!day) return;
    card.querySelectorAll('.exercise-editor').forEach(row => {
        const exercise = day.exercises[Number(row.dataset.exercise)];
        if (!exercise) return;
        exercise.exerciseVariantCode = row.querySelector('[data-exercise-code]').value.trim();
        exercise.sets = Number(row.querySelector('[data-exercise-sets]').value);
        exercise.reps = Number(row.querySelector('[data-exercise-reps]').value);
        exercise.restSeconds = Number(row.querySelector('[data-exercise-rest]').value);
    });
}


/* ==========================================
   FITCORE - CONFIGURACIÓN DE DÍAS
   ========================================== */

// Abrir la configuración del día seleccionado
function openPlanEditDayDialog() {
    syncPlanEditor();

    const day =
        state.planDays[state.selectedPlanDayIndex];

    if (!day) return;

    $('plan-edit-day-number').textContent =
        `DÍA ${state.selectedPlanDayIndex + 1}`;

    $('plan-edit-day-name').value = day.name || '';

    // Crear las opciones visuales con sus iconos SVG
    $('plan-edit-day-types').innerHTML =
        enums.dayTypes.map(type => `

            <label class="plan-edit-type-card">

                <input
                    type="radio"
                    name="plan-edit-day-type"
                    value="${type}"
                    ${day.dayType === type ? 'checked' : ''}>

                <span class="plan-edit-type-content">
                    ${planDayIcon(type)}

                    <span>
                        ${escapeHtml(friendly(type))}
                    </span>
                </span>

            </label>

        `).join('');

    // Deshabilitar movimientos imposibles
    $('plan-edit-move-up').disabled =
        state.selectedPlanDayIndex === 0;

    $('plan-edit-move-down').disabled =
        state.selectedPlanDayIndex ===
        state.planDays.length - 1;

    $('plan-edit-day-dialog').showModal();
}


// Aplicar los valores al borrador del plan
function applyPlanEditDraft() {
    const day =
        state.planDays[state.selectedPlanDayIndex];

    if (!day) return false;

    const nameInput = $('plan-edit-day-name');

    const typeInput = document.querySelector(
        'input[name="plan-edit-day-type"]:checked'
    );

    if (!nameInput.value.trim()) {
        nameInput.setCustomValidity(
            'Introduce un nombre para el día.'
        );

        nameInput.reportValidity();
        nameInput.setCustomValidity('');

        return false;
    }

    if (
        !typeInput ||
        !enums.dayTypes.includes(typeInput.value)
    ) {
        toast(
            'Selecciona el tipo de entrenamiento.',
            true
        );
        return false;
    }

    day.name = nameInput.value.trim();
    day.dayType = typeInput.value;

    return true;
}


// Aplicar los cambios del formulario
function savePlanEditDay(event) {
    event.preventDefault();

    if (!applyPlanEditDraft()) return;

    $('plan-edit-day-dialog').close();

    renderPlanMode();

    toast(
        'Día actualizado en el borrador. ' +
        'Guarda el plan para conservar los cambios.'
    );
}


// Duplicar el día seleccionado
function duplicateSelectedPlanDay() {
    if (!applyPlanEditDraft()) return;

    const day =
        state.planDays[state.selectedPlanDayIndex];

    const copy = {
        name: `${day.name} (copia)`,
        dayType: day.dayType,

        // Copiar los ejercicios sin reutilizar
        // los identificadores de base de datos
        exercises: day.exercises.map(exercise => ({
            exerciseVariantCode:
            exercise.exerciseVariantCode,

            sets: exercise.sets,
            reps: exercise.reps,
            restSeconds: exercise.restSeconds
        }))
    };

    $('plan-edit-day-dialog').close();

    // La función existente selecciona
    // automáticamente el nuevo día
    addPlanDay(copy);

    toast(
        'Día duplicado. Guarda el plan cuando termines.'
    );
}


// Cambiar la posición del día
function moveSelectedPlanDay(direction) {
    if (!applyPlanEditDraft()) return;

    const from = state.selectedPlanDayIndex;
    const to = from + direction;

    if (to < 0 || to >= state.planDays.length) {
        return;
    }

    const [day] = state.planDays.splice(from, 1);

    state.planDays.splice(to, 0, day);

    // Mantener seleccionado el día trasladado
    state.selectedPlanDayIndex = to;

    $('plan-edit-day-dialog').close();

    renderPlanMode();

    toast('Orden actualizado en el borrador.');
}


// Eliminar un día con confirmación
async function deleteSelectedPlanDay() {
    const index = state.selectedPlanDayIndex;
    const day = state.planDays[index];

    if (!day) return;

    $('plan-edit-day-dialog').close();

    const confirmed = await confirmAction(
        'Eliminar día',
        `¿Eliminar «${day.name}» y sus ` +
        `${day.exercises.length} ejercicios ` +
        `del borrador del plan?`
    );

    if (!confirmed) return;

    state.planDays.splice(index, 1);

    state.selectedPlanDayIndex = Math.max(
        0,
        Math.min(index, state.planDays.length - 1)
    );

    renderPlanMode();

    toast(
        'Día eliminado del borrador. ' +
        'Guarda el plan para conservar el cambio.'
    );
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
        state.activePlan = plan; $('plan-name').value = plan.name; $('plan-description').value = plan.description || ''; $('plan-date').value = today();

        state.planDays = [...(plan.days || [])]
            .sort(
                (a, b) =>
                    (a.dayOrder ?? 0) -
                    (b.dayOrder ?? 0)
            )
            .map(day => ({
                id: day.id,
                name: day.name,
                dayType: day.dayType,

                exercises: [...(day.exercises || [])]
                    .sort(
                        (a, b) =>
                            (a.exerciseOrder ?? 0) -
                            (b.exerciseOrder ?? 0)
                    )
                    .map(exercise => ({
                        id: exercise.id,

                        exerciseVariantCode:
                        exercise.exerciseVariantCode,

                        sets: exercise.sets,
                        reps: exercise.reps,
                        restSeconds: exercise.restSeconds
                    }))
            }));

        state.selectedPlanDayIndex = 0; renderPlanMode(); fillSessionDays(); $('metric-plan').textContent = `v${plan.version}`;
        if (!silent) toast('Plan activo cargado.');
    } catch (error) {
        if (error.status === 404) { state.activePlan = null; state.planDays = []; addPlanDay(); renderPlanMode(); fillSessionDays(); $('metric-plan').textContent = 'Ninguno'; if (!silent) toast('Aún no existe un plan activo.'); }
        else if (!silent) toast(error.message, true);
    }
}


/* ========================================
   FITCORE - ANÁLISIS MUSCULAR DE PLANES
   ======================================== */

const planActivationCache = new Map();

let planMusclePreviewVersion = 0;
let planMuscleDialogVersion = 0;
let planMuscleScope = 'day';


// Obtener las activaciones de una variante
async function getPlanVariantActivations(code) {
    if (!code) {
        return { rows: [], failed: true };
    }

    if (!planActivationCache.has(code)) {
        const request = api(
            `/api/exercise-variants/` +
            `${encodeURIComponent(code)}/muscle-activations`
        )
            .then(rows => ({
                rows: Array.isArray(rows) ? rows : [],
                failed: false
            }))
            .catch(error => {
                planActivationCache.delete(code);
                console.warn(
                    'Activaciones del plan no disponibles:',
                    code, error
                );
                return { rows: [], failed: true };
            });

        planActivationCache.set(code, request);
    }

    return planActivationCache.get(code);
}


// Combinar los músculos de un día o de todo el plan
async function calculatePlanMuscles(
    scope = 'day',
    dayIndex = state.selectedPlanDayIndex
) {
    const days = scope === 'week'
        ? state.planDays
        : [state.planDays[dayIndex]].filter(Boolean);

    const exercises = days.flatMap(day =>
        (day.exercises || []).map(exercise => ({
            code: exercise.exerciseVariantCode,
            sets: Math.max(
                0,
                Number(exercise.sets) || 0
            )
        }))
    ).filter(exercise =>
        exercise.code && exercise.sets > 0
    );

    const responses = await Promise.all(
        exercises.map(exercise =>
            getPlanVariantActivations(exercise.code)
        )
    );

    const muscles = new Map();
    let failed = 0;

    exercises.forEach((exercise, index) => {
        const result = responses[index];

        if (result.failed) {
            failed++;
            return;
        }

        const perExercise = new Map();
        const priority = {
            PRIMARY: 2,
            SECONDARY: 1
        };

        // Evitar músculos duplicados en un ejercicio
        result.rows.forEach(item => {
            if (
                !muscleSvgMap[item.muscleCode] ||
                !priority[item.role]
            ) return;

            const previous = perExercise.get(
                item.muscleCode
            );

            if (
                !previous ||
                priority[item.role] >
                priority[previous.role]
            ) {
                perExercise.set(item.muscleCode, item);
            }
        });

        perExercise.forEach(item => {
            const previous = muscles.get(
                item.muscleCode
            ) || {
                code: item.muscleCode,
                name: item.muscleName ||
                    friendly(item.muscleCode),
                primarySets: 0,
                secondarySets: 0
            };

            if (item.role === 'PRIMARY') {
                previous.primarySets += exercise.sets;
            } else {
                previous.secondarySets += exercise.sets;
            }

            muscles.set(item.muscleCode, previous);
        });
    });

    const data = [...muscles.values()].map(item => ({
        ...item,

        estimatedSets:
            item.primarySets +
            item.secondarySets * 0.5,

        role: item.primarySets > 0
            ? 'PRIMARY'
            : 'SECONDARY'

    })).sort((a, b) =>
        b.estimatedSets - a.estimatedSets ||
        a.name.localeCompare(b.name, 'es')
    );

    return {
        data,
        failed,
        exerciseCount: exercises.length,
        plannedSets: exercises.reduce(
            (sum, item) => sum + item.sets,
            0
        )
    };
}


// Clonar el SVG original y colorear sus regiones
function makePlanMuscleSvg(result, scope) {
    if (!state.svg) return null;

    const svg = state.svg.cloneNode(true);

    svg.removeAttribute('width');
    svg.removeAttribute('height');

    svg.setAttribute(
        'preserveAspectRatio',
        'xMidYMid meet'
    );

    svg.removeAttribute('role');
    svg.setAttribute('aria-hidden', 'true');

    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.transform = 'none';
    svg.style.filter = 'none';

    // Limpiar los colores del Catálogo
    svg.querySelectorAll(
        '[data-fitcore-role], [data-plan-muscle-level]'
    ).forEach(node => {
        node.removeAttribute('data-fitcore-role');
        node.removeAttribute('data-plan-muscle-level');
    });

    const maxValue = Math.max(
        0,
        ...result.data.map(item => item.estimatedSets)
    );

    result.data.forEach(item => {
        const proportion = maxValue > 0
            ? item.estimatedSets / maxValue
            : 0;

        const level = proportion >= 0.67
            ? 'high'
            : proportion >= 0.34
                ? 'medium'
                : 'low';

        (muscleSvgMap[item.code] || []).forEach(id => {
            const node = svg.querySelector(
                `[id="${id}"]`
            );

            if (!node) return;

            if (scope === 'week') {
                node.dataset.planMuscleLevel = level;
            } else {
                node.dataset.fitcoreRole = item.role;
            }
        });
    });

    return svg;
}



/* ==========================================
   FITCORE - REDONDEAR FONDO SVG MINIATURA
   ========================================== */

let planMiniClipCounter = 0;

function roundPlanMuscleBackground(svg) {
    if (!svg?.isConnected) return;

    // Localizar la imagen anatómica incrustada
    const image = svg.querySelector('#layer1 image');

    if (!image) {
        console.warn(
            'FitCore: no se encontró la imagen base del SVG.'
        );
        return;
    }

    const SVG_NS = 'http://www.w3.org/2000/svg';

    let bounds;

    try {
        bounds = image.getBBox();
    } catch (error) {
        console.warn('No se pudo medir la imagen:', error);
        return;
    }

    if (bounds.width <= 0 || bounds.height <= 0) {
        return;
    }

    // Buscar o crear defs en este clon
    let defs = svg.querySelector(':scope > defs');

    if (!defs) {
        defs = document.createElementNS(SVG_NS, 'defs');
        svg.insertBefore(defs, svg.firstChild);
    }

    // Identificador único para evitar conflictos
    const clipId = `fitcore-plan-clip-${++planMiniClipCounter}`;

    const clipPath = document.createElementNS(
        SVG_NS,
        'clipPath'
    );

    clipPath.setAttribute('id', clipId);

    clipPath.setAttribute(
        'clipPathUnits',
        'userSpaceOnUse'
    );

    const rect = document.createElementNS(
        SVG_NS,
        'rect'
    );

    // Misma posición y dimensiones que la imagen
    rect.setAttribute('x', bounds.x);
    rect.setAttribute('y', bounds.y);

    rect.setAttribute('width', bounds.width);
    rect.setAttribute('height', bounds.height);

    // Redondeo proporcional al tamaño original
    const radius = Math.min(
        bounds.width,
        bounds.height
    ) * 0.085;

    rect.setAttribute('rx', radius);
    rect.setAttribute('ry', radius);

    clipPath.appendChild(rect);
    defs.appendChild(clipPath);

    // Recortar únicamente la imagen incrustada
    image.setAttribute(
        'clip-path',
        `url(#${clipId})`
    );
}



/* ENCUADRE AUTOMÁTICO DE LA MINIATURA */

function fitPlanDayMuscleSvg(svg, stage) {
    if (!svg?.isConnected || !stage?.isConnected || !svg.getScreenCTM()) {
        return;
    }

    const rootMatrix = svg.getScreenCTM();

    let inverse;

    try {
        inverse = rootMatrix.inverse();
    } catch (_) {
        return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Usar solo las regiones musculares reales
    const ids = new Set(
        Object.values(muscleSvgMap).flat()
    );

    for (const id of ids) {
        const node = svg.getElementById(id);

        if (!node?.getBBox || !node.getScreenCTM()) continue;

        let rect;
        let matrix;

        try {
            rect = node.getBBox();
            matrix = inverse.multiply(node.getScreenCTM());
        } catch (_) {
            continue;
        }

        if (!rect.width || !rect.height) continue;

        const points = [
            [rect.x, rect.y],
            [rect.x + rect.width, rect.y],
            [rect.x, rect.y + rect.height],
            [rect.x + rect.width, rect.y + rect.height]
        ];

        for (const [x, y] of points) {
            const point = new DOMPoint(x, y).matrixTransform(matrix);

            if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;

            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
    }

    if (![minX, minY, maxX, maxY].every(Number.isFinite)) {
        return;
    }

    let bodyWidth = maxX - minX;
    let bodyHeight = maxY - minY;

    if (bodyWidth <= 0 || bodyHeight <= 0) return;

// Márgenes ajustados para que no se corte la cabeza
// ni los pies, ya que el cálculo parte solo de músculos.
    let padX = bodyWidth * 0.05;
    let padTop = bodyHeight * 0.16;
    let padBottom = bodyHeight * 0.09;

    let viewX = minX - padX;
    let viewY = minY - padTop;
    let viewWidth = bodyWidth + padX * 2;
    let viewHeight = bodyHeight + padTop + padBottom;

    // Ajustar el viewBox al ratio del contenedor
    const stageRect = stage.getBoundingClientRect();
    const stageRatio =
        stageRect.width > 0 && stageRect.height > 0
            ? stageRect.width / stageRect.height
            : viewWidth / viewHeight;

    const viewRatio = viewWidth / viewHeight;

    if (viewRatio > stageRatio) {
        // El cuerpo es relativamente más ancho:
        // ampliar altura para llenar mejor el contenedor
        const targetHeight = viewWidth / stageRatio;
        const extraHeight = targetHeight - viewHeight;

        viewY -= extraHeight / 2;
        viewHeight = targetHeight;
    } else {
        // El cuerpo es relativamente más alto:
        // ampliar anchura para llenar mejor el contenedor
        const targetWidth = viewHeight * stageRatio;
        const extraWidth = targetWidth - viewWidth;

        viewX -= extraWidth / 2;
        viewWidth = targetWidth;
    }

    svg.setAttribute(
        'viewBox',
        [viewX, viewY, viewWidth, viewHeight].join(' ')
    );

    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
}




async function renderPlanMusclePreview() {
    const version = ++planMusclePreviewVersion;

    const stage = $('plan-day-muscle-mini');
    const caption = $('plan-day-muscle-caption');
    const list = $('plan-day-muscle-list');

    if (!stage || !caption || !list) return;

    if (!state.svg) {
        caption.textContent = 'Cargando mapa…';
        list.textContent = 'Preparando anatomía…';
        return;
    }

    const selectedIndex = state.selectedPlanDayIndex;

    const result = await calculatePlanMuscles(
        'day',
        selectedIndex
    );

    if (
        version !== planMusclePreviewVersion ||
        !stage.isConnected
    ) return;

    // Mantener el SVG original con sus activaciones
    const svg = makePlanMuscleSvg(result, 'day');



    if (svg) {
        stage.replaceChildren(svg);

        requestAnimationFrame(() => {
            if (
                stage.isConnected &&
                stage.contains(svg)
            ) {
                // 1. Encuadrar y centrar el cuerpo
                fitPlanDayMuscleSvg(svg, stage);

                // 2. Redondear el fondo interno
                roundPlanMuscleBackground(svg);
            }
        });
    }



    // Mostrar los 3 músculos más relevantes
    const topMuscles = result.data.slice(0, 3);

    list.innerHTML = topMuscles.length
        ? topMuscles.map(muscle => `
            <span class="plan-day-muscle-row">
                <i
                    class="plan-day-muscle-dot"
                    aria-hidden="true">
                </i>

                <span title="${escapeHtml(muscle.name)}">
                    ${escapeHtml(muscle.name)}
                </span>
            </span>
        `).join('')
        : `
            <span class="plan-day-muscle-empty">
                Añade ejercicios para ver los músculos
            </span>
        `;

    caption.textContent = result.failed
        ? `${result.data.length} músculos · datos parciales`
        : `${result.data.length} músculos previstos`;
}




/* ========================================
   VENTANA DE ANÁLISIS MUSCULAR
   ======================================== */

function openPlanMuscleDialog(scope = 'day') {
    syncPlanEditor();

    planMuscleScope = scope;

    const selector = $('plan-muscle-day-select');

    selector.replaceChildren(
        ...state.planDays.map((day, index) =>
            new Option(
                `Día ${index + 1} · ${day.name}`,
                String(index)
            )
        )
    );

    selector.value = String(
        Math.min(
            state.selectedPlanDayIndex,
            Math.max(state.planDays.length - 1, 0)
        )
    );

    $('plan-muscle-dialog').showModal();

    void renderPlanMuscleDialog();
}


async function renderPlanMuscleDialog() {
    const version = ++planMuscleDialogVersion;

    const scope = planMuscleScope;

    const index = Number(
        $('plan-muscle-day-select').value || 0
    );

    const dialog = $('plan-muscle-dialog');

    if (!dialog.open) return;

    dialog.querySelectorAll(
        '[data-plan-muscle-scope]'
    ).forEach(button => {
        button.setAttribute(
            'aria-pressed',
            String(
                button.dataset.planMuscleScope === scope
            )
        );
    });

    $('plan-muscle-day-picker').hidden =
        scope === 'week';

    $('plan-muscle-analysis-title').textContent =
        scope === 'week'
            ? 'Distribución de la semana del plan'
            : `Distribución del día ${index + 1}`;

    $('plan-muscle-analysis-list').textContent =
        'Calculando músculos previstos…';

    const result = await calculatePlanMuscles(
        scope,
        index
    );

    if (
        version !== planMuscleDialogVersion ||
        !dialog.open
    ) return;

    const svg = makePlanMuscleSvg(result, scope);

    if (svg) {
        $('plan-muscle-map').replaceChildren(svg);
    } else {
        $('plan-muscle-map').textContent =
            'No se pudo cargar el mapa anatómico.';
    }

    $('plan-muscle-analysis-summary').textContent =
        `${result.exerciseCount} ejercicios · ` +
        `${result.plannedSets} series programadas · ` +
        `${result.data.length} músculos identificados` +
        (result.failed
            ? ` · ${result.failed} ejercicios sin datos`
            : '');

    $('plan-muscle-legend').innerHTML =
        scope === 'week'
            ? `<span><i class="low"></i>Baja</span>
               <span><i class="medium"></i>Media</span>
               <span><i class="high"></i>Alta</span>
               <small>Participación relativa</small>`
            : `<span><i class="primary"></i>Principal</span>
               <span><i class="secondary"></i>Secundario</span>`;

    const list = $('plan-muscle-analysis-list');

    if (!result.data.length) {
        list.innerHTML = `
            <p class="plan-muscle-empty">
                Añade ejercicios al plan para visualizar
                los músculos previstos.
            </p>`;
        return;
    }

    const max = Math.max(
        ...result.data.map(item => item.estimatedSets)
    );

    list.innerHTML = result.data.map(item => `
        <div class="plan-muscle-item">

            <div class="plan-muscle-item-top">
                <strong>${escapeHtml(item.name)}</strong>

                <span>
                    ${formatNumber(item.estimatedSets)}
                    series eq.
                </span>
            </div>

            <div class="plan-muscle-track">
                <i style="width:${
        Math.round(
            item.estimatedSets / max * 100
        )
    }%"></i>
            </div>

            <small>
                ${item.primarySets} principales ·
                ${item.secondarySets} secundarias
            </small>

        </div>
    `).join('');
}



function renderPlanMode() {
    const box = $('plan-version'); if (!box) return;
    box.innerHTML = state.activePlan ? `<span>Modo revisión</span><strong>Versión ${state.activePlan.version}</strong><small>Al guardar se creará la versión ${state.activePlan.version + 1}</small>` : '<span>Modo</span><strong>Nuevo plan</strong><small>Se creará la versión 1</small>';
    renderPlanDays();
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

    const {selectedVariant} =
        resolveVariantForExercise(
            state.sessionPicker.exercise,
            state.sessionPicker.configuration
        );

    if (!selectedVariant) {
        return toast(
            'Selecciona un ejercicio y su configuración.',
            true
        );
    }

    // ===================================
    // MODO PLANES
    // ===================================

    if (state.pickerMode === 'plan') {

        const day =
            state.planDays[state.planPickerDayIndex];

        if (!day) {
            return toast(
                'No se ha encontrado el día del plan.',
                true
            );
        }

        if (state.planPickerAction === 'replace') {
            const exercise = day.exercises[state.planPickerExerciseIndex];
            if (!exercise) {
                return toast('No se ha encontrado el ejercicio que quieres modificar.', true);
            }

            exercise.exerciseVariantCode = selectedVariant.code;

            $('exercise-picker-dialog').close();
            state.sessionPicker = {exercise: null, configuration: {}};
            state.selectedPlanDayIndex = state.planPickerDayIndex;

            state.planPickerAction = 'add';
            state.planPickerExerciseIndex = null;
            state.planPickerExerciseCode = null;
            renderPlanMode();
            toast('Ejercicio intercambiado. Se han conservado sus objetivos de series, repeticiones y descanso. Guarda el plan para conservar el cambio.');
            return;
        }

        const readPositiveInteger = (id, minimum) => {
            const input = $(id);
            const value = Number(input.value);

            if (
                !input.checkValidity() ||
                !Number.isSafeInteger(value) ||
                value < minimum
            ) {
                throw new Error(
                    'Revisa los valores de series, repeticiones y descanso.'
                );
            }

            return value;
        };

        let sets;
        let reps;
        let restSeconds;

        try {
            sets = readPositiveInteger(
                'plan-picker-sets', 1
            );

            reps = readPositiveInteger(
                'plan-picker-reps', 1
            );

            restSeconds = readPositiveInteger(
                'plan-picker-rest', 0
            );

        } catch (error) {
            return toast(error.message, true);
        }

        // Añadir al borrador del plan
        day.exercises.push({
            exerciseVariantCode: selectedVariant.code,
            sets,
            reps,
            restSeconds
        });

        $('exercise-picker-dialog').close();

        state.sessionPicker = {
            exercise: null,
            configuration: {}
        };

        state.selectedPlanDayIndex =
            state.planPickerDayIndex;

        renderPlanMode();

        toast(
            'Ejercicio añadido al día. Guarda el plan cuando termines.'
        );

        return;
    }

    // ===================================
    // MODO ENTRENAMIENTO
    // ===================================

    if (!state.currentSession) return;

    try {
        await api(
            `/api/users/${state.auth.userId}` +
            `/workout-sessions/${state.currentSession.id}/exercises`,
            {
                method: 'POST',
                body: JSON.stringify({
                    workoutExerciseId: null,
                    exerciseVariantCode: selectedVariant.code,
                    completed: false,
                    performedSets: 0,
                    performedReps: 0,
                    performedWeightKg: null,
                    performedDurationMinutes: null,
                    estimatedCaloriesBurned: null,
                    notes: null
                })
            }
        );

        $('exercise-picker-dialog').close();

        state.sessionPicker = {
            exercise: null,
            configuration: {}
        };

        await loadSessionExercises();

        toast('Ejercicio añadido al entrenamiento.');

    } catch (error) {
        toast(error.message, true);
    }
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



async function openExercisePicker(mode = 'session', options = {}) {

    const action = mode === 'plan' ? (options.action || 'add') : 'add';
    const exerciseIndex = Number.isInteger(options.exerciseIndex)
        ? options.exerciseIndex
        : null;

    if (mode === 'session' && !state.currentSession) {
        return;
    }

    if (mode === 'plan') {
        syncPlanEditor();

        if (!state.planDays[state.selectedPlanDayIndex]) {
            return;
        }
    }

    try {
        if (!state.exercises.length || !state.variants.length) {
            [state.exercises, state.variants] =
                await Promise.all([
                    api('/api/exercises'),
                    api('/api/exercise-variants')
                ]);
        }

        // Distinguir el destino del ejercicio
        state.pickerMode = mode;
        state.planPickerAction = action;

        state.planPickerDayIndex =
            mode === 'plan'
                ? state.selectedPlanDayIndex
                : null;

        state.planPickerExerciseIndex =
            mode === 'plan' ? exerciseIndex : null;

        const planExercise =
            mode === 'plan' && exerciseIndex != null
                ? state.planDays[state.planPickerDayIndex]?.exercises[exerciseIndex]
                : null;

        if (mode === 'plan' && action !== 'add' && !planExercise) {
            return toast('No se ha encontrado el ejercicio del plan.', true);
        }

        const currentVariant = planExercise
            ? state.variants.find(variant => variant.code === planExercise.exerciseVariantCode)
            : null;

        const currentExercise = currentVariant
            ? state.exercises.find(exercise => exercise.code === currentVariant.exerciseCode)
            : null;

        state.planPickerExerciseCode = null;
        state.pickerConfigOpen = false;
        state.pickerConfigMoreOpen = false;
        state.pickerDraft = null;
        state.pickerGroupCodes = null;

        state.sessionPicker = {
            exercise: action === 'add' ? null : currentExercise || null,
            configuration: action === 'add' ? {} : configurationFromVariant(currentVariant)
        };

        // Reiniciar filtros
        $('session-exercise-query').value = '';
        $('session-exercise-equipment').value = '';
        $('session-exercise-muscle').value = '';

        // Adaptar la ventana
        const pickerCopy = mode !== 'plan'
            ? {
                eyebrow: 'AÑADIR AL ENTRENAMIENTO',
                title: 'Elige un ejercicio',
                description: 'Elige el ejercicio y configura el material, agarre y demás variantes.',
                action: 'Añadir al entrenamiento'
            }
            : action === 'replace'
                ? {
                    eyebrow: 'INTERCAMBIAR EJERCICIO',
                    title: 'Elige el sustituto',
                    description: 'Selecciona un ejercicio o busca una variante concreta. Podrás ajustarla en Configurar y conservar las series, repeticiones y el descanso.',
                    action: 'Intercambiar ejercicio'
                }
                : {
                        eyebrow: 'AÑADIR AL PLAN',
                        title: 'Elige un ejercicio',
                        description: 'Elige un ejercicio y ajusta su configuración. Si buscas una variante concreta, quedará preseleccionada.',
                        action: 'Añadir al día'
                    };

        $('exercise-picker-eyebrow').textContent = pickerCopy.eyebrow;
        $('exercise-picker-title').textContent = pickerCopy.title;
        $('exercise-picker-description').textContent = pickerCopy.description;
        $('session-add-exercise').textContent = pickerCopy.action;

        // Campos exclusivos de Planes
        $('plan-picker-fields').hidden =
            mode !== 'plan' || action !== 'add';

        // Valores iniciales de planificación
        $('plan-picker-sets').value = '3';
        $('plan-picker-reps').value = '10';
        $('plan-picker-rest').value = '90';

        renderSessionExerciseResults();
        renderSessionExerciseConfig();

        $('exercise-picker-dialog').showModal();
        $('session-exercise-query').focus();

    } catch (error) {
        toast(error.message, true);
    }
}


// Normaliza tildes y signos para que las búsquedas sean tolerantes a variaciones.
function normalizeExerciseSearchText(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

const equipmentSearchAliases = {
    SMITH_MACHINE: 'smith multipower maquina guiada',
    MACHINE_SELECTORISED: 'maquina selectorizada placas',
    MACHINE_PLATE_LOADED: 'maquina discos',
    DUMBBELL: 'mancuerna mancuernas',
    BARBELL: 'barra olimpica',
    CABLE: 'polea cable'
};

function matchesExerciseSearch(text, tokens) {
    const normalized = normalizeExerciseSearchText(text);
    return tokens.every(token => normalized.includes(token));
}

function filteredSessionExercises() {
    return FitCoreExerciseSearch.search({
        exercises: state.exercises,
        variants: state.variants,
        query: $('session-exercise-query')?.value || '',
        equipment: $('session-exercise-equipment')?.value || '',
        muscle: $('session-exercise-muscle')?.value || '',
        friendly
    });
}

function exerciseThumb(exercise, cssClass = 'exercise-thumb') {
    const variants = state.variants.filter(variant => variant.exerciseCode === exercise?.code);
    const representative = variants.find(variant => variant.thumbnailUrl || variant.imageUrl) || variants[0];
    const image = representative?.thumbnailUrl || representative?.imageUrl;
    return image ? `<img class="${cssClass}" src="${escapeHtml(image)}" alt="${escapeHtml(representative.imageAltText || exercise.name)}">` : `<span class="${cssClass} thumb-placeholder">${escapeHtml((exercise?.name || 'FC').slice(0,2).toUpperCase())}</span>`;
}

function renderSessionExerciseResults() {
    const preserveConfiguredSelection = arguments[0] === true;
    const container = $('session-exercise-results');
    if (!container) return;
    const results = filteredSessionExercises();
    const currentExerciseCode = state.sessionPicker.exercise?.code;
    const currentVariantCode = state.sessionPicker.configuration?.variantCode;

    // Si cambian los filtros y la elección ya no coincide, no permitimos
    // registrar una variante de otra búsqueda por accidente.
    const selectionVisible = !currentExerciseCode ||
        results.some(({exercise, matchingCodes, variantCodes}) =>
            exercise.code === currentExerciseCode &&
            (!currentVariantCode || (preserveConfiguredSelection
                ? variantCodes : (matchingCodes || variantCodes)).includes(currentVariantCode))
        );
    if (!selectionVisible) {
        state.sessionPicker = {exercise: null, configuration: {}};
        state.pickerConfigOpen = false;
        state.pickerConfigMoreOpen = false;
        state.pickerDraft = null;
        state.pickerGroupCodes = null;
        renderSessionExerciseConfig();
    }

    $('session-exercise-count').textContent =
        `${results.length} resultado${results.length === 1 ? '' : 's'}`;
    container.innerHTML = results.length
        ? results.map(({exercise, variant, variantCodes, title, detail}) => {
            const selected = state.sessionPicker.exercise?.code === exercise.code &&
                (!state.sessionPicker.configuration?.variantCode ||
                 variantCodes.includes(state.sessionPicker.configuration.variantCode));
            const chosen = variant
                ? ` data-session-variant-code="${escapeHtml(variant.code)}"`
                : '';
            return `<button type="button" class="picker-exercise ${selected ? 'is-selected' : ''}"
                aria-pressed="${selected ? 'true' : 'false'}"
                data-session-exercise-code="${escapeHtml(exercise.code)}"${chosen}>
                ${exerciseThumb(exercise)}
                <span><strong>${escapeHtml(title || exercise.name)}</strong>
                <small>${escapeHtml(detail || friendly(exercise.mainMuscleGroup))}</small></span>
                <i aria-hidden="true">›</i></button>`;
        }).join('')
        : '<div class="empty-state">No hay ejercicios con estos filtros.</div>';
}

function requestedPickerPosition() {
    const q = normalizeExerciseSearchText($('session-exercise-query')?.value || '');
    if (/\bde pie\b/.test(q)) return 'STANDING';
    if (/\bsentad[oa]s?\b/.test(q)) return 'SEATED';
    return 'UNSPECIFIED';
}

function pickerPositionOptions(exercise, variants, configuration, attribute) {
    if (!FitCoreVariantUI.hasOptionalPosition(exercise, variants)) return '';
    const chosen = configuration._positionPreference || 'UNSPECIFIED';
    return `<label>Posición corporal
        <select ${attribute} aria-label="Posición corporal">
            <option value="UNSPECIFIED" ${chosen === 'UNSPECIFIED' ? 'selected' : ''}>Sin especificar</option>
            <option value="STANDING" ${chosen === 'STANDING' ? 'selected' : ''}>De pie</option>
            <option value="SEATED" ${chosen === 'SEATED' ? 'selected' : ''}>Sentado</option>
        </select></label>`;
}

// Preferencia de interfaz: nunca se crea una variante ni posición física ficticia.
function selectPickerPosition(exercise, variants, configuration, preference) {
    if (!['UNSPECIFIED','STANDING','SEATED'].includes(preference)) return configuration;
    if (preference === 'UNSPECIFIED') return {...configuration, _positionPreference:preference};
    const current = variants.find(v => v.code === configuration.variantCode);
    const candidates = variants.filter(v => v.bodyPosition === preference);
    if (!candidates.length) return configuration;
    const sameEquipment = candidates.filter(v => v.equipment === current?.equipment);
    const next = FitCoreExerciseSearch.preferred(sameEquipment.length ? sameEquipment : candidates);
    return {...configurationFromVariant(next), _positionPreference:preference};
}

function pickerVariantTitle(exercise, variant, configuration = {}) {
    return FitCoreVariantUI.variantTitle(exercise, variant, {
        showPosition: ['STANDING','SEATED'].includes(configuration._positionPreference)
    });
}
function renderSessionExerciseConfig() {
    const container = $('session-exercise-config'); const exercise = state.sessionPicker.exercise;
    if (!exercise) {
        const copy = state.pickerMode === 'plan'
            ? 'Selecciona un ejercicio. FitCore elegirá una configuración válida que podrás ajustar más adelante.'
            : 'Selecciona un ejercicio para configurar cómo vas a realizarlo.';
        container.innerHTML = `<div class="empty-state">${copy}</div>`;
        $('session-add-exercise').disabled = true;
        return;
    }

    if (state.pickerMode === 'plan') {
        renderPlanSimpleExerciseConfig(container, exercise);
        return;
    }

    const {controls, selectedVariant} = resolveVariantForExercise(exercise, state.sessionPicker.configuration);
    const optionalPositionField = pickerPositionOptions(exercise,
        availablePickerVariants(exercise), state.sessionPicker.configuration, 'data-session-position');
    const pickerTitle = pickerVariantTitle(exercise, selectedVariant, state.sessionPicker.configuration);
    const visibleControls = controls.filter(control =>
        !(optionalPositionField && control.key === 'bodyPosition') &&
        (control.values.length > 1 || ['equipment','attachmentType'].includes(control.key)));
    const fields = visibleControls.map(control => `<label>${control.label}<select data-session-variant-config="${control.key}" ${control.values.length === 1 ? 'disabled':''}>${control.values.map(value => `<option value="${value}" ${value === control.selected ? 'selected':''}>${variantValue(control.key, value)}</option>`).join('')}</select></label>`).join('');
    container.innerHTML = `<div class="picker-selected">${exerciseThumb(exercise, 'picker-selected-thumb')}<div><p class="eyebrow">CONFIGURACIÓN</p><h3>${escapeHtml(pickerTitle)}</h3><small>${escapeHtml(exercise.description || 'Concreta la ejecución para esta sesión.')}</small></div></div><div class="picker-variant-fields">${optionalPositionField}${fields}</div>${selectedVariant ? `<div class="resolved-variant"><span>Variante que se registrará</span><strong>${escapeHtml(pickerTitle)}</strong><small>${escapeHtml(localizeText(selectedVariant.focusDescription || 'Configuración válida para este ejercicio.'))}</small></div>` : ''}`;
    $('session-add-exercise').disabled = !selectedVariant;
}

// Mismos campos y misma resolución de variantes antes y después de añadir.
// Las opciones se derivan de variantes reales; no se fabrican combinaciones.
function renderVariantConfiguratorFields(controls, candidates, selectedVariant, options = {}) {
    const {
        fieldAttribute = 'data-picker-variant-field',
        exactAttribute = 'data-picker-variant-code',
        moreAttribute = 'data-picker-more',
        moreOpen = false,
        allVariants = null,
        extraTechnicalFields = []
    } = options;
    const editable = controls.filter(control =>
        !(options.hideBodyPosition && control.key === 'bodyPosition') &&
        control.values.filter(value => !(control.empty || []).includes(value)).length >= 2
    );
    const primary = editable.filter(control => planPrimaryVariantKeys.has(control.key));
    const additional = editable.filter(control => !planPrimaryVariantKeys.has(control.key));
    // Ajustes específicos del UI (p. ej. «Sin especificar / De pie /
    // Sentado») también pertenecen al desplegable técnico.
    const extraFields = extraTechnicalFields.filter(Boolean);
    const additionalCount = additional.length + extraFields.length;
    // Algunas variantes (p. ej. fondos inclinados/verticales) no difieren
    // por campos configurables. Mostrar entonces la elección por ejecución,
    // aunque el resolvedor haya reducido candidates a una sola variante.
    const needsExecutionChoice = !editable.length && Array.isArray(allVariants) && allVariants.length > 1;
    const variantChoices = needsExecutionChoice ? allVariants : candidates;
    const fieldHtml = control => `<label>${escapeHtml(control.label)}
        <select ${fieldAttribute}="${escapeHtml(control.key)}" aria-label="${escapeHtml(control.label)}">
            ${control.values.map(value => `<option value="${escapeHtml(value)}"
                ${value === control.selected ? 'selected' : ''}>${escapeHtml(variantValue(control.key, value))}</option>`).join('')}
        </select></label>`;
    return `
        ${primary.length ? primary.map(fieldHtml).join('') : ''}
        ${additionalCount ? `<details class="plan-advanced-more" ${moreAttribute} ${moreOpen ? 'open' : ''}>
            <summary>Más ajustes técnicos <small>(${additionalCount})</small></summary>
            <p>Opciones adicionales disponibles en el catálogo.</p>
            <div class="plan-advanced-extra-fields">${extraFields.join('')}${additional.map(fieldHtml).join('')}</div>
        </details>` : ''}
        ${variantChoices.length > 1 ? `<label class="plan-advanced-exact-choice">${needsExecutionChoice ? 'Tipo de ejecución' : 'Variante concreta'}
            <select ${exactAttribute} aria-label="${needsExecutionChoice ? 'Tipo de ejecución' : 'Variante concreta'}">
                ${variantChoices.map(variant => `<option value="${escapeHtml(variant.code)}"
                    ${variant.code === selectedVariant?.code ? 'selected' : ''}>${escapeHtml(variant.name)}</option>`).join('')}
            </select></label>` : ''}
    `;
}

function availablePickerVariants(exercise) {
    const all = orderedVariantsForExercise(exercise).filter(variant => variant.active !== false);
    return all;
}

function renderPlanSimpleExerciseConfig(container, exercise) {
    const variants = availablePickerVariants(exercise);
    const requested = state.sessionPicker.configuration?.variantCode;
    const selected = variants.find(variant => variant.code === requested)
        || variants.find(variant => variant.isDefault || variant.defaultVariant || variant.default)
        || variants[0];
    if (!selected) {
        container.innerHTML = '<div class="empty-state">Este ejercicio no tiene configuraciones disponibles.</div>';
        $('session-add-exercise').disabled = true;
        return;
    }
    const preference = state.sessionPicker.configuration?._positionPreference || 'UNSPECIFIED';
    state.sessionPicker.configuration = {...configurationFromVariant(selected), _positionPreference:preference};
    const title = pickerVariantTitle(exercise, selected, state.sessionPicker.configuration);
    const chips = variantConfigurationChips(selected, {
        hideBodyPosition: preference === 'UNSPECIFIED' &&
            FitCoreVariantUI.optionalPosition(exercise, selected)
    }).slice(0, 4);
    // La posición se ajusta exclusivamente desde «Configurar».
    const canConfigure = variants.length > 1;
    const button = canConfigure ? `<button type="button" class="picker-config-toggle"
        data-picker-toggle-config aria-haspopup="dialog" aria-controls="picker-variant-dialog"
        aria-label="Configurar variante de ${escapeHtml(exercise.name)}">
        <span aria-hidden="true">⚙</span><span>Configurar</span>
    </button>` : '';
    container.innerHTML = `<div class="picker-selected picker-selected-configurable">
        ${exerciseThumb(exercise, 'picker-selected-thumb')}
        <div class="picker-selected-copy"><p class="eyebrow">EJERCICIO SELECCIONADO</p>
            <h3>${escapeHtml(title)}</h3>
            <small>${escapeHtml(exercise.description || friendly(exercise.mainMuscleGroup))}</small>
        </div>
        ${button}
    </div>
    <div class="plan-simple-selection">
        <span class="plan-simple-label">Configuración seleccionada</span>
        <strong>${escapeHtml(title)}</strong>
        ${chips.length ? `<div class="configuration-chips">${chips.map(chip =>
            `<span>${escapeHtml(chip)}</span>`).join('')}</div>` : ''}
        ${canConfigure ? '<p>Puedes añadir esta variante directamente o pulsar Configurar para cambiarla antes de añadir.</p>' : ''}
    </div>`;
    $('session-add-exercise').disabled = false;
}

// Medir la altura REAL de la variante más exigente de ESTE ejercicio, con
// «Más ajustes técnicos» abierto. No usar mínimos globales ni contar opciones
// que en realidad no se muestran para una combinación determinada.
function measurePickerVariantHeight(exercise, variants) {
    const modal = $('picker-variant-dialog');
    const shell = modal.querySelector('.picker-variant-modal-shell');
    const body = $('picker-variant-dialog-body');
    const heading = modal.querySelector('.picker-variant-heading');
    const actions = modal.querySelector('.picker-variant-dialog-actions');
    const draft = state.pickerDraft;
    if (!draft || !variants.length) return;

    const before = {
        configuration: {...draft.configuration}, moreOpen: draft.moreOpen,
        height: modal.style.height, maxHeight: modal.style.maxHeight,
        shellHeight: shell.style.height, shellMaxHeight: shell.style.maxHeight,
        bodyOverflow: body.style.overflowY
    };
    // Ocultar solo durante la medición evita saltos visuales. Dejamos que la
    // cuadrícula crezca libremente para obtener una altura natural fiable.
    modal.style.visibility = 'hidden';
    modal.style.height = 'auto';
    modal.style.maxHeight = 'none';
    shell.style.height = 'auto';
    shell.style.maxHeight = 'none';
    body.style.overflowY = 'visible';
    let maximum = 0;
    try {
        for (const variant of variants) {
            draft.configuration = {
                ...configurationFromVariant(variant),
                _positionPreference: before.configuration._positionPreference || 'UNSPECIFIED'
            };
            draft.moreOpen = true;
            renderPickerVariantDialog();
            const details = $('picker-variant-dialog-fields')
                .querySelector('.plan-advanced-more');
            if (details) details.open = true;
            const naturalHeight = heading.getBoundingClientRect().height +
                body.scrollHeight + actions.getBoundingClientRect().height + 2;
            maximum = Math.max(maximum, Math.ceil(naturalHeight));
        }
    } finally {
        draft.configuration = before.configuration;
        draft.moreOpen = before.moreOpen;
        modal.style.height = before.height;
        modal.style.maxHeight = before.maxHeight;
        shell.style.height = before.shellHeight;
        shell.style.maxHeight = before.shellMaxHeight;
        body.style.overflowY = before.bodyOverflow;
        renderPickerVariantDialog();
        // Se calcula UNA VEZ al abrir. Los cambios de controles posteriores
        // no modifican el tamaño; el contenido central permite scroll.
        if (maximum > 0) {
            modal.style.setProperty('--picker-variant-height', maximum + 'px');
        }
        modal.style.visibility = '';
    }
}

function openPickerVariantDialog() {
    if (state.pickerMode !== 'plan') return;
    const exercise = state.sessionPicker.exercise;
    if (!exercise) return;
    const variants = availablePickerVariants(exercise);
    if (variants.length < 2) return;
    const selected = variants.find(v => v.code === state.sessionPicker.configuration?.variantCode)
        || variants.find(v => v.isDefault || v.defaultVariant || v.default)
        || variants[0];
    state.pickerDraft = {exerciseCode: exercise.code,
        configuration: {...configurationFromVariant(selected),
            _positionPreference:state.sessionPicker.configuration?._positionPreference || 'UNSPECIFIED'},
        moreOpen:false};
    renderPickerVariantDialog();
    const modal = $('picker-variant-dialog');
    // Empezamos oculto, medimos dentro del top layer y mostramos una sola
    // geometría. CSS limita la altura al viewport cuando sea necesario.
    modal.style.visibility = 'hidden';
    modal.showModal();
    measurePickerVariantHeight(exercise, variants);
    $('picker-variant-dialog-body').querySelector('select:not(:disabled)')?.focus();
}

function renderPickerVariantDialog() {
    const draft = state.pickerDraft;
    const exercise = state.sessionPicker.exercise;
    if (!draft || !exercise || draft.exerciseCode !== exercise.code) return;
    const variants = availablePickerVariants(exercise);
    const {controls, candidates, selectedVariant} =
        resolveVariantForExercise(exercise, draft.configuration, variants);
    $('picker-variant-title').textContent = `Configurar ${exercise.name}`;
    $('picker-variant-identity').innerHTML = `${exerciseThumb(exercise, 'picker-variant-thumb')}
        <div><p class="eyebrow">EJERCICIO SELECCIONADO</p>
        <h3>${escapeHtml(exercise.name)}</h3>
        <p>${escapeHtml(exercise.description || friendly(exercise.mainMuscleGroup))}</p></div>`;
    const optionalPosition = FitCoreVariantUI.hasOptionalPosition(exercise, variants);
    $('picker-variant-dialog-fields').innerHTML =
        renderVariantConfiguratorFields(controls, candidates, selectedVariant, {
            fieldAttribute:'data-picker-dialog-field',
            exactAttribute:'data-picker-dialog-variant-code',
            moreAttribute:'data-picker-dialog-more',
            moreOpen:!!draft.moreOpen,
            hideBodyPosition:optionalPosition,
            extraTechnicalFields: optionalPosition
                ? [pickerPositionOptions(exercise, variants, draft.configuration,
                    'data-picker-dialog-position')] : [],
            allVariants: variants
        });
    const chips = selectedVariant ? variantConfigurationChips(selectedVariant, {
        hideBodyPosition: draft.configuration._positionPreference === 'UNSPECIFIED' &&
            FitCoreVariantUI.optionalPosition(exercise, selectedVariant)
    }).slice(0,4) : [];
    $('picker-variant-dialog-result').innerHTML = selectedVariant
        ? `<span>Configuración resultante</span>
            <strong>${escapeHtml(pickerVariantTitle(exercise, selectedVariant, draft.configuration))}</strong>
            ${chips.length ? `<div class="configuration-chips">${chips.map(chip =>
                `<span>${escapeHtml(chip)}</span>`).join('')}</div>` : ''}
            <small>Solo se pueden aplicar variantes existentes en el catálogo.</small>`
        : `<span>Configuración resultante</span><strong>Sin combinación válida</strong>`;
    $('picker-variant-apply').disabled = !selectedVariant;
}

function closePickerVariantDialog() {
    const dialog = $('picker-variant-dialog');
    if (dialog.open) dialog.close();
    state.pickerDraft = null;
}

function applyPickerVariantDialog() {
    const draft = state.pickerDraft;
    const exercise = state.sessionPicker.exercise;
    if (!draft || !exercise || draft.exerciseCode !== exercise.code) return;
    const variants = availablePickerVariants(exercise);
    const {selectedVariant} = resolveVariantForExercise(exercise, draft.configuration, variants);
    if (!selectedVariant || !variants.some(v => v.code === selectedVariant.code)) return;
    state.sessionPicker.configuration = {...configurationFromVariant(selectedVariant),
        _positionPreference:draft.configuration._positionPreference || 'UNSPECIFIED'};
    closePickerVariantDialog();
    renderSessionExerciseConfig();
    renderSessionExerciseResults(true);
}

async function openPlanAdvancedConfigDialog(dayIndex, exerciseIndex) {
    syncPlanEditor();

    try {
        if (!state.exercises.length || !state.variants.length) {
            [state.exercises, state.variants] = await Promise.all([
                api('/api/exercises'),
                api('/api/exercise-variants')
            ]);
        }

        const planExercise = state.planDays[dayIndex]?.exercises[exerciseIndex];
        const variant = state.variants.find(item => item.code === planExercise?.exerciseVariantCode);
        const exercise = state.exercises.find(item => item.code === variant?.exerciseCode);
        if (!planExercise || !variant || !exercise) {
            return toast('No se ha encontrado la configuración del ejercicio.', true);
        }

        state.planAdvancedConfig = {
            dayIndex,
            exerciseIndex,
            exerciseCode: exercise.code,
            originalVariantCode: variant.code,
            configuration: configurationFromVariant(variant)
        };

        renderPlanAdvancedConfig();
        $('plan-advanced-config-dialog').showModal();
        $('plan-advanced-config-body').querySelector('select:not(:disabled)')?.focus();
    } catch (error) {
        toast(error.message, true);
    }
}


/* Campos principales del configurador de Planes */
const planPrimaryVariantKeys = new Set([
    'equipment',
    'gripType',
    'gripWidth',
    'benchAngle'
]);

function renderPlanAdvancedConfig() {
    const draft = state.planAdvancedConfig;
    if (!draft) return;

    const exercise = state.exercises.find(
        item => item.code === draft.exerciseCode
    );

    const identity = $('plan-advanced-identity');
    const fieldsContainer = $('plan-advanced-fields');
    const resultContainer = $('plan-advanced-result');

    if (
        !exercise ||
        !identity ||
        !fieldsContainer ||
        !resultContainer
    ) return;

    // Conservar el estado del apartado desplegable
    const previousDetails = fieldsContainer.querySelector(
        '.plan-advanced-more'
    );

    if (previousDetails) {
        draft.moreOpen = previousDetails.open;
    }

    const {
        controls,
        candidates,
        selectedVariant
    } = resolveVariantForExercise(
        exercise,
        draft.configuration
    );

    // Información compacta del ejercicio
    identity.innerHTML = `
        ${exerciseThumb(exercise, 'plan-advanced-thumb')}

        <div>
            <p class="eyebrow">EJERCICIO</p>
            <h3>${escapeHtml(exercise.name)}</h3>
            <p>${escapeHtml(
        exercise.description ||
        'Personaliza su ejecución.'
    )}</p>
        </div>
    `;

    fieldsContainer.innerHTML = renderVariantConfiguratorFields(controls, candidates, selectedVariant, {
        fieldAttribute: 'data-plan-advanced-field',
        exactAttribute: 'data-plan-advanced-variant-code',
        moreAttribute: 'data-plan-advanced-more',
        moreOpen: !!draft.moreOpen
    });

    // Resumen de la variante resultante
    resultContainer.innerHTML = selectedVariant
        ? `
            <span>Configuración resultante</span>

            <strong>
                ${escapeHtml(selectedVariant.name)}
            </strong>

            <small>
                ${escapeHtml(localizeText(
            selectedVariant.focusDescription ||
            'Combinación válida del catálogo.'
        ))}
            </small>
        `
        : `
            <span>Configuración resultante</span>
            <strong>Sin combinación válida</strong>
        `;

    $('plan-advanced-save').disabled = !selectedVariant;
}


function closePlanAdvancedConfig() {
    const dialog = $('plan-advanced-config-dialog');
    if (dialog.open) dialog.close();
    state.planAdvancedConfig = null;
}

function savePlanAdvancedConfig(event) {
    event.preventDefault();
    const draft = state.planAdvancedConfig;
    if (!draft) return;

    const exercise = state.exercises.find(item => item.code === draft.exerciseCode);
    const {selectedVariant} = resolveVariantForExercise(exercise, draft.configuration);
    const planExercise = state.planDays[draft.dayIndex]?.exercises[draft.exerciseIndex];

    if (!selectedVariant || !planExercise || selectedVariant.exerciseCode !== exercise?.code) {
        return toast('No se ha podido resolver una configuración válida.', true);
    }

    planExercise.exerciseVariantCode = selectedVariant.code;
    state.selectedPlanDayIndex = draft.dayIndex;
    closePlanAdvancedConfig();
    renderPlanMode();
    toast('Configuración actualizada. Se han conservado las series, repeticiones, descanso y orden. Guarda el plan para conservar el cambio.');
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
        const exerciseName = variant ? FitCoreVariantUI.variantTitle(base, variant) : base?.name || variantName(exercise.exerciseVariantCode);
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

function variantConfigurationChips(variant, options = {}) {
    if (!variant) return [];
    return [friendly(variant.equipment),
        ...variantConfigFields.slice(1)
            .filter(field =>
                !(options.hideBodyPosition && field.key === 'bodyPosition') &&
                variant[field.key] && !(field.empty || []).includes(variant[field.key]))
            .slice(0, 3).map(field => variantValue(field.key, variant[field.key]))];
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


// Activar arrastre de días y ejercicios
    document.addEventListener(
        'pointerdown',
        startPlanDrag
    );

// Evitar selección accidental al terminar de arrastrar
    document.addEventListener(
        'click',
        suppressClickAfterPlanDrag,
        true
    );


    document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.go)));
    document.querySelectorAll('.nav-item').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.view)));
    $('menu-button').addEventListener('click',()=>{const sidebar=document.querySelector('.sidebar');sidebar.classList.toggle('is-open');$('menu-button').setAttribute('aria-expanded',String(sidebar.classList.contains('is-open')));});
    $('auth-form').addEventListener('submit',event=>{event.preventDefault();authenticate(false);}); $('register-button').addEventListener('click',()=>authenticate(true)); $('logout-button').addEventListener('click',logout);
    $('health-check').addEventListener('click',healthCheck); $('catalog-search').addEventListener('click',()=>searchCatalog(0)); $('catalog-query').addEventListener('keydown',e=>{if(e.key==='Enter')searchCatalog(0);});
    $('catalog-clear').addEventListener('click',()=>{$('catalog-query').value='';$('catalog-equipment').value='';$('catalog-muscle').value='';$('catalog-stabilizers').checked=false;searchCatalog(0);});
    $('catalog-results').addEventListener('click',e=>{const item=e.target.closest('[data-exercise]');if(item)selectExercise(item.dataset.exercise);});
    $('variant-detail').addEventListener('change',e=>{const field=e.target.closest('[data-variant-config]'), finalChoice=e.target.closest('[data-variant-code]');if(field){state.variantConfiguration[field.dataset.variantConfig]=field.value;state.variantConfiguration.variantCode=null;previewConfiguredVariant();}else if(finalChoice){state.variantConfiguration.variantCode=finalChoice.value;previewConfiguredVariant();}});
    $('map-stabilizers').addEventListener('change',paintActivations);

    $('plan-configure').addEventListener('click', () => $('plan-settings-dialog').showModal());


// Guardar cambios del día
    $('plan-edit-day-form').addEventListener(
        'submit',
        savePlanEditDay
    );

// Cerrar la ventana
    document.querySelectorAll('[data-close-edit-day]')
        .forEach(button => {

            button.addEventListener('click', () => {
                $('plan-edit-day-dialog').close();
            });

        });

// Duplicar
    $('plan-edit-duplicate').addEventListener(
        'click',
        duplicateSelectedPlanDay
    );

// Mover antes
    $('plan-edit-move-up').addEventListener(
        'click',
        () => moveSelectedPlanDay(-1)
    );

// Mover después
    $('plan-edit-move-down').addEventListener(
        'click',
        () => moveSelectedPlanDay(1)
    );

// Eliminar con confirmación
    $('plan-edit-delete').addEventListener(
        'click',
        () => void deleteSelectedPlanDay()
    );


    $('plan-new-day-form').addEventListener(
        'submit',
        submitPlanNewDay
    );

    document.querySelectorAll('[data-close-new-day]')
        .forEach(button => {
            button.addEventListener('click', () => {
                $('plan-new-day-dialog').close();
            });
        });

    document.querySelectorAll('[data-close-plan-settings]').forEach(button => button.addEventListener('click', () => $('plan-settings-dialog').close()));
    $('plan-settings-form').addEventListener('submit', event => {
        event.preventDefault();
        renderPlanHeader();
        $('plan-settings-dialog').close();
        toast('Configuración del plan actualizada.');
    });
    $('plan-load').addEventListener('click', async () => {
        await loadActivePlan();
        $('plan-settings-dialog').close();
    });


    $('plan-week-muscles').addEventListener(
        'click',
        () => openPlanMuscleDialog('week')
    );

    $('plan-muscle-dialog')
        .querySelectorAll('[data-close-plan-muscles]')
        .forEach(button => {
            button.addEventListener('click', () => {
                $('plan-muscle-dialog').close();
            });
        });

    $('plan-muscle-dialog').addEventListener(
        'close',
        () => {
            planMuscleDialogVersion++;
        }
    );

    $('plan-muscle-dialog').addEventListener(
        'click',
        event => {
            const choice = event.target.closest(
                '[data-plan-muscle-scope]'
            );

            if (!choice) return;

            planMuscleScope = choice.dataset.planMuscleScope;

            void renderPlanMuscleDialog();
        }
    );

    $('plan-muscle-day-select').addEventListener(
        'change',
        () => void renderPlanMuscleDialog()
    );


    $('plan-save').addEventListener('click', savePlan);
    $('plan-day-tabs').addEventListener('click', event => {
        const selected = event.target.closest('[data-select-plan-day]');
        if (selected) {
            syncPlanEditor();
            state.selectedPlanDayIndex = Number(selected.dataset.selectPlanDay);
            renderPlanDays();
            return;
        }
        if (event.target.closest('#add-day')) {
            openPlanNewDayDialog();
        }
    });
    $('plan-days').addEventListener('click', event => {


        if (event.target.closest('#plan-day-muscle-open')) {
            openPlanMuscleDialog('day');
            return;
        }


        if (event.target.closest('[data-empty-add-day]')) {
            return openPlanNewDayDialog();
        }
        const card = event.target.closest('.plan-day-editor');
        if (!card) return;
        const dayIndex = Number(card.dataset.day);
        const day = state.planDays[dayIndex];
        const menuToggle = event.target.closest('[data-plan-row-menu-toggle]');
        const menuAction = event.target.closest('[data-plan-exercise-action]');

        if (menuToggle) {
            togglePlanRowMenu(menuToggle);
            return;
        } else if (menuAction) {
            const exerciseIndex = Number(menuAction.closest('.exercise-editor').dataset.exercise);
            const action = menuAction.dataset.planExerciseAction;
            closePlanRowMenus();
            syncPlanEditor();
            state.selectedPlanDayIndex = dayIndex;

            if (action === 'delete') {
                void removePlanExercise(dayIndex, exerciseIndex);
            } else if (action === 'configure') {
                void openPlanAdvancedConfigDialog(dayIndex, exerciseIndex);
            } else {
                void openExercisePicker('plan', {action, exerciseIndex});
            }
            return;
        } else if (event.target.closest('[data-configure-plan-day]')) {
            syncPlanEditor();
            state.selectedPlanDayIndex = dayIndex;
            openPlanEditDayDialog();
            return;
        } else if (event.target.closest('[data-add-plan-exercise]')) {
            void openExercisePicker('plan');
        } else if (event.target.closest('[data-move]')) {
            syncPlanEditor();
            const row = event.target.closest('.exercise-editor');
            const from = Number(row.dataset.exercise);
            const to = from + Number(event.target.closest('[data-move]').dataset.move);
            if (to >= 0 && to < day.exercises.length) {
                const [item] = day.exercises.splice(from, 1);
                day.exercises.splice(to, 0, item);
                renderPlanDays();
            }
        } else if (event.target.closest('[data-step-field]')) {
            const button = event.target.closest('[data-step-field]');
            const row = button.closest('.exercise-editor');
            const field = button.dataset.stepField;
            const input = row.querySelector(`[data-exercise-${field}]`);
            const minimum = Number(input.min || 0);
            input.value = Math.max(minimum, Number(input.value || 0) + Number(button.dataset.step));
            syncPlanEditor();
            renderPlanDays();
        }
    });
    $('plan-days').addEventListener('change', event => {
        if (!event.target.matches(
            '[data-exercise-code], ' +
            '[data-exercise-sets], ' +
            '[data-exercise-reps], ' +
            '[data-exercise-rest]'
        )) return;
        syncPlanEditor();
        renderPlanDays();
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.plan-row-menu')) closePlanRowMenus();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && document.querySelector('.plan-row-action-menu:not([hidden])')) {
            event.preventDefault();
            closePlanRowMenus({restoreFocus: true});
        }
    });
    window.addEventListener('resize', () => closePlanRowMenus());
    window.addEventListener('scroll', () => closePlanRowMenus(), true);

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

    $('catalog-prev').addEventListener('click', () => searchCatalog(state.catalogPage - 1));
    $('catalog-next').addEventListener('click', () => searchCatalog(state.catalogPage + 1));
    $('session-start').addEventListener('click',startSession); $('session-add-exercise').addEventListener('click',addSessionExercise); $('open-exercise-picker').addEventListener(
        'click',
        () => openExercisePicker('session')
    ); $('session-refresh').addEventListener('click',loadSessionExercises); $('session-complete').addEventListener('click',()=>finishSession('complete')); $('session-cancel').addEventListener('click',()=>finishSession('cancel')); $('session-delete').addEventListener('click',deleteSession); $('session-muscles').addEventListener('click',showSessionMuscles);
    ['session-exercise-query','session-exercise-equipment','session-exercise-muscle'].forEach(id => $(id).addEventListener(id === 'session-exercise-query' ? 'input' : 'change', renderSessionExerciseResults));
    $('session-exercise-results').addEventListener('click', event => {
        const item = event.target.closest('[data-session-exercise-code]');
        if (!item) return;
        const exercise = state.exercises.find(candidate => candidate.code === item.dataset.sessionExerciseCode);
        if (!exercise) return;
        const matchedVariant = state.variants.find(variant =>
            variant.code === item.dataset.sessionVariantCode && variant.exerciseCode === exercise.code
        );
        const configuration = matchedVariant
            ? configurationFromVariant(matchedVariant)
            : state.sessionPicker.exercise?.code === exercise.code
                ? state.sessionPicker.configuration
                : state.pickerMode === 'plan'
                    ? configurationFromVariant(defaultVariantForExercise(exercise))
                    : {};
        const queryPosition = requestedPickerPosition();
        configuration._positionPreference = queryPosition !== 'UNSPECIFIED' ? queryPosition :
            state.sessionPicker.exercise?.code === exercise.code
                ? configuration._positionPreference || 'UNSPECIFIED' : 'UNSPECIFIED';
        state.sessionPicker = {exercise, configuration};
        // Buscar una variante específica la preselecciona; nunca restringe
        // las opciones que se pueden abrir después desde «Configurar».
        state.pickerGroupCodes = null;
        renderSessionExerciseResults();
        renderSessionExerciseConfig();
    });
    $('session-exercise-config').addEventListener('change',e=>{
        const position=e.target.closest('[data-picker-position], [data-session-position]');
        if (position) {
            state.sessionPicker.configuration = selectPickerPosition(
                state.sessionPicker.exercise, availablePickerVariants(state.sessionPicker.exercise),
                state.sessionPicker.configuration, position.value);
            renderSessionExerciseConfig();
            return;
        }
        const field=e.target.closest('[data-session-variant-config]');
        if(!field)return;
        state.sessionPicker.configuration[field.dataset.sessionVariantConfig]=field.value;
        state.sessionPicker.configuration.variantCode=null;
        renderSessionExerciseConfig();
    });

    $('session-exercise-config').addEventListener('click', event => {
        if (event.target.closest('[data-picker-toggle-config]')) openPickerVariantDialog();
    });
    document.querySelectorAll('[data-close-picker-variant]').forEach(button =>
        button.addEventListener('click', closePickerVariantDialog));
    $('picker-variant-dialog').addEventListener('close', () => {
        state.pickerDraft = null;
    });
    $('picker-variant-dialog-body').addEventListener('change', event => {
        const draft = state.pickerDraft;
        if (!draft) return;
        // Preservar el estado real del acordeón ANTES de actualizar cualquier
        // campo (incluida «Posición corporal»). El rerender reemplaza el DOM.
        draft.moreOpen = !!$('picker-variant-dialog-fields')
            .querySelector('[data-picker-dialog-more]')?.open;
        const position = event.target.closest('[data-picker-dialog-position]');
        if (position) {
            draft.configuration = selectPickerPosition(state.sessionPicker.exercise,
                availablePickerVariants(state.sessionPicker.exercise), draft.configuration, position.value);
            renderPickerVariantDialog();
            return;
        }
        const field = event.target.closest('[data-picker-dialog-field]');
        const exact = event.target.closest('[data-picker-dialog-variant-code]');
        if (!field && !exact) return;
        if (field) {
            draft.configuration[field.dataset.pickerDialogField] = field.value;
            draft.configuration.variantCode = null;
        } else {
            const variant = availablePickerVariants(state.sessionPicker.exercise)
                .find(item => item.code === exact.value);
            if (!variant) return;
            const preference = draft.configuration._positionPreference || 'UNSPECIFIED';
            draft.configuration = {...configurationFromVariant(variant), _positionPreference:preference};
        }
        renderPickerVariantDialog();
        if (field) $('picker-variant-dialog-fields')
            .querySelector('[data-picker-dialog-field="' + field.dataset.pickerDialogField + '"]')?.focus();
    });
    $('picker-variant-reset').addEventListener('click', () => {
        if (!state.pickerDraft) return;
        const variants = availablePickerVariants(state.sessionPicker.exercise);
        const selected = variants.find(v => v.isDefault || v.defaultVariant || v.default) || variants[0];
        if (!selected) return;
        state.pickerDraft.configuration = {...configurationFromVariant(selected), _positionPreference:'UNSPECIFIED'};
        renderPickerVariantDialog();
    });
    $('picker-variant-apply').addEventListener('click', applyPickerVariantDialog);



    $('plan-advanced-config-form').addEventListener('submit', savePlanAdvancedConfig);
    $('plan-advanced-config-body').addEventListener('change', event => {
        const field = event.target.closest('[data-plan-advanced-field]');
        const finalChoice = event.target.closest('[data-plan-advanced-variant-code]');
        if (!state.planAdvancedConfig) return;

        if (field) {
            state.planAdvancedConfig.configuration[field.dataset.planAdvancedField] = field.value;
            state.planAdvancedConfig.configuration.variantCode = null;
            renderPlanAdvancedConfig();
        } else if (finalChoice) {
            state.planAdvancedConfig.configuration.variantCode = finalChoice.value;
            renderPlanAdvancedConfig();
        }
    });
    document.querySelectorAll('[data-close-plan-advanced]').forEach(button => button.addEventListener('click', closePlanAdvancedConfig));
    $('plan-advanced-config-dialog').addEventListener('close', () => {
        state.planAdvancedConfig = null;
    });
    document.querySelectorAll('[data-close-picker]').forEach(button=>button.addEventListener('click',()=>{ closePickerVariantDialog(); $('exercise-picker-dialog').close(); })); document.querySelectorAll('[data-close-muscles]').forEach(button=>button.addEventListener('click',()=>$('session-muscle-dialog').close()));
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
