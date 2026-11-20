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
        assertEquals(20, version);
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
}
