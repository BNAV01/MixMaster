package com.mixmaster.platform.interfaces.saasadmin.mappers;

import com.mixmaster.platform.interfaces.saasadmin.dtos.SaasAdminStatusResponse;
import com.mixmaster.platform.modules.platform.status.models.PlatformStatusSnapshot;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class SaasAdminStatusMapper {

    public SaasAdminStatusResponse toResponse(PlatformStatusSnapshot snapshot) {
        return new SaasAdminStatusResponse(
            snapshot.audience(),
            snapshot.securityMode(),
            snapshot.activeProfiles(),
            List.of(
                "tenant-lifecycle",
                "subscription-governance",
                "feature-flags",
                "onboarding-operations"
            ),
            snapshot.generatedAt()
        );
    }
}
