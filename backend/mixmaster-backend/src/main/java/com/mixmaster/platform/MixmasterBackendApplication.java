package com.mixmaster.platform;

import com.mixmaster.platform.shared.config.ApplicationProperties;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableConfigurationProperties(ApplicationProperties.class)
@EnableScheduling
public class MixmasterBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MixmasterBackendApplication.class, args);
    }
}
