package com.mixmaster.platform.modules.messaging.repositories;

import com.mixmaster.platform.modules.messaging.models.EmailTemplate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, String> {

    List<EmailTemplate> findAllByOrderByUpdatedAtDesc();

    Optional<EmailTemplate> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);
}
