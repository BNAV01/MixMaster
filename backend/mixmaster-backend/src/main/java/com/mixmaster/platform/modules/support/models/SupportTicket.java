package com.mixmaster.platform.modules.support.models;

import com.mixmaster.platform.shared.models.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "support_tickets",
    indexes = {
        @Index(name = "idx_support_tickets_tenant_status", columnList = "tenant_id,status,priority"),
        @Index(name = "idx_support_tickets_platform_status", columnList = "status,priority,last_message_at"),
        @Index(name = "idx_support_tickets_assignee", columnList = "assigned_platform_user_id,status")
    }
)
public class SupportTicket extends TenantScopedEntity {

    @Column(name = "branch_id", length = 26)
    private String branchId;

    @Column(name = "requested_by_user_id", length = 26)
    private String requestedByUserId;

    @Column(name = "requested_by_email", nullable = false, length = 160)
    private String requestedByEmail;

    @Column(name = "requested_by_name", nullable = false, length = 160)
    private String requestedByName;

    @Column(name = "subject", nullable = false, length = 200)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 40)
    private SupportTicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 40)
    private SupportTicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private SupportTicketStatus status;

    @Column(name = "assigned_platform_user_id", length = 26)
    private String assignedPlatformUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_reply_by_audience", nullable = false, length = 40)
    private SupportMessageAuthorAudience lastReplyByAudience;

    @Column(name = "first_response_at")
    private OffsetDateTime firstResponseAt;

    @Column(name = "last_message_at", nullable = false)
    private OffsetDateTime lastMessageAt;

    @Column(name = "last_tenant_message_at")
    private OffsetDateTime lastTenantMessageAt;

    @Column(name = "last_platform_reply_at")
    private OffsetDateTime lastPlatformReplyAt;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @Column(name = "resolution_summary", columnDefinition = "TEXT")
    private String resolutionSummary;
}
