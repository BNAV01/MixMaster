package com.mixmaster.platform.modules.identity.staff.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@Embeddable
public class RolePermissionId implements Serializable {

    @Column(name = "role_id", nullable = false, length = 26)
    private String roleId;

    @Column(name = "permission_id", nullable = false, length = 26)
    private String permissionId;
}
