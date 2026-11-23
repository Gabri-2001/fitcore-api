-- V29: Resistencia y requisitos físicos son dimensiones diferentes.
-- BODYWEIGHT no significa "no necesita barra ni instalación".
-- Ningún ejercicio o variante histórica se renombra o elimina.
ALTER TABLE exercise_variants
    ADD COLUMN required_facility varchar(40) NOT NULL DEFAULT 'NONE',
    ADD COLUMN resistance_source varchar(24) NOT NULL DEFAULT 'EXTERNAL_LOAD',
    ADD COLUMN allows_added_weight boolean NOT NULL DEFAULT false,
    ADD COLUMN allows_assistance boolean NOT NULL DEFAULT false;

ALTER TABLE exercise_variants ADD CONSTRAINT exercise_variant_required_facility_check
CHECK (required_facility IN ('NONE','WALL','PULL_UP_BAR','PARALLEL_BARS',
                             'BENCH','CAPTAINS_CHAIR','ANKLE_ANCHOR'));
ALTER TABLE exercise_variants ADD CONSTRAINT exercise_variant_resistance_source_check
CHECK (resistance_source IN ('BODYWEIGHT','EXTERNAL_LOAD'));

UPDATE exercise_variants
SET resistance_source='BODYWEIGHT'
WHERE equipment IN ('BODYWEIGHT','NONE');

UPDATE exercise_variants v SET required_facility = CASE
   WHEN e.code IN ('pullUp','scapularPullUp','deadHang') THEN 'PULL_UP_BAR'
   WHEN e.code = 'dip' THEN 'PARALLEL_BARS'
   WHEN e.code = 'legRaise' AND v.code LIKE 'legRaiseCaptainChair%' THEN 'CAPTAINS_CHAIR'
   WHEN e.code = 'legRaise' AND v.body_position = 'HANGING' THEN 'PULL_UP_BAR'
   WHEN v.code = 'bulgarianSplitSquatBodyweight' THEN 'BENCH'
   WHEN v.code = 'hipThrustBodyweightBenchSupported' THEN 'BENCH'
   WHEN e.code = 'nordicHamstringCurl' THEN 'ANKLE_ANCHOR'
   WHEN v.code IN ('scapularPushUpWall','wallSlideBodyweight') THEN 'WALL'
   ELSE 'NONE'
END
FROM exercises e
WHERE v.exercise_id=e.id AND v.equipment='BODYWEIGHT';

-- La variante con banda necesita pared ADEMÁS de banda.
UPDATE exercise_variants SET required_facility='WALL'
WHERE code='wallSlideBandForearms';

UPDATE exercise_variants v
SET allows_added_weight=true
FROM exercises e WHERE v.exercise_id=e.id AND v.equipment='BODYWEIGHT'
AND e.code IN ('pushUp','pullUp','dip','plank','sidePlank','crunch',
               'reverseCrunch','hipThrust','lunge','splitSquat',
               'standingCalfRaise','deadHang');

UPDATE exercise_variants v SET allows_assistance=true
FROM exercises e WHERE v.exercise_id=e.id AND v.equipment='BODYWEIGHT'
AND e.code IN ('pullUp','dip');

-- V29 garantiza clasificación exhaustiva y ausencia de barras ocultas.
DO $$
DECLARE count_all integer; count_free integer; count_wall integer;
BEGIN
    SELECT COUNT(*) INTO count_all FROM exercise_variants WHERE equipment='BODYWEIGHT';
    SELECT COUNT(*) INTO count_free FROM exercise_variants
      WHERE equipment='BODYWEIGHT' AND required_facility IN ('NONE','WALL');
    SELECT COUNT(*) INTO count_wall FROM exercise_variants
      WHERE equipment='BODYWEIGHT' AND required_facility='WALL';
    IF count_all <> 42 OR count_free <> 20 OR count_wall <> 2 THEN
        RAISE EXCEPTION 'V29 bodyweight audit expected 42/20/2; found %/%/%',
             count_all,count_free,count_wall;
    END IF;
    IF EXISTS(SELECT 1 FROM exercise_variants v
          JOIN exercises e ON e.id=v.exercise_id
          WHERE e.code IN ('pullUp','dip','scapularPullUp','deadHang')
            AND v.equipment='BODYWEIGHT' AND v.required_facility='NONE') THEN
        RAISE EXCEPTION 'V29 bar/parallels requirements missing';
    END IF;
END $$;
