package com.mixmaster.platform.shared.audit;

import com.mixmaster.platform.shared.config.ApplicationProperties;
import com.mixmaster.platform.shared.tenant.TenantContextHolder;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class AuditRevisionService {

    private final ApplicationProperties applicationProperties;
    private final AuditModelListener auditModelListener;
    private final AuditRevisionListener auditRevisionListener;
    private final AuditRevisionRepository auditRevisionRepository;
    private final PlatformAuditorAware platformAuditorAware;

    public AuditRevisionService(
        ApplicationProperties applicationProperties,
        AuditModelListener auditModelListener,
        AuditRevisionListener auditRevisionListener,
        AuditRevisionRepository auditRevisionRepository,
        PlatformAuditorAware platformAuditorAware
    ) {
        this.applicationProperties = applicationProperties;
        this.auditModelListener = auditModelListener;
        this.auditRevisionListener = auditRevisionListener;
        this.auditRevisionRepository = auditRevisionRepository;
        this.platformAuditorAware = platformAuditorAware;
    }

    public AuditRevision record(String module, String action, Map<String, String> metadata) {
        if (!applicationProperties.getAudit().isEnabled()) {
            return null;
        }

        String actor = platformAuditorAware.getCurrentAuditor().orElse("system");
        String tenantKey = TenantContextHolder.get().map(tenant -> tenant.tenantKey()).orElse("platform");
        AuditRevisionEvent event = auditModelListener.onChange(module, action, actor, tenantKey, metadata);
        AuditRevision revision = auditRevisionListener.toRevision(event);
        auditRevisionRepository.save(revision);
        return revision;
    }
}
