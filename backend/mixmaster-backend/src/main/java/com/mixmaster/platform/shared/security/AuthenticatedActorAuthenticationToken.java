package com.mixmaster.platform.shared.security;

import java.util.Collection;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

public class AuthenticatedActorAuthenticationToken extends AbstractAuthenticationToken {

    private final AuthenticatedActor actor;

    public AuthenticatedActorAuthenticationToken(
        AuthenticatedActor actor,
        Collection<? extends GrantedAuthority> authorities
    ) {
        super(authorities);
        this.actor = actor;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return "";
    }

    @Override
    public Object getPrincipal() {
        return actor;
    }
}
