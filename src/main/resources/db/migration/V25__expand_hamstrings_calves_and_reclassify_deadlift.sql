-- V25: catalog of hamstring knee flexion and hip hinges + calf plantar flexion.
-- IDs and all existing session logs remain unchanged. No fabricated EMG percentages.

-- Conventional, sumo and trap-bar deadlifts are whole-body lifts, not isolated hamstring work.
-- This reclassification changes filtering only; their stable IDs and variants are preserved.
UPDATE exercises SET main_muscle_group = 'FULL_BODY', updated_at = CURRENT_TIMESTAMP
WHERE code = 'deadlift' AND main_muscle_group = 'HAMSTRINGS';

-- Nordic knee curl and calf press on leg press have meaningfully distinct patterns.
INSERT INTO exercises (
    code, name, exercise_category, main_muscle_group, movement_pattern,
    description, calories_estimation_type, base_calories_per_unit,
    default_unit, active, created_at, updated_at
)
VALUES
    ('nordicHamstringCurl', 'Curl nórdico', 'STRENGTH', 'HAMSTRINGS', 'KNEE_FLEXION',
     'Flexión de rodilla nórdica con tobillos anclados; énfasis excéntrico y opción asistida.',
     'REP_BASED', 0.20, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('calfPressLegPress', 'Elevación de gemelos en prensa', 'STRENGTH', 'CALVES', 'ANKLE_PLANTAR_FLEXION',
     'Flexión plantar sobre plataforma de prensa, diferente del empuje de piernas.',
     'REP_BASED', 0.15, 'REPETITIONS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Add 20 practical variant executions inside seven relevant families.
INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, active, primary_focus, secondary_focus,
    practicality, focus_description, focus_evidence_type, focus_evidence_level,
    created_at, updated_at
)
SELECT seed.code, seed.name, e.id, seed.equipment, seed.grip_type,
       seed.grip_width, seed.bench_angle, seed.body_position, seed.laterality,
       seed.trajectory, seed.support_type, seed.stance_type, seed.attachment_type,
       seed.shoulder_position, seed.foot_placement, seed.knee_position,
       seed.contraction_type, seed.requires_caution, true,
       seed.primary_focus, seed.secondary_focus, seed.practicality,
       seed.focus_description, 'BIOMECHANICAL_INFERENCE', 'MEDIUM',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('romanianDeadliftDumbbellStanding', 'Peso muerto rumano con mancuernas', 'romanianDeadlift', 'DUMBBELL', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', true, 'HAMSTRING_BIAS', 'POSTERIOR_CHAIN', 'COMMON', 'Bisagra de cadera con mancuernas; mantener control de tronco y rodillas.'),
    ('romanianDeadliftDumbbellSingleLeg', 'Peso muerto rumano unilateral con mancuerna', 'romanianDeadlift', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'DOWNWARD', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'SLIGHTLY_FLEXED', 'DYNAMIC', true, 'HAMSTRING_BIAS', 'UNILATERAL_STABILITY', 'TECHNIQUE_DEPENDENT', 'Bisagra de cadera sobre una pierna; requiere control de equilibrio y pelvis.'),
    ('romanianDeadliftSmithStanding', 'Peso muerto rumano en Smith', 'romanianDeadlift', 'SMITH_MACHINE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', true, 'HAMSTRING_BIAS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Bisagra con barra guiada; la trayectoria depende del modelo de multipower.'),
    ('goodMorningSmithStanding', 'Buenos días en Smith', 'goodMorning', 'SMITH_MACHINE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BEHIND_TORSO', 'MEDIUM', 'SLIGHTLY_FLEXED', 'DYNAMIC', true, 'HAMSTRING_BIAS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Bisagra con barra apoyada en la espalda y guiada por máquina; ajustar recorrido.'),
    ('legCurlMachineSeatedUnilateral', 'Curl femoral sentado unilateral', 'legCurl', 'MACHINE_SELECTORISED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'DOWNWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', false, 'HAMSTRING_BIAS', 'UNILATERAL_STABILITY', 'MACHINE_DEPENDENT', 'Flexión unilateral de rodilla en máquina sentado.'),
    ('legCurlMachineProneUnilateral', 'Curl femoral tumbado unilateral', 'legCurl', 'MACHINE_SELECTORISED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'PRONE', 'UNILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', false, 'HAMSTRING_BIAS', 'UNILATERAL_STABILITY', 'MACHINE_DEPENDENT', 'Flexión unilateral de rodilla en máquina tumbado.'),
    ('legCurlMachineStandingSingleLeg', 'Curl femoral de pie en máquina', 'legCurl', 'MACHINE_SELECTORISED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', false, 'HAMSTRING_BIAS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Flexión de rodilla de pie con apoyo y recorrido guiado de máquina.'),
    ('legCurlCableStandingSingleLeg', 'Curl femoral de pie en polea', 'legCurl', 'CABLE', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'ANKLE_STRAP', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', 'DYNAMIC', false, 'HAMSTRING_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Flexión de rodilla de pie con tobillera y resistencia de polea.'),
    ('legCurlBandStandingSingleLeg', 'Curl femoral de pie con banda', 'legCurl', 'BAND', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'UPWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', 'DYNAMIC', false, 'HAMSTRING_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Flexión de rodilla de pie con banda elástica anclada de forma estable.'),
    ('nordicHamstringCurlBodyweightEccentric', 'Curl nórdico excéntrico con peso corporal', 'nordicHamstringCurl', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'KNEELING', 'BILATERAL', 'DOWNWARD', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'FLEXED', 'ECCENTRIC_EMPHASIS', true, 'HAMSTRING_BIAS', 'POSTERIOR_CHAIN', 'TECHNIQUE_DEPENDENT', 'Descenso excéntrico de rodillas con tobillos sujetos por un apoyo estable; progresar la dificultad.'),
    ('nordicHamstringCurlBandAssisted', 'Curl nórdico asistido con banda', 'nordicHamstringCurl', 'BAND', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'KNEELING', 'BILATERAL', 'DOWNWARD', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'FLEXED', 'ECCENTRIC_EMPHASIS', true, 'HAMSTRING_BIAS', 'POSTERIOR_CHAIN', 'TECHNIQUE_DEPENDENT', 'Curl nórdico con ayuda elástica y tobillos fijados; la asistencia cambia con la elongación.'),
    ('standingCalfRaiseSmithStanding', 'Elevación de gemelos de pie en Smith', 'standingCalfRaise', 'SMITH_MACHINE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BEHIND_TORSO', 'MEDIUM', 'EXTENDED', 'DYNAMIC', false, 'CALF_GASTROCNEMIUS_BIAS', 'CALF_SOLEUS_BIAS', 'MACHINE_DEPENDENT', 'Flexión plantar de pie con barra guiada; mantener rodillas casi extendidas.'),
    ('standingCalfRaiseDumbbellSingleLeg', 'Elevación unilateral de gemelos con mancuerna', 'standingCalfRaise', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'UPWARD', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'EXTENDED', 'DYNAMIC', false, 'CALF_GASTROCNEMIUS_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Elevación unilateral con apoyo de equilibrio opcional y carga en una mano.'),
    ('standingCalfRaiseMachineStanding', 'Elevación de gemelos de pie en máquina', 'standingCalfRaise', 'MACHINE_PLATE_LOADED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MID', 'EXTENDED', 'DYNAMIC', false, 'CALF_GASTROCNEMIUS_BIAS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Flexión plantar de pie guiada; recorrido y apoyo propios de cada máquina.'),
    ('standingCalfRaiseBodyweightSingleLeg', 'Elevación unilateral de gemelos con peso corporal', 'standingCalfRaise', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'UPWARD', 'FREE', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'EXTENDED', 'DYNAMIC', false, 'CALF_GASTROCNEMIUS_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Flexión plantar sobre una pierna; usar apoyo estable cuando se necesite.'),
    ('seatedCalfRaiseDumbbellSeated', 'Elevación de gemelos sentado con mancuerna', 'seatedCalfRaise', 'DUMBBELL', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', false, 'CALF_SOLEUS_BIAS', 'CALF_GASTROCNEMIUS_BIAS', 'COMMON', 'Flexión plantar sentado con mancuerna apoyada sobre los muslos de forma segura.'),
    ('seatedCalfRaisePlateSeated', 'Elevación de gemelos sentado con disco', 'seatedCalfRaise', 'WEIGHT_PLATE', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'FLEXED', 'DYNAMIC', false, 'CALF_SOLEUS_BIAS', 'CALF_GASTROCNEMIUS_BIAS', 'COMMON', 'Flexión plantar sentado con discos colocados de forma estable sobre los muslos.'),
    ('calfPressLegPressMachinePlateLoaded', 'Elevación de gemelos en prensa de discos', 'calfPressLegPress', 'MACHINE_PLATE_LOADED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MID', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'CALF_GASTROCNEMIUS_BIAS', 'CALF_SOLEUS_BIAS', 'MACHINE_DEPENDENT', 'Flexión plantar sobre plataforma de prensa de discos; no bloquear el mecanismo de seguridad.'),
    ('calfPressLegPressMachineSingleLeg', 'Elevación unilateral de gemelos en prensa de discos', 'calfPressLegPress', 'MACHINE_PLATE_LOADED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MID', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'CALF_GASTROCNEMIUS_BIAS', 'UNILATERAL_STABILITY', 'MACHINE_DEPENDENT', 'Flexión plantar unilateral sobre prensa con soporte estable.'),
    ('calfPressLegPressMachineSelectorized', 'Elevación de gemelos en prensa selectorizada', 'calfPressLegPress', 'MACHINE_SELECTORISED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MID', 'SLIGHTLY_FLEXED', 'DYNAMIC', false, 'CALF_GASTROCNEMIUS_BIAS', 'CALF_SOLEUS_BIAS', 'MACHINE_DEPENDENT', 'Flexión plantar sobre plataforma de prensa selectorizada.')
) AS seed (
    code, name, exercise_code, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, primary_focus, secondary_focus,
    practicality, focus_description
)
JOIN exercises e ON e.code = seed.exercise_code
ON CONFLICT (code) DO NOTHING;

-- One default active variant per existing and newly introduced family.
UPDATE exercise_variants
SET is_default = false, updated_at = CURRENT_TIMESTAMP
WHERE is_default AND exercise_id IN (
    SELECT id FROM exercises WHERE code IN (
        'romanianDeadlift','deadlift','goodMorning','legCurl','nordicHamstringCurl',
        'standingCalfRaise','seatedCalfRaise','calfPressLegPress'
    )
);
UPDATE exercise_variants
SET is_default = true, updated_at = CURRENT_TIMESTAMP
WHERE active AND code IN (
    'romanianDeadliftBarbell',
    'deadliftBarbellConventional',
    'goodMorningBarbellStanding',
    'legCurlMachineSeated',
    'nordicHamstringCurlBandAssisted',
    'standingCalfRaiseBodyweight',
    'seatedCalfRaiseMachine',
    'calfPressLegPressMachinePlateLoaded'
);

-- Qualitative muscle roles; regional hamstring aggregation is an explicit anatomical approximation.
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale, created_at, updated_at
)
SELECT v.id, m.id, seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL, CASE seed.evidence_level WHEN 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       'BIOMECHANICAL_INFERENCE', NULL, 9,
       'BIOMECHANICAL_INFERENCE', seed.evidence_level, NULL,
       'Rol biomecánico orientativo por flexión de rodilla, extensión de cadera o flexión plantar; no implica aislamiento.',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('romanianDeadliftDumbbellStanding', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('romanianDeadliftDumbbellStanding', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('romanianDeadliftDumbbellStanding', 'ERECTOR_SPINAE_LUMBAR', 'SECONDARY', 'LOW'),
    ('romanianDeadliftDumbbellStanding', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('romanianDeadliftDumbbellSingleLeg', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('romanianDeadliftDumbbellSingleLeg', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('romanianDeadliftDumbbellSingleLeg', 'ERECTOR_SPINAE_LUMBAR', 'SECONDARY', 'LOW'),
    ('romanianDeadliftDumbbellSingleLeg', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('romanianDeadliftSmithStanding', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('romanianDeadliftSmithStanding', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('romanianDeadliftSmithStanding', 'ERECTOR_SPINAE_LUMBAR', 'SECONDARY', 'LOW'),
    ('romanianDeadliftSmithStanding', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('goodMorningSmithStanding', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('goodMorningSmithStanding', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('goodMorningSmithStanding', 'ERECTOR_SPINAE_LUMBAR', 'SECONDARY', 'LOW'),
    ('goodMorningSmithStanding', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('legCurlMachineSeatedUnilateral', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('legCurlMachineSeatedUnilateral', 'GASTROCNEMIUS', 'SECONDARY', 'LOW'),
    ('legCurlMachineProneUnilateral', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('legCurlMachineProneUnilateral', 'GASTROCNEMIUS', 'SECONDARY', 'LOW'),
    ('legCurlMachineStandingSingleLeg', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('legCurlMachineStandingSingleLeg', 'GASTROCNEMIUS', 'SECONDARY', 'LOW'),
    ('legCurlCableStandingSingleLeg', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('legCurlCableStandingSingleLeg', 'GASTROCNEMIUS', 'SECONDARY', 'LOW'),
    ('legCurlBandStandingSingleLeg', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('legCurlBandStandingSingleLeg', 'GASTROCNEMIUS', 'SECONDARY', 'LOW'),
    ('nordicHamstringCurlBodyweightEccentric', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('nordicHamstringCurlBodyweightEccentric', 'GASTROCNEMIUS', 'SECONDARY', 'LOW'),
    ('nordicHamstringCurlBodyweightEccentric', 'GLUTEUS_MAXIMUS', 'STABILIZER', 'LOW'),
    ('nordicHamstringCurlBodyweightEccentric', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('nordicHamstringCurlBandAssisted', 'HAMSTRINGS_REGION', 'PRIMARY', 'MEDIUM'),
    ('nordicHamstringCurlBandAssisted', 'GASTROCNEMIUS', 'SECONDARY', 'LOW'),
    ('nordicHamstringCurlBandAssisted', 'GLUTEUS_MAXIMUS', 'STABILIZER', 'LOW'),
    ('nordicHamstringCurlBandAssisted', 'RECTUS_ABDOMINIS', 'STABILIZER', 'LOW'),
    ('standingCalfRaiseSmithStanding', 'GASTROCNEMIUS', 'PRIMARY', 'MEDIUM'),
    ('standingCalfRaiseSmithStanding', 'SOLEUS', 'SECONDARY', 'LOW'),
    ('standingCalfRaiseSmithStanding', 'PERONEALS_REGION', 'STABILIZER', 'LOW'),
    ('standingCalfRaiseDumbbellSingleLeg', 'GASTROCNEMIUS', 'PRIMARY', 'MEDIUM'),
    ('standingCalfRaiseDumbbellSingleLeg', 'SOLEUS', 'SECONDARY', 'LOW'),
    ('standingCalfRaiseDumbbellSingleLeg', 'PERONEALS_REGION', 'STABILIZER', 'LOW'),
    ('standingCalfRaiseMachineStanding', 'GASTROCNEMIUS', 'PRIMARY', 'MEDIUM'),
    ('standingCalfRaiseMachineStanding', 'SOLEUS', 'SECONDARY', 'LOW'),
    ('standingCalfRaiseMachineStanding', 'PERONEALS_REGION', 'STABILIZER', 'LOW'),
    ('standingCalfRaiseBodyweightSingleLeg', 'GASTROCNEMIUS', 'PRIMARY', 'MEDIUM'),
    ('standingCalfRaiseBodyweightSingleLeg', 'SOLEUS', 'SECONDARY', 'LOW'),
    ('standingCalfRaiseBodyweightSingleLeg', 'PERONEALS_REGION', 'STABILIZER', 'LOW'),
    ('seatedCalfRaiseDumbbellSeated', 'SOLEUS', 'PRIMARY', 'MEDIUM'),
    ('seatedCalfRaiseDumbbellSeated', 'GASTROCNEMIUS', 'SECONDARY', 'LOW'),
    ('seatedCalfRaisePlateSeated', 'SOLEUS', 'PRIMARY', 'MEDIUM'),
    ('seatedCalfRaisePlateSeated', 'GASTROCNEMIUS', 'SECONDARY', 'LOW'),
    ('calfPressLegPressMachinePlateLoaded', 'GASTROCNEMIUS', 'PRIMARY', 'MEDIUM'),
    ('calfPressLegPressMachinePlateLoaded', 'SOLEUS', 'SECONDARY', 'LOW'),
    ('calfPressLegPressMachinePlateLoaded', 'PERONEALS_REGION', 'STABILIZER', 'LOW'),
    ('calfPressLegPressMachineSingleLeg', 'GASTROCNEMIUS', 'PRIMARY', 'MEDIUM'),
    ('calfPressLegPressMachineSingleLeg', 'SOLEUS', 'SECONDARY', 'LOW'),
    ('calfPressLegPressMachineSingleLeg', 'PERONEALS_REGION', 'STABILIZER', 'LOW'),
    ('calfPressLegPressMachineSelectorized', 'GASTROCNEMIUS', 'PRIMARY', 'MEDIUM'),
    ('calfPressLegPressMachineSelectorized', 'SOLEUS', 'SECONDARY', 'LOW'),
    ('calfPressLegPressMachineSelectorized', 'PERONEALS_REGION', 'STABILIZER', 'LOW')
) AS seed (variant_code, muscle_code, role, evidence_level)
JOIN exercise_variants v ON v.code = seed.variant_code
JOIN muscles m ON m.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

DO $$
DECLARE
    n_variants integer;
    n_mappings integer;
    hamstrings_count integer;
    calves_count integer;
    full_body_deadlift integer;
BEGIN
    SELECT COUNT(*) INTO n_variants FROM exercise_variants WHERE code IN ('romanianDeadliftDumbbellStanding', 'romanianDeadliftDumbbellSingleLeg', 'romanianDeadliftSmithStanding', 'goodMorningSmithStanding', 'legCurlMachineSeatedUnilateral', 'legCurlMachineProneUnilateral', 'legCurlMachineStandingSingleLeg', 'legCurlCableStandingSingleLeg', 'legCurlBandStandingSingleLeg', 'nordicHamstringCurlBodyweightEccentric', 'nordicHamstringCurlBandAssisted', 'standingCalfRaiseSmithStanding', 'standingCalfRaiseDumbbellSingleLeg', 'standingCalfRaiseMachineStanding', 'standingCalfRaiseBodyweightSingleLeg', 'seatedCalfRaiseDumbbellSeated', 'seatedCalfRaisePlateSeated', 'calfPressLegPressMachinePlateLoaded', 'calfPressLegPressMachineSingleLeg', 'calfPressLegPressMachineSelectorized');
    IF n_variants <> 20 THEN
        RAISE EXCEPTION 'V25: expected 20 variants, found %', n_variants;
    END IF;
    SELECT COUNT(*) INTO n_mappings
    FROM exercise_muscle_activations a
    JOIN exercise_variants v ON v.id = a.exercise_variant_id
    WHERE v.code IN ('romanianDeadliftDumbbellStanding', 'romanianDeadliftDumbbellSingleLeg', 'romanianDeadliftSmithStanding', 'goodMorningSmithStanding', 'legCurlMachineSeatedUnilateral', 'legCurlMachineProneUnilateral', 'legCurlMachineStandingSingleLeg', 'legCurlCableStandingSingleLeg', 'legCurlBandStandingSingleLeg', 'nordicHamstringCurlBodyweightEccentric', 'nordicHamstringCurlBandAssisted', 'standingCalfRaiseSmithStanding', 'standingCalfRaiseDumbbellSingleLeg', 'standingCalfRaiseMachineStanding', 'standingCalfRaiseBodyweightSingleLeg', 'seatedCalfRaiseDumbbellSeated', 'seatedCalfRaisePlateSeated', 'calfPressLegPressMachinePlateLoaded', 'calfPressLegPressMachineSingleLeg', 'calfPressLegPressMachineSelectorized') AND a.mapping_version = 9;
    IF n_mappings <> 59 THEN
        RAISE EXCEPTION 'V25: expected 59 muscle mappings, found %', n_mappings;
    END IF;

    SELECT COUNT(*) INTO hamstrings_count
    FROM exercise_variants v JOIN exercises e ON e.id = v.exercise_id
    WHERE e.main_muscle_group = 'HAMSTRINGS' AND v.active;
    SELECT COUNT(*) INTO calves_count
    FROM exercise_variants v JOIN exercises e ON e.id = v.exercise_id
    WHERE e.main_muscle_group = 'CALVES' AND v.active;
    SELECT COUNT(*) INTO full_body_deadlift
    FROM exercise_variants v JOIN exercises e ON e.id = v.exercise_id
    WHERE e.code='deadlift' AND e.main_muscle_group='FULL_BODY' AND v.active;

    IF hamstrings_count <> 15 OR calves_count <> 11 OR full_body_deadlift <> 3 THEN
        RAISE EXCEPTION 'V25: expected 15 hamstrings, 11 calves and 3 whole-body deadlifts, found % / % / %',
            hamstrings_count, calves_count, full_body_deadlift;
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercise_variants v WHERE v.code IN ('romanianDeadliftDumbbellStanding', 'romanianDeadliftDumbbellSingleLeg', 'romanianDeadliftSmithStanding', 'goodMorningSmithStanding', 'legCurlMachineSeatedUnilateral', 'legCurlMachineProneUnilateral', 'legCurlMachineStandingSingleLeg', 'legCurlCableStandingSingleLeg', 'legCurlBandStandingSingleLeg', 'nordicHamstringCurlBodyweightEccentric', 'nordicHamstringCurlBandAssisted', 'standingCalfRaiseSmithStanding', 'standingCalfRaiseDumbbellSingleLeg', 'standingCalfRaiseMachineStanding', 'standingCalfRaiseBodyweightSingleLeg', 'seatedCalfRaiseDumbbellSeated', 'seatedCalfRaisePlateSeated', 'calfPressLegPressMachinePlateLoaded', 'calfPressLegPressMachineSingleLeg', 'calfPressLegPressMachineSelectorized')
        AND NOT EXISTS (
            SELECT 1 FROM exercise_muscle_activations a
            WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY'
        )
    ) THEN
        RAISE EXCEPTION 'V25: a new variant has no primary muscle';
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercises e WHERE e.code IN (
            'romanianDeadlift','deadlift','goodMorning','legCurl','nordicHamstringCurl',
            'standingCalfRaise','seatedCalfRaise','calfPressLegPress'
        ) AND (SELECT COUNT(*) FROM exercise_variants v
               WHERE v.exercise_id=e.id AND v.active AND v.is_default) <> 1
    ) THEN
        RAISE EXCEPTION 'V25: missing or ambiguous default variant';
    END IF;
END $$;
