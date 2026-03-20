package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.interfaces.saasadmin.services.SaasAdminTelemetryService;
import com.mixmaster.platform.modules.support.services.SupportTicketService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SaasAdminApiPaths.ROOT + "/support")
public class SaasAdminSupportController {

    private final ActorPermissionService actorPermissionService;
    private final SupportTicketService supportTicketService;
    private final SaasAdminTelemetryService saasAdminTelemetryService;

    public SaasAdminSupportController(
        ActorPermissionService actorPermissionService,
        SupportTicketService supportTicketService,
        SaasAdminTelemetryService saasAdminTelemetryService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.supportTicketService = supportTicketService;
        this.saasAdminTelemetryService = saasAdminTelemetryService;
    }

    @GetMapping("/tickets")
    public java.util.List<PlatformSupportTicketSummaryResponse> tickets() {
        actorPermissionService.requirePlatformPermission("platform.support.read");
        Map<String, String> tenantNames = saasAdminTelemetryService.loadWorkspace().tenants().stream()
            .collect(Collectors.toMap(
                SaasAdminTelemetryService.TenantTelemetryView::tenantId,
                telemetry -> telemetry.snapshot().getName(),
                (left, right) -> left
            ));

        return supportTicketService.listPlatformTickets().stream()
            .map(ticket -> toSummaryResponse(ticket, tenantNames.get(ticket.tenantId())))
            .toList();
    }

    @GetMapping("/tickets/{ticketId}")
    public PlatformSupportTicketDetailResponse ticket(@PathVariable String ticketId) {
        actorPermissionService.requirePlatformPermission("platform.support.read");
        SupportTicketService.TicketDetailView detail = supportTicketService.requirePlatformTicket(ticketId);
        String tenantName = saasAdminTelemetryService.requireTenantTelemetry(detail.summary().tenantId()).snapshot().getName();
        return toDetailResponse(detail, tenantName);
    }

    @PostMapping("/tickets/{ticketId}/messages")
    public PlatformSupportTicketDetailResponse reply(
        @PathVariable String ticketId,
        @Valid @RequestBody CreatePlatformSupportTicketReplyRequest request
    ) {
        String userId = actorPermissionService.requirePlatformPermission("platform.support.write").userId();
        SupportTicketService.TicketDetailView detail = supportTicketService.replyAsPlatform(
            userId,
            ticketId,
            new SupportTicketService.ReplyCommand(request.body(), request.internalNote())
        );
        saasAdminTelemetryService.refreshTenant(detail.summary().tenantId());
        String tenantName = saasAdminTelemetryService.requireTenantTelemetry(detail.summary().tenantId()).snapshot().getName();
        return toDetailResponse(detail, tenantName);
    }

    @PatchMapping("/tickets/{ticketId}")
    public PlatformSupportTicketDetailResponse update(
        @PathVariable String ticketId,
        @RequestBody UpdatePlatformSupportTicketRequest request
    ) {
        String userId = actorPermissionService.requirePlatformPermission("platform.support.write").userId();
        SupportTicketService.TicketDetailView detail = supportTicketService.updatePlatformTicket(
            userId,
            ticketId,
            new SupportTicketService.UpdateTicketCommand(
                request.status(),
                request.priority(),
                request.assignedPlatformUserId(),
                request.resolutionSummary()
            )
        );
        saasAdminTelemetryService.refreshTenant(detail.summary().tenantId());
        String tenantName = saasAdminTelemetryService.requireTenantTelemetry(detail.summary().tenantId()).snapshot().getName();
        return toDetailResponse(detail, tenantName);
    }

    private PlatformSupportTicketSummaryResponse toSummaryResponse(SupportTicketService.TicketSummaryView ticket, String tenantName) {
        return new PlatformSupportTicketSummaryResponse(
            ticket.ticketId(),
            ticket.tenantId(),
            tenantName,
            ticket.subject(),
            ticket.category().name(),
            ticket.priority().name(),
            ticket.status().name(),
            ticket.requestedByEmail(),
            ticket.requestedByName(),
            ticket.assignedPlatformUserId(),
            ticket.lastReplyByAudience().name(),
            ticket.lastMessageAt(),
            ticket.lastTenantMessageAt(),
            ticket.lastPlatformReplyAt(),
            ticket.resolvedAt(),
            ticket.resolutionSummary()
        );
    }

    private PlatformSupportTicketDetailResponse toDetailResponse(SupportTicketService.TicketDetailView detail, String tenantName) {
        return new PlatformSupportTicketDetailResponse(
            toSummaryResponse(detail.summary(), tenantName),
            detail.messages().stream()
                .map(message -> new PlatformSupportTicketMessageResponse(
                    message.messageId(),
                    message.authorAudience().name(),
                    message.authorDisplayName(),
                    message.authorEmail(),
                    message.body(),
                    message.internalNote(),
                    message.createdAt()
                ))
                .toList()
        );
    }
}
