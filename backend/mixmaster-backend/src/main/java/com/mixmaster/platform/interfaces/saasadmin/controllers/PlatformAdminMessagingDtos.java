package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.modules.messaging.models.EmailRecipientMode;
import com.mixmaster.platform.modules.messaging.models.EmailTemplateCategory;
import com.mixmaster.platform.modules.messaging.models.PlatformEmailProvider;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

record PlatformMessagingWorkspaceResponse(
    PlatformEmailSettingsResponse settings,
    List<PlatformEmailPlaceholderResponse> placeholders,
    List<PlatformEmailTemplateSummaryResponse> templates
) {
}

record PlatformEmailSettingsResponse(
    String settingsId,
    String providerCode,
    String host,
    int port,
    String protocol,
    boolean authRequired,
    boolean starttlsEnabled,
    boolean sslEnabled,
    String username,
    boolean passwordConfigured,
    String fromName,
    String fromEmail,
    String replyToEmail,
    int connectionTimeoutMs,
    int readTimeoutMs,
    int writeTimeoutMs,
    OffsetDateTime lastTestSentAt,
    String lastTestStatus,
    String lastTestError
) {
}

record UpdatePlatformEmailSettingsRequest(
    @NotNull PlatformEmailProvider providerCode,
    @NotBlank String host,
    @Min(1) @Max(65535) int port,
    @NotBlank String protocol,
    boolean authRequired,
    boolean starttlsEnabled,
    boolean sslEnabled,
    String username,
    @Size(max = 512) String password,
    @NotBlank String fromName,
    @NotBlank @Email String fromEmail,
    @Email String replyToEmail,
    @Min(1000) int connectionTimeoutMs,
    @Min(1000) int readTimeoutMs,
    @Min(1000) int writeTimeoutMs
) {
}

record SendPlatformTestEmailRequest(
    @NotBlank @Email String recipientEmail,
    String recipientName
) {
}

record PlatformEmailTestResultResponse(
    String recipientEmail,
    String recipientName,
    OffsetDateTime sentAt,
    String status
) {
}

record PlatformEmailPlaceholderResponse(
    String key,
    String label,
    String description,
    String exampleValue
) {
}

record PlatformEmailTemplateSummaryResponse(
    String templateId,
    String code,
    String name,
    String category,
    boolean active,
    LocalDateTime updatedAt
) {
}

record PlatformEmailTemplateDetailResponse(
    String templateId,
    String code,
    String name,
    String category,
    String description,
    String subjectTemplate,
    String htmlTemplate,
    String textTemplate,
    boolean active,
    List<String> placeholderKeys,
    LocalDateTime updatedAt
) {
}

record CreatePlatformEmailTemplateRequest(
    @NotBlank String code,
    @NotBlank String name,
    @NotNull EmailTemplateCategory category,
    @Size(max = 500) String description,
    @NotBlank @Size(max = 500) String subjectTemplate,
    @NotBlank String htmlTemplate,
    String textTemplate,
    boolean active
) {
}

record UpdatePlatformEmailTemplateRequest(
    @NotBlank String code,
    @NotBlank String name,
    @NotNull EmailTemplateCategory category,
    @Size(max = 500) String description,
    @NotBlank @Size(max = 500) String subjectTemplate,
    @NotBlank String htmlTemplate,
    String textTemplate,
    boolean active
) {
}

record PreviewPlatformEmailTemplateRequest(
    String tenantId,
    String supportTicketId
) {
}

record PlatformRenderedEmailPreviewResponse(
    String subject,
    String htmlBody,
    String textBody,
    List<String> unresolvedPlaceholders,
    Map<String, String> resolvedPlaceholders,
    String tenantId,
    String supportTicketId
) {
}

record DispatchPlatformEmailTemplateRequest(
    @NotBlank String tenantId,
    @NotNull EmailRecipientMode recipientMode,
    @Email String customRecipientEmail,
    String customRecipientName,
    String supportTicketId
) {
}

record PlatformEmailDispatchResponse(
    String templateId,
    String tenantId,
    String recipientEmail,
    String recipientName,
    OffsetDateTime sentAt
) {
}
