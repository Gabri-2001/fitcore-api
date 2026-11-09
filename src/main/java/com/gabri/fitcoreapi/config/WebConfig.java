package com.gabri.fitcoreapi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addRedirectViewController("/fitcore-lab", "/fitcore-lab/index.html");
        registry.addRedirectViewController("/fitcore-lab/", "/fitcore-lab/index.html");
    }
}
