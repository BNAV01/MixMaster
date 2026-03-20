package com.mixmaster.platform.modules.identity.access;

import java.util.List;
import java.util.Set;

public final class TenantRoleCatalog {

    private static final Set<String> ALL_TENANT_PERMISSIONS = Set.of(
        PermissionCatalog.TENANT_DASHBOARD_READ,
        PermissionCatalog.TENANT_ANALYTICS_READ,
        PermissionCatalog.TENANT_ANALYTICS_EXPORT,
        PermissionCatalog.TENANT_MENU_READ,
        PermissionCatalog.TENANT_MENU_WRITE,
        PermissionCatalog.TENANT_MENU_PUBLISH,
        PermissionCatalog.TENANT_AVAILABILITY_READ,
        PermissionCatalog.TENANT_AVAILABILITY_WRITE,
        PermissionCatalog.TENANT_STAFF_READ,
        PermissionCatalog.TENANT_STAFF_WRITE,
        PermissionCatalog.TENANT_STAFF_ASSIGN,
        PermissionCatalog.TENANT_BRANCHES_READ,
        PermissionCatalog.TENANT_BRANCHES_WRITE,
        PermissionCatalog.TENANT_SETTINGS_READ,
        PermissionCatalog.TENANT_SETTINGS_WRITE,
        PermissionCatalog.TENANT_REPORTS_READ,
        PermissionCatalog.TENANT_REPORTS_EXPORT,
        PermissionCatalog.TENANT_QR_READ,
        PermissionCatalog.TENANT_QR_WRITE,
        PermissionCatalog.TENANT_TICKETS_READ,
        PermissionCatalog.TENANT_TICKETS_WRITE,
        PermissionCatalog.TENANT_TICKETS_RESOLVE,
        PermissionCatalog.TENANT_LOYALTY_READ,
        PermissionCatalog.TENANT_LOYALTY_WRITE,
        PermissionCatalog.TENANT_CAMPAIGNS_READ,
        PermissionCatalog.TENANT_CAMPAIGNS_WRITE
    );

    private static final List<TenantRoleTemplate> TEMPLATES = List.of(
        new TenantRoleTemplate(
            "TENANT_OWNER",
            "Tenant Owner",
            "Control total del tenant, configuracion, personal y operacion multisucursal.",
            ALL_TENANT_PERMISSIONS
        ),
        new TenantRoleTemplate(
            "GENERAL_MANAGER",
            "General Manager",
            "Gobierno operativo y analitico del tenant.",
            Set.of(
                PermissionCatalog.TENANT_DASHBOARD_READ,
                PermissionCatalog.TENANT_ANALYTICS_READ,
                PermissionCatalog.TENANT_ANALYTICS_EXPORT,
                PermissionCatalog.TENANT_MENU_READ,
                PermissionCatalog.TENANT_MENU_WRITE,
                PermissionCatalog.TENANT_MENU_PUBLISH,
                PermissionCatalog.TENANT_AVAILABILITY_READ,
                PermissionCatalog.TENANT_AVAILABILITY_WRITE,
                PermissionCatalog.TENANT_STAFF_READ,
                PermissionCatalog.TENANT_STAFF_ASSIGN,
                PermissionCatalog.TENANT_BRANCHES_READ,
                PermissionCatalog.TENANT_SETTINGS_READ,
                PermissionCatalog.TENANT_REPORTS_READ,
                PermissionCatalog.TENANT_REPORTS_EXPORT,
                PermissionCatalog.TENANT_QR_READ,
                PermissionCatalog.TENANT_QR_WRITE,
                PermissionCatalog.TENANT_TICKETS_READ,
                PermissionCatalog.TENANT_TICKETS_WRITE,
                PermissionCatalog.TENANT_TICKETS_RESOLVE,
                PermissionCatalog.TENANT_LOYALTY_READ,
                PermissionCatalog.TENANT_LOYALTY_WRITE,
                PermissionCatalog.TENANT_CAMPAIGNS_READ,
                PermissionCatalog.TENANT_CAMPAIGNS_WRITE
            )
        ),
        new TenantRoleTemplate(
            "AREA_MANAGER",
            "Area Manager",
            "Gestion multi-sucursal con foco operativo y analitico.",
            Set.of(
                PermissionCatalog.TENANT_DASHBOARD_READ,
                PermissionCatalog.TENANT_ANALYTICS_READ,
                PermissionCatalog.TENANT_ANALYTICS_EXPORT,
                PermissionCatalog.TENANT_MENU_READ,
                PermissionCatalog.TENANT_AVAILABILITY_READ,
                PermissionCatalog.TENANT_AVAILABILITY_WRITE,
                PermissionCatalog.TENANT_STAFF_READ,
                PermissionCatalog.TENANT_BRANCHES_READ,
                PermissionCatalog.TENANT_REPORTS_READ,
                PermissionCatalog.TENANT_REPORTS_EXPORT,
                PermissionCatalog.TENANT_QR_READ,
                PermissionCatalog.TENANT_TICKETS_READ,
                PermissionCatalog.TENANT_TICKETS_WRITE
            )
        ),
        new TenantRoleTemplate(
            "BRANCH_MANAGER",
            "Branch Manager",
            "Gestion integral de una sucursal.",
            Set.of(
                PermissionCatalog.TENANT_DASHBOARD_READ,
                PermissionCatalog.TENANT_ANALYTICS_READ,
                PermissionCatalog.TENANT_MENU_READ,
                PermissionCatalog.TENANT_MENU_WRITE,
                PermissionCatalog.TENANT_AVAILABILITY_READ,
                PermissionCatalog.TENANT_AVAILABILITY_WRITE,
                PermissionCatalog.TENANT_STAFF_READ,
                PermissionCatalog.TENANT_REPORTS_READ,
                PermissionCatalog.TENANT_QR_READ,
                PermissionCatalog.TENANT_QR_WRITE,
                PermissionCatalog.TENANT_TICKETS_READ,
                PermissionCatalog.TENANT_TICKETS_WRITE,
                PermissionCatalog.TENANT_LOYALTY_READ,
                PermissionCatalog.TENANT_CAMPAIGNS_READ
            )
        ),
        new TenantRoleTemplate(
            "STORE_ADMIN",
            "Store Admin",
            "Administracion operativa de la sucursal.",
            Set.of(
                PermissionCatalog.TENANT_DASHBOARD_READ,
                PermissionCatalog.TENANT_MENU_READ,
                PermissionCatalog.TENANT_AVAILABILITY_READ,
                PermissionCatalog.TENANT_AVAILABILITY_WRITE,
                PermissionCatalog.TENANT_STAFF_READ,
                PermissionCatalog.TENANT_QR_READ,
                PermissionCatalog.TENANT_TICKETS_READ,
                PermissionCatalog.TENANT_TICKETS_WRITE
            )
        ),
        new TenantRoleTemplate(
            "INVENTORY_MANAGER",
            "Inventory Manager",
            "Control de disponibilidad, catalogo y reportes de insumos.",
            Set.of(
                PermissionCatalog.TENANT_DASHBOARD_READ,
                PermissionCatalog.TENANT_MENU_READ,
                PermissionCatalog.TENANT_MENU_WRITE,
                PermissionCatalog.TENANT_AVAILABILITY_READ,
                PermissionCatalog.TENANT_AVAILABILITY_WRITE,
                PermissionCatalog.TENANT_REPORTS_READ
            )
        ),
        new TenantRoleTemplate(
            "FINANCE_OPERATIONS_MANAGER",
            "Finance / Operations Manager",
            "Lectura de reportes, analitica y supervision operativa.",
            Set.of(
                PermissionCatalog.TENANT_DASHBOARD_READ,
                PermissionCatalog.TENANT_ANALYTICS_READ,
                PermissionCatalog.TENANT_ANALYTICS_EXPORT,
                PermissionCatalog.TENANT_REPORTS_READ,
                PermissionCatalog.TENANT_REPORTS_EXPORT,
                PermissionCatalog.TENANT_BRANCHES_READ,
                PermissionCatalog.TENANT_TICKETS_READ
            )
        ),
        new TenantRoleTemplate(
            "BARTENDER_LEAD",
            "Bartender Lead",
            "Lider operativo de barra.",
            Set.of(
                PermissionCatalog.TENANT_DASHBOARD_READ,
                PermissionCatalog.TENANT_MENU_READ,
                PermissionCatalog.TENANT_AVAILABILITY_READ,
                PermissionCatalog.TENANT_AVAILABILITY_WRITE,
                PermissionCatalog.TENANT_TICKETS_WRITE
            )
        ),
        new TenantRoleTemplate(
            "STAFF",
            "Staff",
            "Operacion general local.",
            Set.of(
                PermissionCatalog.TENANT_DASHBOARD_READ,
                PermissionCatalog.TENANT_MENU_READ,
                PermissionCatalog.TENANT_AVAILABILITY_READ
            )
        ),
        new TenantRoleTemplate(
            "WAITER",
            "Waiter / Mesero",
            "Operacion de sala y mesa.",
            Set.of(
                PermissionCatalog.TENANT_DASHBOARD_READ,
                PermissionCatalog.TENANT_MENU_READ
            )
        ),
        new TenantRoleTemplate(
            "HOST",
            "Host / Recepcion",
            "Atencion de recepcion y acceso.",
            Set.of(
                PermissionCatalog.TENANT_MENU_READ,
                PermissionCatalog.TENANT_QR_READ
            )
        ),
        new TenantRoleTemplate(
            "CASHIER",
            "Cashier",
            "Operacion de caja y cierre local.",
            Set.of(
                PermissionCatalog.TENANT_DASHBOARD_READ,
                PermissionCatalog.TENANT_REPORTS_READ
            )
        ),
        new TenantRoleTemplate(
            "MARKETING_MANAGER",
            "Marketing Manager",
            "Campanas y activacion comercial.",
            Set.of(
                PermissionCatalog.TENANT_ANALYTICS_READ,
                PermissionCatalog.TENANT_CAMPAIGNS_READ,
                PermissionCatalog.TENANT_CAMPAIGNS_WRITE,
                PermissionCatalog.TENANT_LOYALTY_READ
            )
        )
    );

    private TenantRoleCatalog() {
    }

    public static List<TenantRoleTemplate> templates() {
        return TEMPLATES;
    }
}
