package com.mixmaster.platform.interfaces.saasadmin.audit;

import com.mixmaster.platform.shared.audit.AuditRevisionService;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class SaasAdminAuditService {

    private final AuditRevisionService auditRevisionService;

    public SaasAdminAuditService(AuditRevisionService auditRevisionService) {
        this.auditRevisionService = auditRevisionService;
    }

    public void record(SaasAdminAuditAction action, Map<String, String> metadata) {
        auditRevisionService.record("saas-admin", action.name(), metadata);
    }
}
