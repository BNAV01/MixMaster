package com.mixmaster.platform.modules.organization.models;

import com.mixmaster.platform.shared.models.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "tenants",
    indexes = {
        @Index(name = "idx_tenants_status", columnList = "status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_tenants_code", columnNames = "code")
    }
)
public class Tenant extends BaseEntity {

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private TenantStatus status;

    @Column(name = "timezone", nullable = false, length = 80)
    private String timezone;
}
