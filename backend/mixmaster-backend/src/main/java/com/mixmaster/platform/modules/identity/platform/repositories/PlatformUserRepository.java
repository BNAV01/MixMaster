package com.mixmaster.platform.modules.identity.platform.repositories;

import com.mixmaster.platform.modules.identity.platform.models.PlatformUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformUserRepository extends JpaRepository<PlatformUser, String> {

    Optional<PlatformUser> findByEmailIgnoreCase(String email);
}
