-- FitCore V24: progressive quadriceps/glute catalog enrichment and adductor taxonomy repair.
-- Preserve identifiers and historical workout references. Roles are qualitative inferences.

-- Hip adduction recruits the adductors as primary. It is not a gluteal family.
-- The original V1 exercises CHECK did not yet include ADDUCTORS.
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_main_muscle_group_check;
ALTER TABLE exercises ADD CONSTRAINT exercises_main_muscle_group_check
    CHECK (main_muscle_group IN (
        'CHEST','BACK','SHOULDERS','BICEPS','TRICEPS',
        'QUADRICEPS','HAMSTRINGS','GLUTES','ADDUCTORS','CALVES','CORE','FULL_BODY',
        'SCAPULAR','ROTATOR_CUFF','FOREARMS','NECK'
    ));
UPDATE exercises
SET main_muscle_group = 'ADDUCTORS', updated_at = CURRENT_TIMESTAMP
WHERE code = 'hipAdduction' AND main_muscle_group = 'GLUTES';

-- Preserve historical variants. New entries belong to existing exercise bases.
INSERT INTO exercise_variants (
    code, name, exercise_id, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    contraction_type, requires_caution, active, primary_focus, secondary_focus,
    practicality, focus_description, focus_evidence_type, focus_evidence_level,
    created_at, updated_at
)
SELECT seed.code, seed.name, e.id, seed.equipment, seed.grip_type, seed.grip_width,
       seed.bench_angle, seed.body_position, seed.laterality, seed.trajectory,
       seed.support_type, seed.stance_type, seed.attachment_type, seed.shoulder_position,
       seed.foot_placement, seed.knee_position, 'DYNAMIC', seed.requires_caution, true,
       seed.primary_focus, seed.secondary_focus, seed.practicality,
       seed.focus_description, 'BIOMECHANICAL_INFERENCE', 'MEDIUM',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('backSquatSmithStanding', 'Sentadilla trasera en Smith', 'backSquat', 'SMITH_MACHINE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BEHIND_TORSO', 'MEDIUM', 'FLEXED', true, 'QUAD_BIAS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Sentadilla guiada trasera. La trayectoria depende de la máquina.'),
    ('frontSquatSmithStanding', 'Sentadilla frontal en Smith', 'frontSquat', 'SMITH_MACHINE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'MEDIUM', 'FLEXED', true, 'QUAD_BIAS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Sentadilla frontal guiada; controlar la trayectoria y postura.'),
    ('frontSquatDumbbellStanding', 'Sentadilla frontal con mancuernas', 'frontSquat', 'DUMBBELL', 'NEUTRAL', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'MEDIUM', 'FLEXED', false, 'QUAD_BIAS', 'GLUTE_BIAS', 'COMMON', 'Sentadilla con mancuernas sostenidas frente a los hombros.'),
    ('hackSquatMachineNarrowFeet', 'Sentadilla hack con pies estrechos', 'hackSquat', 'MACHINE_PLATE_LOADED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'MACHINE_SUPPORTED', 'FEET_NARROW', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MID', 'FLEXED', false, 'QUAD_BIAS', 'GLUTE_BIAS', 'MACHINE_DEPENDENT', 'La colocación de pies adapta la postura, no garantiza un sesgo muscular.'),
    ('hackSquatMachineHighFeet', 'Sentadilla hack con pies altos', 'hackSquat', 'MACHINE_PLATE_LOADED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'BILATERAL', 'DOWNWARD', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'HIGH', 'FLEXED', false, 'QUAD_BIAS', 'GLUTE_BIAS', 'MACHINE_DEPENDENT', 'Plataforma y amplitud del movimiento condicionan la ejecución.'),
    ('legPressMachineSingleLeg', 'Prensa unilateral de piernas en máquina de discos', 'legPress', 'MACHINE_PLATE_LOADED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'DOWNWARD', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MID', 'FLEXED', false, 'QUAD_BIAS', 'UNILATERAL_STABILITY', 'MACHINE_DEPENDENT', 'Prensa unilateral: evitar rotaciones pélvicas y ajustar carga.'),
    ('legPressMachineSelectorizedSeated', 'Prensa horizontal en máquina selectorizada', 'legPress', 'MACHINE_SELECTORISED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'BILATERAL', 'HORIZONTAL', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MID', 'FLEXED', false, 'QUAD_BIAS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Prensa guiada selectorizada, distinto perfil de carga al sistema de discos.'),
    ('lungeDumbbellForward', 'Zancada hacia delante con mancuernas', 'lunge', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'ALTERNATING', 'DOWNWARD', 'FREE', 'STAGGERED', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', false, 'QUAD_BIAS', 'GLUTE_BIAS', 'COMMON', 'Zancada hacia delante, controlando la fase de frenado y el apoyo.'),
    ('lungeDumbbellWalking', 'Zancadas caminando con mancuernas', 'lunge', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'ALTERNATING', 'DOWNWARD', 'FREE', 'STAGGERED', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', false, 'QUAD_BIAS', 'GLUTE_BIAS', 'COMMON', 'Zancadas sucesivas caminando; exige equilibrio durante la transición.'),
    ('lungeBarbellReverse', 'Zancada inversa con barra', 'lunge', 'BARBELL', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'ALTERNATING', 'DOWNWARD', 'FREE', 'STAGGERED', 'NO_ATTACHMENT', 'ARMS_BEHIND_TORSO', 'MEDIUM', 'FLEXED', false, 'QUAD_BIAS', 'GLUTE_BIAS', 'COMMON', 'Zancada hacia atrás con barra sobre la espalda.'),
    ('lungeBodyweightReverse', 'Zancada inversa con peso corporal', 'lunge', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'ALTERNATING', 'DOWNWARD', 'FREE', 'STAGGERED', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', false, 'QUAD_BIAS', 'GLUTE_BIAS', 'COMMON', 'Zancada inversa sin carga externa, apta para progresión técnica.'),
    ('splitSquatDumbbellStandard', 'Sentadilla dividida con mancuernas', 'splitSquat', 'DUMBBELL', 'NEUTRAL', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'DOWNWARD', 'FREE', 'SPLIT', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', false, 'QUAD_BIAS', 'GLUTE_BIAS', 'COMMON', 'Sentadilla con pies divididos y ambos apoyos en el suelo.'),
    ('bulgarianSplitSquatSmith', 'Sentadilla búlgara en Smith', 'splitSquat', 'SMITH_MACHINE', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'DOWNWARD', 'BENCH_SUPPORTED', 'SPLIT', 'NO_ATTACHMENT', 'ARMS_BEHIND_TORSO', 'MEDIUM', 'FLEXED', false, 'QUAD_BIAS', 'GLUTE_BIAS', 'MACHINE_DEPENDENT', 'Sentadilla con pie posterior elevado y barra guiada; ajustar banco y trayectoria.'),
    ('splitSquatBarbellStandard', 'Sentadilla dividida con barra', 'splitSquat', 'BARBELL', 'PRONATED', 'MEDIUM', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'DOWNWARD', 'FREE', 'SPLIT', 'NO_ATTACHMENT', 'ARMS_BEHIND_TORSO', 'MEDIUM', 'FLEXED', false, 'QUAD_BIAS', 'GLUTE_BIAS', 'COMMON', 'Sentadilla con pies divididos y carga sobre la espalda.'),
    ('bulgarianSplitSquatBodyweight', 'Sentadilla búlgara con peso corporal', 'splitSquat', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'DOWNWARD', 'BENCH_SUPPORTED', 'SPLIT', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', false, 'QUAD_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Sentadilla búlgara sin carga externa con pie posterior elevado.'),
    ('legExtensionMachineSingleLeg', 'Extensión unilateral de piernas en máquina', 'legExtension', 'MACHINE_SELECTORISED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SEATED', 'UNILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'NOT_APPLICABLE', 'FLEXED', false, 'QUAD_BIAS', 'UNILATERAL_STABILITY', 'MACHINE_DEPENDENT', 'Extensión unilateral de rodilla. Evitar asumir aislamiento de una cabeza concreta.'),
    ('hipThrustMachinePlateLoaded', 'Hip thrust en máquina de discos', 'hipThrust', 'MACHINE_PLATE_LOADED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SUPINE', 'BILATERAL', 'UPWARD', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', false, 'GLUTE_BIAS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Extensión de cadera guiada; el apoyo y el recorrido dependen de la máquina.'),
    ('hipThrustSmithBenchSupported', 'Hip thrust en Smith con banco', 'hipThrust', 'SMITH_MACHINE', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', false, 'GLUTE_BIAS', 'MACHINE_STABILITY', 'MACHINE_DEPENDENT', 'Extensión de cadera con barra guiada y banco; ajustar altura y seguridad.'),
    ('hipThrustDumbbellBenchSupported', 'Hip thrust con mancuerna y banco', 'hipThrust', 'DUMBBELL', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', false, 'GLUTE_BIAS', NULL, 'COMMON', 'Extensión de cadera con carga en pelvis y apoyo escapular en banco.'),
    ('hipThrustBodyweightBenchSupported', 'Hip thrust con peso corporal y banco', 'hipThrust', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'SUPINE', 'BILATERAL', 'UPWARD', 'BENCH_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'FLEXED', false, 'GLUTE_BIAS', NULL, 'COMMON', 'Extensión de cadera con peso corporal y apoyo sobre banco.'),
    ('gluteKickbackMachineStanding', 'Patada de glúteo en máquina', 'gluteKickback', 'MACHINE_SELECTORISED', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'TO_HIP', 'MACHINE_SUPPORTED', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'GLUTE_BIAS', 'UNILATERAL_STABILITY', 'MACHINE_DEPENDENT', 'Extensión unilateral de cadera guiada; el recorrido depende de la máquina.'),
    ('gluteKickbackBandQuadruped', 'Patada de glúteo en cuadrupedia con banda', 'gluteKickback', 'BAND', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'QUADRUPED', 'UNILATERAL', 'TO_HIP', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'FLEXED', false, 'GLUTE_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Extensión de cadera en cuatro apoyos con banda; evitar compensación lumbar.'),
    ('gluteKickbackBodyweightQuadruped', 'Patada de glúteo en cuadrupedia', 'gluteKickback', 'BODYWEIGHT', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'QUADRUPED', 'UNILATERAL', 'TO_HIP', 'FLOOR_SUPPORTED', 'NOT_APPLICABLE', 'NO_ATTACHMENT', 'ARMS_IN_FRONT', 'NOT_APPLICABLE', 'FLEXED', false, 'GLUTE_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Extensión unilateral de cadera sin carga externa en cuadrupedia.'),
    ('hipAbductionCableStandingSingleLeg', 'Abducción unilateral de cadera en polea', 'hipAbduction', 'CABLE', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM', 'ANKLE_STRAP', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'HIP_ABDUCTION_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Abducción de cadera de pie con tobillera y control del tronco.'),
    ('hipAbductionBandStanding', 'Abducción de cadera de pie con banda', 'hipAbduction', 'BAND', 'NO_SPECIFIC_GRIP', 'NOT_APPLICABLE', 'NOT_APPLICABLE', 'STANDING', 'UNILATERAL', 'HORIZONTAL', 'FREE', 'FEET_MEDIUM', 'NO_ATTACHMENT', 'ARMS_BY_SIDES', 'MEDIUM', 'SLIGHTLY_FLEXED', false, 'HIP_ABDUCTION_BIAS', 'UNILATERAL_STABILITY', 'COMMON', 'Abducción de cadera con banda elástica; resistencia dependiente de la longitud.')
) AS seed (
    code, name, exercise_code, equipment, grip_type, grip_width, bench_angle,
    body_position, laterality, trajectory, support_type, stance_type,
    attachment_type, shoulder_position, foot_placement, knee_position,
    requires_caution, primary_focus, secondary_focus, practicality, focus_description
)
JOIN exercises e ON e.code = seed.exercise_code
ON CONFLICT (code) DO NOTHING;

-- Exactly one default for all eleven original exercise families.
UPDATE exercise_variants
SET is_default = false, updated_at = CURRENT_TIMESTAMP
WHERE is_default AND exercise_id IN (
    SELECT id FROM exercises WHERE code IN (
        'backSquat','frontSquat','hackSquat','legPress','lunge','splitSquat',
        'legExtension','hipThrust','gluteKickback','hipAbduction','hipAdduction'
    )
);
UPDATE exercise_variants
SET is_default = true, updated_at = CURRENT_TIMESTAMP
WHERE active AND code IN (
    'backSquatBarbellMediumStance',
    'frontSquatBarbellMediumStance',
    'hackSquatMachineMediumFeet',
    'legPressMachineMidFeet',
    'reverseLungeDumbbell',
    'bulgarianSplitSquatDumbbell',
    'legExtensionMachineSeated',
    'barbellHipThrust',
    'gluteKickbackCableStanding',
    'hipAbductionMachineSeated',
    'hipAdductionMachineSeated'
);

-- Anatomical portions and qualitative roles, without invented EMG percentages.
INSERT INTO exercise_muscle_activations (
    exercise_variant_id, muscle_id, role, activation_level, notes,
    confidence, source_type, source_refs, mapping_version,
    evidence_type, evidence_level, source_ref, rationale, created_at, updated_at
)
SELECT v.id, m.id, seed.role,
       CASE seed.role WHEN 'PRIMARY' THEN 3 WHEN 'SECONDARY' THEN 2 ELSE 1 END,
       NULL, CASE WHEN seed.evidence_level = 'MEDIUM' THEN 'MEDIUM' ELSE 'REVIEW' END,
       'BIOMECHANICAL_INFERENCE', NULL, 8,
       'BIOMECHANICAL_INFERENCE', seed.evidence_level, NULL,
       'Rol muscular orientativo por patrones de movimiento, sin afirmar aislamiento ni porcentajes.',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('backSquatSmithStanding', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('backSquatSmithStanding', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('backSquatSmithStanding', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('backSquatSmithStanding', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('backSquatSmithStanding', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('frontSquatSmithStanding', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('frontSquatSmithStanding', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('frontSquatSmithStanding', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('frontSquatSmithStanding', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('frontSquatSmithStanding', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('frontSquatDumbbellStanding', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('frontSquatDumbbellStanding', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('frontSquatDumbbellStanding', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('frontSquatDumbbellStanding', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('frontSquatDumbbellStanding', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('hackSquatMachineNarrowFeet', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('hackSquatMachineNarrowFeet', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('hackSquatMachineNarrowFeet', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('hackSquatMachineNarrowFeet', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('hackSquatMachineHighFeet', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('hackSquatMachineHighFeet', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('hackSquatMachineHighFeet', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('hackSquatMachineHighFeet', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('legPressMachineSingleLeg', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('legPressMachineSingleLeg', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('legPressMachineSingleLeg', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('legPressMachineSingleLeg', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('legPressMachineSelectorizedSeated', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('legPressMachineSelectorizedSeated', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('legPressMachineSelectorizedSeated', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('legPressMachineSelectorizedSeated', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('lungeDumbbellForward', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('lungeDumbbellForward', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('lungeDumbbellForward', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('lungeDumbbellForward', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('lungeDumbbellForward', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('lungeDumbbellForward', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('lungeDumbbellWalking', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('lungeDumbbellWalking', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('lungeDumbbellWalking', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('lungeDumbbellWalking', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('lungeDumbbellWalking', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('lungeDumbbellWalking', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('lungeBarbellReverse', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('lungeBarbellReverse', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('lungeBarbellReverse', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('lungeBarbellReverse', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('lungeBarbellReverse', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('lungeBarbellReverse', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('lungeBodyweightReverse', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('lungeBodyweightReverse', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('lungeBodyweightReverse', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('lungeBodyweightReverse', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('lungeBodyweightReverse', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('lungeBodyweightReverse', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('splitSquatDumbbellStandard', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('splitSquatDumbbellStandard', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('splitSquatDumbbellStandard', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('splitSquatDumbbellStandard', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('splitSquatDumbbellStandard', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('splitSquatDumbbellStandard', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('bulgarianSplitSquatSmith', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('bulgarianSplitSquatSmith', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('bulgarianSplitSquatSmith', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('bulgarianSplitSquatSmith', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('bulgarianSplitSquatSmith', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('bulgarianSplitSquatSmith', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('splitSquatBarbellStandard', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('splitSquatBarbellStandard', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('splitSquatBarbellStandard', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('splitSquatBarbellStandard', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('splitSquatBarbellStandard', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('splitSquatBarbellStandard', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('bulgarianSplitSquatBodyweight', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('bulgarianSplitSquatBodyweight', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('bulgarianSplitSquatBodyweight', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('bulgarianSplitSquatBodyweight', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('bulgarianSplitSquatBodyweight', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('bulgarianSplitSquatBodyweight', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('legExtensionMachineSingleLeg', 'VASTUS_MEDIALIS', 'PRIMARY', 'MEDIUM'),
    ('legExtensionMachineSingleLeg', 'VASTUS_LATERALIS', 'PRIMARY', 'MEDIUM'),
    ('legExtensionMachineSingleLeg', 'VASTUS_INTERMEDIUS', 'PRIMARY', 'MEDIUM'),
    ('hipThrustMachinePlateLoaded', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('hipThrustMachinePlateLoaded', 'GLUTEUS_MEDIUS', 'SECONDARY', 'LOW'),
    ('hipThrustMachinePlateLoaded', 'HAMSTRINGS_REGION', 'SECONDARY', 'LOW'),
    ('hipThrustSmithBenchSupported', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('hipThrustSmithBenchSupported', 'GLUTEUS_MEDIUS', 'SECONDARY', 'LOW'),
    ('hipThrustSmithBenchSupported', 'HAMSTRINGS_REGION', 'SECONDARY', 'LOW'),
    ('hipThrustDumbbellBenchSupported', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('hipThrustDumbbellBenchSupported', 'GLUTEUS_MEDIUS', 'SECONDARY', 'LOW'),
    ('hipThrustDumbbellBenchSupported', 'HAMSTRINGS_REGION', 'SECONDARY', 'LOW'),
    ('hipThrustBodyweightBenchSupported', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('hipThrustBodyweightBenchSupported', 'GLUTEUS_MEDIUS', 'SECONDARY', 'LOW'),
    ('hipThrustBodyweightBenchSupported', 'HAMSTRINGS_REGION', 'SECONDARY', 'LOW'),
    ('gluteKickbackMachineStanding', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('gluteKickbackMachineStanding', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('gluteKickbackMachineStanding', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('gluteKickbackBandQuadruped', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('gluteKickbackBandQuadruped', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('gluteKickbackBandQuadruped', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('gluteKickbackBodyweightQuadruped', 'GLUTEUS_MAXIMUS', 'PRIMARY', 'MEDIUM'),
    ('gluteKickbackBodyweightQuadruped', 'GLUTEUS_MEDIUS', 'STABILIZER', 'LOW'),
    ('gluteKickbackBodyweightQuadruped', 'ERECTOR_SPINAE_LUMBAR', 'STABILIZER', 'LOW'),
    ('hipAbductionCableStandingSingleLeg', 'GLUTEUS_MEDIUS', 'PRIMARY', 'MEDIUM'),
    ('hipAbductionCableStandingSingleLeg', 'TENSOR_FASCIAE_LATAE', 'SECONDARY', 'LOW'),
    ('hipAbductionCableStandingSingleLeg', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW'),
    ('hipAbductionBandStanding', 'GLUTEUS_MEDIUS', 'PRIMARY', 'MEDIUM'),
    ('hipAbductionBandStanding', 'TENSOR_FASCIAE_LATAE', 'SECONDARY', 'LOW'),
    ('hipAbductionBandStanding', 'GLUTEUS_MAXIMUS', 'SECONDARY', 'LOW')
) AS seed (variant_code, muscle_code, role, evidence_level)
JOIN exercise_variants v ON v.code = seed.variant_code
JOIN muscles m ON m.code = seed.muscle_code
ON CONFLICT (exercise_variant_id, muscle_id) DO NOTHING;

DO $$
DECLARE
    inserted_variants integer;
    inserted_mappings integer;
    q_count integer;
    g_count integer;
BEGIN
    SELECT COUNT(*) INTO inserted_variants FROM exercise_variants WHERE code IN ('backSquatSmithStanding', 'frontSquatSmithStanding', 'frontSquatDumbbellStanding', 'hackSquatMachineNarrowFeet', 'hackSquatMachineHighFeet', 'legPressMachineSingleLeg', 'legPressMachineSelectorizedSeated', 'lungeDumbbellForward', 'lungeDumbbellWalking', 'lungeBarbellReverse', 'lungeBodyweightReverse', 'splitSquatDumbbellStandard', 'bulgarianSplitSquatSmith', 'splitSquatBarbellStandard', 'bulgarianSplitSquatBodyweight', 'legExtensionMachineSingleLeg', 'hipThrustMachinePlateLoaded', 'hipThrustSmithBenchSupported', 'hipThrustDumbbellBenchSupported', 'hipThrustBodyweightBenchSupported', 'gluteKickbackMachineStanding', 'gluteKickbackBandQuadruped', 'gluteKickbackBodyweightQuadruped', 'hipAbductionCableStandingSingleLeg', 'hipAbductionBandStanding');
    IF inserted_variants <> 25 THEN
        RAISE EXCEPTION 'V24: expected 25 variants, found %', inserted_variants;
    END IF;
    SELECT COUNT(*) INTO inserted_mappings
    FROM exercise_muscle_activations a
    JOIN exercise_variants v ON v.id = a.exercise_variant_id
    WHERE v.code IN ('backSquatSmithStanding', 'frontSquatSmithStanding', 'frontSquatDumbbellStanding', 'hackSquatMachineNarrowFeet', 'hackSquatMachineHighFeet', 'legPressMachineSingleLeg', 'legPressMachineSelectorizedSeated', 'lungeDumbbellForward', 'lungeDumbbellWalking', 'lungeBarbellReverse', 'lungeBodyweightReverse', 'splitSquatDumbbellStandard', 'bulgarianSplitSquatSmith', 'splitSquatBarbellStandard', 'bulgarianSplitSquatBodyweight', 'legExtensionMachineSingleLeg', 'hipThrustMachinePlateLoaded', 'hipThrustSmithBenchSupported', 'hipThrustDumbbellBenchSupported', 'hipThrustBodyweightBenchSupported', 'gluteKickbackMachineStanding', 'gluteKickbackBandQuadruped', 'gluteKickbackBodyweightQuadruped', 'hipAbductionCableStandingSingleLeg', 'hipAbductionBandStanding') AND a.mapping_version = 8;
    IF inserted_mappings <> 109 THEN
        RAISE EXCEPTION 'V24: expected 109 muscle mappings, found %', inserted_mappings;
    END IF;

    SELECT COUNT(*) INTO q_count FROM exercise_variants v
    JOIN exercises e ON e.id = v.exercise_id
    WHERE e.main_muscle_group = 'QUADRICEPS' AND v.active;
    SELECT COUNT(*) INTO g_count FROM exercise_variants v
    JOIN exercises e ON e.id = v.exercise_id
    WHERE e.main_muscle_group = 'GLUTES' AND v.active;
    IF q_count <> 25 OR g_count <> 12 THEN
        RAISE EXCEPTION 'V24: expected quadriceps 25 and glutes 12, found % / %', q_count, g_count;
    END IF;

    IF (SELECT main_muscle_group FROM exercises WHERE code = 'hipAdduction') <> 'ADDUCTORS' THEN
        RAISE EXCEPTION 'V24: hipAdduction must belong to ADDUCTORS';
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercise_variants v
        WHERE v.code IN ('backSquatSmithStanding', 'frontSquatSmithStanding', 'frontSquatDumbbellStanding', 'hackSquatMachineNarrowFeet', 'hackSquatMachineHighFeet', 'legPressMachineSingleLeg', 'legPressMachineSelectorizedSeated', 'lungeDumbbellForward', 'lungeDumbbellWalking', 'lungeBarbellReverse', 'lungeBodyweightReverse', 'splitSquatDumbbellStandard', 'bulgarianSplitSquatSmith', 'splitSquatBarbellStandard', 'bulgarianSplitSquatBodyweight', 'legExtensionMachineSingleLeg', 'hipThrustMachinePlateLoaded', 'hipThrustSmithBenchSupported', 'hipThrustDumbbellBenchSupported', 'hipThrustBodyweightBenchSupported', 'gluteKickbackMachineStanding', 'gluteKickbackBandQuadruped', 'gluteKickbackBodyweightQuadruped', 'hipAbductionCableStandingSingleLeg', 'hipAbductionBandStanding')
        AND NOT EXISTS (
            SELECT 1 FROM exercise_muscle_activations a
            WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY'
        )
    ) THEN
        RAISE EXCEPTION 'V24: new variant without primary muscle';
    END IF;

    IF EXISTS (
        SELECT 1 FROM exercises e WHERE e.code IN (
            'backSquat','frontSquat','hackSquat','legPress','lunge','splitSquat',
            'legExtension','hipThrust','gluteKickback','hipAbduction','hipAdduction'
        ) AND (
            SELECT COUNT(*) FROM exercise_variants v
            WHERE v.exercise_id=e.id AND v.active AND v.is_default
        ) <> 1
    ) THEN
        RAISE EXCEPTION 'V24: missing/ambiguous default for legs or glutes';
    END IF;
END $$;
