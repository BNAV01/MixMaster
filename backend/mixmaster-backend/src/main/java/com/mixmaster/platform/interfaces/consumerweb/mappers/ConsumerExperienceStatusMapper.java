package com.mixmaster.platform.interfaces.consumerweb.mappers;

import com.mixmaster.platform.interfaces.consumerweb.dtos.ConsumerExperienceStatusResponse;
import com.mixmaster.platform.modules.platform.status.models.PlatformStatusSnapshot;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ConsumerExperienceStatusMapper {

    public ConsumerExperienceStatusResponse toResponse(PlatformStatusSnapshot snapshot) {
        return new ConsumerExperienceStatusResponse(
            snapshot.audience(),
            snapshot.application(),
            snapshot.architecture(),
            snapshot.multitenancy(),
            snapshot.activeProfiles(),
            List.of(
                "qr-entry",
                "anonymous-session",
                "registered-account-merge",
                "recommendation-feedback-loop"
            ),
            snapshot.generatedAt()
        );
    }
}
