package com.mixmaster.platform.interfaces.consumerweb.controllers;

import com.mixmaster.platform.interfaces.consumerweb.security.ConsumerWebApiPaths;
import com.mixmaster.platform.interfaces.consumerweb.services.ConsumerPublicMenuService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ConsumerWebApiPaths.PUBLIC_BASE_PATH)
public class ConsumerPublicMenuController {

    private final ConsumerPublicMenuService consumerPublicMenuService;

    public ConsumerPublicMenuController(ConsumerPublicMenuService consumerPublicMenuService) {
        this.consumerPublicMenuService = consumerPublicMenuService;
    }

    @GetMapping("/q/{qrToken}")
    public ConsumerPublicMenuService.PublicQrContextView qrContext(@PathVariable String qrToken) {
        return consumerPublicMenuService.resolveQrContext(qrToken);
    }

    @GetMapping("/menus/published")
    public ConsumerPublicMenuService.PublishedMenuView publishedMenu(@RequestParam String qrToken) {
        return consumerPublicMenuService.loadPublishedMenu(qrToken);
    }

    @GetMapping("/menus/published/pdf")
    public ResponseEntity<ByteArrayResource> publishedMenuPdf(@RequestParam String qrToken) {
        PdfDocumentView pdfDocument = toPdfDocumentView(
            consumerPublicMenuService.loadPublishedPdf(qrToken)
        );
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + pdfDocument.fileName() + "\"")
            .contentType(MediaType.parseMediaType(pdfDocument.contentType()))
            .body(new ByteArrayResource(pdfDocument.bytes()));
    }

    private PdfDocumentView toPdfDocumentView(com.mixmaster.platform.modules.menu.publication.services.MenuWorkspaceService.PdfDocumentView pdfDocumentView) {
        return new PdfDocumentView(
            pdfDocumentView.fileName(),
            pdfDocumentView.contentType(),
            pdfDocumentView.bytes()
        );
    }

    private record PdfDocumentView(
        String fileName,
        String contentType,
        byte[] bytes
    ) {
    }
}
