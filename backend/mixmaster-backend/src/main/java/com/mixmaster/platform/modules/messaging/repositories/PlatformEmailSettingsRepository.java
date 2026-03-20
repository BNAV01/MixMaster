package com.mixmaster.platform.modules.messaging.repositories;

import com.mixmaster.platform.modules.messaging.models.PlatformEmailSettings;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformEmailSettingsRepository extends JpaRepository<PlatformEmailSettings, String> {

    Optional<PlatformEmailSettings> findFirstByActiveTrueOrderByUpdatedAtDesc();

    Optional<PlatformEmailSettings> findTopByOrderByUpdatedAtDesc();
}
