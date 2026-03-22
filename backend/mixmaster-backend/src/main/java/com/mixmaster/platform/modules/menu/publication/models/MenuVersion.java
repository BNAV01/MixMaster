package com.mixmaster.platform.modules.menu.publication.models;

import com.mixmaster.platform.shared.models.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "menu_versions",
    indexes = {
        @Index(name = "idx_menu_versions_menu_status", columnList = "menu_id,status"),
        @Index(name = "idx_menu_versions_published_at", columnList = "published_at")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_menu_versions_menu_version", columnNames = {"menu_id", "version_number"})
    }
)
public class MenuVersion extends TenantScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;

    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private MenuVersionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 40)
    private MenuContentSourceType sourceType = MenuContentSourceType.STRUCTURED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_menu_version_id")
    private MenuVersion baseMenuVersion;

    @Lob
    @Column(name = "definition_json", columnDefinition = "LONGTEXT")
    private String definitionJson;

    @Column(name = "pdf_file_name", length = 255)
    private String pdfFileName;

    @Column(name = "pdf_content_type", length = 120)
    private String pdfContentType;

    @Column(name = "pdf_size_bytes")
    private Long pdfSizeBytes;

    @Lob
    @Column(name = "pdf_bytes", columnDefinition = "LONGBLOB")
    private byte[] pdfBytes;

    @Column(name = "checksum", length = 128)
    private String checksum;

    @Column(name = "change_summary", length = 500)
    private String changeSummary;

    @Column(name = "created_by", length = 160)
    private String createdBy;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rollback_of_version_id")
    private MenuVersion rollbackOfVersion;
}
