package com.mixmaster.platform.interfaces.tenantconsole.audit;

import com.mixmaster.platform.shared.audit.AuditRevisionService;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class TenantConsoleAuditService {

    private final AuditRevisionService auditRevisionService;

    public TenantConsoleAuditService(AuditRevisionService auditRevisionService) {
        this.auditRevisionService = auditRevisionService;
    }

    public void record(TenantConsoleAuditAction action, Map<String, String> metadata) {
        auditRevisionService.record("tenant-console", action.name(), metadata);
    }
}
