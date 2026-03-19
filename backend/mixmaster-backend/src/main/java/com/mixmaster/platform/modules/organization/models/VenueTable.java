package com.mixmaster.platform.modules.organization.models;

import com.mixmaster.platform.shared.models.TenantScopedSoftDeletableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
    name = "venue_tables",
    indexes = {
        @Index(name = "idx_venue_tables_tenant_branch", columnList = "tenant_id,branch_id"),
        @Index(name = "idx_venue_tables_branch_active", columnList = "branch_id,is_active")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_venue_tables_branch_code", columnNames = {"branch_id", "code"})
    }
)
public class VenueTable extends TenantScopedSoftDeletableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "label", nullable = false, length = 120)
    private String label;

    @Column(name = "seating_capacity")
    private Integer seatingCapacity;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
