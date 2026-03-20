package com.mixmaster.platform.modules.identity.auth.services;

import com.mixmaster.platform.modules.identity.platform.models.PlatformUser;

public record PlatformSessionBundle(
    AuthTokens tokens,
    PlatformUser user
) {
}
