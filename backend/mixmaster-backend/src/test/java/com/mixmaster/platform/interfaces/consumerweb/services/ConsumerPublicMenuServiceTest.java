package com.mixmaster.platform.interfaces.consumerweb.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.mixmaster.platform.modules.menu.publication.models.MenuContentSourceType;
import com.mixmaster.platform.modules.menu.publication.models.MenuVersionStatus;
import com.mixmaster.platform.modules.menu.publication.services.MenuWorkspaceService;
import com.mixmaster.platform.modules.organization.models.Brand;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.modules.organization.models.QrCode;
import com.mixmaster.platform.modules.organization.models.QrCodeStatus;
import com.mixmaster.platform.modules.organization.models.VenueTable;
import com.mixmaster.platform.modules.organization.repositories.QrCodeRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ConsumerPublicMenuServiceTest {

    @Mock
    private QrCodeRepository qrCodeRepository;

    @Mock
    private MenuWorkspaceService menuWorkspaceService;

    @InjectMocks
    private ConsumerPublicMenuService consumerPublicMenuService;

    @Test
    void resolveQrContextReturnsRealBranchAndTableData() {
        QrCode qrCode = activeQrCode();
        when(qrCodeRepository.findByTokenAndDeletedAtIsNull("qr-live-001")).thenReturn(Optional.of(qrCode));

        ConsumerPublicMenuService.PublicQrContextView context = consumerPublicMenuService.resolveQrContext("qr-live-001");

        assertThat(context.valid()).isTrue();
        assertThat(context.branchId()).isEqualTo("branch-001");
        assertThat(context.branchName()).isEqualTo("Casa Matriz");
        assertThat(context.tableLabel()).isEqualTo("Mesa 7");
        assertThat(context.venueMode()).isEqualTo("table");
    }

    @Test
    void loadPublishedMenuBuildsCatalogOnlyViewForPdfSource() {
        QrCode qrCode = activeQrCode();
        when(qrCodeRepository.findByTokenAndDeletedAtIsNull("qr-live-001")).thenReturn(Optional.of(qrCode));
        when(menuWorkspaceService.loadWorkspace("tenant-001", "branch-001")).thenReturn(new MenuWorkspaceService.MenuWorkspaceView(
            "menu-001",
            "branch-001",
            "Casa Matriz",
            "brand-001",
            "Bar Metal",
            null,
            new MenuWorkspaceService.MenuVersionView(
                "version-001",
                "Carta noche",
                3,
                MenuVersionStatus.PUBLISHED,
                MenuContentSourceType.PDF,
                "CATALOG_ONLY",
                "Carta oficial en PDF con catalogo de cocteles para pedir.",
                List.of("PDF visible para el cliente."),
                List.of(
                    new MenuWorkspaceService.MenuCatalogItemCommand(
                        "Cocteles de autor",
                        "Garden Spritz",
                        "Ligero y citrico.",
                        new BigDecimal("8900"),
                        "CLP",
                        "cocktail",
                        true
                    ),
                    new MenuWorkspaceService.MenuCatalogItemCommand(
                        "Cocteles de autor",
                        "Midnight Negroni",
                        "Amargo y profundo.",
                        new BigDecimal("10200"),
                        "CLP",
                        "cocktail",
                        false
                    )
                ),
                "carta.pdf",
                "application/pdf",
                2048L,
                OffsetDateTime.parse("2026-03-21T18:00:00Z"),
                LocalDateTime.of(2026, 3, 21, 15, 0)
            )
        ));

        ConsumerPublicMenuService.PublishedMenuView publishedMenu = consumerPublicMenuService.loadPublishedMenu("qr-live-001");

        assertThat(publishedMenu.sourceType()).isEqualTo("PDF");
        assertThat(publishedMenu.recommendationMode()).isEqualTo("CATALOG_ONLY");
        assertThat(publishedMenu.hasPdf()).isTrue();
        assertThat(publishedMenu.sections()).hasSize(1);
        assertThat(publishedMenu.sections().getFirst().subsections()).hasSize(1);
        assertThat(publishedMenu.sections().getFirst().subsections().getFirst().items()).hasSize(2);
        assertThat(publishedMenu.highlights()).extracting(ConsumerPublicMenuService.PublishedMenuHighlightView::id)
            .contains("pdf-source", "catalog-only", "catalog-reco");
    }

    private QrCode activeQrCode() {
        Brand brand = new Brand();
        brand.setId("brand-001");
        brand.setName("Bar Metal");

        Branch branch = new Branch();
        branch.setId("branch-001");
        branch.setTenantId("tenant-001");
        branch.setBrand(brand);
        branch.setName("Casa Matriz");
        branch.setAddressLine1("Providencia 123");
        branch.setCommune("Providencia");
        branch.setCity("Santiago");
        branch.setActive(true);

        VenueTable venueTable = new VenueTable();
        venueTable.setId("table-001");
        venueTable.setLabel("Mesa 7");
        venueTable.setBranch(branch);

        QrCode qrCode = new QrCode();
        qrCode.setId("qr-001");
        qrCode.setTenantId("tenant-001");
        qrCode.setBranch(branch);
        qrCode.setVenueTable(venueTable);
        qrCode.setToken("qr-live-001");
        qrCode.setStatus(QrCodeStatus.ACTIVE);
        return qrCode;
    }
}
