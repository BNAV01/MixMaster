package com.baresflix.api.security;

import com.baresflix.api.exceptions.JwtResponseException;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


//Interceptor que se ejecuta antes de cada peticion
@Component
class JWTAuthenticationFilter extends OncePerRequestFilter { //OncePerRequestFilter se ejecuta una vez por cada peticion
    private final TokenUtils _jwtService;
    private final UserDetailsService _userDetailsService;

    public JWTAuthenticationFilter(TokenUtils jwtService, UserDetailsService userDetailsService) {
        this._jwtService = jwtService;
        this._userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal( //Va a rescatar el token y va a validar si es valido o no y ver que la URI no sea la de refresh el token
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String bearerToken = request.getHeader("Authorization");
        if(bearerToken != null && bearerToken.startsWith("Bearer ") && !request.getRequestURI().equals("/api/v1/auth/refreshToken")) {
            String token = bearerToken.split("Bearer ")[1].trim();
            try {
                UserDetails userDetails = this._userDetailsService.loadUserByUsername(this._jwtService.extractEmail(token));
                UsernamePasswordAuthenticationToken usernamePass = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(usernamePass);
            } catch (ExpiredJwtException e) {

            } catch (JwtResponseException e) {
                throw new RuntimeException(e);
            }
        }
        filterChain.doFilter(request, response);
    }
}