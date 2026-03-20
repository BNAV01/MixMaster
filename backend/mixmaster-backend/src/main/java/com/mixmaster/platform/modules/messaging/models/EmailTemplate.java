package com.mixmaster.platform.modules.messaging.models;

import com.mixmaster.platform.shared.models.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "platform_email_templates",
    indexes = {
        @Index(name = "idx_platform_email_templates_category", columnList = "category"),
        @Index(name = "idx_platform_email_templates_updated_at", columnList = "updated_at")
    }
)
public class EmailTemplate extends BaseEntity {

    @Column(name = "code", nullable = false, length = 80, unique = true)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 40)
    private EmailTemplateCategory category;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "subject_template", nullable = false, length = 500)
    private String subjectTemplate;

    @Column(name = "html_template", nullable = false, columnDefinition = "LONGTEXT")
    private String htmlTemplate;

    @Column(name = "text_template", columnDefinition = "LONGTEXT")
    private String textTemplate;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "created_by_user_id", length = 26)
    private String createdByUserId;

    @Column(name = "updated_by_user_id", length = 26)
    private String updatedByUserId;
}
