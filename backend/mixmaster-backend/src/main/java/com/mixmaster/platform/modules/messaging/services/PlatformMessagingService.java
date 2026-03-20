package com.mixmaster.platform.modules.messaging.services;

import com.mixmaster.platform.interfaces.saasadmin.services.SaasAdminWorkspaceService;
import com.mixmaster.platform.modules.identity.platform.models.PlatformUser;
import com.mixmaster.platform.modules.identity.platform.repositories.PlatformUserRepository;
import com.mixmaster.platform.modules.messaging.models.EmailRecipientMode;
import com.mixmaster.platform.modules.messaging.models.EmailTemplate;
import com.mixmaster.platform.modules.messaging.models.EmailTemplateCategory;
import com.mixmaster.platform.modules.messaging.models.PlatformEmailProvider;
import com.mixmaster.platform.modules.messaging.models.PlatformEmailSettings;
import com.mixmaster.platform.modules.messaging.repositories.EmailTemplateRepository;
import com.mixmaster.platform.modules.messaging.repositories.PlatformEmailSettingsRepository;
import com.mixmaster.platform.modules.support.services.SupportTicketService;
import com.mixmaster.platform.shared.security.SecretCipherService;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformMessagingService {

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_.-]+)\\s*}}");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    private static final List<PlaceholderDefinition> PLACEHOLDERS = List.of(
        new PlaceholderDefinition("platform.fullName", "Nombre operador SaaS", "Nombre del actor SaaS que envía o previsualiza.", "MixMaster SaaS Admin"),
        new PlaceholderDefinition("platform.email", "Correo operador SaaS", "Correo del actor SaaS que envía o previsualiza.", "platform@mixmaster.cl"),
        new PlaceholderDefinition("tenant.id", "Id tenant", "Identificador interno del tenant.", "01J123TENANTABCXYZ12345678"),
        new PlaceholderDefinition("tenant.code", "Código tenant", "Código técnico del tenant.", "bellavista-night-bar"),
        new PlaceholderDefinition("tenant.name", "Nombre comercial", "Nombre comercial del tenant.", "Bellavista Night Bar"),
        new PlaceholderDefinition("tenant.legalName", "Razón social", "Razón social del tenant.", "Bellavista Night Bar SpA"),
        new PlaceholderDefinition("tenant.ownerEmail", "Correo owner", "Correo del owner inicial del tenant.", "duena@bellavista.cl"),
        new PlaceholderDefinition("tenant.ownerFullName", "Nombre owner", "Nombre del owner inicial del tenant.", "Camila Rojas"),
        new PlaceholderDefinition("tenant.billingEmail", "Correo facturación", "Correo de facturación registrado.", "facturacion@bellavista.cl"),
        new PlaceholderDefinition("tenant.subscriptionPlanCode", "Plan", "Plan SaaS actual del tenant.", "FOUNDATION"),
        new PlaceholderDefinition("tenant.subscriptionStatus", "Estado suscripción", "Estado comercial de la suscripción.", "TRIAL"),
        new PlaceholderDefinition("tenant.onboardingStage", "Etapa onboarding", "Etapa actual de onboarding.", "LEGAL_SETUP"),
        new PlaceholderDefinition("tenant.readinessScore", "Readiness", "Score de readiness operativo/legal del tenant.", "84"),
        new PlaceholderDefinition("tenant.siiStartActivitiesVerified", "SII verificado", "Indica si el inicio de actividades SII está verificado.", "Sí"),
        new PlaceholderDefinition("branch.name", "Sucursal principal", "Nombre de la sucursal principal o primera visible.", "Casa Matriz"),
        new PlaceholderDefinition("branch.code", "Código sucursal", "Código de la sucursal principal.", "casa-matriz"),
        new PlaceholderDefinition("branch.city", "Ciudad sucursal", "Ciudad de la sucursal principal.", "Santiago"),
        new PlaceholderDefinition("support.ticketId", "Id ticket", "Identificador de ticket asociado.", "01J123TICKETABCXYZ12345678"),
        new PlaceholderDefinition("support.subject", "Asunto ticket", "Asunto del ticket asociado.", "Revisión de onboarding legal"),
        new PlaceholderDefinition("support.priority", "Prioridad ticket", "Prioridad del ticket asociado.", "HIGH"),
        new PlaceholderDefinition("support.status", "Estado ticket", "Estado actual del ticket asociado.", "WAITING_ON_PLATFORM"),
        new PlaceholderDefinition("system.date", "Fecha", "Fecha actual en America/Santiago.", "20-03-2026"),
        new PlaceholderDefinition("system.datetime", "Fecha y hora", "Fecha y hora actual en America/Santiago.", "20-03-2026 10:30"),
        new PlaceholderDefinition("system.year", "Año", "Año actual.", "2026")
    );

    private final PlatformEmailSettingsRepository platformEmailSettingsRepository;
    private final EmailTemplateRepository emailTemplateRepository;
    private final PlatformUserRepository platformUserRepository;
    private final SaasAdminWorkspaceService saasAdminWorkspaceService;
    private final SupportTicketService supportTicketService;
    private final SecretCipherService secretCipherService;

    public PlatformMessagingService(
        PlatformEmailSettingsRepository platformEmailSettingsRepository,
        EmailTemplateRepository emailTemplateRepository,
        PlatformUserRepository platformUserRepository,
        SaasAdminWorkspaceService saasAdminWorkspaceService,
        SupportTicketService supportTicketService,
        SecretCipherService secretCipherService
    ) {
        this.platformEmailSettingsRepository = platformEmailSettingsRepository;
        this.emailTemplateRepository = emailTemplateRepository;
        this.platformUserRepository = platformUserRepository;
        this.saasAdminWorkspaceService = saasAdminWorkspaceService;
        this.supportTicketService = supportTicketService;
        this.secretCipherService = secretCipherService;
    }

    @Transactional(readOnly = true)
    public MessagingWorkspaceView loadWorkspace() {
        return new MessagingWorkspaceView(
            loadSettings(),
            PLACEHOLDERS.stream().map(this::toPlaceholderView).toList(),
            listTemplates()
        );
    }

    @Transactional(readOnly = true)
    public EmailSettingsView loadSettings() {
        return platformEmailSettingsRepository.findTopByOrderByUpdatedAtDesc()
            .map(this::toSettingsView)
            .orElseGet(this::defaultSettingsView);
    }

    @Transactional
    public EmailSettingsView updateSettings(String actorUserId, UpdateSettingsCommand command) {
        PlatformEmailSettings settings = platformEmailSettingsRepository.findTopByOrderByUpdatedAtDesc()
            .orElseGet(PlatformEmailSettings::new);

        settings.setProviderCode(command.providerCode());
        settings.setHost(command.host().trim());
        settings.setPort(command.port());
        settings.setProtocol(command.protocol().trim().toLowerCase(Locale.ROOT));
        settings.setAuthRequired(command.authRequired());
        settings.setStarttlsEnabled(command.starttlsEnabled());
        settings.setSslEnabled(command.sslEnabled());
        settings.setUsername(normalizeNullable(command.username()));
        settings.setFromName(command.fromName().trim());
        settings.setFromEmail(command.fromEmail().trim().toLowerCase(Locale.ROOT));
        settings.setReplyToEmail(normalizeNullableEmail(command.replyToEmail()));
        settings.setConnectionTimeoutMs(command.connectionTimeoutMs());
        settings.setReadTimeoutMs(command.readTimeoutMs());
        settings.setWriteTimeoutMs(command.writeTimeoutMs());
        settings.setActive(true);
        if (settings.getCreatedByUserId() == null) {
            settings.setCreatedByUserId(actorUserId);
        }
        settings.setUpdatedByUserId(actorUserId);

        if (command.password() != null) {
            String password = normalizeNullable(command.password());
            settings.setPasswordCiphertext(password == null ? null : secretCipherService.encrypt(password));
        }

        validateSettings(settings);
        platformEmailSettingsRepository.save(settings);
        return toSettingsView(settings);
    }

    @Transactional
    public TestEmailResult sendTestEmail(String actorUserId, TestEmailCommand command) {
        PlatformEmailSettings settings = requireSettings();
        PlatformUser actor = requirePlatformUser(actorUserId);

        try {
            sendMessage(
                settings,
                command.recipientEmail(),
                normalizeNullable(command.recipientName()),
                "Prueba SMTP MixMaster",
                "<p>Esta es una prueba de configuración SMTP desde MixMaster.</p>"
                    + "<p>Operador: <strong>" + actor.getFullName() + "</strong> (" + actor.getEmail() + ")</p>",
                "Esta es una prueba de configuración SMTP desde MixMaster. Operador: "
                    + actor.getFullName() + " (" + actor.getEmail() + ")"
            );

            settings.setLastTestSentAt(OffsetDateTime.now());
            settings.setLastTestStatus("SUCCESS");
            settings.setLastTestError(null);
            platformEmailSettingsRepository.save(settings);

            return new TestEmailResult(
                command.recipientEmail(),
                normalizeNullable(command.recipientName()),
                settings.getLastTestSentAt(),
                "SUCCESS"
            );
        } catch (Exception exception) {
            settings.setLastTestSentAt(OffsetDateTime.now());
            settings.setLastTestStatus("FAILURE");
            settings.setLastTestError(trimError(exception.getMessage()));
            platformEmailSettingsRepository.save(settings);
            throw new IllegalArgumentException("No fue posible enviar el correo de prueba: " + exception.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<EmailTemplateSummaryView> listTemplates() {
        return emailTemplateRepository.findAllByOrderByUpdatedAtDesc().stream()
            .map(this::toTemplateSummaryView)
            .toList();
    }

    @Transactional(readOnly = true)
    public EmailTemplateDetailView requireTemplate(String templateId) {
        return toTemplateDetailView(requireTemplateEntity(templateId));
    }

    @Transactional
    public EmailTemplateDetailView createTemplate(String actorUserId, CreateTemplateCommand command) {
        String normalizedCode = normalizeCode(command.code());
        if (emailTemplateRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("El código de plantilla ya está en uso");
        }

        EmailTemplate template = new EmailTemplate();
        applyTemplateMutation(template, actorUserId, normalizedCode, command);
        template.setCreatedByUserId(actorUserId);
        emailTemplateRepository.save(template);
        return toTemplateDetailView(template);
    }

    @Transactional
    public EmailTemplateDetailView updateTemplate(String actorUserId, String templateId, UpdateTemplateCommand command) {
        EmailTemplate template = requireTemplateEntity(templateId);
        String normalizedCode = normalizeCode(command.code());
        emailTemplateRepository.findByCodeIgnoreCase(normalizedCode)
            .filter(existing -> !Objects.equals(existing.getId(), template.getId()))
            .ifPresent(existing -> {
                throw new IllegalArgumentException("El código de plantilla ya está en uso");
            });

        applyTemplateMutation(template, actorUserId, normalizedCode, command);
        emailTemplateRepository.save(template);
        return toTemplateDetailView(template);
    }

    @Transactional
    public void deleteTemplate(String templateId) {
        emailTemplateRepository.delete(requireTemplateEntity(templateId));
    }

    @Transactional(readOnly = true)
    public RenderedEmailPreviewView previewTemplate(String actorUserId, String templateId, PreviewTemplateCommand command) {
        EmailTemplate template = requireTemplateEntity(templateId);
        PlatformUser actor = requirePlatformUser(actorUserId);
        PlaceholderContext context = buildContext(actor, normalizeNullable(command.tenantId()), normalizeNullable(command.supportTicketId()));
        return renderTemplate(template, context);
    }

    @Transactional
    public EmailDispatchView dispatchTemplate(String actorUserId, String templateId, DispatchTemplateCommand command) {
        PlatformEmailSettings settings = requireSettings();
        EmailTemplate template = requireTemplateEntity(templateId);
        PlatformUser actor = requirePlatformUser(actorUserId);
        SaasAdminWorkspaceService.TenantDetailSnapshot tenant = saasAdminWorkspaceService.requireTenantDetail(command.tenantId());
        PlaceholderContext context = buildContext(actor, tenant.tenantId(), normalizeNullable(command.supportTicketId()));
        RenderedEmailPreviewView rendered = renderTemplate(template, context);

        if (!rendered.unresolvedPlaceholders().isEmpty()) {
            throw new IllegalArgumentException("La plantilla contiene placeholders no resueltos: "
                + String.join(", ", rendered.unresolvedPlaceholders()));
        }

        Recipient recipient = resolveRecipient(command, tenant);
        sendMessage(settings, recipient.email(), recipient.name(), rendered.subject(), rendered.htmlBody(), rendered.textBody());

        return new EmailDispatchView(
            template.getId(),
            tenant.tenantId(),
            recipient.email(),
            recipient.name(),
            OffsetDateTime.now()
        );
    }

    private void applyTemplateMutation(
        EmailTemplate template,
        String actorUserId,
        String normalizedCode,
        TemplateMutation mutation
    ) {
        template.setCode(normalizedCode);
        template.setName(mutation.name().trim());
        template.setCategory(mutation.category());
        template.setDescription(normalizeNullable(mutation.description()));
        template.setSubjectTemplate(mutation.subjectTemplate().trim());
        template.setHtmlTemplate(mutation.htmlTemplate().trim());
        template.setTextTemplate(normalizeNullable(mutation.textTemplate()));
        template.setActive(mutation.active());
        template.setUpdatedByUserId(actorUserId);
    }

    private PlatformUser requirePlatformUser(String actorUserId) {
        return platformUserRepository.findById(actorUserId)
            .orElseThrow(() -> new IllegalArgumentException("El usuario SaaS no fue encontrado"));
    }

    private PlatformEmailSettings requireSettings() {
        PlatformEmailSettings settings = platformEmailSettingsRepository.findTopByOrderByUpdatedAtDesc()
            .orElseThrow(() -> new IllegalArgumentException("Todavía no existe configuración SMTP"));
        validateSettings(settings);
        return settings;
    }

    private void validateSettings(PlatformEmailSettings settings) {
        if (settings.getHost() == null || settings.getHost().isBlank()) {
            throw new IllegalArgumentException("Debes definir el host SMTP");
        }
        if (settings.getPort() <= 0) {
            throw new IllegalArgumentException("Debes definir un puerto SMTP válido");
        }
        if (settings.getFromEmail() == null || settings.getFromEmail().isBlank()) {
            throw new IllegalArgumentException("Debes definir el correo remitente");
        }
        if (settings.isAuthRequired()) {
            if (settings.getUsername() == null || settings.getUsername().isBlank()) {
                throw new IllegalArgumentException("SMTP con autenticación requiere username");
            }
            if (settings.getPasswordCiphertext() == null || settings.getPasswordCiphertext().isBlank()) {
                throw new IllegalArgumentException("SMTP con autenticación requiere contraseña o token de aplicación");
            }
        }
    }

    private JavaMailSenderImpl buildMailSender(PlatformEmailSettings settings) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(settings.getHost());
        sender.setPort(settings.getPort());
        sender.setProtocol(settings.getProtocol());
        sender.setDefaultEncoding("UTF-8");

        if (settings.getUsername() != null && !settings.getUsername().isBlank()) {
            sender.setUsername(settings.getUsername());
        }
        if (settings.getPasswordCiphertext() != null && !settings.getPasswordCiphertext().isBlank()) {
            sender.setPassword(secretCipherService.decrypt(settings.getPasswordCiphertext()));
        }

        sender.getJavaMailProperties().put("mail.transport.protocol", settings.getProtocol());
        sender.getJavaMailProperties().put("mail.smtp.auth", settings.isAuthRequired());
        sender.getJavaMailProperties().put("mail.smtp.starttls.enable", settings.isStarttlsEnabled());
        sender.getJavaMailProperties().put("mail.smtp.ssl.enable", settings.isSslEnabled());
        sender.getJavaMailProperties().put("mail.smtp.connectiontimeout", settings.getConnectionTimeoutMs());
        sender.getJavaMailProperties().put("mail.smtp.timeout", settings.getReadTimeoutMs());
        sender.getJavaMailProperties().put("mail.smtp.writetimeout", settings.getWriteTimeoutMs());
        return sender;
    }

    private void sendMessage(
        PlatformEmailSettings settings,
        String recipientEmail,
        String recipientName,
        String subject,
        String htmlBody,
        String textBody
    ) {
        try {
            JavaMailSenderImpl sender = buildMailSender(settings);
            var mimeMessage = sender.createMimeMessage();
            var helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(settings.getFromEmail(), settings.getFromName());
            helper.setTo(recipientEmail);
            if (settings.getReplyToEmail() != null && !settings.getReplyToEmail().isBlank()) {
                helper.setReplyTo(settings.getReplyToEmail());
            }
            helper.setSubject(subject);
            helper.setText(resolveTextBody(textBody, htmlBody), htmlBody);
            sender.send(mimeMessage);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Falló la entrega SMTP hacia " + recipientEmail + ": " + exception.getMessage());
        }
    }

    private Recipient resolveRecipient(DispatchTemplateCommand command, SaasAdminWorkspaceService.TenantDetailSnapshot tenant) {
        return switch (command.recipientMode()) {
            case OWNER -> new Recipient(
                requireValue(tenant.ownerEmail(), "El tenant no tiene correo owner"),
                normalizeNullable(tenant.ownerFullName())
            );
            case BILLING -> new Recipient(
                requireValue(tenant.billingEmail(), "El tenant no tiene correo de facturación"),
                normalizeNullable(tenant.legalName() != null ? tenant.legalName() : tenant.name())
            );
            case CUSTOM -> new Recipient(
                requireValue(normalizeNullable(command.customRecipientEmail()), "Debes indicar el correo destinatario personalizado"),
                normalizeNullable(command.customRecipientName())
            );
        };
    }

    private PlaceholderContext buildContext(PlatformUser actor, String tenantId, String supportTicketId) {
        Map<String, String> values = new LinkedHashMap<>();
        OffsetDateTime now = OffsetDateTime.now(ZoneId.of("America/Santiago"));

        values.put("platform.fullName", actor.getFullName());
        values.put("platform.email", actor.getEmail());
        values.put("system.date", DATE_FORMATTER.format(now));
        values.put("system.datetime", DATE_TIME_FORMATTER.format(now));
        values.put("system.year", String.valueOf(now.getYear()));

        if (tenantId != null) {
            SaasAdminWorkspaceService.TenantDetailSnapshot tenant = saasAdminWorkspaceService.requireTenantDetail(tenantId);
            SaasAdminWorkspaceService.TenantBranchSnapshot primaryBranch = tenant.branches().stream().findFirst().orElse(null);

            values.put("tenant.id", tenant.tenantId());
            values.put("tenant.code", tenant.code());
            values.put("tenant.name", tenant.name());
            values.put("tenant.legalName", nullSafe(tenant.legalName()));
            values.put("tenant.ownerEmail", nullSafe(tenant.ownerEmail()));
            values.put("tenant.ownerFullName", nullSafe(tenant.ownerFullName()));
            values.put("tenant.billingEmail", nullSafe(tenant.billingEmail()));
            values.put("tenant.subscriptionPlanCode", nullSafe(tenant.subscriptionPlanCode()));
            values.put("tenant.subscriptionStatus", tenant.subscriptionStatus().name());
            values.put("tenant.onboardingStage", tenant.onboardingStage().name());
            values.put("tenant.readinessScore", String.valueOf(tenant.readinessScore()));
            values.put("tenant.siiStartActivitiesVerified", tenant.siiStartActivitiesVerified() ? "Sí" : "No");
            values.put("branch.name", primaryBranch != null ? nullSafe(primaryBranch.name()) : "");
            values.put("branch.code", primaryBranch != null ? nullSafe(primaryBranch.code()) : "");
            values.put("branch.city", primaryBranch != null ? nullSafe(primaryBranch.city()) : "");
        } else {
            PLACEHOLDERS.stream()
                .filter(placeholder -> placeholder.key().startsWith("tenant.") || placeholder.key().startsWith("branch."))
                .forEach(placeholder -> values.putIfAbsent(placeholder.key(), placeholder.exampleValue()));
        }

        if (supportTicketId != null) {
            SupportTicketService.TicketDetailView ticket = supportTicketService.requirePlatformTicket(supportTicketId);
            values.put("support.ticketId", ticket.summary().ticketId());
            values.put("support.subject", ticket.summary().subject());
            values.put("support.priority", ticket.summary().priority().name());
            values.put("support.status", ticket.summary().status().name());
        } else {
            PLACEHOLDERS.stream()
                .filter(placeholder -> placeholder.key().startsWith("support."))
                .forEach(placeholder -> values.putIfAbsent(placeholder.key(), placeholder.exampleValue()));
        }

        PLACEHOLDERS.forEach(placeholder -> values.putIfAbsent(placeholder.key(), placeholder.exampleValue()));
        return new PlaceholderContext(values, tenantId, supportTicketId);
    }

    private RenderedEmailPreviewView renderTemplate(EmailTemplate template, PlaceholderContext context) {
        RenderResult subject = renderValue(template.getSubjectTemplate(), context.values());
        RenderResult html = renderValue(template.getHtmlTemplate(), context.values());
        RenderResult text = renderValue(resolveTextBody(template.getTextTemplate(), template.getHtmlTemplate()), context.values());

        Set<String> unresolved = new LinkedHashSet<>();
        unresolved.addAll(subject.unresolvedPlaceholders());
        unresolved.addAll(html.unresolvedPlaceholders());
        unresolved.addAll(text.unresolvedPlaceholders());

        Set<String> usedPlaceholders = new LinkedHashSet<>();
        usedPlaceholders.addAll(subject.usedPlaceholders());
        usedPlaceholders.addAll(html.usedPlaceholders());
        usedPlaceholders.addAll(text.usedPlaceholders());

        Map<String, String> resolvedValues = usedPlaceholders.stream()
            .collect(Collectors.toMap(
                placeholder -> placeholder,
                placeholder -> context.values().getOrDefault(placeholder, ""),
                (left, right) -> left,
                LinkedHashMap::new
            ));

        return new RenderedEmailPreviewView(
            subject.rendered(),
            html.rendered(),
            text.rendered(),
            new ArrayList<>(unresolved),
            resolvedValues,
            context.tenantId(),
            context.supportTicketId()
        );
    }

    private RenderResult renderValue(String templateValue, Map<String, String> contextValues) {
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(templateValue);
        StringBuffer output = new StringBuffer();
        Set<String> unresolved = new LinkedHashSet<>();
        Set<String> used = new LinkedHashSet<>();

        while (matcher.find()) {
            String placeholder = matcher.group(1);
            used.add(placeholder);
            String replacement = contextValues.get(placeholder);
            if (replacement == null) {
                unresolved.add(placeholder);
                replacement = "";
            }
            matcher.appendReplacement(output, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(output);
        return new RenderResult(output.toString(), new ArrayList<>(unresolved), new ArrayList<>(used));
    }

    private EmailTemplate requireTemplateEntity(String templateId) {
        return emailTemplateRepository.findById(templateId)
            .orElseThrow(() -> new IllegalArgumentException("La plantilla no fue encontrada"));
    }

    private EmailSettingsView toSettingsView(PlatformEmailSettings settings) {
        return new EmailSettingsView(
            settings.getId(),
            settings.getProviderCode(),
            settings.getHost(),
            settings.getPort(),
            settings.getProtocol(),
            settings.isAuthRequired(),
            settings.isStarttlsEnabled(),
            settings.isSslEnabled(),
            settings.getUsername(),
            settings.getPasswordCiphertext() != null && !settings.getPasswordCiphertext().isBlank(),
            settings.getFromName(),
            settings.getFromEmail(),
            settings.getReplyToEmail(),
            settings.getConnectionTimeoutMs(),
            settings.getReadTimeoutMs(),
            settings.getWriteTimeoutMs(),
            settings.getLastTestSentAt(),
            settings.getLastTestStatus(),
            settings.getLastTestError()
        );
    }

    private EmailSettingsView defaultSettingsView() {
        return new EmailSettingsView(
            null,
            PlatformEmailProvider.GOOGLE_WORKSPACE,
            "smtp-relay.gmail.com",
            587,
            "smtp",
            false,
            true,
            false,
            null,
            false,
            "MixMaster",
            "",
            null,
            10000,
            10000,
            10000,
            null,
            null,
            null
        );
    }

    private PlaceholderView toPlaceholderView(PlaceholderDefinition definition) {
        return new PlaceholderView(
            definition.key(),
            definition.label(),
            definition.description(),
            definition.exampleValue()
        );
    }

    private EmailTemplateSummaryView toTemplateSummaryView(EmailTemplate template) {
        return new EmailTemplateSummaryView(
            template.getId(),
            template.getCode(),
            template.getName(),
            template.getCategory(),
            template.isActive(),
            template.getUpdatedAt()
        );
    }

    private EmailTemplateDetailView toTemplateDetailView(EmailTemplate template) {
        Set<String> placeholderKeys = new LinkedHashSet<>();
        placeholderKeys.addAll(extractPlaceholders(template.getSubjectTemplate()));
        placeholderKeys.addAll(extractPlaceholders(template.getHtmlTemplate()));
        placeholderKeys.addAll(extractPlaceholders(template.getTextTemplate()));

        return new EmailTemplateDetailView(
            template.getId(),
            template.getCode(),
            template.getName(),
            template.getCategory(),
            template.getDescription(),
            template.getSubjectTemplate(),
            template.getHtmlTemplate(),
            template.getTextTemplate(),
            template.isActive(),
            new ArrayList<>(placeholderKeys),
            template.getUpdatedAt()
        );
    }

    private List<String> extractPlaceholders(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }

        Matcher matcher = PLACEHOLDER_PATTERN.matcher(value);
        Set<String> found = new LinkedHashSet<>();
        while (matcher.find()) {
            found.add(matcher.group(1));
        }
        return new ArrayList<>(found);
    }

    private String normalizeCode(String rawValue) {
        String normalized = rawValue.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-");
        normalized = normalized.replaceAll("(^-+|-+$)", "");
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("Debes indicar un código de plantilla válido");
        }
        return normalized;
    }

    private String normalizeNullable(String rawValue) {
        if (rawValue == null) {
            return null;
        }

        String trimmed = rawValue.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String normalizeNullableEmail(String rawValue) {
        String normalized = normalizeNullable(rawValue);
        return normalized == null ? null : normalized.toLowerCase(Locale.ROOT);
    }

    private String resolveTextBody(String textBody, String htmlBody) {
        if (textBody != null && !textBody.isBlank()) {
            return textBody;
        }
        return htmlBody
            .replaceAll("<br\\s*/?>", "\n")
            .replaceAll("</p>", "\n\n")
            .replaceAll("<[^>]+>", "")
            .replace("&nbsp;", " ")
            .trim();
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private String requireValue(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }

    private String trimError(String message) {
        if (message == null || message.isBlank()) {
            return "Error SMTP no especificado";
        }
        return message.length() > 500 ? message.substring(0, 500) : message;
    }

    private record PlaceholderDefinition(
        String key,
        String label,
        String description,
        String exampleValue
    ) {
    }

    private record PlaceholderContext(
        Map<String, String> values,
        String tenantId,
        String supportTicketId
    ) {
    }

    private record RenderResult(
        String rendered,
        List<String> unresolvedPlaceholders,
        List<String> usedPlaceholders
    ) {
    }

    private record Recipient(
        String email,
        String name
    ) {
    }

    public record MessagingWorkspaceView(
        EmailSettingsView settings,
        List<PlaceholderView> placeholders,
        List<EmailTemplateSummaryView> templates
    ) {
    }

    public record EmailSettingsView(
        String settingsId,
        PlatformEmailProvider providerCode,
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

    public record PlaceholderView(
        String key,
        String label,
        String description,
        String exampleValue
    ) {
    }

    public record EmailTemplateSummaryView(
        String templateId,
        String code,
        String name,
        EmailTemplateCategory category,
        boolean active,
        java.time.LocalDateTime updatedAt
    ) {
    }

    public record EmailTemplateDetailView(
        String templateId,
        String code,
        String name,
        EmailTemplateCategory category,
        String description,
        String subjectTemplate,
        String htmlTemplate,
        String textTemplate,
        boolean active,
        List<String> placeholderKeys,
        java.time.LocalDateTime updatedAt
    ) {
    }

    public record UpdateSettingsCommand(
        PlatformEmailProvider providerCode,
        String host,
        int port,
        String protocol,
        boolean authRequired,
        boolean starttlsEnabled,
        boolean sslEnabled,
        String username,
        String password,
        String fromName,
        String fromEmail,
        String replyToEmail,
        int connectionTimeoutMs,
        int readTimeoutMs,
        int writeTimeoutMs
    ) {
    }

    public record TestEmailCommand(
        String recipientEmail,
        String recipientName
    ) {
    }

    public record TestEmailResult(
        String recipientEmail,
        String recipientName,
        OffsetDateTime sentAt,
        String status
    ) {
    }

    public interface TemplateMutation {
        String code();

        String name();

        EmailTemplateCategory category();

        String description();

        String subjectTemplate();

        String htmlTemplate();

        String textTemplate();

        boolean active();
    }

    public record CreateTemplateCommand(
        String code,
        String name,
        EmailTemplateCategory category,
        String description,
        String subjectTemplate,
        String htmlTemplate,
        String textTemplate,
        boolean active
    ) implements TemplateMutation {
    }

    public record UpdateTemplateCommand(
        String code,
        String name,
        EmailTemplateCategory category,
        String description,
        String subjectTemplate,
        String htmlTemplate,
        String textTemplate,
        boolean active
    ) implements TemplateMutation {
    }

    public record PreviewTemplateCommand(
        String tenantId,
        String supportTicketId
    ) {
    }

    public record DispatchTemplateCommand(
        String tenantId,
        EmailRecipientMode recipientMode,
        String customRecipientEmail,
        String customRecipientName,
        String supportTicketId
    ) {
    }

    public record RenderedEmailPreviewView(
        String subject,
        String htmlBody,
        String textBody,
        List<String> unresolvedPlaceholders,
        Map<String, String> resolvedPlaceholders,
        String tenantId,
        String supportTicketId
    ) {
    }

    public record EmailDispatchView(
        String templateId,
        String tenantId,
        String recipientEmail,
        String recipientName,
        OffsetDateTime sentAt
    ) {
    }
}
