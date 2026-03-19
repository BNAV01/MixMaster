package com.mixmaster.platform.shared.audit;

import java.util.List;

public interface AuditRevisionRepository {

    void save(AuditRevision revision);

    List<AuditRevision> findRecent(int limit);
}
