package com.baresflix.api.security;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration

public class WebSecurityConfig {

    private final JWTAuthenticationFilter _jwtAutherizationFilter;
    private final AuthenticationProvider _authenticationProvider;



    public WebSecurityConfig(JWTAuthenticationFilter jwtAutherizationFilter, AuthenticationProvider authenticationProvider) {
        this._jwtAutherizationFilter = jwtAutherizationFilter;
        this._authenticationProvider = authenticationProvider;

    }
    @Bean
    SecurityFilterChain filterChain(HttpSecurity security, AuthenticationManager authenticationManager) throws Exception {

        return security
                .csrf()
                .disable()
                .cors()
                .and()
                .authorizeHttpRequests()
                .requestMatchers("/api/v1/auth/**")
                .permitAll()
                .anyRequest()
                //.authenticated() REEMPLAZAR ESTO PARA PERMITIR TODAS LAS MIERDAS O NO
                .permitAll()
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authenticationProvider(_authenticationProvider)
                .addFilterBefore(_jwtAutherizationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling()
                .and()
                .build()
                ;
    }
}
