package com.mixmaster.platform.modules.consumer.anonymous.models;

import com.mixmaster.platform.modules.consumer.accounts.models.ConsumerProfile;
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
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "anonymous_profiles",
    indexes = {
        @Index(name = "idx_anonymous_profiles_tenant_status", columnList = "tenant_id,status"),
        @Index(name = "idx_anonymous_profiles_last_seen", columnList = "tenant_id,last_seen_at")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_anonymous_profiles_tenant_token", columnNames = {"tenant_id", "stable_token_hash"})
    }
)
public class AnonymousProfile extends TenantScopedEntity {

    @Column(name = "stable_token_hash", nullable = false, length = 255)
    private String stableTokenHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_device_context_id")
    private DeviceContext primaryDeviceContext;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_level", nullable = false, length = 40)
    private ConsentLevel consentLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private AnonymousProfileStatus status;

    @Column(name = "first_seen_at", nullable = false)
    private OffsetDateTime firstSeenAt;

    @Column(name = "last_seen_at", nullable = false)
    private OffsetDateTime lastSeenAt;

    @Column(name = "affinity_summary_json", columnDefinition = "json")
    private String affinitySummaryJson;

    @Column(name = "dislike_summary_json", columnDefinition = "json")
    private String dislikeSummaryJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merged_to_consumer_profile_id")
    private ConsumerProfile mergedToConsumerProfile;
}
