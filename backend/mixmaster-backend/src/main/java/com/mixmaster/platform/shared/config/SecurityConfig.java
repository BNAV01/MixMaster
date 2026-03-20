package com.mixmaster.platform.shared.config;

import com.mixmaster.platform.interfaces.consumerweb.security.ConsumerWebApiPaths;
import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.shared.security.ApiAccessDeniedHandler;
import com.mixmaster.platform.shared.security.ApiAuthenticationEntryPoint;
import com.mixmaster.platform.shared.security.BearerTokenAuthenticationFilter;
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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
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
        TenantContextFilter tenantContextFilter,
        BearerTokenAuthenticationFilter bearerTokenAuthenticationFilter,
        ApiAuthenticationEntryPoint apiAuthenticationEntryPoint,
        ApiAccessDeniedHandler apiAccessDeniedHandler
    ) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(apiAuthenticationEntryPoint)
                .accessDeniedHandler(apiAccessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info", "/error").permitAll()
                .requestMatchers(ConsumerWebApiPaths.PUBLIC_BASE_PATH + "/**").permitAll()
                .requestMatchers(ConsumerWebApiPaths.ACCOUNT_BASE_PATH + "/**").permitAll()
                .requestMatchers(TenantConsoleApiPaths.PUBLIC_BASE_PATH + "/**").permitAll()
                .requestMatchers(SaasAdminApiPaths.PUBLIC_BASE_PATH + "/**").permitAll()
                .requestMatchers(TenantConsoleApiPaths.ROOT + "/**").authenticated()
                .requestMatchers(SaasAdminApiPaths.ROOT + "/**").authenticated()
                .anyRequest().denyAll()
            )
            .addFilterBefore(maliciousRequestFilter, AuthorizationFilter.class)
            .addFilterAfter(requestRateLimitFilter, MaliciousRequestFilter.class)
            .addFilterAfter(tenantContextFilter, RequestRateLimitFilter.class)
            .addFilterBefore(bearerTokenAuthenticationFilter, AnonymousAuthenticationFilter.class);

        return http.build();
    }
}
