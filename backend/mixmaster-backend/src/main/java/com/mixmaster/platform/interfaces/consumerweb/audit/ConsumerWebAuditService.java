package com.mixmaster.platform.interfaces.consumerweb.audit;

import com.mixmaster.platform.shared.audit.AuditRevisionService;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ConsumerWebAuditService {

    private final AuditRevisionService auditRevisionService;

    public ConsumerWebAuditService(AuditRevisionService auditRevisionService) {
        this.auditRevisionService = auditRevisionService;
    }

    public void record(ConsumerWebAuditAction action, Map<String, String> metadata) {
        auditRevisionService.record("consumer-web", action.name(), metadata);
    }
}
