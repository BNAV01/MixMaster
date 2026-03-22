package com.mixmaster.platform.interfaces.tenantconsole.controllers;

import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.modules.menu.publication.models.MenuContentSourceType;
import com.mixmaster.platform.modules.menu.publication.models.MenuVersionStatus;
import com.mixmaster.platform.modules.menu.publication.services.MenuWorkspaceService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import com.mixmaster.platform.shared.security.AuthenticatedActor;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(TenantConsoleApiPaths.ROOT)
public class TenantConsoleMenuController {

    private final ActorPermissionService actorPermissionService;
    private final MenuWorkspaceService menuWorkspaceService;

    public TenantConsoleMenuController(
        ActorPermissionService actorPermissionService,
        MenuWorkspaceService menuWorkspaceService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.menuWorkspaceService = menuWorkspaceService;
    }

    @GetMapping("/menu/workspace")
    public TenantMenuWorkspaceResponse workspace(@RequestParam(required = false) String branchId) {
        AuthenticatedActor actor = actorPermissionService.requireTenantAnyPermission("tenant.menu.read", "tenant.menu.write");
        String resolvedBranchId = resolveBranchId(actor, branchId);
        actorPermissionService.requireBranchAccess(actor, resolvedBranchId);
        return toResponse(menuWorkspaceService.loadWorkspace(actor.tenantId(), resolvedBranchId));
    }

    @PatchMapping("/menu/workspace")
    public TenantMenuWorkspaceResponse saveWorkspace(@Valid @RequestBody SaveTenantMenuWorkspaceRequest request) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.menu.write");
        String resolvedBranchId = resolveBranchId(actor, request.branchId());
        actorPermissionService.requireBranchAccess(actor, resolvedBranchId);
        return toResponse(menuWorkspaceService.saveDraft(
            actor.tenantId(),
            actor.displayName(),
            new MenuWorkspaceService.SaveMenuWorkspaceCommand(
                resolvedBranchId,
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

    @PostMapping("/menu/workspace/publish")
    public TenantMenuWorkspaceResponse publishWorkspace(@RequestParam(required = false) String branchId) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.menu.publish");
        String resolvedBranchId = resolveBranchId(actor, branchId);
        actorPermissionService.requireBranchAccess(actor, resolvedBranchId);
        return toResponse(menuWorkspaceService.publishDraft(actor.tenantId(), resolvedBranchId));
    }

    @GetMapping("/menu/workspace/pdf")
    public ResponseEntity<ByteArrayResource> pdf(
        @RequestParam(required = false) String branchId,
        @RequestParam(defaultValue = "DRAFT") MenuVersionStatus versionStatus
    ) {
        AuthenticatedActor actor = actorPermissionService.requireTenantAnyPermission("tenant.menu.read", "tenant.menu.write");
        String resolvedBranchId = resolveBranchId(actor, branchId);
        actorPermissionService.requireBranchAccess(actor, resolvedBranchId);
        MenuWorkspaceService.PdfDocumentView pdfDocument = menuWorkspaceService.loadPdfDocument(actor.tenantId(), resolvedBranchId, versionStatus);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + pdfDocument.fileName() + "\"")
            .contentType(MediaType.parseMediaType(pdfDocument.contentType()))
            .body(new ByteArrayResource(pdfDocument.bytes()));
    }

    private String resolveBranchId(AuthenticatedActor actor, String branchId) {
        String resolvedBranchId = branchId != null && !branchId.isBlank() ? branchId : actor.activeBranchId();
        if (resolvedBranchId == null || resolvedBranchId.isBlank()) {
            throw new IllegalArgumentException("A branch context is required to manage the menu workspace");
        }
        return resolvedBranchId;
    }

    private TenantMenuWorkspaceResponse toResponse(MenuWorkspaceService.MenuWorkspaceView workspaceView) {
        return new TenantMenuWorkspaceResponse(
            workspaceView.menuId(),
            workspaceView.branchId(),
            workspaceView.branchName(),
            workspaceView.brandId(),
            workspaceView.brandName(),
            toVersionResponse(workspaceView.draftVersion()),
            toVersionResponse(workspaceView.publishedVersion())
        );
    }

    private TenantMenuVersionResponse toVersionResponse(MenuWorkspaceService.MenuVersionView versionView) {
        if (versionView == null) {
            return null;
        }

        return new TenantMenuVersionResponse(
            versionView.versionId(),
            versionView.menuName(),
            versionView.versionNumber(),
            versionView.status().name(),
            versionView.sourceType().name(),
            versionView.recommendationMode(),
            versionView.description(),
            versionView.notes(),
            versionView.items().stream()
                .map(item -> new TenantMenuItemResponse(
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

record TenantMenuWorkspaceResponse(
    String menuId,
    String branchId,
    String branchName,
    String brandId,
    String brandName,
    TenantMenuVersionResponse draftVersion,
    TenantMenuVersionResponse publishedVersion
) {
}

record TenantMenuVersionResponse(
    String versionId,
    String menuName,
    int versionNumber,
    String status,
    String sourceType,
    String recommendationMode,
    String description,
    List<String> notes,
    List<TenantMenuItemResponse> items,
    String pdfFileName,
    String pdfContentType,
    Long pdfSizeBytes,
    java.time.OffsetDateTime publishedAt,
    java.time.LocalDateTime updatedAt
) {
}

record TenantMenuItemResponse(
    String categoryName,
    String name,
    String description,
    BigDecimal price,
    String currencyCode,
    String productType,
    boolean featured
) {
}

record SaveTenantMenuWorkspaceRequest(
    String branchId,
    @NotBlank String menuName,
    String menuDescription,
    @NotNull MenuContentSourceType sourceType,
    List<String> notes,
    @NotEmpty List<@Valid SaveTenantMenuItemRequest> items,
    @Valid SaveTenantMenuPdfUploadRequest pdfUpload
) {
}

record SaveTenantMenuItemRequest(
    @NotBlank String categoryName,
    @NotBlank String name,
    String description,
    @NotNull BigDecimal price,
    @NotBlank String currencyCode,
    @NotBlank String productType,
    boolean featured
) {
}

record SaveTenantMenuPdfUploadRequest(
    @NotBlank String fileName,
    @NotBlank String contentType,
    @NotBlank String base64
) {
}
