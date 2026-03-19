package com.mixmaster.platform;

import com.mixmaster.platform.shared.config.ApplicationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(ApplicationProperties.class)
public class MixmasterBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MixmasterBackendApplication.class, args);
    }
}
