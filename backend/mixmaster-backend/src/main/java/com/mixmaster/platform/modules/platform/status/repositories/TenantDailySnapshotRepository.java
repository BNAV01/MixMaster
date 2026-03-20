package com.mixmaster.platform.modules.platform.status.repositories;

import com.mixmaster.platform.modules.platform.status.models.TenantDailySnapshot;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TenantDailySnapshotRepository extends JpaRepository<TenantDailySnapshot, String> {

    Optional<TenantDailySnapshot> findTopByTenantIdOrderByCapturedAtDesc(String tenantId);

    @Query("""
        select snapshot
        from TenantDailySnapshot snapshot
        where snapshot.capturedAt = (
            select max(innerSnapshot.capturedAt)
            from TenantDailySnapshot innerSnapshot
            where innerSnapshot.tenantId = snapshot.tenantId
        )
        """)
    List<TenantDailySnapshot> findLatestSnapshots();
}
