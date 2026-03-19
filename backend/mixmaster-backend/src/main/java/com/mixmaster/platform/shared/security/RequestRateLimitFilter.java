package com.mixmaster.platform.shared.security;

import com.mixmaster.platform.shared.config.ApplicationProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;

public class RequestRateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MILLIS = 60_000L;
    private static final int MAX_TRACKED_CLIENTS = 20_000;

    private final ApplicationProperties applicationProperties;
    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

    public RequestRateLimitFilter(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        if (!applicationProperties.getRateLimit().isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        int limit = resolveLimit(request);
        if (limit <= 0) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = resolveClientKey(request);
        if (!allow(key, limit)) {
            response.sendError(429, "Too many requests");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private int resolveLimit(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path == null) {
            return 0;
        }

        if (path.endsWith("/status")) {
            return applicationProperties.getRateLimit().getStatusPerMinute();
        }

        if (path.contains("/auth/") || path.endsWith("/login")) {
            return applicationProperties.getRateLimit().getLoginPerMinute();
        }

        if (HttpMethod.POST.matches(method)
            || HttpMethod.PUT.matches(method)
            || HttpMethod.PATCH.matches(method)
            || HttpMethod.DELETE.matches(method)) {
            return applicationProperties.getRateLimit().getWritePerMinute();
        }

        return 0;
    }

    private boolean allow(String key, int limit) {
        if (counters.size() > MAX_TRACKED_CLIENTS) {
            counters.clear();
        }

        Counter counter = counters.computeIfAbsent(key, ignored -> new Counter());
        synchronized (counter) {
            long now = Instant.now().toEpochMilli();
            if (now - counter.windowStartedAt >= WINDOW_MILLIS) {
                counter.windowStartedAt = now;
                counter.count = 0;
            }

            counter.count++;
            return counter.count <= limit;
        }
    }

    private String resolveClientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim() + "|" + request.getRequestURI();
        }

        return request.getRemoteAddr() + "|" + request.getRequestURI();
    }

    private static final class Counter {
        private long windowStartedAt = Instant.now().toEpochMilli();
        private int count;
    }
}
