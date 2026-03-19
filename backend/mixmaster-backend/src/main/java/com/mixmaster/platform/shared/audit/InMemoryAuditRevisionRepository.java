package com.mixmaster.platform.shared.audit;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedDeque;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryAuditRevisionRepository implements AuditRevisionRepository {

    private final ConcurrentLinkedDeque<AuditRevision> revisions = new ConcurrentLinkedDeque<>();

    @Override
    public void save(AuditRevision revision) {
        revisions.addFirst(revision);
        while (revisions.size() > 1_000) {
            revisions.removeLast();
        }
    }

    @Override
    public List<AuditRevision> findRecent(int limit) {
        return new ArrayList<>(revisions.stream().limit(limit).toList());
    }
}
