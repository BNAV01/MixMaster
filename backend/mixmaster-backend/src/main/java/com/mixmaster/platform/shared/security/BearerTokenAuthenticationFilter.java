package com.mixmaster.platform.shared.security;

import com.mixmaster.platform.interfaces.consumerweb.security.ConsumerWebApiPaths;
import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.modules.identity.auth.services.AuthSessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class BearerTokenAuthenticationFilter extends OncePerRequestFilter {

    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
        ConsumerWebApiPaths.PUBLIC_BASE_PATH,
        SaasAdminApiPaths.PUBLIC_BASE_PATH,
        TenantConsoleApiPaths.PUBLIC_BASE_PATH
    );

    private final AuthSessionService authSessionService;
    private final ApiAuthenticationEntryPoint apiAuthenticationEntryPoint;

    public BearerTokenAuthenticationFilter(
        AuthSessionService authSessionService,
        ApiAuthenticationEntryPoint apiAuthenticationEntryPoint
    ) {
        this.authSessionService = authSessionService;
        this.apiAuthenticationEntryPoint = apiAuthenticationEntryPoint;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return PUBLIC_PATH_PREFIXES.stream().anyMatch(path::startsWith)
            || path.startsWith("/actuator/")
            || path.equals("/error");
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");

        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = authorizationHeader.substring(7).trim();

        if (!StringUtils.hasText(accessToken)) {
            apiAuthenticationEntryPoint.commence(request, response, new BadCredentialsException("Bearer token is missing"));
            return;
        }

        try {
            AuthenticatedActor actor = authSessionService.authenticateAccessToken(accessToken);
            AuthenticatedActorAuthenticationToken authentication = new AuthenticatedActorAuthenticationToken(
                actor,
                actor.permissions().stream().map(permission -> new SimpleGrantedAuthority("PERM_" + permission)).toList()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);
        } catch (BadCredentialsException exception) {
            SecurityContextHolder.clearContext();
            apiAuthenticationEntryPoint.commence(request, response, exception);
        }
    }
}
