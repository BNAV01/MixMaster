package com.mixmaster.platform.modules.identity.auth.services;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class CredentialSecurityServiceTest {

    private final CredentialSecurityService credentialSecurityService = new CredentialSecurityService();

    @Test
    void acceptsEightCharacterPasswordWhenAllComplexityRulesArePresent() {
        assertThatCode(() -> credentialSecurityService.validatePassword("Ab!c2345", "ops@local.com", "Tenant Operator"))
            .doesNotThrowAnyException();
    }

    @Test
    void rejectsPasswordsShorterThanEightCharacters() {
        assertThatThrownBy(() -> credentialSecurityService.validatePassword("Ab!2345", "ops@local.com", "Tenant Operator"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Password must be between 8 and 128 characters");
    }

    @Test
    void keepsRejectingPasswordsWithoutSpecialCharacters() {
        assertThatThrownBy(() -> credentialSecurityService.validatePassword("Abcd2345", "ops@local.com", "Tenant Operator"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Password must include at least one special character");
    }
}
