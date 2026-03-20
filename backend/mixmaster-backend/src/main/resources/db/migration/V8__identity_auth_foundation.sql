CREATE TABLE platform_users (
    id CHAR(26) PRIMARY KEY,
    email VARCHAR(160) NOT NULL,
    full_name VARCHAR(160) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_code VARCHAR(80) NOT NULL,
    status VARCHAR(40) NOT NULL,
    password_set_at DATETIME(6) NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME(6) NULL,
    last_login_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_platform_users_email (email)
);

CREATE INDEX idx_platform_users_status ON platform_users (status);
CREATE INDEX idx_platform_users_role_status ON platform_users (role_code, status);

ALTER TABLE staff_users
    ADD COLUMN password_set_at DATETIME(6) NULL AFTER password_hash,
    ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0 AFTER password_set_at,
    ADD COLUMN locked_until DATETIME(6) NULL AFTER failed_login_attempts,
    ADD COLUMN password_reset_required BOOLEAN NOT NULL DEFAULT FALSE AFTER locked_until;

ALTER TABLE staff_role_assignments
    ADD COLUMN scope_type VARCHAR(40) NOT NULL DEFAULT 'TENANT' AFTER branch_id;

CREATE INDEX idx_staff_role_assignments_scope ON staff_role_assignments (tenant_id, scope_type, status);

CREATE TABLE auth_sessions (
    id CHAR(26) PRIMARY KEY,
    audience VARCHAR(40) NOT NULL,
    platform_user_id CHAR(26) NULL,
    staff_user_id CHAR(26) NULL,
    tenant_id CHAR(26) NULL,
    active_branch_id CHAR(26) NULL,
    access_token_hash VARCHAR(64) NOT NULL,
    refresh_token_hash VARCHAR(64) NOT NULL,
    access_expires_at DATETIME(6) NOT NULL,
    refresh_expires_at DATETIME(6) NOT NULL,
    revoked_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_auth_sessions_platform_user FOREIGN KEY (platform_user_id) REFERENCES platform_users (id),
    CONSTRAINT fk_auth_sessions_staff_user FOREIGN KEY (staff_user_id) REFERENCES staff_users (id),
    CONSTRAINT fk_auth_sessions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_auth_sessions_branch FOREIGN KEY (active_branch_id) REFERENCES branches (id),
    UNIQUE KEY uk_auth_sessions_access_hash (access_token_hash),
    UNIQUE KEY uk_auth_sessions_refresh_hash (refresh_token_hash)
);

CREATE INDEX idx_auth_sessions_audience ON auth_sessions (audience);
CREATE INDEX idx_auth_sessions_staff_active ON auth_sessions (staff_user_id, revoked_at, access_expires_at);
CREATE INDEX idx_auth_sessions_platform_active ON auth_sessions (platform_user_id, revoked_at, access_expires_at);
