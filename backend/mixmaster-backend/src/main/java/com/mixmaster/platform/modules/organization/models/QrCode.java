package com.mixmaster.platform.modules.organization.models;

import com.mixmaster.platform.shared.models.TenantScopedSoftDeletableEntity;
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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "qr_codes",
    indexes = {
        @Index(name = "idx_qr_codes_tenant_branch", columnList = "tenant_id,branch_id"),
        @Index(name = "idx_qr_codes_status", columnList = "status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_qr_codes_token", columnNames = "token")
    }
)
public class QrCode extends TenantScopedSoftDeletableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_table_id")
    private VenueTable venueTable;

    @Column(name = "token", nullable = false, length = 255)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private QrCodeStatus status;
}
