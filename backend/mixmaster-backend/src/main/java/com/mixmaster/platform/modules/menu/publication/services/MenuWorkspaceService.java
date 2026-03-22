package com.mixmaster.platform.modules.menu.publication.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mixmaster.platform.modules.menu.publication.models.Menu;
import com.mixmaster.platform.modules.menu.publication.models.MenuContentSourceType;
import com.mixmaster.platform.modules.menu.publication.models.MenuScopeType;
import com.mixmaster.platform.modules.menu.publication.models.MenuStatus;
import com.mixmaster.platform.modules.menu.publication.models.MenuVersion;
import com.mixmaster.platform.modules.menu.publication.models.MenuVersionStatus;
import com.mixmaster.platform.modules.menu.publication.repositories.MenuRepository;
import com.mixmaster.platform.modules.menu.publication.repositories.MenuVersionRepository;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.modules.organization.repositories.BranchRepository;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MenuWorkspaceService {

    private final BranchRepository branchRepository;
    private final MenuRepository menuRepository;
    private final MenuVersionRepository menuVersionRepository;
    private final ObjectMapper objectMapper;

    public MenuWorkspaceService(
        BranchRepository branchRepository,
        MenuRepository menuRepository,
        MenuVersionRepository menuVersionRepository,
        ObjectMapper objectMapper
    ) {
        this.branchRepository = branchRepository;
        this.menuRepository = menuRepository;
        this.menuVersionRepository = menuVersionRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public MenuWorkspaceView loadWorkspace(String tenantId, String branchId) {
        Branch branch = requireBranch(tenantId, branchId);
        Menu menu = menuRepository.findTopByTenantIdAndScopeBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(tenantId, branchId)
            .orElse(null);

        if (menu == null) {
            return new MenuWorkspaceView(
                null,
                branch.getId(),
                branch.getName(),
                branch.getBrand().getId(),
                branch.getBrand().getName(),
                null,
                null
            );
        }

        MenuVersion draftVersion = menuVersionRepository.findTopByMenu_IdAndStatusOrderByVersionNumberDesc(
            menu.getId(),
            MenuVersionStatus.DRAFT
        ).orElse(null);
        MenuVersion publishedVersion = menuVersionRepository.findTopByMenu_IdAndStatusOrderByVersionNumberDesc(
            menu.getId(),
            MenuVersionStatus.PUBLISHED
        ).orElse(null);

        return new MenuWorkspaceView(
            menu.getId(),
            branch.getId(),
            branch.getName(),
            branch.getBrand().getId(),
            branch.getBrand().getName(),
            toVersionView(menu, draftVersion),
            toVersionView(menu, publishedVersion)
        );
    }

    @Transactional
    public MenuWorkspaceView saveDraft(String tenantId, String actorLabel, SaveMenuWorkspaceCommand command) {
        Branch branch = requireBranch(tenantId, command.branchId());

        Menu menu = menuRepository.findTopByTenantIdAndScopeBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(tenantId, branch.getId())
            .orElseGet(() -> newMenu(tenantId, branch, command.menuName()));

        menu.setName(command.menuName().trim());
        menu.setCode(slugify(command.menuName(), branch.getCode().toLowerCase(Locale.ROOT)));
        menuRepository.save(menu);

        List<MenuVersion> versions = menuVersionRepository.findAllByMenu_IdOrderByVersionNumberDesc(menu.getId());
        MenuVersion draftVersion = versions.stream()
            .filter(version -> version.getStatus() == MenuVersionStatus.DRAFT)
            .findFirst()
            .orElse(null);

        validateCommand(command, draftVersion);

        if (draftVersion == null) {
            draftVersion = new MenuVersion();
            draftVersion.setTenantId(tenantId);
            draftVersion.setMenu(menu);
            draftVersion.setVersionNumber(versions.isEmpty() ? 1 : versions.getFirst().getVersionNumber() + 1);
            draftVersion.setStatus(MenuVersionStatus.DRAFT);
        }

        draftVersion.setSourceType(command.sourceType());
        draftVersion.setDefinitionJson(serializeDefinition(new MenuDefinition(
            command.menuDescription(),
            command.notes(),
            command.items()
        )));
        draftVersion.setChangeSummary(command.menuDescription());
        draftVersion.setCreatedBy(actorLabel);

        if (command.sourceType() == MenuContentSourceType.PDF) {
            applyPdfPayload(draftVersion, command.pdfUpload());
        } else {
            draftVersion.setPdfFileName(null);
            draftVersion.setPdfContentType(null);
            draftVersion.setPdfSizeBytes(null);
            draftVersion.setPdfBytes(null);
        }

        menuVersionRepository.save(draftVersion);
        return loadWorkspace(tenantId, branch.getId());
    }

    @Transactional
    public MenuWorkspaceView publishDraft(String tenantId, String branchId) {
        Menu menu = menuRepository.findTopByTenantIdAndScopeBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(tenantId, branchId)
            .orElseThrow(() -> new IllegalArgumentException("No menu workspace exists for the selected branch"));

        MenuVersion draftVersion = menuVersionRepository.findTopByMenu_IdAndStatusOrderByVersionNumberDesc(
            menu.getId(),
            MenuVersionStatus.DRAFT
        ).orElseThrow(() -> new IllegalArgumentException("No draft version is available to publish"));

        List<MenuVersion> versions = menuVersionRepository.findAllByMenu_IdOrderByVersionNumberDesc(menu.getId());
        for (MenuVersion version : versions) {
            if (version.getStatus() == MenuVersionStatus.PUBLISHED) {
                version.setStatus(MenuVersionStatus.ARCHIVED);
                menuVersionRepository.save(version);
            }
        }

        draftVersion.setStatus(MenuVersionStatus.PUBLISHED);
        draftVersion.setPublishedAt(OffsetDateTime.now());
        menuVersionRepository.save(draftVersion);

        menu.setStatus(MenuStatus.ACTIVE);
        menuRepository.save(menu);

        return loadWorkspace(tenantId, branchId);
    }

    @Transactional(readOnly = true)
    public PdfDocumentView loadPdfDocument(String tenantId, String branchId, MenuVersionStatus versionStatus) {
        Menu menu = menuRepository.findTopByTenantIdAndScopeBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(tenantId, branchId)
            .orElseThrow(() -> new IllegalArgumentException("No menu workspace exists for the selected branch"));
        MenuVersion version = menuVersionRepository.findTopByMenu_IdAndStatusOrderByVersionNumberDesc(menu.getId(), versionStatus)
            .orElseThrow(() -> new IllegalArgumentException("No PDF document is available for the requested version"));

        if (version.getSourceType() != MenuContentSourceType.PDF || version.getPdfBytes() == null || version.getPdfBytes().length == 0) {
            throw new IllegalArgumentException("The requested menu version does not contain a PDF upload");
        }

        return new PdfDocumentView(
            version.getPdfFileName(),
            version.getPdfContentType(),
            version.getPdfBytes()
        );
    }

    private Menu newMenu(String tenantId, Branch branch, String menuName) {
        Menu menu = new Menu();
        menu.setTenantId(tenantId);
        menu.setBrand(branch.getBrand());
        menu.setScopeBranch(branch);
        menu.setScopeType(MenuScopeType.BRANCH);
        menu.setStatus(MenuStatus.INACTIVE);
        menu.setName(menuName.trim());
        menu.setCode(slugify(menuName, branch.getCode().toLowerCase(Locale.ROOT)));
        return menu;
    }

    private void validateCommand(SaveMenuWorkspaceCommand command, MenuVersion currentDraftVersion) {
        if (command.menuName() == null || command.menuName().isBlank()) {
            throw new IllegalArgumentException("Menu name is required");
        }
        if (command.items() == null || command.items().isEmpty()) {
            throw new IllegalArgumentException("At least one catalog item is required");
        }
        boolean hasExistingPdf = currentDraftVersion != null
            && currentDraftVersion.getPdfBytes() != null
            && currentDraftVersion.getPdfBytes().length > 0;
        if (command.sourceType() == MenuContentSourceType.PDF && command.pdfUpload() == null && !hasExistingPdf) {
            throw new IllegalArgumentException("PDF menus require an uploaded PDF document");
        }
    }

    private void applyPdfPayload(MenuVersion draftVersion, PdfUploadCommand uploadCommand) {
        if (uploadCommand == null) {
            return;
        }
        byte[] pdfBytes = Base64.getDecoder().decode(uploadCommand.base64().trim());
        if (pdfBytes.length == 0) {
            throw new IllegalArgumentException("Uploaded PDF is empty");
        }

        draftVersion.setPdfFileName(uploadCommand.fileName());
        draftVersion.setPdfContentType(uploadCommand.contentType());
        draftVersion.setPdfSizeBytes((long) pdfBytes.length);
        draftVersion.setPdfBytes(pdfBytes);
    }

    private Branch requireBranch(String tenantId, String branchId) {
        return branchRepository.findByIdAndTenantIdAndDeletedAtIsNull(branchId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Branch " + branchId + " was not found"));
    }

    private String serializeDefinition(MenuDefinition definition) {
        try {
            return objectMapper.writeValueAsString(definition);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Menu definition could not be serialized", exception);
        }
    }

    private MenuDefinition deserializeDefinition(String definitionJson) {
        if (definitionJson == null || definitionJson.isBlank()) {
            return new MenuDefinition(null, List.of(), List.of());
        }

        try {
            return objectMapper.readValue(definitionJson, MenuDefinition.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Menu definition could not be parsed", exception);
        }
    }

    private MenuVersionView toVersionView(Menu menu, MenuVersion version) {
        if (version == null) {
            return null;
        }

        MenuDefinition definition = deserializeDefinition(version.getDefinitionJson());
        return new MenuVersionView(
            version.getId(),
            menu.getName(),
            version.getVersionNumber(),
            version.getStatus(),
            version.getSourceType(),
            version.getSourceType() == MenuContentSourceType.PDF ? "CATALOG_ONLY" : "INTEGRATED",
            definition.description(),
            definition.notes(),
            definition.items(),
            version.getPdfFileName(),
            version.getPdfContentType(),
            version.getPdfSizeBytes(),
            version.getPublishedAt(),
            version.getUpdatedAt()
        );
    }

    private String slugify(String value, String fallback) {
        String normalized = value == null
            ? ""
            : value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? fallback : normalized;
    }

    public record MenuWorkspaceView(
        String menuId,
        String branchId,
        String branchName,
        String brandId,
        String brandName,
        MenuVersionView draftVersion,
        MenuVersionView publishedVersion
    ) {
    }

    public record MenuVersionView(
        String versionId,
        String menuName,
        int versionNumber,
        MenuVersionStatus status,
        MenuContentSourceType sourceType,
        String recommendationMode,
        String description,
        List<String> notes,
        List<MenuCatalogItemCommand> items,
        String pdfFileName,
        String pdfContentType,
        Long pdfSizeBytes,
        OffsetDateTime publishedAt,
        java.time.LocalDateTime updatedAt
    ) {
    }

    public record SaveMenuWorkspaceCommand(
        String branchId,
        String menuName,
        String menuDescription,
        MenuContentSourceType sourceType,
        List<String> notes,
        List<MenuCatalogItemCommand> items,
        PdfUploadCommand pdfUpload
    ) {
    }

    public record PdfUploadCommand(
        String fileName,
        String contentType,
        String base64
    ) {
    }

    public record MenuCatalogItemCommand(
        String categoryName,
        String name,
        String description,
        java.math.BigDecimal price,
        String currencyCode,
        String productType,
        boolean featured
    ) {
    }

    public record MenuDefinition(
        String description,
        List<String> notes,
        List<MenuCatalogItemCommand> items
    ) {
    }

    public record PdfDocumentView(
        String fileName,
        String contentType,
        byte[] bytes
    ) {
    }
}
