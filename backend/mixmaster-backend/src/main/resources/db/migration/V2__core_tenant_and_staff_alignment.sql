CREATE INDEX idx_tenants_status ON tenants (status);

ALTER TABLE brands
    ADD COLUMN deleted_at DATETIME(6) NULL AFTER updated_at;

CREATE INDEX idx_brands_tenant_active ON brands (tenant_id, is_active);

ALTER TABLE branches
    ADD COLUMN deleted_at DATETIME(6) NULL AFTER updated_at;

CREATE INDEX idx_branches_tenant_brand ON branches (tenant_id, brand_id);
CREATE INDEX idx_branches_tenant_active ON branches (tenant_id, is_active);

ALTER TABLE venue_tables
    ADD COLUMN deleted_at DATETIME(6) NULL AFTER updated_at;

CREATE INDEX idx_venue_tables_tenant_branch ON venue_tables (tenant_id, branch_id);
CREATE INDEX idx_venue_tables_branch_active ON venue_tables (branch_id, is_active);

ALTER TABLE qr_codes
    ADD COLUMN deleted_at DATETIME(6) NULL AFTER updated_at;

CREATE INDEX idx_qr_codes_tenant_branch ON qr_codes (tenant_id, branch_id);
CREATE INDEX idx_qr_codes_status ON qr_codes (status);

ALTER TABLE roles
    ADD COLUMN description VARCHAR(255) NULL AFTER name,
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER description,
    ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER created_at,
    ADD COLUMN deleted_at DATETIME(6) NULL AFTER updated_at;

CREATE INDEX idx_roles_tenant_active ON roles (tenant_id, is_active);

ALTER TABLE staff_users
    ADD COLUMN password_hash VARCHAR(255) NULL AFTER full_name,
    ADD COLUMN last_login_at DATETIME(6) NULL AFTER status,
    ADD COLUMN deleted_at DATETIME(6) NULL AFTER updated_at;

CREATE INDEX idx_staff_users_tenant_status ON staff_users (tenant_id, status);
CREATE INDEX idx_staff_role_assignments_tenant_staff ON staff_role_assignments (tenant_id, staff_user_id);
CREATE INDEX idx_staff_role_assignments_tenant_role ON staff_role_assignments (tenant_id, role_id);
CREATE INDEX idx_staff_role_assignments_branch ON staff_role_assignments (branch_id);
