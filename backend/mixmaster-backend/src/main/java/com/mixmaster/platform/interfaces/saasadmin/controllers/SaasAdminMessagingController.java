package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.modules.identity.access.PermissionCatalog;
import com.mixmaster.platform.modules.messaging.services.PlatformMessagingService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SaasAdminApiPaths.ROOT + "/messaging")
public class SaasAdminMessagingController {

    private final ActorPermissionService actorPermissionService;
    private final PlatformMessagingService platformMessagingService;

    public SaasAdminMessagingController(
        ActorPermissionService actorPermissionService,
        PlatformMessagingService platformMessagingService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.platformMessagingService = platformMessagingService;
    }

    @GetMapping("/workspace")
    public PlatformMessagingWorkspaceResponse loadWorkspace() {
        actorPermissionService.requirePlatformPermission(PermissionCatalog.PLATFORM_COMMUNICATIONS_READ);
        PlatformMessagingService.MessagingWorkspaceView workspace = platformMessagingService.loadWorkspace();
        return new PlatformMessagingWorkspaceResponse(
            toSettingsResponse(workspace.settings()),
            workspace.placeholders().stream().map(placeholder -> new PlatformEmailPlaceholderResponse(
                placeholder.key(),
                placeholder.label(),
                placeholder.description(),
                placeholder.exampleValue()
            )).toList(),
            workspace.templates().stream().map(this::toTemplateSummaryResponse).toList()
        );
    }

    @PutMapping("/settings")
    public PlatformEmailSettingsResponse updateSettings(@Valid @RequestBody UpdatePlatformEmailSettingsRequest request) {
        String actorUserId = actorPermissionService.requirePlatformPermission(PermissionCatalog.PLATFORM_COMMUNICATIONS_WRITE).userId();
        return toSettingsResponse(platformMessagingService.updateSettings(
            actorUserId,
            new PlatformMessagingService.UpdateSettingsCommand(
                request.providerCode(),
                request.host(),
                request.port(),
                request.protocol(),
                request.authRequired(),
                request.starttlsEnabled(),
                request.sslEnabled(),
                request.username(),
                request.password(),
                request.fromName(),
                request.fromEmail(),
                request.replyToEmail(),
                request.connectionTimeoutMs(),
                request.readTimeoutMs(),
                request.writeTimeoutMs()
            )
        ));
    }

    @PostMapping("/settings/test")
    public PlatformEmailTestResultResponse sendTestEmail(@Valid @RequestBody SendPlatformTestEmailRequest request) {
        String actorUserId = actorPermissionService.requirePlatformPermission(PermissionCatalog.PLATFORM_COMMUNICATIONS_WRITE).userId();
        PlatformMessagingService.TestEmailResult result = platformMessagingService.sendTestEmail(
            actorUserId,
            new PlatformMessagingService.TestEmailCommand(request.recipientEmail(), request.recipientName())
        );
        return new PlatformEmailTestResultResponse(
            result.recipientEmail(),
            result.recipientName(),
            result.sentAt(),
            result.status()
        );
    }

    @GetMapping("/templates")
    public List<PlatformEmailTemplateSummaryResponse> listTemplates() {
        actorPermissionService.requirePlatformPermission(PermissionCatalog.PLATFORM_COMMUNICATIONS_READ);
        return platformMessagingService.listTemplates().stream().map(this::toTemplateSummaryResponse).toList();
    }

    @GetMapping("/templates/{templateId}")
    public PlatformEmailTemplateDetailResponse getTemplate(@PathVariable String templateId) {
        actorPermissionService.requirePlatformPermission(PermissionCatalog.PLATFORM_COMMUNICATIONS_READ);
        return toTemplateDetailResponse(platformMessagingService.requireTemplate(templateId));
    }

    @PostMapping("/templates")
    public PlatformEmailTemplateDetailResponse createTemplate(@Valid @RequestBody CreatePlatformEmailTemplateRequest request) {
        String actorUserId = actorPermissionService.requirePlatformPermission(PermissionCatalog.PLATFORM_COMMUNICATIONS_WRITE).userId();
        return toTemplateDetailResponse(platformMessagingService.createTemplate(
            actorUserId,
            new PlatformMessagingService.CreateTemplateCommand(
                request.code(),
                request.name(),
                request.category(),
                request.description(),
                request.subjectTemplate(),
                request.htmlTemplate(),
                request.textTemplate(),
                request.active()
            )
        ));
    }

    @PutMapping("/templates/{templateId}")
    public PlatformEmailTemplateDetailResponse updateTemplate(
        @PathVariable String templateId,
        @Valid @RequestBody UpdatePlatformEmailTemplateRequest request
    ) {
        String actorUserId = actorPermissionService.requirePlatformPermission(PermissionCatalog.PLATFORM_COMMUNICATIONS_WRITE).userId();
        return toTemplateDetailResponse(platformMessagingService.updateTemplate(
            actorUserId,
            templateId,
            new PlatformMessagingService.UpdateTemplateCommand(
                request.code(),
                request.name(),
                request.category(),
                request.description(),
                request.subjectTemplate(),
                request.htmlTemplate(),
                request.textTemplate(),
                request.active()
            )
        ));
    }

    @DeleteMapping("/templates/{templateId}")
    public void deleteTemplate(@PathVariable String templateId) {
        actorPermissionService.requirePlatformPermission(PermissionCatalog.PLATFORM_COMMUNICATIONS_WRITE);
        platformMessagingService.deleteTemplate(templateId);
    }

    @PostMapping("/templates/{templateId}/preview")
    public PlatformRenderedEmailPreviewResponse previewTemplate(
        @PathVariable String templateId,
        @RequestBody(required = false) PreviewPlatformEmailTemplateRequest request
    ) {
        String actorUserId = actorPermissionService.requirePlatformPermission(PermissionCatalog.PLATFORM_COMMUNICATIONS_READ).userId();
        PreviewPlatformEmailTemplateRequest safeRequest = request != null
            ? request
            : new PreviewPlatformEmailTemplateRequest(null, null);
        PlatformMessagingService.RenderedEmailPreviewView preview = platformMessagingService.previewTemplate(
            actorUserId,
            templateId,
            new PlatformMessagingService.PreviewTemplateCommand(safeRequest.tenantId(), safeRequest.supportTicketId())
        );
        return new PlatformRenderedEmailPreviewResponse(
            preview.subject(),
            preview.htmlBody(),
            preview.textBody(),
            preview.unresolvedPlaceholders(),
            preview.resolvedPlaceholders(),
            preview.tenantId(),
            preview.supportTicketId()
        );
    }

    @PostMapping("/templates/{templateId}/dispatch")
    public PlatformEmailDispatchResponse dispatchTemplate(
        @PathVariable String templateId,
        @Valid @RequestBody DispatchPlatformEmailTemplateRequest request
    ) {
        String actorUserId = actorPermissionService.requirePlatformPermission(PermissionCatalog.PLATFORM_COMMUNICATIONS_WRITE).userId();
        PlatformMessagingService.EmailDispatchView dispatch = platformMessagingService.dispatchTemplate(
            actorUserId,
            templateId,
            new PlatformMessagingService.DispatchTemplateCommand(
                request.tenantId(),
                request.recipientMode(),
                request.customRecipientEmail(),
                request.customRecipientName(),
                request.supportTicketId()
            )
        );
        return new PlatformEmailDispatchResponse(
            dispatch.templateId(),
            dispatch.tenantId(),
            dispatch.recipientEmail(),
            dispatch.recipientName(),
            dispatch.sentAt()
        );
    }

    private PlatformEmailSettingsResponse toSettingsResponse(PlatformMessagingService.EmailSettingsView settings) {
        return new PlatformEmailSettingsResponse(
            settings.settingsId(),
            settings.providerCode().name(),
            settings.host(),
            settings.port(),
            settings.protocol(),
            settings.authRequired(),
            settings.starttlsEnabled(),
            settings.sslEnabled(),
            settings.username(),
            settings.passwordConfigured(),
            settings.fromName(),
            settings.fromEmail(),
            settings.replyToEmail(),
            settings.connectionTimeoutMs(),
            settings.readTimeoutMs(),
            settings.writeTimeoutMs(),
            settings.lastTestSentAt(),
            settings.lastTestStatus(),
            settings.lastTestError()
        );
    }

    private PlatformEmailTemplateSummaryResponse toTemplateSummaryResponse(PlatformMessagingService.EmailTemplateSummaryView template) {
        return new PlatformEmailTemplateSummaryResponse(
            template.templateId(),
            template.code(),
            template.name(),
            template.category().name(),
            template.active(),
            template.updatedAt()
        );
    }

    private PlatformEmailTemplateDetailResponse toTemplateDetailResponse(PlatformMessagingService.EmailTemplateDetailView template) {
        return new PlatformEmailTemplateDetailResponse(
            template.templateId(),
            template.code(),
            template.name(),
            template.category().name(),
            template.description(),
            template.subjectTemplate(),
            template.htmlTemplate(),
            template.textTemplate(),
            template.active(),
            template.placeholderKeys(),
            template.updatedAt()
        );
    }
}
