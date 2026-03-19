package com.mixmaster.platform.modules.consumer.anonymous.models;

import com.mixmaster.platform.modules.consumer.accounts.models.ConsumerProfile;
import com.mixmaster.platform.shared.utils.UlidGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

@Getter
@Setter
@NoArgsConstructor
@Immutable
@Entity
@Table(
    name = "anonymous_profile_merges",
    indexes = {
        @Index(name = "idx_anonymous_profile_merges_tenant_merged_at", columnList = "tenant_id,merged_at"),
        @Index(name = "idx_anonymous_profile_merges_consumer_profile", columnList = "consumer_profile_id")
    }
)
public class AnonymousProfileMerge {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 26)
    private String id;

    @Column(name = "tenant_id", nullable = false, updatable = false, length = 26)
    private String tenantId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "anonymous_profile_id", nullable = false, updatable = false)
    private AnonymousProfile anonymousProfile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consumer_profile_id", nullable = false, updatable = false)
    private ConsumerProfile consumerProfile;

    @Column(name = "merge_reason", nullable = false, length = 80)
    private String mergeReason;

    @Column(name = "merged_by", length = 160)
    private String mergedBy;

    @Column(name = "merged_at", nullable = false, updatable = false)
    private OffsetDateTime mergedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (id == null || id.isBlank()) {
            id = UlidGenerator.nextUlid();
        }
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (mergedAt == null) {
            mergedAt = createdAt;
        }
    }
}
