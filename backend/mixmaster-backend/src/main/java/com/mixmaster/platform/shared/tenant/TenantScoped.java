package com.mixmaster.platform.shared.tenant;

public interface TenantScoped {

    String getTenantId();

    void setTenantId(String tenantId);
}
