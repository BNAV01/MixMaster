package com.mixmaster.platform.modules.messaging.models;

import com.mixmaster.platform.shared.models.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
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
    name = "platform_email_settings",
    indexes = {
        @Index(name = "idx_platform_email_settings_active", columnList = "active"),
        @Index(name = "idx_platform_email_settings_updated_at", columnList = "updated_at")
    }
)
public class PlatformEmailSettings extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_code", nullable = false, length = 40)
    private PlatformEmailProvider providerCode;

    @Column(name = "host", nullable = false, length = 160)
    private String host;

    @Column(name = "port", nullable = false)
    private int port;

    @Column(name = "protocol", nullable = false, length = 16)
    private String protocol;

    @Column(name = "auth_required", nullable = false)
    private boolean authRequired;

    @Column(name = "starttls_enabled", nullable = false)
    private boolean starttlsEnabled;

    @Column(name = "ssl_enabled", nullable = false)
    private boolean sslEnabled;

    @Column(name = "username", length = 160)
    private String username;

    @Column(name = "password_ciphertext", columnDefinition = "TEXT")
    private String passwordCiphertext;

    @Column(name = "from_name", nullable = false, length = 160)
    private String fromName;

    @Column(name = "from_email", nullable = false, length = 160)
    private String fromEmail;

    @Column(name = "reply_to_email", length = 160)
    private String replyToEmail;

    @Column(name = "connection_timeout_ms", nullable = false)
    private int connectionTimeoutMs;

    @Column(name = "read_timeout_ms", nullable = false)
    private int readTimeoutMs;

    @Column(name = "write_timeout_ms", nullable = false)
    private int writeTimeoutMs;

    @Column(name = "last_test_sent_at")
    private OffsetDateTime lastTestSentAt;

    @Column(name = "last_test_status", length = 40)
    private String lastTestStatus;

    @Column(name = "last_test_error", length = 500)
    private String lastTestError;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "created_by_user_id", length = 26)
    private String createdByUserId;

    @Column(name = "updated_by_user_id", length = 26)
    private String updatedByUserId;
}
