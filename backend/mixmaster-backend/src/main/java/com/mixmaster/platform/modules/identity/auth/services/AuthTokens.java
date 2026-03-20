package com.mixmaster.platform.modules.identity.auth.services;

import java.time.OffsetDateTime;

public record AuthTokens(
    String accessToken,
    String refreshToken,
    OffsetDateTime accessExpiresAt,
    OffsetDateTime refreshExpiresAt
) {
}
