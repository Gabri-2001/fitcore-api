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
}
