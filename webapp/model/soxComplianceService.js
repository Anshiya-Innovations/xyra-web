sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    var oSoxModel = null;

    var oInitialData = {
        kpis: {
            totalControls: 24,
            automatedControls: 18,
            openDeviations: 3,
            complianceScore: "98.4%",
            criticalIssues: 1
        },
        chartData: [
            { category: "Compliant", count: 20, state: "Success" },
            { category: "Non-Compliant", count: 3, state: "Error" },
            { category: "Pending Review", count: 1, state: "Warning" }
        ],
        alertSummary: {
            critical: 1,
            high: 2,
            medium: 4,
            low: 1,
            totalAlerts: 8
        },
        controls: [
            {
                controlId: "SOX-01",
                description: "Default Password Protection - SAP* & DDIC Users",
                system: "PRD",
                client: "100",
                frequency: "Daily",
                status: "Compliant",
                statusState: "Success",
                deviationCount: 0,
                risk: "Critical",
                riskState: "Error",
                lastRun: "2026-08-12 00:00:00",
                automated: true,
                category: "Access Control",
                owner: "Security Administration Team",
                soxScope: "SOX Section 404 - Access Control & Authentication",
                rules: [
                    { sapObject: "SAP*", client: "100", parameter: "login/no_automatic_user_sapstar", operator: "EQUALS", expectedValue: "1", status: "PASS" },
                    { sapObject: "DDIC", client: "100", parameter: "login/password_downwards_compatibility", operator: "EQUALS", expectedValue: "0", status: "PASS" }
                ],
                notes: "Default superuser accounts are locked and automatic login is disabled across all production clients."
            },
            {
                controlId: "SOX-02",
                description: "Segregation of Duties (SOD) Conflict Detection",
                system: "PRD",
                client: "100",
                frequency: "Realtime",
                status: "Non-Compliant",
                statusState: "Error",
                deviationCount: 2,
                risk: "Critical",
                riskState: "Error",
                lastRun: "2026-08-12 14:30:00",
                automated: true,
                category: "SOD Management",
                owner: "GRC & SOD Risk Management",
                soxScope: "SOX Section 404 - Segregation of Financial Duties",
                rules: [
                    { sapObject: "SOD_ADMIN", client: "100", parameter: "AUTH_CHECK_FB01_F110", operator: "NOT_EQUALS", expectedValue: "CONFLICT", status: "FAIL" },
                    { sapObject: "SAP_ALL", client: "100", parameter: "S_TABU_DIS", operator: "NOT_EQUALS", expectedValue: "FULL_ACCESS", status: "FAIL" }
                ],
                notes: "Detected 2 active users with conflicting Vendor Payment (F110) and Journal Posting (FB01) authorizations. Escalated to Reviewer 1."
            },
            {
                controlId: "SOX-03",
                description: "Superuser & Emergency Access Logging (Firefighter)",
                system: "PRD",
                client: "100",
                frequency: "Daily",
                status: "Compliant",
                statusState: "Success",
                deviationCount: 0,
                risk: "High",
                riskState: "Warning",
                lastRun: "2026-08-12 01:00:00",
                automated: true,
                category: "Privileged Access",
                owner: "SAP Basis & GRC Emergency Access",
                soxScope: "SOX Section 404 - Privileged Access Monitoring",
                rules: [
                    { sapObject: "FF_USER_*", client: "100", parameter: "rec/client", operator: "EQUALS", expectedValue: "ALL", status: "PASS" },
                    { sapObject: "SPROUT", client: "100", parameter: "audit/journal_sync", operator: "EQUALS", expectedValue: "ENABLED", status: "PASS" }
                ],
                notes: "All Emergency Access Firefighter sessions in client 100 were logged with verified manager sign-off."
            },
            {
                controlId: "SOX-04",
                description: "SAP HANA Audit Logging & Parameter Verification",
                system: "PRD",
                client: "000",
                frequency: "Weekly (Every Monday)",
                status: "Compliant",
                statusState: "Success",
                deviationCount: 0,
                risk: "High",
                riskState: "Warning",
                lastRun: "2026-08-10 02:00:00",
                automated: true,
                category: "System Audit",
                owner: "HANA Database Administration",
                soxScope: "SOX Section 404 - System Audit Integrity",
                rules: [
                    { sapObject: "HDB_PRD", client: "000", parameter: "global.ini -> auditing status", operator: "EQUALS", expectedValue: "ON", status: "PASS" }
                ],
                notes: "SAP HANA audit policy verified active and writing directly to encrypted syslog."
            },
            {
                controlId: "SOX-05",
                description: "Basis System Change Option & Client Copy Restrictions",
                system: "QAS",
                client: "200",
                frequency: "Daily",
                status: "Pending Review",
                statusState: "Warning",
                deviationCount: 1,
                risk: "Medium",
                riskState: "Warning",
                lastRun: "2026-08-12 03:00:00",
                automated: false,
                category: "Change Management",
                owner: "SAP Basis Infrastructure Team",
                soxScope: "SOX Section 404 - Change Management Controls",
                rules: [
                    { sapObject: "SCC4", client: "200", parameter: "Client Changes", operator: "EQUALS", expectedValue: "NO_CHANGES", status: "WARNING" }
                ],
                notes: "Temporary client change option opened during QAS refresh; pending post-refresh lock confirmation."
            },
            {
                controlId: "SOX-06",
                description: "SAP Profile Parameter Security Verification",
                system: "PRD",
                client: "100",
                frequency: "Daily",
                status: "Compliant",
                statusState: "Success",
                deviationCount: 0,
                risk: "Medium",
                riskState: "Warning",
                lastRun: "2026-08-12 04:00:00",
                automated: true,
                category: "Config Security",
                owner: "System Architecture Team",
                soxScope: "SOX Section 404 - Profile Configuration Standards",
                rules: [
                    { sapObject: "DEFAULT.PFL", client: "100", parameter: "gw/sec_info", operator: "EQUALS", expectedValue: "$(DIR_DATA)/secinfo", status: "PASS" }
                ],
                notes: "All 18 mandatory profile parameters conform to SAP security hardening baseline."
            },
            {
                controlId: "SOX-07",
                description: "Sensitive Transaction Code (T-Code) Access Review",
                system: "DEV",
                client: "001",
                frequency: "Monthly (Last day of month)",
                status: "Compliant",
                statusState: "Success",
                deviationCount: 0,
                risk: "Low",
                riskState: "None",
                lastRun: "2026-07-31 23:59:00",
                automated: true,
                category: "Access Review",
                owner: "Internal Audit & Access Governance",
                soxScope: "SOX Section 404 - Periodic Access Certification",
                rules: [
                    { sapObject: "DEV_USERS", client: "001", parameter: "SCC4_S_TABU_CLI", operator: "EQUALS", expectedValue: "RESTRICTED", status: "PASS" }
                ],
                notes: "Monthly authorization review completed for all sensitive developer access roles."
            },
            {
                controlId: "SOX-08",
                description: "Background Job Authorization & Service User Access",
                system: "PRD",
                client: "100",
                frequency: "Daily",
                status: "Non-Compliant",
                statusState: "Error",
                deviationCount: 1,
                risk: "High",
                riskState: "Warning",
                lastRun: "2026-08-12 05:00:00",
                automated: true,
                category: "Batch Jobs",
                owner: "Batch Operations & Basis Team",
                soxScope: "SOX Section 404 - Batch Processing & Job Execution",
                rules: [
                    { sapObject: "BTC_USER", client: "100", parameter: "S_PROGRAM -> P_ACTION", operator: "EQUALS", expectedValue: "SUBMIT_ONLY", status: "FAIL" }
                ],
                notes: "Detected batch service user executing with SAP_ALL authorization in PRD client 100."
            }
        ]
    };

    return {
        getModel: function () {
            if (!oSoxModel) {
                oSoxModel = new JSONModel(JSON.parse(JSON.stringify(oInitialData)));
            }
            return oSoxModel;
        },

        refreshData: function () {
            if (oSoxModel) {
                oSoxModel.setData(JSON.parse(JSON.stringify(oInitialData)));
            }
        }
    };
});
