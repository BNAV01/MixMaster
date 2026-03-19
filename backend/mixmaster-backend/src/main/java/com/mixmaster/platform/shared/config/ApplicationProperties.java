package com.mixmaster.platform.shared.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mixmaster")
public class ApplicationProperties {

    private final Tenant tenant = new Tenant();
    private final Cors cors = new Cors();
    private final Security security = new Security();
    private final RateLimit rateLimit = new RateLimit();
    private final Audit audit = new Audit();

    public Tenant getTenant() {
        return tenant;
    }

    public Cors getCors() {
        return cors;
    }

    public Security getSecurity() {
        return security;
    }

    public RateLimit getRateLimit() {
        return rateLimit;
    }

    public Audit getAudit() {
        return audit;
    }

    public static class Tenant {
        private String headerName = "X-Tenant-Key";
        private String brandHeaderName = "X-Brand-Key";
        private String branchHeaderName = "X-Branch-Key";

        public String getHeaderName() {
            return headerName;
        }

        public void setHeaderName(String headerName) {
            this.headerName = headerName;
        }

        public String getBrandHeaderName() {
            return brandHeaderName;
        }

        public void setBrandHeaderName(String brandHeaderName) {
            this.brandHeaderName = brandHeaderName;
        }

        public String getBranchHeaderName() {
            return branchHeaderName;
        }

        public void setBranchHeaderName(String branchHeaderName) {
            this.branchHeaderName = branchHeaderName;
        }
    }

    public static class Cors {
        private List<String> allowedOriginPatterns = new ArrayList<>(List.of("http://localhost:*"));

        public List<String> getAllowedOriginPatterns() {
            return allowedOriginPatterns;
        }

        public void setAllowedOriginPatterns(List<String> allowedOriginPatterns) {
            this.allowedOriginPatterns = allowedOriginPatterns;
        }
    }

    public static class Security {
        private final Bootstrap bootstrap = new Bootstrap();

        public Bootstrap getBootstrap() {
            return bootstrap;
        }

        public static class Bootstrap {
            private boolean enabled;
            private String consumerUsername = "consumer.local";
            private String consumerPassword = "change-me";
            private String tenantUsername = "tenant.local";
            private String tenantPassword = "change-me";
            private String platformUsername = "platform.local";
            private String platformPassword = "change-me";

            public boolean isEnabled() {
                return enabled;
            }

            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }

            public String getConsumerUsername() {
                return consumerUsername;
            }

            public void setConsumerUsername(String consumerUsername) {
                this.consumerUsername = consumerUsername;
            }

            public String getConsumerPassword() {
                return consumerPassword;
            }

            public void setConsumerPassword(String consumerPassword) {
                this.consumerPassword = consumerPassword;
            }

            public String getTenantUsername() {
                return tenantUsername;
            }

            public void setTenantUsername(String tenantUsername) {
                this.tenantUsername = tenantUsername;
            }

            public String getTenantPassword() {
                return tenantPassword;
            }

            public void setTenantPassword(String tenantPassword) {
                this.tenantPassword = tenantPassword;
            }

            public String getPlatformUsername() {
                return platformUsername;
            }

            public void setPlatformUsername(String platformUsername) {
                this.platformUsername = platformUsername;
            }

            public String getPlatformPassword() {
                return platformPassword;
            }

            public void setPlatformPassword(String platformPassword) {
                this.platformPassword = platformPassword;
            }
        }
    }

    public static class RateLimit {
        private boolean enabled = true;
        private int loginPerMinute = 20;
        private int writePerMinute = 120;
        private int statusPerMinute = 240;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public int getLoginPerMinute() {
            return loginPerMinute;
        }

        public void setLoginPerMinute(int loginPerMinute) {
            this.loginPerMinute = loginPerMinute;
        }

        public int getWritePerMinute() {
            return writePerMinute;
        }

        public void setWritePerMinute(int writePerMinute) {
            this.writePerMinute = writePerMinute;
        }

        public int getStatusPerMinute() {
            return statusPerMinute;
        }

        public void setStatusPerMinute(int statusPerMinute) {
            this.statusPerMinute = statusPerMinute;
        }
    }

    public static class Audit {
        private boolean enabled = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }
}
