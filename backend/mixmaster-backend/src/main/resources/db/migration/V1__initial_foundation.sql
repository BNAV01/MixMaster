CREATE TABLE tenants (
    id CHAR(26) PRIMARY KEY,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    status VARCHAR(40) NOT NULL,
    timezone VARCHAR(80) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_tenants_code (code)
);

CREATE TABLE brands (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_brands_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    UNIQUE KEY uk_brands_tenant_code (tenant_id, code)
);

CREATE TABLE branches (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    brand_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    timezone VARCHAR(80) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_branches_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_branches_brand FOREIGN KEY (brand_id) REFERENCES brands (id),
    UNIQUE KEY uk_branches_tenant_code (tenant_id, code)
);

CREATE TABLE venue_tables (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    label VARCHAR(120) NOT NULL,
    seating_capacity INT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_venue_tables_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_venue_tables_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    UNIQUE KEY uk_venue_tables_branch_code (branch_id, code)
);

CREATE TABLE qr_codes (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NOT NULL,
    venue_table_id CHAR(26) NULL,
    token VARCHAR(255) NOT NULL,
    status VARCHAR(40) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_qr_codes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_qr_codes_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_qr_codes_table FOREIGN KEY (venue_table_id) REFERENCES venue_tables (id),
    UNIQUE KEY uk_qr_codes_token (token)
);

CREATE TABLE roles (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(120) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    UNIQUE KEY uk_roles_tenant_code (tenant_id, code)
);

CREATE TABLE permissions (
    id CHAR(26) PRIMARY KEY,
    code VARCHAR(120) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_permissions_code (code)
);

CREATE TABLE role_permissions (
    role_id CHAR(26) NOT NULL,
    permission_id CHAR(26) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id),
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id)
);

CREATE TABLE staff_users (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    email VARCHAR(160) NOT NULL,
    full_name VARCHAR(160) NOT NULL,
    status VARCHAR(40) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_staff_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    UNIQUE KEY uk_staff_users_tenant_email (tenant_id, email)
);

CREATE TABLE staff_role_assignments (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    staff_user_id CHAR(26) NOT NULL,
    role_id CHAR(26) NOT NULL,
    brand_id CHAR(26) NULL,
    branch_id CHAR(26) NULL,
    status VARCHAR(40) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_staff_role_assignments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_staff_role_assignments_staff_user FOREIGN KEY (staff_user_id) REFERENCES staff_users (id),
    CONSTRAINT fk_staff_role_assignments_role FOREIGN KEY (role_id) REFERENCES roles (id),
    CONSTRAINT fk_staff_role_assignments_brand FOREIGN KEY (brand_id) REFERENCES brands (id),
    CONSTRAINT fk_staff_role_assignments_branch FOREIGN KEY (branch_id) REFERENCES branches (id)
);

CREATE TABLE consumer_accounts (
    id CHAR(26) PRIMARY KEY,
    email VARCHAR(160) NULL,
    phone VARCHAR(40) NULL,
    status VARCHAR(40) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_consumer_accounts_email (email),
    UNIQUE KEY uk_consumer_accounts_phone (phone)
);

CREATE TABLE consumer_profiles (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    consumer_account_id CHAR(26) NOT NULL,
    display_name VARCHAR(160) NULL,
    preferred_language VARCHAR(16) NULL,
    marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_consumer_profiles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_consumer_profiles_account FOREIGN KEY (consumer_account_id) REFERENCES consumer_accounts (id),
    UNIQUE KEY uk_consumer_profiles_tenant_account (tenant_id, consumer_account_id)
);

CREATE TABLE anonymous_profiles (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    stable_token_hash VARCHAR(255) NOT NULL,
    status VARCHAR(40) NOT NULL,
    merged_to_consumer_profile_id CHAR(26) NULL,
    first_seen_at DATETIME(6) NOT NULL,
    last_seen_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_anonymous_profiles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_anonymous_profiles_consumer_profile FOREIGN KEY (merged_to_consumer_profile_id) REFERENCES consumer_profiles (id),
    UNIQUE KEY uk_anonymous_profiles_token (stable_token_hash)
);

CREATE TABLE anonymous_sessions (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NOT NULL,
    venue_table_id CHAR(26) NULL,
    qr_code_id CHAR(26) NULL,
    anonymous_profile_id CHAR(26) NULL,
    consumer_profile_id CHAR(26) NULL,
    source VARCHAR(40) NOT NULL,
    objective VARCHAR(80) NULL,
    status VARCHAR(40) NOT NULL,
    context_json JSON NULL,
    started_at DATETIME(6) NOT NULL,
    ended_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_anonymous_sessions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_anonymous_sessions_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_anonymous_sessions_table FOREIGN KEY (venue_table_id) REFERENCES venue_tables (id),
    CONSTRAINT fk_anonymous_sessions_qr FOREIGN KEY (qr_code_id) REFERENCES qr_codes (id),
    CONSTRAINT fk_anonymous_sessions_anonymous_profile FOREIGN KEY (anonymous_profile_id) REFERENCES anonymous_profiles (id),
    CONSTRAINT fk_anonymous_sessions_consumer_profile FOREIGN KEY (consumer_profile_id) REFERENCES consumer_profiles (id)
);

CREATE TABLE product_categories (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(120) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_product_categories_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    UNIQUE KEY uk_product_categories_tenant_code (tenant_id, code)
);

CREATE TABLE ingredients (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(120) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_ingredients_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    UNIQUE KEY uk_ingredients_tenant_code (tenant_id, code)
);

CREATE TABLE tags (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(120) NOT NULL,
    tag_type VARCHAR(80) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_tags_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    UNIQUE KEY uk_tags_tenant_code (tenant_id, code)
);

CREATE TABLE products (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    brand_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NULL,
    category_id CHAR(26) NOT NULL,
    product_type VARCHAR(40) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    short_description VARCHAR(255) NULL,
    long_description TEXT NULL,
    alcohol_level DECIMAL(5,2) NULL,
    price_current DECIMAL(10,2) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    visibility_mode VARCHAR(40) NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_products_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands (id),
    CONSTRAINT fk_products_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES product_categories (id),
    UNIQUE KEY uk_products_tenant_code (tenant_id, code)
);

CREATE TABLE product_ingredients (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    product_id CHAR(26) NOT NULL,
    ingredient_id CHAR(26) NOT NULL,
    role_code VARCHAR(80) NULL,
    quantity_label VARCHAR(80) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_product_ingredients_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_product_ingredients_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_product_ingredients_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
);

CREATE TABLE product_tags (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    product_id CHAR(26) NOT NULL,
    tag_id CHAR(26) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_product_tags_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_product_tags_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_product_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id),
    UNIQUE KEY uk_product_tags_product_tag (product_id, tag_id)
);

CREATE TABLE menus (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    brand_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    scope_type VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    source_menu_id CHAR(26) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_menus_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_menus_brand FOREIGN KEY (brand_id) REFERENCES brands (id),
    CONSTRAINT fk_menus_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_menus_source FOREIGN KEY (source_menu_id) REFERENCES menus (id),
    UNIQUE KEY uk_menus_scope_code (tenant_id, brand_id, branch_id, code)
);

CREATE TABLE menu_versions (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    menu_id CHAR(26) NOT NULL,
    version_number INT NOT NULL,
    status VARCHAR(40) NOT NULL,
    publication_started_at DATETIME(6) NULL,
    published_at DATETIME(6) NULL,
    rollback_of_version_id CHAR(26) NULL,
    created_by VARCHAR(160) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_menu_versions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_menu_versions_menu FOREIGN KEY (menu_id) REFERENCES menus (id),
    CONSTRAINT fk_menu_versions_rollback FOREIGN KEY (rollback_of_version_id) REFERENCES menu_versions (id),
    UNIQUE KEY uk_menu_versions_menu_version (menu_id, version_number)
);

CREATE TABLE menu_sections (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    menu_version_id CHAR(26) NOT NULL,
    parent_section_id CHAR(26) NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_menu_sections_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_menu_sections_version FOREIGN KEY (menu_version_id) REFERENCES menu_versions (id),
    CONSTRAINT fk_menu_sections_parent FOREIGN KEY (parent_section_id) REFERENCES menu_sections (id)
);

CREATE TABLE menu_items (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    menu_version_id CHAR(26) NOT NULL,
    menu_section_id CHAR(26) NOT NULL,
    product_id CHAR(26) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    visibility_mode VARCHAR(40) NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_menu_items_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_menu_items_version FOREIGN KEY (menu_version_id) REFERENCES menu_versions (id),
    CONSTRAINT fk_menu_items_section FOREIGN KEY (menu_section_id) REFERENCES menu_sections (id),
    CONSTRAINT fk_menu_items_product FOREIGN KEY (product_id) REFERENCES products (id),
    UNIQUE KEY uk_menu_items_section_product (menu_section_id, product_id)
);

CREATE TABLE product_availability (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NOT NULL,
    product_id CHAR(26) NOT NULL,
    availability_status VARCHAR(40) NOT NULL,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    reason_code VARCHAR(80) NULL,
    last_changed_at DATETIME(6) NOT NULL,
    changed_by VARCHAR(160) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_product_availability_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_product_availability_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_product_availability_product FOREIGN KEY (product_id) REFERENCES products (id),
    UNIQUE KEY uk_product_availability_branch_product (branch_id, product_id)
);

CREATE TABLE product_state_changes (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NOT NULL,
    product_id CHAR(26) NOT NULL,
    previous_state VARCHAR(40) NULL,
    new_state VARCHAR(40) NOT NULL,
    reason_code VARCHAR(80) NULL,
    changed_by VARCHAR(160) NULL,
    changed_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_product_state_changes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_product_state_changes_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_product_state_changes_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE campaigns (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    brand_id CHAR(26) NULL,
    branch_id CHAR(26) NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    status VARCHAR(40) NOT NULL,
    starts_at DATETIME(6) NULL,
    ends_at DATETIME(6) NULL,
    rule_json JSON NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_campaigns_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_campaigns_brand FOREIGN KEY (brand_id) REFERENCES brands (id),
    CONSTRAINT fk_campaigns_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    UNIQUE KEY uk_campaigns_tenant_code (tenant_id, code)
);

CREATE TABLE recommendation_requests (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NOT NULL,
    anonymous_session_id CHAR(26) NULL,
    consumer_profile_id CHAR(26) NULL,
    objective VARCHAR(80) NOT NULL,
    exploration_mode VARCHAR(40) NOT NULL,
    request_payload JSON NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_recommendation_requests_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_recommendation_requests_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_recommendation_requests_session FOREIGN KEY (anonymous_session_id) REFERENCES anonymous_sessions (id),
    CONSTRAINT fk_recommendation_requests_consumer_profile FOREIGN KEY (consumer_profile_id) REFERENCES consumer_profiles (id)
);

CREATE TABLE recommendation_results (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    recommendation_request_id CHAR(26) NOT NULL,
    strategy_code VARCHAR(80) NOT NULL,
    status VARCHAR(40) NOT NULL,
    generated_at DATETIME(6) NOT NULL,
    explanation_summary VARCHAR(255) NULL,
    CONSTRAINT fk_recommendation_results_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_recommendation_results_request FOREIGN KEY (recommendation_request_id) REFERENCES recommendation_requests (id)
);

CREATE TABLE recommendation_result_items (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    recommendation_result_id CHAR(26) NOT NULL,
    product_id CHAR(26) NOT NULL,
    ranking_position INT NOT NULL,
    score DECIMAL(6,3) NOT NULL,
    explanation_text VARCHAR(255) NULL,
    CONSTRAINT fk_recommendation_result_items_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_recommendation_result_items_result FOREIGN KEY (recommendation_result_id) REFERENCES recommendation_results (id),
    CONSTRAINT fk_recommendation_result_items_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE recommendation_feedback (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NOT NULL,
    recommendation_request_id CHAR(26) NOT NULL,
    recommendation_result_id CHAR(26) NOT NULL,
    recommendation_result_item_id CHAR(26) NULL,
    anonymous_session_id CHAR(26) NULL,
    consumer_profile_id CHAR(26) NULL,
    verdict VARCHAR(40) NOT NULL,
    adjustment_json JSON NULL,
    submitted_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_recommendation_feedback_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_recommendation_feedback_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_recommendation_feedback_request FOREIGN KEY (recommendation_request_id) REFERENCES recommendation_requests (id),
    CONSTRAINT fk_recommendation_feedback_result FOREIGN KEY (recommendation_result_id) REFERENCES recommendation_results (id),
    CONSTRAINT fk_recommendation_feedback_item FOREIGN KEY (recommendation_result_item_id) REFERENCES recommendation_result_items (id),
    CONSTRAINT fk_recommendation_feedback_session FOREIGN KEY (anonymous_session_id) REFERENCES anonymous_sessions (id),
    CONSTRAINT fk_recommendation_feedback_consumer_profile FOREIGN KEY (consumer_profile_id) REFERENCES consumer_profiles (id)
);

CREATE TABLE loyalty_levels (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(120) NOT NULL,
    threshold_points INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_loyalty_levels_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    UNIQUE KEY uk_loyalty_levels_tenant_code (tenant_id, code)
);

CREATE TABLE loyalty_accounts (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    consumer_profile_id CHAR(26) NOT NULL,
    loyalty_level_id CHAR(26) NULL,
    points_balance INT NOT NULL DEFAULT 0,
    visits_count INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_loyalty_accounts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_loyalty_accounts_consumer_profile FOREIGN KEY (consumer_profile_id) REFERENCES consumer_profiles (id),
    CONSTRAINT fk_loyalty_accounts_level FOREIGN KEY (loyalty_level_id) REFERENCES loyalty_levels (id),
    UNIQUE KEY uk_loyalty_accounts_profile (consumer_profile_id)
);

CREATE TABLE benefits (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    benefit_type VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    rule_json JSON NULL,
    valid_from DATETIME(6) NULL,
    valid_until DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_benefits_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    UNIQUE KEY uk_benefits_tenant_code (tenant_id, code)
);

CREATE TABLE benefit_redemptions (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NOT NULL,
    benefit_id CHAR(26) NOT NULL,
    loyalty_account_id CHAR(26) NOT NULL,
    status VARCHAR(40) NOT NULL,
    redeemed_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_benefit_redemptions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_benefit_redemptions_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_benefit_redemptions_benefit FOREIGN KEY (benefit_id) REFERENCES benefits (id),
    CONSTRAINT fk_benefit_redemptions_account FOREIGN KEY (loyalty_account_id) REFERENCES loyalty_accounts (id)
);

CREATE TABLE loyalty_points_ledger (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    loyalty_account_id CHAR(26) NOT NULL,
    entry_type VARCHAR(40) NOT NULL,
    points_delta INT NOT NULL,
    balance_after INT NOT NULL,
    reason_code VARCHAR(80) NOT NULL,
    source_entity_type VARCHAR(80) NULL,
    source_entity_id CHAR(26) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_loyalty_points_ledger_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_loyalty_points_ledger_account FOREIGN KEY (loyalty_account_id) REFERENCES loyalty_accounts (id)
);

CREATE TABLE sales (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NOT NULL,
    anonymous_session_id CHAR(26) NULL,
    consumer_profile_id CHAR(26) NULL,
    venue_table_id CHAR(26) NULL,
    source VARCHAR(40) NOT NULL,
    external_reference VARCHAR(120) NULL,
    subtotal_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    sold_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_sales_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_sales_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_sales_session FOREIGN KEY (anonymous_session_id) REFERENCES anonymous_sessions (id),
    CONSTRAINT fk_sales_consumer_profile FOREIGN KEY (consumer_profile_id) REFERENCES consumer_profiles (id),
    CONSTRAINT fk_sales_table FOREIGN KEY (venue_table_id) REFERENCES venue_tables (id)
);

CREATE TABLE sale_items (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    sale_id CHAR(26) NOT NULL,
    product_id CHAR(26) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    recommendation_result_item_id CHAR(26) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_sale_items_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) REFERENCES sales (id),
    CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_sale_items_result_item FOREIGN KEY (recommendation_result_item_id) REFERENCES recommendation_result_items (id)
);

CREATE TABLE audit_logs (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NULL,
    actor VARCHAR(160) NOT NULL,
    module VARCHAR(80) NOT NULL,
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(120) NULL,
    entity_id CHAR(26) NULL,
    metadata_json JSON NULL,
    occurred_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE INDEX idx_anonymous_sessions_branch_started_at ON anonymous_sessions (branch_id, started_at);
CREATE INDEX idx_product_availability_branch_status ON product_availability (branch_id, availability_status);
CREATE INDEX idx_recommendation_requests_branch_created_at ON recommendation_requests (branch_id, created_at);
CREATE INDEX idx_recommendation_feedback_branch_submitted_at ON recommendation_feedback (branch_id, submitted_at);
CREATE INDEX idx_sales_branch_sold_at ON sales (branch_id, sold_at);
CREATE INDEX idx_audit_logs_module_occurred_at ON audit_logs (module, occurred_at);
