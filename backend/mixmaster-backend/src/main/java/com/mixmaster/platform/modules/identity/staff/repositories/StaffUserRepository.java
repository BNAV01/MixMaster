package com.mixmaster.platform.modules.identity.staff.repositories;

import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.modules.identity.staff.models.StaffUserStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffUserRepository extends JpaRepository<StaffUser, String> {

    Optional<StaffUser> findByTenantIdAndEmailIgnoreCaseAndDeletedAtIsNull(String tenantId, String email);

    Optional<StaffUser> findByIdAndTenantIdAndDeletedAtIsNull(String id, String tenantId);

    List<StaffUser> findAllByTenantIdAndDeletedAtIsNullOrderByFullNameAsc(String tenantId);

    boolean existsByTenantIdAndEmailIgnoreCaseAndDeletedAtIsNull(String tenantId, String email);

    long countByTenantIdAndDeletedAtIsNull(String tenantId);

    long countByTenantIdAndStatusAndDeletedAtIsNull(String tenantId, StaffUserStatus status);
}
