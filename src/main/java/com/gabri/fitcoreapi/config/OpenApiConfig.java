package com.gabri.fitcoreapi.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI fitCoreOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("FitCore API")
                        .description("Backend API for fitness planning, nutrition tracking, workout execution and user progress management.")
                        .version("v1")
                        .contact(new Contact()
                                .name("Gabriel Diaz")
                                .email("gabrielademardiaz@gmail.com")));
    }
}