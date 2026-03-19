package com.mixmaster.platform.modules.consumer.accounts.models;

import com.mixmaster.platform.shared.models.TenantScopedEntity;
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
    name = "consumer_profiles",
    indexes = {
        @Index(name = "idx_consumer_profiles_tenant_language", columnList = "tenant_id,preferred_language")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_consumer_profiles_tenant_account", columnNames = {"tenant_id", "consumer_account_id"})
    }
)
public class ConsumerProfile extends TenantScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consumer_account_id", nullable = false)
    private ConsumerAccount consumerAccount;

    @Column(name = "display_name", length = 160)
    private String displayName;

    @Column(name = "preferred_language", length = 16)
    private String preferredLanguage;

    @Column(name = "marketing_opt_in", nullable = false)
    private boolean marketingOptIn;
}
