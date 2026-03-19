ALTER TABLE product_categories
    ADD COLUMN deleted_at DATETIME(6) NULL AFTER updated_at;

CREATE INDEX idx_product_categories_tenant_active ON product_categories (tenant_id, is_active);

CREATE TABLE product_subcategories (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    category_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(120) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    CONSTRAINT fk_product_subcategories_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_product_subcategories_category FOREIGN KEY (category_id) REFERENCES product_categories (id),
    UNIQUE KEY uk_product_subcategories_tenant_category_code (tenant_id, category_id, code)
);

CREATE INDEX idx_product_subcategories_category ON product_subcategories (category_id);
CREATE INDEX idx_product_subcategories_tenant_active ON product_subcategories (tenant_id, is_active);

ALTER TABLE products
    DROP FOREIGN KEY fk_products_branch;

ALTER TABLE products
    CHANGE COLUMN branch_id scope_branch_id CHAR(26) NULL,
    ADD COLUMN subcategory_id CHAR(26) NULL AFTER category_id,
    ADD COLUMN scope_type VARCHAR(40) NOT NULL DEFAULT 'BRAND' AFTER subcategory_id,
    ADD COLUMN slug VARCHAR(180) NULL AFTER name,
    ADD COLUMN image_url VARCHAR(512) NULL AFTER currency_code,
    ADD COLUMN deleted_at DATETIME(6) NULL AFTER updated_at,
    ADD CONSTRAINT fk_products_scope_branch FOREIGN KEY (scope_branch_id) REFERENCES branches (id),
    ADD CONSTRAINT fk_products_subcategory FOREIGN KEY (subcategory_id) REFERENCES product_subcategories (id);

UPDATE products
SET slug = LOWER(REPLACE(code, ' ', '-'))
WHERE slug IS NULL;

ALTER TABLE products
    MODIFY COLUMN slug VARCHAR(180) NOT NULL;

CREATE UNIQUE INDEX uk_products_tenant_slug ON products (tenant_id, slug);
CREATE INDEX idx_products_tenant_brand ON products (tenant_id, brand_id);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_scope ON products (scope_type, scope_branch_id);
CREATE INDEX idx_products_active_visibility ON products (tenant_id, is_active, visibility_mode);

ALTER TABLE menus
    DROP FOREIGN KEY fk_menus_branch;

ALTER TABLE menus
    CHANGE COLUMN branch_id scope_branch_id CHAR(26) NULL,
    ADD COLUMN deleted_at DATETIME(6) NULL AFTER updated_at,
    ADD CONSTRAINT fk_menus_scope_branch FOREIGN KEY (scope_branch_id) REFERENCES branches (id);

CREATE INDEX idx_menus_scope ON menus (tenant_id, brand_id, scope_branch_id);
CREATE INDEX idx_menus_status ON menus (tenant_id, status);

ALTER TABLE menu_versions
    ADD COLUMN base_menu_version_id CHAR(26) NULL AFTER status,
    ADD COLUMN checksum VARCHAR(128) NULL AFTER base_menu_version_id,
    ADD COLUMN change_summary VARCHAR(500) NULL AFTER checksum,
    ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER created_at,
    ADD CONSTRAINT fk_menu_versions_base FOREIGN KEY (base_menu_version_id) REFERENCES menu_versions (id);

CREATE INDEX idx_menu_versions_menu_status ON menu_versions (menu_id, status);
CREATE INDEX idx_menu_versions_published_at ON menu_versions (published_at);

ALTER TABLE menu_sections
    DROP FOREIGN KEY fk_menu_sections_parent;

ALTER TABLE menu_sections
    DROP COLUMN parent_section_id,
    ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER created_at;

CREATE UNIQUE INDEX uk_menu_sections_version_code ON menu_sections (menu_version_id, code);
CREATE INDEX idx_menu_sections_version_order ON menu_sections (menu_version_id, display_order);

CREATE TABLE menu_subsections (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    menu_section_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_menu_subsections_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_menu_subsections_section FOREIGN KEY (menu_section_id) REFERENCES menu_sections (id),
    UNIQUE KEY uk_menu_subsections_section_code (menu_section_id, code)
);

CREATE INDEX idx_menu_subsections_section_order ON menu_subsections (menu_section_id, display_order);

ALTER TABLE menu_items
    ADD COLUMN menu_subsection_id CHAR(26) NULL AFTER menu_section_id,
    ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER created_at,
    ADD CONSTRAINT fk_menu_items_subsection FOREIGN KEY (menu_subsection_id) REFERENCES menu_subsections (id);

CREATE INDEX idx_menu_items_version_order ON menu_items (menu_version_id, display_order);
CREATE INDEX idx_menu_items_subsection ON menu_items (menu_subsection_id);

DROP INDEX idx_product_availability_branch_status ON product_availability;

ALTER TABLE product_availability
    CHANGE COLUMN availability_status state VARCHAR(40) NOT NULL,
    CHANGE COLUMN last_changed_at effective_from DATETIME(6) NOT NULL,
    CHANGE COLUMN changed_by updated_by VARCHAR(160) NULL,
    ADD COLUMN effective_until DATETIME(6) NULL AFTER effective_from,
    ADD COLUMN source_type VARCHAR(40) NOT NULL DEFAULT 'MANUAL' AFTER effective_until,
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0 AFTER updated_at;

CREATE INDEX idx_product_availability_branch_state ON product_availability (branch_id, state);
CREATE INDEX idx_product_availability_effective_window ON product_availability (effective_from, effective_until);
