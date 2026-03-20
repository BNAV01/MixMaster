ALTER TABLE tenants
    ADD COLUMN legal_name VARCHAR(160) NULL AFTER name,
    ADD COLUMN tax_id VARCHAR(16) NULL AFTER legal_name,
    ADD COLUMN billing_email VARCHAR(160) NULL AFTER timezone,
    ADD COLUMN billing_phone VARCHAR(40) NULL AFTER billing_email,
    ADD COLUMN economic_activity VARCHAR(160) NULL AFTER billing_phone,
    ADD COLUMN sii_activity_code VARCHAR(32) NULL AFTER economic_activity,
    ADD COLUMN tax_address VARCHAR(200) NULL AFTER sii_activity_code,
    ADD COLUMN tax_commune VARCHAR(120) NULL AFTER tax_address,
    ADD COLUMN tax_city VARCHAR(120) NULL AFTER tax_commune,
    ADD COLUMN legal_representative_name VARCHAR(160) NULL AFTER tax_city,
    ADD COLUMN legal_representative_tax_id VARCHAR(16) NULL AFTER legal_representative_name,
    ADD COLUMN onboarding_stage VARCHAR(40) NOT NULL DEFAULT 'OWNER_BOOTSTRAPPED' AFTER legal_representative_tax_id,
    ADD COLUMN subscription_plan_code VARCHAR(80) NOT NULL DEFAULT 'FOUNDATION' AFTER onboarding_stage,
    ADD COLUMN subscription_status VARCHAR(40) NOT NULL DEFAULT 'TRIAL' AFTER subscription_plan_code,
    ADD COLUMN trial_ends_at DATETIME(6) NULL AFTER subscription_status,
    ADD COLUMN activated_at DATETIME(6) NULL AFTER trial_ends_at,
    ADD COLUMN suspended_at DATETIME(6) NULL AFTER activated_at,
    ADD COLUMN sii_start_activities_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER suspended_at,
    ADD COLUMN sii_start_activities_verified_at DATETIME(6) NULL AFTER sii_start_activities_verified;

UPDATE tenants
SET legal_name = name
WHERE legal_name IS NULL;

UPDATE tenants
SET subscription_status = CASE status
    WHEN 'ACTIVE' THEN 'ACTIVE'
    WHEN 'TRIAL' THEN 'TRIAL'
    WHEN 'SUSPENDED' THEN 'SUSPENDED'
    ELSE 'ARCHIVED'
END;

UPDATE tenants
SET activated_at = created_at
WHERE status = 'ACTIVE'
  AND activated_at IS NULL;

UPDATE tenants
SET trial_ends_at = DATE_ADD(created_at, INTERVAL 14 DAY)
WHERE status = 'TRIAL'
  AND trial_ends_at IS NULL;

UPDATE tenants
SET suspended_at = updated_at
WHERE status = 'SUSPENDED'
  AND suspended_at IS NULL;

ALTER TABLE tenants
    MODIFY COLUMN legal_name VARCHAR(160) NOT NULL;

ALTER TABLE branches
    ADD COLUMN address_line1 VARCHAR(200) NULL AFTER currency_code,
    ADD COLUMN commune VARCHAR(120) NULL AFTER address_line1,
    ADD COLUMN city VARCHAR(120) NULL AFTER commune;
