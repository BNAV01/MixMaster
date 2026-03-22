package com.mixmaster.platform.modules.organization.repositories;

import com.mixmaster.platform.modules.organization.models.QrCode;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QrCodeRepository extends JpaRepository<QrCode, String> {

    Optional<QrCode> findByTokenAndDeletedAtIsNull(String token);
}
