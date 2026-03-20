package com.mixmaster.platform.modules.identity.access;

import java.util.List;

public final class PermissionCatalog {

    public static final String PLATFORM_TENANTS_READ = "platform.tenants.read";
    public static final String PLATFORM_TENANTS_WRITE = "platform.tenants.write";
    public static final String PLATFORM_USERS_READ = "platform.users.read";
    public static final String PLATFORM_USERS_WRITE = "platform.users.write";
    public static final String PLATFORM_ONBOARDING_READ = "platform.onboarding.read";
    public static final String PLATFORM_ONBOARDING_WRITE = "platform.onboarding.write";
    public static final String PLATFORM_BILLING_READ = "platform.billing.read";
    public static final String PLATFORM_BILLING_WRITE = "platform.billing.write";
    public static final String PLATFORM_SUPPORT_READ = "platform.support.read";
    public static final String PLATFORM_SUPPORT_WRITE = "platform.support.write";
    public static final String PLATFORM_FLAGS_READ = "platform.flags.read";
    public static final String PLATFORM_FLAGS_WRITE = "platform.flags.write";
    public static final String PLATFORM_REPORTS_READ = "platform.reports.read";
    public static final String PLATFORM_REPORTS_EXPORT = "platform.reports.export";
    public static final String PLATFORM_COMMUNICATIONS_READ = "platform.communications.read";
    public static final String PLATFORM_COMMUNICATIONS_WRITE = "platform.communications.write";

    public static final String TENANT_DASHBOARD_READ = "tenant.dashboard.read";
    public static final String TENANT_ANALYTICS_READ = "tenant.analytics.read";
    public static final String TENANT_ANALYTICS_EXPORT = "tenant.analytics.export";
    public static final String TENANT_MENU_READ = "tenant.menu.read";
    public static final String TENANT_MENU_WRITE = "tenant.menu.write";
    public static final String TENANT_MENU_PUBLISH = "tenant.menu.publish";
    public static final String TENANT_AVAILABILITY_READ = "tenant.availability.read";
    public static final String TENANT_AVAILABILITY_WRITE = "tenant.availability.write";
    public static final String TENANT_STAFF_READ = "tenant.staff.read";
    public static final String TENANT_STAFF_WRITE = "tenant.staff.write";
    public static final String TENANT_STAFF_ASSIGN = "tenant.staff.assign";
    public static final String TENANT_BRANCHES_READ = "tenant.branches.read";
    public static final String TENANT_BRANCHES_WRITE = "tenant.branches.write";
    public static final String TENANT_SETTINGS_READ = "tenant.settings.read";
    public static final String TENANT_SETTINGS_WRITE = "tenant.settings.write";
    public static final String TENANT_REPORTS_READ = "tenant.reports.read";
    public static final String TENANT_REPORTS_EXPORT = "tenant.reports.export";
    public static final String TENANT_QR_READ = "tenant.qr.read";
    public static final String TENANT_QR_WRITE = "tenant.qr.write";
    public static final String TENANT_TICKETS_READ = "tenant.tickets.read";
    public static final String TENANT_TICKETS_WRITE = "tenant.tickets.write";
    public static final String TENANT_TICKETS_RESOLVE = "tenant.tickets.resolve";
    public static final String TENANT_LOYALTY_READ = "tenant.loyalty.read";
    public static final String TENANT_LOYALTY_WRITE = "tenant.loyalty.write";
    public static final String TENANT_CAMPAIGNS_READ = "tenant.campaigns.read";
    public static final String TENANT_CAMPAIGNS_WRITE = "tenant.campaigns.write";

    private static final List<PermissionDefinition> DEFINITIONS = List.of(
        new PermissionDefinition(PLATFORM_TENANTS_READ, "Read tenants and onboarding state."),
        new PermissionDefinition(PLATFORM_TENANTS_WRITE, "Create and update tenants."),
        new PermissionDefinition(PLATFORM_USERS_READ, "Read platform operators and assignments."),
        new PermissionDefinition(PLATFORM_USERS_WRITE, "Create and update platform operators."),
        new PermissionDefinition(PLATFORM_ONBOARDING_READ, "Read onboarding queues and activation readiness."),
        new PermissionDefinition(PLATFORM_ONBOARDING_WRITE, "Advance onboarding and compliance states."),
        new PermissionDefinition(PLATFORM_BILLING_READ, "Read plan and subscription data."),
        new PermissionDefinition(PLATFORM_BILLING_WRITE, "Update plan and subscription data."),
        new PermissionDefinition(PLATFORM_SUPPORT_READ, "Read SaaS support cases."),
        new PermissionDefinition(PLATFORM_SUPPORT_WRITE, "Create, assign, and resolve SaaS support cases."),
        new PermissionDefinition(PLATFORM_FLAGS_READ, "Read feature flags."),
        new PermissionDefinition(PLATFORM_FLAGS_WRITE, "Create and update feature flags."),
        new PermissionDefinition(PLATFORM_REPORTS_READ, "Read legal and operational report catalogs."),
        new PermissionDefinition(PLATFORM_REPORTS_EXPORT, "Export legal and operational reports."),
        new PermissionDefinition(PLATFORM_COMMUNICATIONS_READ, "Read SMTP settings, template catalogs, and email previews."),
        new PermissionDefinition(PLATFORM_COMMUNICATIONS_WRITE, "Update SMTP settings, manage templates, and dispatch tenant emails."),
        new PermissionDefinition(TENANT_DASHBOARD_READ, "Read tenant dashboards."),
        new PermissionDefinition(TENANT_ANALYTICS_READ, "Read analytics summaries."),
        new PermissionDefinition(TENANT_ANALYTICS_EXPORT, "Export analytics reports."),
        new PermissionDefinition(TENANT_MENU_READ, "Read menu and catalog information."),
        new PermissionDefinition(TENANT_MENU_WRITE, "Create and update menu drafts and catalog records."),
        new PermissionDefinition(TENANT_MENU_PUBLISH, "Publish menu versions."),
        new PermissionDefinition(TENANT_AVAILABILITY_READ, "Read availability boards."),
        new PermissionDefinition(TENANT_AVAILABILITY_WRITE, "Update product availability."),
        new PermissionDefinition(TENANT_STAFF_READ, "Read internal staff users and roles."),
        new PermissionDefinition(TENANT_STAFF_WRITE, "Create and update internal staff users."),
        new PermissionDefinition(TENANT_STAFF_ASSIGN, "Assign and revoke staff roles."),
        new PermissionDefinition(TENANT_BRANCHES_READ, "Read branch and brand structures."),
        new PermissionDefinition(TENANT_BRANCHES_WRITE, "Create and update branch and brand structures."),
        new PermissionDefinition(TENANT_SETTINGS_READ, "Read tenant configuration."),
        new PermissionDefinition(TENANT_SETTINGS_WRITE, "Update tenant configuration."),
        new PermissionDefinition(TENANT_REPORTS_READ, "Read operational reports."),
        new PermissionDefinition(TENANT_REPORTS_EXPORT, "Export operational reports."),
        new PermissionDefinition(TENANT_QR_READ, "Read QR inventories and metadata."),
        new PermissionDefinition(TENANT_QR_WRITE, "Create, regenerate, and deactivate QR codes."),
        new PermissionDefinition(TENANT_TICKETS_READ, "Read tenant support tickets."),
        new PermissionDefinition(TENANT_TICKETS_WRITE, "Create and comment tenant support tickets."),
        new PermissionDefinition(TENANT_TICKETS_RESOLVE, "Resolve tenant support tickets."),
        new PermissionDefinition(TENANT_LOYALTY_READ, "Read loyalty configuration and balances."),
        new PermissionDefinition(TENANT_LOYALTY_WRITE, "Update loyalty configuration."),
        new PermissionDefinition(TENANT_CAMPAIGNS_READ, "Read campaigns."),
        new PermissionDefinition(TENANT_CAMPAIGNS_WRITE, "Create and update campaigns.")
    );

    private PermissionCatalog() {
    }

    public static List<PermissionDefinition> definitions() {
        return DEFINITIONS;
    }
}
