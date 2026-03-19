package com.mixmaster.platform.shared.api;

import java.time.OffsetDateTime;

public record ApiErrorResponse(
    String code,
    String message,
    OffsetDateTime timestamp
) {
}
