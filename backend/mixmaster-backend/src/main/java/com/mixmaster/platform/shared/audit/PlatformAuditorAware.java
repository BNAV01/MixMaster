package com.mixmaster.platform.shared.audit;

import com.mixmaster.platform.shared.tenant.TenantContextHolder;
import java.util.Optional;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("platformAuditorAware")
public class PlatformAuditorAware implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
            && authentication.isAuthenticated()
            && !(authentication instanceof AnonymousAuthenticationToken)) {
            return Optional.ofNullable(authentication.getName());
        }

        return TenantContextHolder.get()
            .map(tenantContext -> "tenant:" + tenantContext.tenantKey())
            .or(() -> Optional.of("system"));
    }
}
