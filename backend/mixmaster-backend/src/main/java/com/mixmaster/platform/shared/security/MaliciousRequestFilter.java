package com.mixmaster.platform.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Pattern;
import org.springframework.web.filter.OncePerRequestFilter;

public class MaliciousRequestFilter extends OncePerRequestFilter {

    private static final Pattern DANGEROUS_PATTERN = Pattern.compile(
        "(?i)(?:\\.\\.|%2e%2e|%00|<script|%3cscript|;|`|/etc/passwd|/tmp)"
    );

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String queryString = request.getQueryString();
        String requestUri = request.getRequestURI();

        if (matchesDangerousInput(queryString) || matchesDangerousInput(requestUri)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Suspicious request detected");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean matchesDangerousInput(String value) {
        return value != null && DANGEROUS_PATTERN.matcher(value).find();
    }
}
