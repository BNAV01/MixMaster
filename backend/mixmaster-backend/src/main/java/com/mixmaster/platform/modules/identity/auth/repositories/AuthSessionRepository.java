package com.mixmaster.platform.modules.identity.auth.repositories;

import com.mixmaster.platform.modules.identity.auth.models.AuthSession;
import com.mixmaster.platform.modules.identity.auth.models.AuthSessionAudience;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthSessionRepository extends JpaRepository<AuthSession, String> {

    Optional<AuthSession> findByAccessTokenHash(String accessTokenHash);

    Optional<AuthSession> findByRefreshTokenHash(String refreshTokenHash);

    long countByAudienceAndRevokedAtIsNullAndAccessExpiresAtAfter(AuthSessionAudience audience, OffsetDateTime accessExpiresAt);

    long countByAudienceAndPlatformUser_IdAndRevokedAtIsNullAndAccessExpiresAtAfter(
        AuthSessionAudience audience,
        String platformUserId,
        OffsetDateTime accessExpiresAt
    );

    List<AuthSession> findAllByAudienceAndPlatformUser_IdAndRevokedAtIsNull(AuthSessionAudience audience, String platformUserId);
}
