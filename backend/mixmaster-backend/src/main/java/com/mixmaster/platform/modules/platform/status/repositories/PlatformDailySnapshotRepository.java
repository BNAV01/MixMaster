package com.mixmaster.platform.modules.platform.status.repositories;

import com.mixmaster.platform.modules.platform.status.models.PlatformDailySnapshot;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformDailySnapshotRepository extends JpaRepository<PlatformDailySnapshot, String> {

    Optional<PlatformDailySnapshot> findTopByOrderByCapturedAtDesc();
}
