package com.mixmaster.platform.interfaces.tenantconsole.controllers;

import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.modules.support.services.SupportTicketService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import com.mixmaster.platform.shared.security.AuthenticatedActor;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(TenantConsoleApiPaths.ROOT + "/support")
public class TenantConsoleSupportController {

    private final ActorPermissionService actorPermissionService;
    private final SupportTicketService supportTicketService;

    public TenantConsoleSupportController(
        ActorPermissionService actorPermissionService,
        SupportTicketService supportTicketService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.supportTicketService = supportTicketService;
    }

    @GetMapping("/tickets")
    public java.util.List<TenantSupportTicketSummaryResponse> tickets() {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.tickets.read");
        return supportTicketService.listTenantTickets(actor.tenantId()).stream()
            .map(this::toSummaryResponse)
            .toList();
    }

    @GetMapping("/tickets/{ticketId}")
    public TenantSupportTicketDetailResponse ticket(@PathVariable String ticketId) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.tickets.read");
        return toDetailResponse(supportTicketService.requireTenantTicket(actor.tenantId(), ticketId));
    }

    @PostMapping("/tickets")
    public TenantSupportTicketDetailResponse createTicket(@Valid @RequestBody CreateTenantSupportTicketRequest request) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.tickets.write");
        if (request.branchId() != null) {
            actorPermissionService.requireBranchAccess(actor, request.branchId());
        }
        return toDetailResponse(supportTicketService.createTenantTicket(
            actor.tenantId(),
            actor.userId(),
            new SupportTicketService.CreateTicketCommand(
                request.branchId(),
                request.subject(),
                request.category(),
                request.priority(),
                request.body()
            )
        ));
    }

    @PostMapping("/tickets/{ticketId}/messages")
    public TenantSupportTicketDetailResponse reply(
        @PathVariable String ticketId,
        @Valid @RequestBody ReplyTenantSupportTicketRequest request
    ) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.tickets.write");
        return toDetailResponse(supportTicketService.replyAsTenant(
            actor.tenantId(),
            actor.userId(),
            ticketId,
            new SupportTicketService.ReplyCommand(request.body(), false)
        ));
    }

    @PostMapping("/tickets/{ticketId}/resolve")
    public TenantSupportTicketDetailResponse resolve(
        @PathVariable String ticketId,
        @RequestBody ResolveTenantSupportTicketRequest request
    ) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.tickets.resolve");
        return toDetailResponse(supportTicketService.resolveAsTenant(
            actor.tenantId(),
            actor.userId(),
            ticketId,
            request.resolutionSummary()
        ));
    }

    private TenantSupportTicketSummaryResponse toSummaryResponse(SupportTicketService.TicketSummaryView ticket) {
        return new TenantSupportTicketSummaryResponse(
            ticket.ticketId(),
            ticket.tenantId(),
            ticket.branchId(),
            ticket.subject(),
            ticket.category().name(),
            ticket.priority().name(),
            ticket.status().name(),
            ticket.requestedByEmail(),
            ticket.requestedByName(),
            ticket.lastReplyByAudience().name(),
            ticket.lastMessageAt(),
            ticket.lastTenantMessageAt(),
            ticket.lastPlatformReplyAt(),
            ticket.resolvedAt(),
            ticket.resolutionSummary()
        );
    }

    private TenantSupportTicketDetailResponse toDetailResponse(SupportTicketService.TicketDetailView detail) {
        return new TenantSupportTicketDetailResponse(
            toSummaryResponse(detail.summary()),
            detail.messages().stream()
                .map(message -> new TenantSupportTicketMessageResponse(
                    message.messageId(),
                    message.authorAudience().name(),
                    message.authorDisplayName(),
                    message.authorEmail(),
                    message.body(),
                    message.createdAt()
                ))
                .toList()
        );
    }
}
