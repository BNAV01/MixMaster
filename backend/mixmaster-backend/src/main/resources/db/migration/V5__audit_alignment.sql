ALTER TABLE audit_logs
    ADD COLUMN brand_id CHAR(26) NULL AFTER tenant_id,
    ADD COLUMN branch_id CHAR(26) NULL AFTER brand_id,
    ADD COLUMN audience VARCHAR(40) NULL AFTER actor,
    ADD COLUMN trace_id VARCHAR(80) NULL AFTER entity_id;

CREATE INDEX idx_audit_logs_tenant_occurred_at ON audit_logs (tenant_id, occurred_at);
CREATE INDEX idx_audit_logs_entity_lookup ON audit_logs (entity_type, entity_id);
