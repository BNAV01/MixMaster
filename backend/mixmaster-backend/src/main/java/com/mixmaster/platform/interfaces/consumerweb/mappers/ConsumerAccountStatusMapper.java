package com.mixmaster.platform.interfaces.consumerweb.mappers;

import com.mixmaster.platform.interfaces.consumerweb.dtos.ConsumerAccountStatusResponse;
import com.mixmaster.platform.modules.platform.status.models.PlatformStatusSnapshot;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ConsumerAccountStatusMapper {

    public ConsumerAccountStatusResponse toResponse(PlatformStatusSnapshot snapshot, String principal) {
        return new ConsumerAccountStatusResponse(
            snapshot.audience(),
            snapshot.securityMode(),
            snapshot.activeProfiles(),
            principal,
            List.of(
                "favorites",
                "history-merge",
                "loyalty-benefits",
                "cross-branch-profile"
            ),
            snapshot.generatedAt()
        );
    }
}
