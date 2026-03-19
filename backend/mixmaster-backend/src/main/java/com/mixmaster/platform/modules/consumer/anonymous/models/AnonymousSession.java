package com.mixmaster.platform.modules.consumer.anonymous.models;

import com.mixmaster.platform.modules.consumer.accounts.models.ConsumerProfile;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.modules.organization.models.QrCode;
import com.mixmaster.platform.modules.organization.models.VenueTable;
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
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "anonymous_sessions",
    indexes = {
        @Index(name = "idx_anonymous_sessions_branch_started_at", columnList = "branch_id,started_at"),
        @Index(name = "idx_anonymous_sessions_profile_status", columnList = "anonymous_profile_id,status"),
        @Index(name = "idx_anonymous_sessions_consumer_profile", columnList = "consumer_profile_id")
    }
)
public class AnonymousSession extends TenantScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_table_id")
    private VenueTable venueTable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "qr_code_id")
    private QrCode qrCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anonymous_profile_id")
    private AnonymousProfile anonymousProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_profile_id")
    private ConsumerProfile consumerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_context_id")
    private DeviceContext deviceContext;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 40)
    private AnonymousSessionSource source;

    @Column(name = "objective", length = 80)
    private String objective;

    @Column(name = "party_size")
    private Integer partySize;

    @Column(name = "context_json", columnDefinition = "json")
    private String contextJson;

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "last_activity_at")
    private OffsetDateTime lastActivityAt;

    @Column(name = "ended_at")
    private OffsetDateTime endedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private AnonymousSessionStatus status;
}
