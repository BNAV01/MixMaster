package com.mixmaster.platform.modules.consumer.accounts.models;

import com.mixmaster.platform.shared.models.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    name = "consumer_accounts",
    indexes = {
        @Index(name = "idx_consumer_accounts_status", columnList = "status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_consumer_accounts_email", columnNames = "email"),
        @UniqueConstraint(name = "uk_consumer_accounts_phone", columnNames = "phone")
    }
)
public class ConsumerAccount extends BaseEntity {

    @Column(name = "email", length = 160)
    private String email;

    @Column(name = "phone", length = 40)
    private String phone;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private ConsumerAccountStatus status;

    @Column(name = "email_verified_at")
    private OffsetDateTime emailVerifiedAt;

    @Column(name = "phone_verified_at")
    private OffsetDateTime phoneVerifiedAt;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;
}
