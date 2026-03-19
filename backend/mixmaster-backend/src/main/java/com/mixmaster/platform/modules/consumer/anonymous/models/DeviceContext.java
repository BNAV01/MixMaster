package com.mixmaster.platform.modules.consumer.anonymous.models;

import com.mixmaster.platform.shared.models.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
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
    name = "device_contexts",
    indexes = {
        @Index(name = "idx_device_contexts_tenant_last_seen", columnList = "tenant_id,last_seen_at")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_device_contexts_tenant_fingerprint", columnNames = {"tenant_id", "device_fingerprint_hash"})
    }
)
public class DeviceContext extends TenantScopedEntity {

    @Column(name = "device_fingerprint_hash", nullable = false, length = 255)
    private String deviceFingerprintHash;

    @Column(name = "client_type", nullable = false, length = 40)
    private String clientType;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "os_name", length = 120)
    private String osName;

    @Column(name = "browser_name", length = 120)
    private String browserName;

    @Column(name = "app_version", length = 80)
    private String appVersion;

    @Column(name = "ip_hash", length = 255)
    private String ipHash;

    @Column(name = "locale", length = 32)
    private String locale;

    @Column(name = "timezone", length = 64)
    private String timezone;

    @Column(name = "last_seen_at", nullable = false)
    private OffsetDateTime lastSeenAt;
}
