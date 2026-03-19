ALTER TABLE consumer_accounts
    ADD COLUMN password_hash VARCHAR(255) NULL AFTER phone,
    ADD COLUMN email_verified_at DATETIME(6) NULL AFTER status,
    ADD COLUMN phone_verified_at DATETIME(6) NULL AFTER email_verified_at,
    ADD COLUMN last_login_at DATETIME(6) NULL AFTER phone_verified_at;

CREATE INDEX idx_consumer_accounts_status ON consumer_accounts (status);

CREATE TABLE device_contexts (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    device_fingerprint_hash VARCHAR(255) NOT NULL,
    client_type VARCHAR(40) NOT NULL,
    user_agent VARCHAR(512) NULL,
    os_name VARCHAR(120) NULL,
    browser_name VARCHAR(120) NULL,
    app_version VARCHAR(80) NULL,
    ip_hash VARCHAR(255) NULL,
    locale VARCHAR(32) NULL,
    timezone VARCHAR(64) NULL,
    last_seen_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_device_contexts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    UNIQUE KEY uk_device_contexts_tenant_fingerprint (tenant_id, device_fingerprint_hash)
);

CREATE INDEX idx_device_contexts_tenant_last_seen ON device_contexts (tenant_id, last_seen_at);

ALTER TABLE anonymous_profiles
    DROP INDEX uk_anonymous_profiles_token,
    ADD COLUMN primary_device_context_id CHAR(26) NULL AFTER stable_token_hash,
    ADD COLUMN consent_level VARCHAR(40) NOT NULL DEFAULT 'ESSENTIAL' AFTER primary_device_context_id,
    ADD COLUMN affinity_summary_json JSON NULL AFTER last_seen_at,
    ADD COLUMN dislike_summary_json JSON NULL AFTER affinity_summary_json,
    ADD CONSTRAINT fk_anonymous_profiles_device_context FOREIGN KEY (primary_device_context_id) REFERENCES device_contexts (id),
    ADD UNIQUE KEY uk_anonymous_profiles_tenant_token (tenant_id, stable_token_hash);

CREATE INDEX idx_anonymous_profiles_tenant_status ON anonymous_profiles (tenant_id, status);
CREATE INDEX idx_anonymous_profiles_last_seen ON anonymous_profiles (tenant_id, last_seen_at);

ALTER TABLE anonymous_sessions
    ADD COLUMN device_context_id CHAR(26) NULL AFTER consumer_profile_id,
    ADD COLUMN party_size INT NULL AFTER objective,
    ADD COLUMN last_activity_at DATETIME(6) NULL AFTER started_at,
    ADD CONSTRAINT fk_anonymous_sessions_device_context FOREIGN KEY (device_context_id) REFERENCES device_contexts (id);

CREATE INDEX idx_anonymous_sessions_profile_status ON anonymous_sessions (anonymous_profile_id, status);
CREATE INDEX idx_anonymous_sessions_consumer_profile ON anonymous_sessions (consumer_profile_id);

CREATE TABLE anonymous_profile_merges (
    id CHAR(26) PRIMARY KEY,
    tenant_id CHAR(26) NOT NULL,
    anonymous_profile_id CHAR(26) NOT NULL,
    consumer_profile_id CHAR(26) NOT NULL,
    merge_reason VARCHAR(80) NOT NULL,
    merged_by VARCHAR(160) NULL,
    merged_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_anonymous_profile_merges_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_anonymous_profile_merges_profile FOREIGN KEY (anonymous_profile_id) REFERENCES anonymous_profiles (id),
    CONSTRAINT fk_anonymous_profile_merges_consumer_profile FOREIGN KEY (consumer_profile_id) REFERENCES consumer_profiles (id),
    UNIQUE KEY uk_anonymous_profile_merges_profile (anonymous_profile_id)
);

CREATE INDEX idx_anonymous_profile_merges_tenant_merged_at ON anonymous_profile_merges (tenant_id, merged_at);
CREATE INDEX idx_anonymous_profile_merges_consumer_profile ON anonymous_profile_merges (consumer_profile_id);
