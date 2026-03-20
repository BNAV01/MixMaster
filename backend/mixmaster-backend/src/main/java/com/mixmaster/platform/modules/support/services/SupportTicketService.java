package com.mixmaster.platform.modules.support.services;

import com.mixmaster.platform.modules.identity.platform.models.PlatformUser;
import com.mixmaster.platform.modules.identity.platform.repositories.PlatformUserRepository;
import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffUserRepository;
import com.mixmaster.platform.modules.support.models.SupportMessageAuthorAudience;
import com.mixmaster.platform.modules.support.models.SupportTicket;
import com.mixmaster.platform.modules.support.models.SupportTicketCategory;
import com.mixmaster.platform.modules.support.models.SupportTicketMessage;
import com.mixmaster.platform.modules.support.models.SupportTicketPriority;
import com.mixmaster.platform.modules.support.models.SupportTicketStatus;
import com.mixmaster.platform.modules.support.repositories.SupportTicketMessageRepository;
import com.mixmaster.platform.modules.support.repositories.SupportTicketRepository;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupportTicketService {

    private static final Set<SupportTicketStatus> OPEN_STATUSES = EnumSet.of(
        SupportTicketStatus.OPEN,
        SupportTicketStatus.WAITING_ON_PLATFORM,
        SupportTicketStatus.WAITING_ON_TENANT
    );
    private static final Set<SupportTicketPriority> URGENT_PRIORITIES = EnumSet.of(
        SupportTicketPriority.HIGH,
        SupportTicketPriority.URGENT
    );

    private final SupportTicketRepository supportTicketRepository;
    private final SupportTicketMessageRepository supportTicketMessageRepository;
    private final StaffUserRepository staffUserRepository;
    private final PlatformUserRepository platformUserRepository;

    public SupportTicketService(
        SupportTicketRepository supportTicketRepository,
        SupportTicketMessageRepository supportTicketMessageRepository,
        StaffUserRepository staffUserRepository,
        PlatformUserRepository platformUserRepository
    ) {
        this.supportTicketRepository = supportTicketRepository;
        this.supportTicketMessageRepository = supportTicketMessageRepository;
        this.staffUserRepository = staffUserRepository;
        this.platformUserRepository = platformUserRepository;
    }

    @Transactional(readOnly = true)
    public List<TicketSummaryView> listPlatformTickets() {
        return supportTicketRepository.findAllByOrderByLastMessageAtDesc().stream()
            .map(this::toSummaryView)
            .toList();
    }

    @Transactional(readOnly = true)
    public TicketDetailView requirePlatformTicket(String ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
            .orElseThrow(() -> new IllegalArgumentException("Support ticket was not found"));
        return toDetailView(ticket, true);
    }

    @Transactional(readOnly = true)
    public List<TicketSummaryView> listTenantTickets(String tenantId) {
        return supportTicketRepository.findAllByTenantIdOrderByLastMessageAtDesc(tenantId).stream()
            .map(this::toSummaryView)
            .toList();
    }

    @Transactional(readOnly = true)
    public TicketDetailView requireTenantTicket(String tenantId, String ticketId) {
        SupportTicket ticket = supportTicketRepository.findByIdAndTenantId(ticketId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Support ticket was not found"));
        return toDetailView(ticket, false);
    }

    @Transactional
    public TicketDetailView createTenantTicket(
        String tenantId,
        String actorUserId,
        CreateTicketCommand command
    ) {
        StaffUser actor = staffUserRepository.findByIdAndTenantIdAndDeletedAtIsNull(actorUserId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Staff user was not found"));

        OffsetDateTime now = OffsetDateTime.now();

        SupportTicket ticket = new SupportTicket();
        ticket.setTenantId(tenantId);
        ticket.setBranchId(command.branchId());
        ticket.setRequestedByUserId(actor.getId());
        ticket.setRequestedByEmail(actor.getEmail());
        ticket.setRequestedByName(actor.getFullName());
        ticket.setSubject(command.subject().trim());
        ticket.setCategory(command.category());
        ticket.setPriority(command.priority());
        ticket.setStatus(SupportTicketStatus.WAITING_ON_PLATFORM);
        ticket.setLastReplyByAudience(SupportMessageAuthorAudience.STAFF);
        ticket.setLastMessageAt(now);
        ticket.setLastTenantMessageAt(now);
        supportTicketRepository.save(ticket);

        SupportTicketMessage message = new SupportTicketMessage();
        message.setTenantId(tenantId);
        message.setTicket(ticket);
        message.setAuthorAudience(SupportMessageAuthorAudience.STAFF);
        message.setAuthorUserId(actor.getId());
        message.setAuthorDisplayName(actor.getFullName());
        message.setAuthorEmail(actor.getEmail());
        message.setBody(command.body().trim());
        message.setInternalNote(false);
        supportTicketMessageRepository.save(message);

        return toDetailView(ticket, false);
    }

    @Transactional
    public TicketDetailView replyAsTenant(String tenantId, String actorUserId, String ticketId, ReplyCommand command) {
        StaffUser actor = staffUserRepository.findByIdAndTenantIdAndDeletedAtIsNull(actorUserId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Staff user was not found"));
        SupportTicket ticket = supportTicketRepository.findByIdAndTenantId(ticketId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Support ticket was not found"));

        addMessage(ticket, SupportMessageAuthorAudience.STAFF, actor.getId(), actor.getFullName(), actor.getEmail(), command.body(), false);
        ticket.setStatus(SupportTicketStatus.WAITING_ON_PLATFORM);
        ticket.setLastReplyByAudience(SupportMessageAuthorAudience.STAFF);
        ticket.setLastTenantMessageAt(OffsetDateTime.now());
        supportTicketRepository.save(ticket);

        return toDetailView(ticket, false);
    }

    @Transactional
    public TicketDetailView replyAsPlatform(String actorUserId, String ticketId, ReplyCommand command) {
        PlatformUser actor = platformUserRepository.findById(actorUserId)
            .orElseThrow(() -> new IllegalArgumentException("Platform user was not found"));
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
            .orElseThrow(() -> new IllegalArgumentException("Support ticket was not found"));

        addMessage(ticket, SupportMessageAuthorAudience.PLATFORM, actor.getId(), actor.getFullName(), actor.getEmail(), command.body(), command.internalNote());

        OffsetDateTime now = OffsetDateTime.now();
        if (!command.internalNote()) {
            if (ticket.getFirstResponseAt() == null) {
                ticket.setFirstResponseAt(now);
            }
            ticket.setStatus(SupportTicketStatus.WAITING_ON_TENANT);
            ticket.setLastReplyByAudience(SupportMessageAuthorAudience.PLATFORM);
            ticket.setLastPlatformReplyAt(now);
        }
        supportTicketRepository.save(ticket);

        return toDetailView(ticket, true);
    }

    @Transactional
    public TicketDetailView updatePlatformTicket(String actorUserId, String ticketId, UpdateTicketCommand command) {
        platformUserRepository.findById(actorUserId)
            .orElseThrow(() -> new IllegalArgumentException("Platform user was not found"));
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
            .orElseThrow(() -> new IllegalArgumentException("Support ticket was not found"));

        if (command.priority() != null) {
            ticket.setPriority(command.priority());
        }
        if (command.assignedPlatformUserId() != null) {
            if (command.assignedPlatformUserId().isBlank()) {
                ticket.setAssignedPlatformUserId(null);
            } else {
                platformUserRepository.findById(command.assignedPlatformUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Assigned platform user was not found"));
                ticket.setAssignedPlatformUserId(command.assignedPlatformUserId());
            }
        }
        if (command.status() != null) {
            ticket.setStatus(command.status());
            if (command.status() == SupportTicketStatus.RESOLVED || command.status() == SupportTicketStatus.CLOSED) {
                ticket.setResolvedAt(OffsetDateTime.now());
            } else {
                ticket.setResolvedAt(null);
            }
        }
        if (command.resolutionSummary() != null) {
            String summary = command.resolutionSummary().trim();
            ticket.setResolutionSummary(summary.isBlank() ? null : summary);
        }

        supportTicketRepository.save(ticket);
        return toDetailView(ticket, true);
    }

    @Transactional
    public TicketDetailView resolveAsTenant(String tenantId, String actorUserId, String ticketId, String resolutionSummary) {
        staffUserRepository.findByIdAndTenantIdAndDeletedAtIsNull(actorUserId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Staff user was not found"));
        SupportTicket ticket = supportTicketRepository.findByIdAndTenantId(ticketId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Support ticket was not found"));

        ticket.setStatus(SupportTicketStatus.RESOLVED);
        ticket.setResolvedAt(OffsetDateTime.now());
        if (resolutionSummary != null) {
            String summary = resolutionSummary.trim();
            ticket.setResolutionSummary(summary.isBlank() ? null : summary);
        }
        supportTicketRepository.save(ticket);

        return toDetailView(ticket, false);
    }

    @Transactional(readOnly = true)
    public long countOpenTickets() {
        return supportTicketRepository.countByStatusIn(OPEN_STATUSES);
    }

    @Transactional(readOnly = true)
    public long countUrgentOpenTickets() {
        return supportTicketRepository.countByStatusInAndPriorityIn(OPEN_STATUSES, URGENT_PRIORITIES);
    }

    @Transactional(readOnly = true)
    public long countOpenTicketsByTenant(String tenantId) {
        return supportTicketRepository.countByTenantIdAndStatusIn(tenantId, OPEN_STATUSES);
    }

    @Transactional(readOnly = true)
    public long countUrgentOpenTicketsByTenant(String tenantId) {
        return supportTicketRepository.countByTenantIdAndStatusInAndPriorityIn(tenantId, OPEN_STATUSES, URGENT_PRIORITIES);
    }

    private void addMessage(
        SupportTicket ticket,
        SupportMessageAuthorAudience authorAudience,
        String authorUserId,
        String authorDisplayName,
        String authorEmail,
        String body,
        boolean internalNote
    ) {
        OffsetDateTime now = OffsetDateTime.now();

        SupportTicketMessage message = new SupportTicketMessage();
        message.setTenantId(ticket.getTenantId());
        message.setTicket(ticket);
        message.setAuthorAudience(authorAudience);
        message.setAuthorUserId(authorUserId);
        message.setAuthorDisplayName(authorDisplayName);
        message.setAuthorEmail(authorEmail);
        message.setBody(body.trim());
        message.setInternalNote(internalNote);
        supportTicketMessageRepository.save(message);

        ticket.setLastMessageAt(now);
    }

    private TicketSummaryView toSummaryView(SupportTicket ticket) {
        return new TicketSummaryView(
            ticket.getId(),
            ticket.getTenantId(),
            ticket.getBranchId(),
            ticket.getSubject(),
            ticket.getCategory(),
            ticket.getPriority(),
            ticket.getStatus(),
            ticket.getRequestedByEmail(),
            ticket.getRequestedByName(),
            ticket.getAssignedPlatformUserId(),
            ticket.getLastReplyByAudience(),
            ticket.getLastMessageAt(),
            ticket.getLastTenantMessageAt(),
            ticket.getLastPlatformReplyAt(),
            ticket.getResolvedAt(),
            ticket.getResolutionSummary()
        );
    }

    private TicketDetailView toDetailView(SupportTicket ticket, boolean includeInternalNotes) {
        List<TicketMessageView> messages = supportTicketMessageRepository.findAllByTicket_IdOrderByCreatedAtAsc(ticket.getId()).stream()
            .filter(message -> includeInternalNotes || !message.isInternalNote())
            .sorted(Comparator.comparing(SupportTicketMessage::getCreatedAt))
            .map(message -> new TicketMessageView(
                message.getId(),
                message.getAuthorAudience(),
                message.getAuthorDisplayName(),
                message.getAuthorEmail(),
                message.getBody(),
                message.isInternalNote(),
                message.getCreatedAt()
            ))
            .toList();

        return new TicketDetailView(
            toSummaryView(ticket),
            messages
        );
    }

    public record CreateTicketCommand(
        String branchId,
        String subject,
        SupportTicketCategory category,
        SupportTicketPriority priority,
        String body
    ) {
    }

    public record ReplyCommand(
        String body,
        boolean internalNote
    ) {
    }

    public record UpdateTicketCommand(
        SupportTicketStatus status,
        SupportTicketPriority priority,
        String assignedPlatformUserId,
        String resolutionSummary
    ) {
    }

    public record TicketSummaryView(
        String ticketId,
        String tenantId,
        String branchId,
        String subject,
        SupportTicketCategory category,
        SupportTicketPriority priority,
        SupportTicketStatus status,
        String requestedByEmail,
        String requestedByName,
        String assignedPlatformUserId,
        SupportMessageAuthorAudience lastReplyByAudience,
        OffsetDateTime lastMessageAt,
        OffsetDateTime lastTenantMessageAt,
        OffsetDateTime lastPlatformReplyAt,
        OffsetDateTime resolvedAt,
        String resolutionSummary
    ) {
    }

    public record TicketMessageView(
        String messageId,
        SupportMessageAuthorAudience authorAudience,
        String authorDisplayName,
        String authorEmail,
        String body,
        boolean internalNote,
        LocalDateTime createdAt
    ) {
    }

    public record TicketDetailView(
        TicketSummaryView summary,
        List<TicketMessageView> messages
    ) {
    }
}
