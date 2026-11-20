package com.gabri.fitcoreapi;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class FlywayPostgresIntegrationTest {
    private static final String TEST_JWT_SECRET =
            "ZmFrZVN1cGVyU2VjdXJlQmFzZTY0S2V5Rm9yRml0Q29yZUFwaVByb2plY3QxMjM0NTY3ODkw";

    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("app.security.jwt.secret", () -> TEST_JWT_SECRET);
    }

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Test
    void appliesAllMigrationsAndValidatesTheSchema() {
        Integer version = jdbcTemplate.queryForObject(
                "select max(cast(version as integer)) from flyway_schema_history where success = true",
                Integer.class);
        assertEquals(28, version);
    }

    @Test
    void seedsChestVariantsAndKeepsStableDefaults() {
        Integer chestCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM exercise_variants v
                JOIN exercises e ON e.id = v.exercise_id
                WHERE e.main_muscle_group = 'CHEST'
                """, Integer.class);
        assertEquals(31, chestCount);

        Integer lowInclines = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants
                WHERE bench_angle = 'LOW_INCLINE' AND code IN (
                  'benchPressBarbellLowInclineMediumGrip',
                  'benchPressDumbbellLowInclineNeutralGrip',
                  'benchPressSmithLowInclineMediumGrip'
                )
                """, Integer.class);
        assertEquals(3, lowInclines);

        Integer newVariantsWithoutActivation = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v
                WHERE v.code IN (
                  'benchPressBarbellInclineMediumGrip',
                  'benchPressDumbbellInclineNeutralGrip',
                  'benchPressDumbbellInclinePronatedGrip',
                  'benchPressSmithFlatMediumGrip',
                  'benchPressSmithInclineMediumGrip',
                  'benchPressBarbellDeclineMediumGrip',
                  'benchPressDumbbellDeclineNeutralGrip',
                  'benchPressDumbbellFlatPronatedGrip',
                  'benchPressBarbellLowInclineMediumGrip',
                  'benchPressDumbbellLowInclineNeutralGrip',
                  'benchPressSmithLowInclineMediumGrip',
                  'chestFlyDumbbellFlat', 'chestFlyDumbbellIncline',
                  'chestFlyCableLowToHigh', 'chestFlyCableHighToLow',
                  'chestFlyCableSeated',
                  'chestPressMachineInclinePronatedMediumGrip',
                  'chestPressMachineDeclinePronatedMediumGrip',
                  'chestPressMachinePlateLoadedFlatNeutralGrip'
                ) AND NOT EXISTS (
                  SELECT 1 FROM exercise_muscle_activations a
                  WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY'
                )
                """, Integer.class);
        assertEquals(0, newVariantsWithoutActivation);

        Integer missingDefault = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM exercises e
                WHERE EXISTS (
                  SELECT 1 FROM exercise_variants v
                  WHERE v.exercise_id = e.id AND v.active = true
                ) AND NOT EXISTS (
                  SELECT 1 FROM exercise_variants v
                  WHERE v.exercise_id = e.id AND v.active = true AND v.is_default = true
                )
                """, Integer.class);
        assertEquals(0, missingDefault);

        Integer chestDefaults = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v
                JOIN exercises e ON e.id = v.exercise_id
                WHERE e.main_muscle_group = 'CHEST' AND v.active AND v.is_default
                """, Integer.class);
        assertEquals(5, chestDefaults);

        Boolean benchDefault = jdbcTemplate.queryForObject("""
                SELECT is_default FROM exercise_variants
                WHERE code = 'benchPressBarbellFlatMediumGrip'
                """, Boolean.class);
        assertEquals(Boolean.TRUE, benchDefault);
    }

    @Test
    void seedsBackVariantsWithQualitativeActivationsAndStableDefaults() {
        Integer backVariants = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM exercise_variants v
                JOIN exercises e ON e.id = v.exercise_id
                WHERE e.main_muscle_group = 'BACK'
                """, Integer.class);
        assertEquals(40, backVariants);

        // V15 ya utilizaba mapping_version=5 para dominadas. Contar solo los
        // codigos introducidos por V21 evita mezclar historiales de mapeo.
        Integer v21Variants = jdbcTemplate.queryForObject("""
                SELECT COUNT(DISTINCT v.id)
                FROM exercise_variants v
                JOIN exercise_muscle_activations a ON a.exercise_variant_id = v.id
                WHERE a.mapping_version = 5 AND v.code IN (
                    'latPulldownSingleArmKneelingNeutralGrip',
                    'seatedCableRowPronatedWideGrip',
                    'seatedCableRowSupinatedMediumGrip',
                    'seatedCableRowSingleArmNeutralGrip',
                    'machineRowSelectorisedNeutralMediumGrip',
                    'machineRowUnilateralNeutralGrip',
                    'barbellRowPronatedWideGripToUpperChest',
                    'barbellRowPronatedMediumGripToHip',
                    'oneArmDumbbellRowFreeNeutralGrip',
                    'oneArmDumbbellRowChestSupportedIncline',
                    'straightArmPulldownCableSingleArm',
                    'shrugDumbbellStanding',
                    'shrugMachineStanding'
                )
                """, Integer.class);
        assertEquals(13, v21Variants);

        Integer v21Activations = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_muscle_activations a
                JOIN exercise_variants v ON v.id = a.exercise_variant_id
                WHERE a.mapping_version = 5 AND v.code IN (
                    'latPulldownSingleArmKneelingNeutralGrip',
                    'seatedCableRowPronatedWideGrip',
                    'seatedCableRowSupinatedMediumGrip',
                    'seatedCableRowSingleArmNeutralGrip',
                    'machineRowSelectorisedNeutralMediumGrip',
                    'machineRowUnilateralNeutralGrip',
                    'barbellRowPronatedWideGripToUpperChest',
                    'barbellRowPronatedMediumGripToHip',
                    'oneArmDumbbellRowFreeNeutralGrip',
                    'oneArmDumbbellRowChestSupportedIncline',
                    'straightArmPulldownCableSingleArm',
                    'shrugDumbbellStanding',
                    'shrugMachineStanding'
                )
                """, Integer.class);
        assertEquals(69, v21Activations);

        Integer missingPrimary = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v
                WHERE EXISTS (
                    SELECT 1 FROM exercise_muscle_activations a
                    WHERE a.exercise_variant_id = v.id AND a.mapping_version = 5
                ) AND NOT EXISTS (
                    SELECT 1 FROM exercise_muscle_activations a
                    WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY'
                )
                """, Integer.class);
        assertEquals(0, missingPrimary);

        Integer backDefaults = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v
                JOIN exercises e ON e.id = v.exercise_id
                WHERE e.main_muscle_group = 'BACK' AND v.active AND v.is_default
                """, Integer.class);
        assertEquals(8, backDefaults);

        Integer pullUps = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v
                JOIN exercises e ON e.id = v.exercise_id
                WHERE e.code = 'pullUp'
                """, Integer.class);
        assertEquals(9, pullUps);

        Boolean preferredRow = jdbcTemplate.queryForObject("""
                SELECT is_default FROM exercise_variants
                WHERE code = 'seatedCableRowNeutralGrip'
                """, Boolean.class);
        assertEquals(Boolean.TRUE, preferredRow);

        Boolean preferredPulldown = jdbcTemplate.queryForObject("""
                SELECT is_default FROM exercise_variants
                WHERE code = 'latPulldownPronatedMediumGripToChest'
                """, Boolean.class);
        assertEquals(Boolean.TRUE, preferredPulldown);
    }


    @Test
    void seedsShoulderVariantsAndAuditsPreviousMuscleGroups() {
        Integer newShoulderVariants = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants
                WHERE code IN ('overheadPressDumbbellStanding', 'overheadPressDumbbellSeated', 'overheadPressSmithSeated', 'overheadPressMachineSeated', 'lateralRaiseCableUnilateralStanding', 'lateralRaiseMachineSeated', 'lateralRaiseDumbbellSeated', 'frontRaiseCableStanding', 'frontRaisePlateStanding', 'rearDeltFlyDumbbellBentOver', 'rearDeltFlyCableStanding', 'rearDeltFlyDumbbellChestSupportedIncline', 'facePullBandStanding')
                """, Integer.class);
        assertEquals(13, newShoulderVariants);

        Integer shoulderCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v
                JOIN exercises e ON e.id = v.exercise_id
                WHERE e.main_muscle_group = 'SHOULDERS' AND v.active
                """, Integer.class);
        assertEquals(18, shoulderCount);

        Integer mappings = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_muscle_activations a
                JOIN exercise_variants v ON v.id = a.exercise_variant_id
                WHERE v.code IN ('overheadPressDumbbellStanding', 'overheadPressDumbbellSeated', 'overheadPressSmithSeated', 'overheadPressMachineSeated', 'lateralRaiseCableUnilateralStanding', 'lateralRaiseMachineSeated', 'lateralRaiseDumbbellSeated', 'frontRaiseCableStanding', 'frontRaisePlateStanding', 'rearDeltFlyDumbbellBentOver', 'rearDeltFlyCableStanding', 'rearDeltFlyDumbbellChestSupportedIncline', 'facePullBandStanding') AND a.mapping_version = 6
                """, Integer.class);
        assertEquals(63, mappings);

        Integer missingPrimary = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v
                WHERE v.code IN ('overheadPressDumbbellStanding', 'overheadPressDumbbellSeated', 'overheadPressSmithSeated', 'overheadPressMachineSeated', 'lateralRaiseCableUnilateralStanding', 'lateralRaiseMachineSeated', 'lateralRaiseDumbbellSeated', 'frontRaiseCableStanding', 'frontRaisePlateStanding', 'rearDeltFlyDumbbellBentOver', 'rearDeltFlyCableStanding', 'rearDeltFlyDumbbellChestSupportedIncline', 'facePullBandStanding') AND NOT EXISTS (
                    SELECT 1 FROM exercise_muscle_activations a
                    WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY'
                )
                """, Integer.class);
        assertEquals(0, missingPrimary);

        String uprightDipAngle = jdbcTemplate.queryForObject("""
                SELECT bench_angle FROM exercise_variants
                WHERE code = 'dipBodyweightUpright'
                """, String.class);
        assertEquals("NOT_APPLICABLE", uprightDipAngle);

        Integer existingCounts = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v
                JOIN exercises e ON e.id = v.exercise_id
                WHERE e.main_muscle_group IN ('CHEST','BACK') AND v.active
                """, Integer.class);
        assertEquals(71, existingCounts);

        Integer shoulderDefaults = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v
                JOIN exercises e ON e.id = v.exercise_id
                WHERE e.main_muscle_group = 'SHOULDERS' AND v.active AND v.is_default
                """, Integer.class);
        assertEquals(5, shoulderDefaults);
    }


    @Test
    void seedsBicepsAndTricepsVariantsWithValidMuscleMappings() {
        Integer newVariants = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants
                WHERE code IN ('bicepsCurlBarbellStanding', 'bicepsCurlEzBarStanding', 'bicepsCurlDumbbellInclineSeated', 'bicepsCurlDumbbellPreacherSeated', 'bicepsCurlCableStanding', 'bicepsCurlDumbbellConcentrationSeated', 'hammerCurlCableRopeStanding', 'hammerCurlDumbbellSeated', 'reverseCurlBarbellStanding', 'reverseCurlCableStanding', 'tricepsPushdownCableStraightBar', 'tricepsPushdownCableVBar', 'tricepsPushdownCableSingleArm', 'overheadTricepsExtensionDumbbellSeated', 'overheadTricepsExtensionEzBarSeated', 'overheadTricepsExtensionCableSingleArm', 'lyingTricepsExtensionDumbbellFlat', 'lyingTricepsExtensionEzBarIncline')
                """, Integer.class);
        assertEquals(18, newVariants);

        Integer mapped = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_muscle_activations a
                JOIN exercise_variants v ON v.id = a.exercise_variant_id
                WHERE a.mapping_version = 7 AND v.code IN ('bicepsCurlBarbellStanding', 'bicepsCurlEzBarStanding', 'bicepsCurlDumbbellInclineSeated', 'bicepsCurlDumbbellPreacherSeated', 'bicepsCurlCableStanding', 'bicepsCurlDumbbellConcentrationSeated', 'hammerCurlCableRopeStanding', 'hammerCurlDumbbellSeated', 'reverseCurlBarbellStanding', 'reverseCurlCableStanding', 'tricepsPushdownCableStraightBar', 'tricepsPushdownCableVBar', 'tricepsPushdownCableSingleArm', 'overheadTricepsExtensionDumbbellSeated', 'overheadTricepsExtensionEzBarSeated', 'overheadTricepsExtensionCableSingleArm', 'lyingTricepsExtensionDumbbellFlat', 'lyingTricepsExtensionEzBarIncline')
                """, Integer.class);
        assertEquals(77, mapped);

        Integer missingPrimary = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v WHERE v.code IN ('bicepsCurlBarbellStanding', 'bicepsCurlEzBarStanding', 'bicepsCurlDumbbellInclineSeated', 'bicepsCurlDumbbellPreacherSeated', 'bicepsCurlCableStanding', 'bicepsCurlDumbbellConcentrationSeated', 'hammerCurlCableRopeStanding', 'hammerCurlDumbbellSeated', 'reverseCurlBarbellStanding', 'reverseCurlCableStanding', 'tricepsPushdownCableStraightBar', 'tricepsPushdownCableVBar', 'tricepsPushdownCableSingleArm', 'overheadTricepsExtensionDumbbellSeated', 'overheadTricepsExtensionEzBarSeated', 'overheadTricepsExtensionCableSingleArm', 'lyingTricepsExtensionDumbbellFlat', 'lyingTricepsExtensionEzBarIncline')
                AND NOT EXISTS (SELECT 1 FROM exercise_muscle_activations a
                    WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY')
                """, Integer.class);
        assertEquals(0, missingPrimary);

        Integer biceps = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id = v.exercise_id
                WHERE e.main_muscle_group = 'BICEPS' AND v.active
                """, Integer.class);
        Integer triceps = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id = v.exercise_id
                WHERE e.main_muscle_group = 'TRICEPS' AND v.active
                """, Integer.class);
        assertEquals(13, biceps);
        assertEquals(11, triceps);

        Integer armDefaults = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id = v.exercise_id
                WHERE e.main_muscle_group IN ('BICEPS','TRICEPS') AND v.active AND v.is_default
                """, Integer.class);
        assertEquals(6, armDefaults);

        String preacherSupport = jdbcTemplate.queryForObject("""
                SELECT support_type FROM exercise_variants
                WHERE code = 'bicepsCurlDumbbellPreacherSeated'
                """, String.class);
        assertEquals("BENCH_SUPPORTED", preacherSupport);
    }


    @Test
    void seedsLowerBodyV24AndReclassifiesHipAdduction() {
        Integer v24 = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants WHERE code IN ('backSquatSmithStanding', 'frontSquatSmithStanding', 'frontSquatDumbbellStanding', 'hackSquatMachineNarrowFeet', 'hackSquatMachineHighFeet', 'legPressMachineSingleLeg', 'legPressMachineSelectorizedSeated', 'lungeDumbbellForward', 'lungeDumbbellWalking', 'lungeBarbellReverse', 'lungeBodyweightReverse', 'splitSquatDumbbellStandard', 'bulgarianSplitSquatSmith', 'splitSquatBarbellStandard', 'bulgarianSplitSquatBodyweight', 'legExtensionMachineSingleLeg', 'hipThrustMachinePlateLoaded', 'hipThrustSmithBenchSupported', 'hipThrustDumbbellBenchSupported', 'hipThrustBodyweightBenchSupported', 'gluteKickbackMachineStanding', 'gluteKickbackBandQuadruped', 'gluteKickbackBodyweightQuadruped', 'hipAbductionCableStandingSingleLeg', 'hipAbductionBandStanding')
                """, Integer.class);
        assertEquals(25, v24);

        Integer mappings = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_muscle_activations a
                JOIN exercise_variants v ON v.id = a.exercise_variant_id
                WHERE v.code IN ('backSquatSmithStanding', 'frontSquatSmithStanding', 'frontSquatDumbbellStanding', 'hackSquatMachineNarrowFeet', 'hackSquatMachineHighFeet', 'legPressMachineSingleLeg', 'legPressMachineSelectorizedSeated', 'lungeDumbbellForward', 'lungeDumbbellWalking', 'lungeBarbellReverse', 'lungeBodyweightReverse', 'splitSquatDumbbellStandard', 'bulgarianSplitSquatSmith', 'splitSquatBarbellStandard', 'bulgarianSplitSquatBodyweight', 'legExtensionMachineSingleLeg', 'hipThrustMachinePlateLoaded', 'hipThrustSmithBenchSupported', 'hipThrustDumbbellBenchSupported', 'hipThrustBodyweightBenchSupported', 'gluteKickbackMachineStanding', 'gluteKickbackBandQuadruped', 'gluteKickbackBodyweightQuadruped', 'hipAbductionCableStandingSingleLeg', 'hipAbductionBandStanding') AND a.mapping_version = 8
                """, Integer.class);
        assertEquals(109, mappings);

        Integer missingPrimary = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v WHERE v.code IN ('backSquatSmithStanding', 'frontSquatSmithStanding', 'frontSquatDumbbellStanding', 'hackSquatMachineNarrowFeet', 'hackSquatMachineHighFeet', 'legPressMachineSingleLeg', 'legPressMachineSelectorizedSeated', 'lungeDumbbellForward', 'lungeDumbbellWalking', 'lungeBarbellReverse', 'lungeBodyweightReverse', 'splitSquatDumbbellStandard', 'bulgarianSplitSquatSmith', 'splitSquatBarbellStandard', 'bulgarianSplitSquatBodyweight', 'legExtensionMachineSingleLeg', 'hipThrustMachinePlateLoaded', 'hipThrustSmithBenchSupported', 'hipThrustDumbbellBenchSupported', 'hipThrustBodyweightBenchSupported', 'gluteKickbackMachineStanding', 'gluteKickbackBandQuadruped', 'gluteKickbackBodyweightQuadruped', 'hipAbductionCableStandingSingleLeg', 'hipAbductionBandStanding')
                AND NOT EXISTS (
                    SELECT 1 FROM exercise_muscle_activations a
                    WHERE a.exercise_variant_id = v.id AND a.role = 'PRIMARY'
                )
                """, Integer.class);
        assertEquals(0, missingPrimary);

        Integer quadriceps = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group='QUADRICEPS' AND v.active
                """, Integer.class);
        Integer glutes = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group='GLUTES' AND v.active
                """, Integer.class);
        assertEquals(25, quadriceps);
        assertEquals(12, glutes);

        String adductorsGroup = jdbcTemplate.queryForObject("""
                SELECT main_muscle_group FROM exercises WHERE code='hipAdduction'
                """, String.class);
        assertEquals("ADDUCTORS", adductorsGroup);

        Integer defaultCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.code IN ('backSquat','frontSquat','hackSquat','legPress','lunge','splitSquat',
                                 'legExtension','hipThrust','gluteKickback','hipAbduction','hipAdduction')
                    AND v.active AND v.is_default
                """, Integer.class);
        assertEquals(11, defaultCount);
    }


    @Test
    void seedsHamstringsAndCalvesInV25WithStableDefaults() {
        Integer newVariants = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants WHERE code IN ('romanianDeadliftDumbbellStanding', 'romanianDeadliftDumbbellSingleLeg', 'romanianDeadliftSmithStanding', 'goodMorningSmithStanding', 'legCurlMachineSeatedUnilateral', 'legCurlMachineProneUnilateral', 'legCurlMachineStandingSingleLeg', 'legCurlCableStandingSingleLeg', 'legCurlBandStandingSingleLeg', 'nordicHamstringCurlBodyweightEccentric', 'nordicHamstringCurlBandAssisted', 'standingCalfRaiseSmithStanding', 'standingCalfRaiseDumbbellSingleLeg', 'standingCalfRaiseMachineStanding', 'standingCalfRaiseBodyweightSingleLeg', 'seatedCalfRaiseDumbbellSeated', 'seatedCalfRaisePlateSeated', 'calfPressLegPressMachinePlateLoaded', 'calfPressLegPressMachineSingleLeg', 'calfPressLegPressMachineSelectorized')
                """, Integer.class);
        assertEquals(20, newVariants);

        Integer mappings = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_muscle_activations a
                JOIN exercise_variants v ON v.id=a.exercise_variant_id
                WHERE a.mapping_version=9 AND v.code IN ('romanianDeadliftDumbbellStanding', 'romanianDeadliftDumbbellSingleLeg', 'romanianDeadliftSmithStanding', 'goodMorningSmithStanding', 'legCurlMachineSeatedUnilateral', 'legCurlMachineProneUnilateral', 'legCurlMachineStandingSingleLeg', 'legCurlCableStandingSingleLeg', 'legCurlBandStandingSingleLeg', 'nordicHamstringCurlBodyweightEccentric', 'nordicHamstringCurlBandAssisted', 'standingCalfRaiseSmithStanding', 'standingCalfRaiseDumbbellSingleLeg', 'standingCalfRaiseMachineStanding', 'standingCalfRaiseBodyweightSingleLeg', 'seatedCalfRaiseDumbbellSeated', 'seatedCalfRaisePlateSeated', 'calfPressLegPressMachinePlateLoaded', 'calfPressLegPressMachineSingleLeg', 'calfPressLegPressMachineSelectorized')
                """, Integer.class);
        assertEquals(59, mappings);

        Integer hamstrings = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group='HAMSTRINGS' AND v.active
                """, Integer.class);
        Integer calves = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group='CALVES' AND v.active
                """, Integer.class);
        assertEquals(15, hamstrings);
        assertEquals(11, calves);

        String deadliftGroup = jdbcTemplate.queryForObject("""
                SELECT main_muscle_group FROM exercises WHERE code='deadlift'
                """, String.class);
        assertEquals("FULL_BODY", deadliftGroup);

        Integer deadliftVariants = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v
                JOIN exercises e ON e.id=v.exercise_id
                WHERE e.code='deadlift' AND v.active
                """, Integer.class);
        assertEquals(3, deadliftVariants);

        Integer missingPrimary = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v WHERE v.code IN ('romanianDeadliftDumbbellStanding', 'romanianDeadliftDumbbellSingleLeg', 'romanianDeadliftSmithStanding', 'goodMorningSmithStanding', 'legCurlMachineSeatedUnilateral', 'legCurlMachineProneUnilateral', 'legCurlMachineStandingSingleLeg', 'legCurlCableStandingSingleLeg', 'legCurlBandStandingSingleLeg', 'nordicHamstringCurlBodyweightEccentric', 'nordicHamstringCurlBandAssisted', 'standingCalfRaiseSmithStanding', 'standingCalfRaiseDumbbellSingleLeg', 'standingCalfRaiseMachineStanding', 'standingCalfRaiseBodyweightSingleLeg', 'seatedCalfRaiseDumbbellSeated', 'seatedCalfRaisePlateSeated', 'calfPressLegPressMachinePlateLoaded', 'calfPressLegPressMachineSingleLeg', 'calfPressLegPressMachineSelectorized')
                AND NOT EXISTS (
                    SELECT 1 FROM exercise_muscle_activations a
                    WHERE a.exercise_variant_id=v.id AND a.role='PRIMARY'
                )
                """, Integer.class);
        assertEquals(0, missingPrimary);

        Integer defaults = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.code IN (
                    'romanianDeadlift','deadlift','goodMorning','legCurl','nordicHamstringCurl',
                    'standingCalfRaise','seatedCalfRaise','calfPressLegPress'
                ) AND v.active AND v.is_default
                """, Integer.class);
        assertEquals(8, defaults);

        String nordicSupport = jdbcTemplate.queryForObject("""
                SELECT support_type FROM exercise_variants
                WHERE code='nordicHamstringCurlBandAssisted'
                """, String.class);
        assertEquals("FLOOR_SUPPORTED", nordicSupport);
    }


    @Test
    void seedsCoreByMovementPatternInV26() {
        Integer variants = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group='CORE' AND v.active
                """, Integer.class);
        assertEquals(25, variants);

        Integer families = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercises WHERE main_muscle_group='CORE' AND active
                """, Integer.class);
        assertEquals(9, families);

        Integer newMappings = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_muscle_activations WHERE mapping_version=10
                """, Integer.class);
        assertEquals(70, newMappings);

        Integer missingPrimary = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group='CORE' AND v.active
                  AND NOT EXISTS (SELECT 1 FROM exercise_muscle_activations a
                                  WHERE a.exercise_variant_id=v.id AND a.role='PRIMARY')
                """, Integer.class);
        assertEquals(0, missingPrimary);

        Integer activeDefaults = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group='CORE' AND v.active AND v.is_default
                """, Integer.class);
        assertEquals(9, activeDefaults);

        String pallofPattern = jdbcTemplate.queryForObject("""
                SELECT movement_pattern FROM exercises WHERE code='pallofPress'
                """, String.class);
        String woodchopperPattern = jdbcTemplate.queryForObject("""
                SELECT movement_pattern FROM exercises WHERE code='woodchopper'
                """, String.class);
        assertEquals("ANTI_ROTATION", pallofPattern);
        assertEquals("TRUNK_ROTATION", woodchopperPattern);

        String sidePlankUnit = jdbcTemplate.queryForObject("""
                SELECT default_unit FROM exercises WHERE code='sidePlank'
                """, String.class);
        assertEquals("SECONDS", sidePlankUnit);

        String visibleHangingName = jdbcTemplate.queryForObject("""
                SELECT name FROM exercise_variants WHERE code='legRaiseHanging'
                """, String.class);
        assertEquals("Elevación de piernas colgado", visibleHangingName);
    }


    @Test
    void seedsForearmAndGripFamiliesInV27WithoutSyntheticMuscleRegions() {
        Integer families=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercises WHERE main_muscle_group='FOREARMS' AND active
                """, Integer.class);
        assertEquals(7,families);
        Integer variants=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group='FOREARMS' AND v.active
                """, Integer.class);
        assertEquals(20,variants);
        Integer mapping=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_muscle_activations WHERE mapping_version=11
                """, Integer.class);
        assertEquals(41,mapping);
        Integer missingPrimary=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group='FOREARMS' AND v.active AND NOT EXISTS
                  (SELECT 1 FROM exercise_muscle_activations a
                   WHERE a.exercise_variant_id=v.id AND a.role='PRIMARY')
                """, Integer.class);
        assertEquals(0,missingPrimary);
        Integer defaults=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group='FOREARMS' AND v.active AND v.is_default
                """, Integer.class);
        assertEquals(7,defaults);
        Integer secondsFamilies=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercises
                WHERE code IN ('farmerCarry','deadHang','staticGripHold')
                  AND default_unit='SECONDS' AND calories_estimation_type='DURATION_BASED'
                """, Integer.class);
        assertEquals(3,secondsFamilies);
        Integer deepWithoutSvg=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM muscles WHERE code IN
                ('PRONATOR_TERES','PRONATOR_QUADRATUS','SUPINATOR')
                AND has_svg_region=false AND muscle_group='FOREARMS'
                """,Integer.class);
        assertEquals(3,deepWithoutSvg);
        String pronation=jdbcTemplate.queryForObject("""
                SELECT primary_focus FROM exercise_variants
                WHERE code='forearmPronationDumbbellSeated'
                """,String.class);
        String supination=jdbcTemplate.queryForObject("""
                SELECT primary_focus FROM exercise_variants
                WHERE code='forearmSupinationDumbbellSeated'
                """,String.class);
        assertEquals("FOREARM_PRONATION",pronation);
        assertEquals("FOREARM_SUPINATION",supination);
        String earlierReverseCurl=jdbcTemplate.queryForObject("""
                SELECT e.main_muscle_group FROM exercises e WHERE e.code='reverseCurl'
                """,String.class);
        assertEquals("BICEPS",earlierReverseCurl);
    }


    @Test
    void seedsScapularAndRotatorCuffCatalogV28WithoutFakeSvgMuscles() {
        Integer totalFamilies=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercises
                WHERE main_muscle_group IN ('SCAPULAR','ROTATOR_CUFF') AND active
                """,Integer.class);
        assertEquals(7,totalFamilies);
        Integer totalVariants=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group IN ('SCAPULAR','ROTATOR_CUFF') AND v.active
                """,Integer.class);
        assertEquals(17,totalVariants);
        Integer mapped=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_muscle_activations WHERE mapping_version=12
                """,Integer.class);
        assertEquals(43,mapped);
        Integer defaults=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group IN ('SCAPULAR','ROTATOR_CUFF') AND v.is_default AND v.active
                """,Integer.class);
        assertEquals(7,defaults);
        Integer missingPrimary=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercise_variants v JOIN exercises e ON e.id=v.exercise_id
                WHERE e.main_muscle_group IN ('SCAPULAR','ROTATOR_CUFF') AND v.active
                  AND NOT EXISTS (SELECT 1 FROM exercise_muscle_activations a
                                  WHERE a.exercise_variant_id=v.id AND a.role='PRIMARY')
                """,Integer.class);
        assertEquals(0,missingPrimary);
        Integer innerRotatorNoSvg=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM muscles WHERE code='SUBSCAPULARIS'
                AND muscle_group='ROTATOR_CUFF' AND has_svg_region=false
                """,Integer.class);
        assertEquals(1,innerRotatorNoSvg);
        String externalFocus=jdbcTemplate.queryForObject("""
                SELECT primary_focus FROM exercise_variants
                WHERE code='shoulderExternalRotationBandStanding'
                """,String.class);
        String internalFocus=jdbcTemplate.queryForObject("""
                SELECT primary_focus FROM exercise_variants
                WHERE code='shoulderInternalRotationBandStanding'
                """,String.class);
        assertEquals("ROTATOR_CUFF_EXTERNAL_ROTATION",externalFocus);
        assertEquals("ROTATOR_CUFF_INTERNAL_ROTATION",internalFocus);
        Integer existingFacePull=jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM exercises WHERE code='facePull' AND main_muscle_group='SHOULDERS'
                """,Integer.class);
        assertEquals(1,existingFacePull);
    }

}
