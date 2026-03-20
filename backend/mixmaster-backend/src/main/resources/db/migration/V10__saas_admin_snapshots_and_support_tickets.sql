CREATE TABLE platform_daily_snapshots (
    id CHAR(26) PRIMARY KEY,
    captured_for_date DATE NOT NULL,
    captured_at DATETIME(6) NOT NULL,
    total_tenants BIGINT NOT NULL,
    active_tenants BIGINT NOT NULL,
    trial_tenants BIGINT NOT NULL,
    suspended_tenants BIGINT NOT NULL,
    legal_ready_tenants BIGINT NOT NULL,
    onboarding_pending_tenants BIGINT NOT NULL,
    expiring_trials BIGINT NOT NULL,
    sii_verified_tenants BIGINT NOT NULL,
    total_staff_users BIGINT NOT NULL,
    active_staff_users BIGINT NOT NULL,
    owners_pending_password_reset BIGINT NOT NULL,
    open_tickets BIGINT NOT NULL,
    urgent_tickets BIGINT NOT NULL,
    average_readiness_score INT NOT NULL,
    new_tenants_last_24h BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE INDEX idx_platform_daily_snapshots_captured_at ON platform_daily_snapshots (captured_at);
CREATE INDEX idx_platform_daily_snapshots_for_date ON platform_daily_snapshots (captured_for_date);

CREATE TABLE tenant_daily_snapshots (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    captured_for_date DATE NOT NULL,
    captured_at DATETIME(6) NOT NULL,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(160) NOT NULL,
    legal_name VARCHAR(160) NOT NULL,
    timezone VARCHAR(80) NOT NULL,
    status VARCHAR(40) NOT NULL,
    subscription_plan_code VARCHAR(80) NOT NULL,
    subscription_status VARCHAR(40) NOT NULL,
    onboarding_stage VARCHAR(40) NOT NULL,
    owner_email VARCHAR(160) NULL,
    owner_full_name VARCHAR(160) NULL,
    owner_password_reset_required BOOLEAN NOT NULL DEFAULT FALSE,
    brand_count BIGINT NOT NULL,
    branch_count BIGINT NOT NULL,
    staff_user_count BIGINT NOT NULL,
    active_staff_user_count BIGINT NOT NULL,
    legal_ready BOOLEAN NOT NULL DEFAULT FALSE,
    readiness_score INT NOT NULL,
    sii_start_activities_verified BOOLEAN NOT NULL DEFAULT FALSE,
    open_ticket_count BIGINT NOT NULL,
    urgent_ticket_count BIGINT NOT NULL,
    trial_ends_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_tenant_daily_snapshots_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

CREATE INDEX idx_tenant_daily_snapshots_tenant_captured_at ON tenant_daily_snapshots (tenant_id, captured_at);
CREATE INDEX idx_tenant_daily_snapshots_for_date ON tenant_daily_snapshots (captured_for_date);
CREATE INDEX idx_tenant_daily_snapshots_plan_status ON tenant_daily_snapshots (subscription_plan_code, subscription_status);

CREATE TABLE support_tickets (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    branch_id CHAR(26) NULL,
    requested_by_user_id CHAR(26) NULL,
    requested_by_email VARCHAR(160) NOT NULL,
    requested_by_name VARCHAR(160) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(40) NOT NULL,
    priority VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    assigned_platform_user_id CHAR(26) NULL,
    last_reply_by_audience VARCHAR(40) NOT NULL,
    first_response_at DATETIME(6) NULL,
    last_message_at DATETIME(6) NOT NULL,
    last_tenant_message_at DATETIME(6) NULL,
    last_platform_reply_at DATETIME(6) NULL,
    resolved_at DATETIME(6) NULL,
    resolution_summary TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_support_tickets_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_support_tickets_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    CONSTRAINT fk_support_tickets_requested_by_user FOREIGN KEY (requested_by_user_id) REFERENCES staff_users (id),
    CONSTRAINT fk_support_tickets_assigned_platform_user FOREIGN KEY (assigned_platform_user_id) REFERENCES platform_users (id)
);

CREATE INDEX idx_support_tickets_tenant_status ON support_tickets (tenant_id, status, priority);
CREATE INDEX idx_support_tickets_platform_status ON support_tickets (status, priority, last_message_at);
CREATE INDEX idx_support_tickets_assignee ON support_tickets (assigned_platform_user_id, status);

CREATE TABLE support_ticket_messages (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    ticket_id CHAR(26) NOT NULL,
    author_audience VARCHAR(40) NOT NULL,
    author_user_id CHAR(26) NULL,
    author_display_name VARCHAR(160) NOT NULL,
    author_email VARCHAR(160) NULL,
    body TEXT NOT NULL,
    internal_note BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_support_ticket_messages_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_support_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets (id)
);

CREATE INDEX idx_support_ticket_messages_ticket_created ON support_ticket_messages (ticket_id, created_at);
