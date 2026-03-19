package com.mixmaster.platform.shared.tenant;

public class TenantContextMissingException extends RuntimeException {

    public TenantContextMissingException(String message) {
        super(message);
    }
}
