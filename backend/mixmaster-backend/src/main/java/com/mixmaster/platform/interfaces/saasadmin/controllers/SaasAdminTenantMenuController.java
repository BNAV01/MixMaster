package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.modules.menu.publication.models.MenuContentSourceType;
import com.mixmaster.platform.modules.menu.publication.models.MenuVersionStatus;
import com.mixmaster.platform.modules.menu.publication.services.MenuWorkspaceService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SaasAdminApiPaths.ROOT)
public class SaasAdminTenantMenuController {

    private final ActorPermissionService actorPermissionService;
    private final MenuWorkspaceService menuWorkspaceService;

    public SaasAdminTenantMenuController(
        ActorPermissionService actorPermissionService,
        MenuWorkspaceService menuWorkspaceService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.menuWorkspaceService = menuWorkspaceService;
    }

    @GetMapping("/tenants/{tenantId}/menu/workspace")
    public PlatformTenantMenuWorkspaceResponse workspace(
        @PathVariable String tenantId,
        @RequestParam String branchId
    ) {
        actorPermissionService.requirePlatformPermission("platform.tenants.read");
        return toResponse(menuWorkspaceService.loadWorkspace(tenantId, branchId));
    }

    @PatchMapping("/tenants/{tenantId}/menu/workspace")
    public PlatformTenantMenuWorkspaceResponse saveWorkspace(
        @PathVariable String tenantId,
        @Valid @RequestBody SavePlatformTenantMenuWorkspaceRequest request
    ) {
        var actor = actorPermissionService.requirePlatformPermission("platform.tenants.write");
        return toResponse(menuWorkspaceService.saveDraft(
            tenantId,
            actor.displayName(),
            new MenuWorkspaceService.SaveMenuWorkspaceCommand(
                request.branchId(),
                request.menuName(),
                request.menuDescription(),
                request.sourceType(),
                request.notes(),
                request.items().stream()
                    .map(item -> new MenuWorkspaceService.MenuCatalogItemCommand(
                        item.categoryName(),
                        item.name(),
                        item.description(),
                        item.price(),
                        item.currencyCode(),
                        item.productType(),
                        item.featured()
                    ))
                    .toList(),
                request.pdfUpload() == null
                    ? null
                    : new MenuWorkspaceService.PdfUploadCommand(
                        request.pdfUpload().fileName(),
                        request.pdfUpload().contentType(),
                        request.pdfUpload().base64()
                    )
            )
        ));
    }

    @PostMapping("/tenants/{tenantId}/menu/workspace/publish")
    public PlatformTenantMenuWorkspaceResponse publishWorkspace(
        @PathVariable String tenantId,
        @RequestParam String branchId
    ) {
        actorPermissionService.requirePlatformPermission("platform.tenants.write");
        return toResponse(menuWorkspaceService.publishDraft(tenantId, branchId));
    }

    @GetMapping("/tenants/{tenantId}/menu/workspace/pdf")
    public ResponseEntity<ByteArrayResource> pdf(
        @PathVariable String tenantId,
        @RequestParam String branchId,
        @RequestParam(defaultValue = "DRAFT") MenuVersionStatus versionStatus
    ) {
        actorPermissionService.requirePlatformPermission("platform.tenants.read");
        MenuWorkspaceService.PdfDocumentView pdfDocument = menuWorkspaceService.loadPdfDocument(tenantId, branchId, versionStatus);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + pdfDocument.fileName() + "\"")
            .contentType(MediaType.parseMediaType(pdfDocument.contentType()))
            .body(new ByteArrayResource(pdfDocument.bytes()));
    }

    private PlatformTenantMenuWorkspaceResponse toResponse(MenuWorkspaceService.MenuWorkspaceView workspaceView) {
        return new PlatformTenantMenuWorkspaceResponse(
            workspaceView.menuId(),
            workspaceView.branchId(),
            workspaceView.branchName(),
            workspaceView.brandId(),
            workspaceView.brandName(),
            toVersionResponse(workspaceView.draftVersion()),
            toVersionResponse(workspaceView.publishedVersion())
        );
    }

    private PlatformTenantMenuVersionResponse toVersionResponse(MenuWorkspaceService.MenuVersionView versionView) {
        if (versionView == null) {
            return null;
        }

        return new PlatformTenantMenuVersionResponse(
            versionView.versionId(),
            versionView.menuName(),
            versionView.versionNumber(),
            versionView.status().name(),
            versionView.sourceType().name(),
            versionView.recommendationMode(),
            versionView.description(),
            versionView.notes(),
            versionView.items().stream()
                .map(item -> new PlatformTenantMenuItemResponse(
                    item.categoryName(),
                    item.name(),
                    item.description(),
                    item.price(),
                    item.currencyCode(),
                    item.productType(),
                    item.featured()
                ))
                .toList(),
            versionView.pdfFileName(),
            versionView.pdfContentType(),
            versionView.pdfSizeBytes(),
            versionView.publishedAt(),
            versionView.updatedAt()
        );
    }
}

record PlatformTenantMenuWorkspaceResponse(
    String menuId,
    String branchId,
    String branchName,
    String brandId,
    String brandName,
    PlatformTenantMenuVersionResponse draftVersion,
    PlatformTenantMenuVersionResponse publishedVersion
) {
}

record PlatformTenantMenuVersionResponse(
    String versionId,
    String menuName,
    int versionNumber,
    String status,
    String sourceType,
    String recommendationMode,
    String description,
    List<String> notes,
    List<PlatformTenantMenuItemResponse> items,
    String pdfFileName,
    String pdfContentType,
    Long pdfSizeBytes,
    java.time.OffsetDateTime publishedAt,
    java.time.LocalDateTime updatedAt
) {
}

record PlatformTenantMenuItemResponse(
    String categoryName,
    String name,
    String description,
    BigDecimal price,
    String currencyCode,
    String productType,
    boolean featured
) {
}

record SavePlatformTenantMenuWorkspaceRequest(
    @NotBlank String branchId,
    @NotBlank String menuName,
    String menuDescription,
    @NotNull MenuContentSourceType sourceType,
    List<String> notes,
    @NotEmpty List<@Valid SavePlatformTenantMenuItemRequest> items,
    @Valid SavePlatformTenantMenuPdfUploadRequest pdfUpload
) {
}

record SavePlatformTenantMenuItemRequest(
    @NotBlank String categoryName,
    @NotBlank String name,
    String description,
    @NotNull BigDecimal price,
    @NotBlank String currencyCode,
    @NotBlank String productType,
    boolean featured
) {
}

record SavePlatformTenantMenuPdfUploadRequest(
    @NotBlank String fileName,
    @NotBlank String contentType,
    @NotBlank String base64
) {
}
