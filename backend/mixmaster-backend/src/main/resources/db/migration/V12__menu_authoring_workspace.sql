ALTER TABLE menu_versions
    ADD COLUMN source_type VARCHAR(40) NOT NULL DEFAULT 'STRUCTURED' AFTER status,
    ADD COLUMN definition_json LONGTEXT NULL AFTER source_type,
    ADD COLUMN pdf_file_name VARCHAR(255) NULL AFTER definition_json,
    ADD COLUMN pdf_content_type VARCHAR(120) NULL AFTER pdf_file_name,
    ADD COLUMN pdf_size_bytes BIGINT NULL AFTER pdf_content_type,
    ADD COLUMN pdf_bytes LONGBLOB NULL AFTER pdf_size_bytes;

CREATE INDEX idx_menu_versions_source_type ON menu_versions (source_type);
