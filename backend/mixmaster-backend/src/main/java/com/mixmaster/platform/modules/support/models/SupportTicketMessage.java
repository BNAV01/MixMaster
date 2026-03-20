package com.mixmaster.platform.modules.support.models;

import com.mixmaster.platform.shared.models.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "support_ticket_messages",
    indexes = {
        @Index(name = "idx_support_ticket_messages_ticket_created", columnList = "ticket_id,created_at")
    }
)
public class SupportTicketMessage extends TenantScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @Enumerated(EnumType.STRING)
    @Column(name = "author_audience", nullable = false, length = 40)
    private SupportMessageAuthorAudience authorAudience;

    @Column(name = "author_user_id", length = 26)
    private String authorUserId;

    @Column(name = "author_display_name", nullable = false, length = 160)
    private String authorDisplayName;

    @Column(name = "author_email", length = 160)
    private String authorEmail;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "internal_note", nullable = false)
    private boolean internalNote;
}
