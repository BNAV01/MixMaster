package com.mixmaster.platform.shared.tenant;

import com.mixmaster.platform.shared.config.ApplicationProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;

public class TenantContextFilter extends OncePerRequestFilter {

    private final ApplicationProperties applicationProperties;

    public TenantContextFilter(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String tenantKey = resolveHeader(request, applicationProperties.getTenant().getHeaderName(), "X-Tenant-Id");
        String brandKey = request.getHeader(applicationProperties.getTenant().getBrandHeaderName());
        String branchKey = resolveHeader(request, applicationProperties.getTenant().getBranchHeaderName(), "X-Branch-Id");

        try {
            if (tenantKey != null || brandKey != null || branchKey != null) {
                TenantContextHolder.set(new TenantContext(tenantKey, brandKey, branchKey));
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContextHolder.clear();
        }
    }

    private String resolveHeader(HttpServletRequest request, String primaryHeaderName, String fallbackHeaderName) {
        String primaryHeaderValue = request.getHeader(primaryHeaderName);
        if (primaryHeaderValue != null) {
            return primaryHeaderValue;
        }

        return request.getHeader(fallbackHeaderName);
    }
}
