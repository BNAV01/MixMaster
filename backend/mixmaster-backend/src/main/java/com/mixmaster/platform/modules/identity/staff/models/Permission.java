package com.mixmaster.platform.modules.identity.staff.models;

import com.mixmaster.platform.shared.models.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
    name = "permissions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_permissions_code", columnNames = "code")
    }
)
public class Permission extends BaseEntity {

    @Column(name = "code", nullable = false, length = 120)
    private String code;

    @Column(name = "description", nullable = false, length = 255)
    private String description;
}
