package com.mixmaster.platform.shared.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@Profile("!test")
@EnableJpaAuditing(auditorAwareRef = "platformAuditorAware")
public class JpaAuditingConfig {
}
