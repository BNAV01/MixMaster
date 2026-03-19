package com.mixmaster.platform.modules.availability.models;

import com.mixmaster.platform.modules.menu.catalog.models.Product;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.shared.models.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "product_availability",
    indexes = {
        @Index(name = "idx_product_availability_branch_state", columnList = "branch_id,state"),
        @Index(name = "idx_product_availability_effective_window", columnList = "effective_from,effective_until")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_product_availability_branch_product", columnNames = {"branch_id", "product_id"})
    }
)
public class ProductAvailability extends TenantScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 40)
    private AvailabilityState state;

    @Column(name = "is_visible", nullable = false)
    private boolean visible = true;

    @Column(name = "reason_code", length = 80)
    private String reasonCode;

    @Column(name = "effective_from", nullable = false)
    private OffsetDateTime effectiveFrom;

    @Column(name = "effective_until")
    private OffsetDateTime effectiveUntil;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 40)
    private AvailabilitySourceType sourceType;

    @Column(name = "updated_by", length = 160)
    private String updatedBy;

    @Version
    @Column(name = "version", nullable = false)
    private long version;
}
