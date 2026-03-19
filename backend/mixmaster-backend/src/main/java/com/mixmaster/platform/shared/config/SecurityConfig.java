package com.mixmaster.platform.shared.config;

import com.mixmaster.platform.interfaces.consumerweb.security.ConsumerWebApiPaths;
import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.shared.security.MaliciousRequestFilter;
import com.mixmaster.platform.shared.security.RequestRateLimitFilter;
import com.mixmaster.platform.shared.tenant.TenantContextFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.util.StringUtils;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(
        ApplicationProperties applicationProperties,
        PasswordEncoder passwordEncoder
    ) {
        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
        ApplicationProperties.Security.Bootstrap bootstrap = applicationProperties.getSecurity().getBootstrap();

        if (bootstrap.isEnabled()) {
            registerBootstrapUser(manager, passwordEncoder, bootstrap.getConsumerUsername(), bootstrap.getConsumerPassword(), "CONSUMER");
            registerBootstrapUser(manager, passwordEncoder, bootstrap.getTenantUsername(), bootstrap.getTenantPassword(), "TENANT_ADMIN", "TENANT_STAFF");
            registerBootstrapUser(manager, passwordEncoder, bootstrap.getPlatformUsername(), bootstrap.getPlatformPassword(), "PLATFORM_ADMIN", "PLATFORM_SUPPORT");
        }

        return manager;
    }

    @Bean
    MaliciousRequestFilter maliciousRequestFilter() {
        return new MaliciousRequestFilter();
    }

    @Bean
    RequestRateLimitFilter requestRateLimitFilter(ApplicationProperties applicationProperties) {
        return new RequestRateLimitFilter(applicationProperties);
    }

    @Bean
    TenantContextFilter tenantContextFilter(ApplicationProperties applicationProperties) {
        return new TenantContextFilter(applicationProperties);
    }

    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        MaliciousRequestFilter maliciousRequestFilter,
        RequestRateLimitFilter requestRateLimitFilter,
        TenantContextFilter tenantContextFilter
    ) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .httpBasic(Customizer.withDefaults())
            .formLogin(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info", "/error").permitAll()
                .requestMatchers(ConsumerWebApiPaths.PUBLIC_BASE_PATH + "/**").permitAll()
                .requestMatchers(TenantConsoleApiPaths.PUBLIC_BASE_PATH + "/**").permitAll()
                .requestMatchers(SaasAdminApiPaths.PUBLIC_BASE_PATH + "/**").permitAll()
                .requestMatchers(ConsumerWebApiPaths.ROOT + "/**").permitAll()
                .requestMatchers(TenantConsoleApiPaths.ROOT + "/**").hasAnyRole("TENANT_ADMIN", "TENANT_STAFF")
                .requestMatchers(SaasAdminApiPaths.ROOT + "/**").hasAnyRole("PLATFORM_ADMIN", "PLATFORM_SUPPORT")
                .anyRequest().denyAll());

        http
            .addFilterBefore(maliciousRequestFilter, BasicAuthenticationFilter.class)
            .addFilterBefore(requestRateLimitFilter, BasicAuthenticationFilter.class)
            .addFilterAfter(tenantContextFilter, RequestRateLimitFilter.class);

        return http.build();
    }

    private void registerBootstrapUser(
        InMemoryUserDetailsManager manager,
        PasswordEncoder passwordEncoder,
        String username,
        String password,
        String... roles
    ) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            return;
        }

        manager.createUser(User.withUsername(username)
            .password(passwordEncoder.encode(password))
            .roles(roles)
            .build());
    }
}
