package com.mixmaster.platform.interfaces.consumerweb.services;

import com.mixmaster.platform.interfaces.consumerweb.exceptions.ConsumerWebException;
import com.mixmaster.platform.modules.menu.publication.models.MenuContentSourceType;
import com.mixmaster.platform.modules.menu.publication.models.MenuVersionStatus;
import com.mixmaster.platform.modules.menu.publication.services.MenuWorkspaceService;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.modules.organization.models.QrCode;
import com.mixmaster.platform.modules.organization.models.QrCodeStatus;
import com.mixmaster.platform.modules.organization.repositories.QrCodeRepository;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Currency;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsumerPublicMenuService {

    private final QrCodeRepository qrCodeRepository;
    private final MenuWorkspaceService menuWorkspaceService;

    public ConsumerPublicMenuService(
        QrCodeRepository qrCodeRepository,
        MenuWorkspaceService menuWorkspaceService
    ) {
        this.qrCodeRepository = qrCodeRepository;
        this.menuWorkspaceService = menuWorkspaceService;
    }

    @Transactional(readOnly = true)
    public PublicQrContextView resolveQrContext(String qrToken) {
        QrCode qrCode = findQrCode(qrToken).orElse(null);
        if (qrCode == null) {
            return new PublicQrContextView(
                qrToken,
                null,
                null,
                "",
                null,
                false,
                "bar"
            );
        }

        Branch branch = qrCode.getBranch();
        boolean valid = qrCode.getStatus() == QrCodeStatus.ACTIVE && branch.isActive();
        return new PublicQrContextView(
            qrCode.getToken(),
            branch.getTenantId(),
            branch.getId(),
            branch.getName(),
            qrCode.getVenueTable() != null ? qrCode.getVenueTable().getLabel() : null,
            valid,
            qrCode.getVenueTable() != null ? "table" : "bar"
        );
    }

    @Transactional(readOnly = true)
    public PublishedMenuView loadPublishedMenu(String qrToken) {
        QrCode qrCode = requireActiveQrCode(qrToken);
        Branch branch = qrCode.getBranch();
        MenuWorkspaceService.MenuWorkspaceView workspace = menuWorkspaceService.loadWorkspace(branch.getTenantId(), branch.getId());
        MenuWorkspaceService.MenuVersionView publishedVersion = workspace.publishedVersion();

        if (publishedVersion == null) {
            throw new ConsumerWebException("La sucursal seleccionada aun no tiene una carta publicada.");
        }

        return new PublishedMenuView(
            workspace.menuId(),
            publishedVersion.versionId(),
            branch.getId(),
            branch.getName(),
            toSections(publishedVersion.items()),
            publishedVersion.publishedAt() != null
                ? publishedVersion.publishedAt().toString()
                : publishedVersion.updatedAt().atOffset(ZoneOffset.UTC).toString(),
            toBranding(workspace, branch, publishedVersion),
            buildHighlights(publishedVersion.sourceType()),
            buildNotes(publishedVersion),
            publishedVersion.sourceType().name(),
            publishedVersion.recommendationMode(),
            publishedVersion.pdfFileName() != null && publishedVersion.pdfSizeBytes() != null && publishedVersion.pdfSizeBytes() > 0
        );
    }

    @Transactional(readOnly = true)
    public MenuWorkspaceService.PdfDocumentView loadPublishedPdf(String qrToken) {
        QrCode qrCode = requireActiveQrCode(qrToken);
        Branch branch = qrCode.getBranch();
        return menuWorkspaceService.loadPdfDocument(branch.getTenantId(), branch.getId(), MenuVersionStatus.PUBLISHED);
    }

    private java.util.Optional<QrCode> findQrCode(String qrToken) {
        if (qrToken == null || qrToken.isBlank()) {
            throw new ConsumerWebException("Se requiere un qrToken valido.");
        }
        return qrCodeRepository.findByTokenAndDeletedAtIsNull(qrToken.trim());
    }

    private QrCode requireActiveQrCode(String qrToken) {
        QrCode qrCode = findQrCode(qrToken)
            .orElseThrow(() -> new ConsumerWebException("El QR solicitado no existe."));

        if (qrCode.getStatus() != QrCodeStatus.ACTIVE) {
            throw new ConsumerWebException("El QR solicitado no esta activo.");
        }
        if (!qrCode.getBranch().isActive()) {
            throw new ConsumerWebException("La sucursal del QR no esta disponible.");
        }
        return qrCode;
    }

    private List<PublishedMenuSectionView> toSections(List<MenuWorkspaceService.MenuCatalogItemCommand> items) {
        Map<String, Map<String, List<MenuWorkspaceService.MenuCatalogItemCommand>>> byCategory = new LinkedHashMap<>();
        for (MenuWorkspaceService.MenuCatalogItemCommand item : items) {
            String category = sanitizeCategory(item.categoryName());
            String productType = normalizePublishedProductType(item.productType());
            byCategory.computeIfAbsent(category, ignored -> new LinkedHashMap<>())
                .computeIfAbsent(productType, ignored -> new ArrayList<>())
                .add(item);
        }

        List<PublishedMenuSectionView> sections = new ArrayList<>();
        int sectionOrder = 1;
        for (Map.Entry<String, Map<String, List<MenuWorkspaceService.MenuCatalogItemCommand>>> categoryEntry : byCategory.entrySet()) {
            List<PublishedMenuSubsectionView> subsections = new ArrayList<>();
            int subsectionOrder = 1;
            int itemCount = 0;

            for (Map.Entry<String, List<MenuWorkspaceService.MenuCatalogItemCommand>> typeEntry : categoryEntry.getValue().entrySet()) {
                List<PublishedMenuItemView> subsectionItems = new ArrayList<>();
                int itemOrder = 1;
                for (MenuWorkspaceService.MenuCatalogItemCommand item : typeEntry.getValue()) {
                    subsectionItems.add(new PublishedMenuItemView(
                        "item-" + sectionOrder + "-" + subsectionOrder + "-" + itemOrder,
                        item.name(),
                        normalizePublishedProductType(item.productType()),
                        item.description() == null ? "" : item.description(),
                        formatPrice(item.price(), item.currencyCode()),
                        null,
                        "available",
                        item.featured() ? "Seleccion destacada del local." : null,
                        item.featured() ? "Destacado en la carta publicada." : null,
                        buildTags(item),
                        List.of()
                    ));
                    itemOrder++;
                }

                itemCount += subsectionItems.size();
                subsections.add(new PublishedMenuSubsectionView(
                    "subsection-" + sectionOrder + "-" + subsectionOrder,
                    productTypeLabel(typeEntry.getKey()),
                    null,
                    null,
                    subsectionOrder,
                    subsectionItems
                ));
                subsectionOrder++;
            }

            sections.add(new PublishedMenuSectionView(
                "section-" + sectionOrder,
                categoryEntry.getKey(),
                null,
                null,
                itemCount,
                sectionOrder,
                subsections
            ));
            sectionOrder++;
        }

        return sections;
    }

    private PublishedMenuBrandingView toBranding(
        MenuWorkspaceService.MenuWorkspaceView workspace,
        Branch branch,
        MenuWorkspaceService.MenuVersionView publishedVersion
    ) {
        String descriptor = publishedVersion.description() != null && !publishedVersion.description().isBlank()
            ? publishedVersion.description()
            : "Carta publicada de " + workspace.brandName() + " para " + branch.getName() + ".";

        String serviceModeLabel = publishedVersion.sourceType() == MenuContentSourceType.PDF
            ? "Carta PDF + catalogo digital de cocteles"
            : "Carta digital estructurada + recomendaciones integradas";

        String ambienceNote = publishedVersion.sourceType() == MenuContentSourceType.PDF
            ? "La carta visual completa vive en PDF; aqui quedan los productos operativos para pedir y recomendar."
            : "La carta fue creada dentro de MixMaster, con productos listos para navegar y recomendar.";

        return new PublishedMenuBrandingView(
            branch.getName(),
            descriptor,
            null,
            null,
            joinNonBlank(branch.getAddressLine1(), branch.getCommune(), branch.getCity()),
            "Publicada y disponible",
            ambienceNote,
            serviceModeLabel,
            List.of(
                workspace.brandName(),
                publishedVersion.sourceType() == MenuContentSourceType.PDF ? "PDF oficial" : "Carta estructurada",
                publishedVersion.recommendationMode() == null ? "MixMaster" : publishedVersion.recommendationMode().replace('_', ' ')
            ),
            List.of()
        );
    }

    private List<PublishedMenuHighlightView> buildHighlights(MenuContentSourceType sourceType) {
        if (sourceType == MenuContentSourceType.PDF) {
            return List.of(
                new PublishedMenuHighlightView(
                    "pdf-source",
                    "Carta oficial en PDF",
                    "El local conserva su carta visual completa y la publica junto al catalogo operativo de MixMaster."
                ),
                new PublishedMenuHighlightView(
                    "catalog-only",
                    "Catalogo para pedir",
                    "En esta pagina solo aparecen los productos cargados para ordenar rapido, favoritos y recomendaciones."
                ),
                new PublishedMenuHighlightView(
                    "catalog-reco",
                    "Motor conectado al catalogo",
                    "Las recomendaciones toman los cocteles y productos digitales vinculados, sin depender del PDF."
                )
            );
        }

        return List.of(
            new PublishedMenuHighlightView(
                "structured-menu",
                "Carta creada en plataforma",
                "Categorias, descripciones, precios y notas fueron construidos dentro de MixMaster."
            ),
            new PublishedMenuHighlightView(
                "structured-reco",
                "Motor integrado a la carta",
                "Las recomendaciones trabajan directo sobre los cocteles y productos publicados por el local."
            ),
            new PublishedMenuHighlightView(
                "branch-publish",
                "Version por sucursal",
                "Cada sucursal mantiene su propia carta publicada y lista para actualizar sin romper la experiencia."
            )
        );
    }

    private List<String> buildNotes(MenuWorkspaceService.MenuVersionView publishedVersion) {
        List<String> notes = new ArrayList<>(publishedVersion.notes() != null ? publishedVersion.notes() : List.of());
        if (publishedVersion.sourceType() == MenuContentSourceType.PDF) {
            notes.add("La carta completa puede abrirse en PDF, mientras este catalogo digital concentra los productos operativos para pedir.");
        } else {
            notes.add("Las recomendaciones pueden tomar la carta estructurada como base directa para priorizar cocteles y categorias.");
        }
        return notes.stream()
            .filter(note -> note != null && !note.isBlank())
            .distinct()
            .toList();
    }

    private List<String> buildTags(MenuWorkspaceService.MenuCatalogItemCommand item) {
        List<String> tags = new ArrayList<>();
        if (item.productType() != null && !item.productType().isBlank()) {
            tags.add(normalizePublishedProductType(item.productType()));
        }
        if (item.featured()) {
            tags.add("destacado");
        }
        return tags;
    }

    private String sanitizeCategory(String value) {
        return value == null || value.isBlank() ? "Carta" : value.trim();
    }

    private String normalizePublishedProductType(String value) {
        if (value == null || value.isBlank()) {
            return "other";
        }

        return switch (value.trim().toLowerCase(Locale.ROOT)) {
            case "cocktail", "mocktail", "wine", "beer", "food", "dessert" -> value.trim().toLowerCase(Locale.ROOT);
            default -> "other";
        };
    }

    private String productTypeLabel(String productType) {
        return switch (productType) {
            case "cocktail" -> "Cocteles";
            case "mocktail" -> "Sin alcohol";
            case "wine" -> "Vinos";
            case "beer" -> "Cervezas";
            case "food" -> "Comida";
            case "dessert" -> "Postres";
            default -> "Otros";
        };
    }

    private String formatPrice(BigDecimal price, String currencyCode) {
        if (price == null) {
            return "";
        }

        String normalizedCurrencyCode = currencyCode == null || currencyCode.isBlank() ? "CLP" : currencyCode.trim().toUpperCase(Locale.ROOT);
        Locale locale = "CLP".equals(normalizedCurrencyCode) ? Locale.forLanguageTag("es-CL") : Locale.US;
        NumberFormat formatter = NumberFormat.getCurrencyInstance(locale);
        formatter.setCurrency(Currency.getInstance(normalizedCurrencyCode));
        return formatter.format(price);
    }

    private String joinNonBlank(String... values) {
        return java.util.Arrays.stream(values)
            .filter(value -> value != null && !value.isBlank())
            .map(String::trim)
            .distinct()
            .reduce((left, right) -> left + ", " + right)
            .orElse(null);
    }

    public record PublicQrContextView(
        String qrToken,
        String tenantId,
        String branchId,
        String branchName,
        String tableLabel,
        boolean valid,
        String venueMode
    ) {
    }

    public record PublishedMenuView(
        String menuId,
        String versionId,
        String branchId,
        String branchName,
        List<PublishedMenuSectionView> sections,
        String updatedAt,
        PublishedMenuBrandingView branding,
        List<PublishedMenuHighlightView> highlights,
        List<String> notes,
        String sourceType,
        String recommendationMode,
        boolean hasPdf
    ) {
    }

    public record PublishedMenuSectionView(
        String id,
        String title,
        String subtitle,
        String description,
        int itemCount,
        Integer displayOrder,
        List<PublishedMenuSubsectionView> subsections
    ) {
    }

    public record PublishedMenuSubsectionView(
        String id,
        String title,
        String subtitle,
        String description,
        Integer displayOrder,
        List<PublishedMenuItemView> items
    ) {
    }

    public record PublishedMenuItemView(
        String id,
        String name,
        String productType,
        String description,
        String priceLabel,
        String imageUrl,
        String availabilityState,
        String preparationNote,
        String featuredReason,
        List<String> tags,
        List<PublishedMenuModifierGroupView> customizationGroups
    ) {
    }

    public record PublishedMenuModifierGroupView(
        String id,
        String title,
        String selectionRule,
        List<PublishedMenuModifierOptionView> options
    ) {
    }

    public record PublishedMenuModifierOptionView(
        String id,
        String label,
        String priceDeltaLabel
    ) {
    }

    public record PublishedMenuBrandingView(
        String venueName,
        String descriptor,
        String logoUrl,
        String heroImageUrl,
        String address,
        String serviceHoursLabel,
        String ambienceNote,
        String serviceModeLabel,
        List<String> heroTags,
        List<PublishedMenuSocialLinkView> socialLinks
    ) {
    }

    public record PublishedMenuSocialLinkView(
        String id,
        String type,
        String label,
        String handle,
        String url
    ) {
    }

    public record PublishedMenuHighlightView(
        String id,
        String title,
        String description
    ) {
    }
}
