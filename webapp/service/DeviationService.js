sap.ui.define([], function () {
    "use strict";

    var MOCK_ALERT_HEADERS = [
        {
            alertId: "ALT-1001",
            controlId: "NLG08",
            controlName: "Basis Kernel Audit Logging & Parameter Validation",
            system: "MY8",
            client: "100",
            sector: "MedTech",
            region: "North America",
            platform: "USROTC",
            status: "Open",
            severity: "Critical",
            deviationCount: 3,
            alertDate: "2026-08-10",
            description: "Kernel parameter rsdb/ssfs_connect changed outside maintenance window."
        },
        {
            alertId: "ALT-1002",
            controlId: "NLG01",
            controlName: "SAP System Security Baseline & Parameter Enforcement",
            system: "DEV",
            client: "000",
            sector: "MedTech",
            region: "North America",
            platform: "USROTC",
            status: "Open",
            severity: "High",
            deviationCount: 2,
            alertDate: "2026-08-09",
            description: "Super User account J2EE_ADMIN logged in directly with default password."
        },
        {
            alertId: "ALT-1003",
            controlId: "XYRA-08",
            controlName: "SAP Java Audit Log Filters & Security Event Monitoring",
            system: "QAS",
            client: "200",
            sector: "Pharma",
            region: "EMEA",
            platform: "EUROTC",
            status: "Resolved",
            severity: "High",
            deviationCount: 1,
            alertDate: "2026-08-08",
            description: "Audit log filter #4 deactivated during transport import."
        },
        {
            alertId: "ALT-1004",
            controlId: "XYRA-28",
            controlName: "SAP HANA Security Audit Logging & Retention Check",
            system: "PRD",
            client: "100",
            sector: "Pharma",
            region: "EMEA",
            platform: "EUROTC",
            status: "Resolved",
            severity: "Medium",
            deviationCount: 4,
            alertDate: "2026-08-07",
            description: "HANA audit trail file size exceeded 80% threshold without rotation."
        },
        {
            alertId: "ALT-1005",
            controlId: "XYRA-01",
            controlName: "Segregation of Duties (SoD) Conflict Scan & Privilege Escalation",
            system: "MP8",
            client: "300",
            sector: "Consumer Health",
            region: "APAC",
            platform: "APROTC",
            status: "In Progress",
            severity: "High",
            deviationCount: 2,
            alertDate: "2026-08-06",
            description: "Role SAP_ALL assigned to non-dialog user ADSUSER in client 300."
        },
        {
            alertId: "ALT-1006",
            controlId: "XYRA-002",
            controlName: "Financial Journal Entry Threshold Audit & PO Limit Verification",
            system: "asmy0801",
            client: "100",
            sector: "Consumer Health",
            region: "APAC",
            platform: "APROTC",
            status: "Resolved",
            severity: "Medium",
            deviationCount: 1,
            alertDate: "2026-08-05",
            description: "PO limit override without dual authorization approval."
        },
        {
            alertId: "ALT-1007",
            controlId: "XYRA-003",
            controlName: "Automated Kernel Audit Logging & Parameter Validation",
            system: "MQ8",
            client: "001",
            sector: "Corporate",
            region: "LATAM",
            platform: "GLOBAL",
            status: "Open",
            severity: "Low",
            deviationCount: 1,
            alertDate: "2026-08-04",
            description: "Update tool SUM executed without active change request reference."
        }
    ];

    var MOCK_ALERT_ITEMS = {
        "ALT-1001": [
            {
                itemId: "ITM-101",
                sapObject: "SDMI_*",
                parameter: "Update Tool",
                operator: "Equals",
                expectedValue: "SUM (SAP Upgrade Manager)",
                actualValue: "SWPM (Software Provisioning Manager)",
                status: "Critical",
                timestamp: "2026-08-10 14:32:05",
                details: "Unauthorized software provisioning tool execution detected on MY8 client 100."
            },
            {
                itemId: "ITM-102",
                sapObject: "SAP*",
                parameter: "Password Changed",
                operator: "Equals",
                expectedValue: "Yes",
                actualValue: "No",
                status: "Critical",
                timestamp: "2026-08-10 14:32:06",
                details: "SAP* password change date not updated after system copy."
            },
            {
                itemId: "ITM-103",
                sapObject: "DDIC",
                parameter: "Locked",
                operator: "Equals",
                expectedValue: "Yes",
                actualValue: "No (Unlocked)",
                status: "High",
                timestamp: "2026-08-10 14:35:12",
                details: "DDIC account remains unlocked after maintenance window closed."
            }
        ],
        "ALT-1002": [
            {
                itemId: "ITM-201",
                sapObject: "J2EE_ADMIN",
                parameter: "User Type",
                operator: "Equals",
                expectedValue: "B (System User)",
                actualValue: "A (Dialog User)",
                status: "Critical",
                timestamp: "2026-08-09 09:15:22",
                details: "J2EE_ADMIN user type changed from System to Dialog."
            },
            {
                itemId: "ITM-202",
                sapObject: "J2EE_ADMIN",
                parameter: "Super User",
                operator: "Not Equals",
                expectedValue: "SUPER",
                actualValue: "SUPER",
                status: "High",
                timestamp: "2026-08-09 09:16:00",
                details: "J2EE_ADMIN assigned SUPER privilege escalation group."
            }
        ],
        "ALT-1003": [
            {
                itemId: "ITM-301",
                sapObject: "SAPJSF",
                parameter: "Security Policy",
                operator: "Equals",
                expectedValue: "Z_NOEXPIRY",
                actualValue: "DEFAULT",
                status: "Medium",
                timestamp: "2026-08-08 11:20:00",
                details: "Security policy fallback detected on SAPJSF."
            }
        ],
        "ALT-1004": [
            {
                itemId: "ITM-401",
                sapObject: "EARLYWATCH",
                parameter: "Locked",
                operator: "Equals",
                expectedValue: "Yes",
                actualValue: "No",
                status: "Medium",
                timestamp: "2026-08-07 16:45:10",
                details: "EARLYWATCH account unlocked without valid ticket."
            }
        ],
        "ALT-1005": [
            {
                itemId: "ITM-501",
                sapObject: "ADSUSER",
                parameter: "Roles Assigned",
                operator: "Not Contains",
                expectedValue: "SAP_ALL",
                actualValue: "SAP_ALL, S_A.TMSADM",
                status: "High",
                timestamp: "2026-08-06 10:10:33",
                details: "ADSUSER assigned SAP_ALL composite role."
            }
        ],
        "ALT-1006": [
            {
                itemId: "ITM-601",
                sapObject: "WF-BATCH",
                parameter: "Failed Logins",
                operator: "Less Than or Equal",
                expectedValue: "3",
                actualValue: "12",
                status: "Medium",
                timestamp: "2026-08-05 08:05:14",
                details: "12 consecutive failed login attempts detected for WF-BATCH."
            }
        ],
        "ALT-1007": [
            {
                itemId: "ITM-701",
                sapObject: "TMSADM",
                parameter: "Update Tool",
                operator: "Equals",
                expectedValue: "None",
                actualValue: "SUM (SAP Upgrade Manager)",
                status: "Low",
                timestamp: "2026-08-04 18:00:00",
                details: "SUM tool execution logged under TMSADM."
            }
        ]
    };

    return {
        queryDeviations: function (oFilters) {
            oFilters = oFilters || {};

            var aFiltered = MOCK_ALERT_HEADERS.filter(function (item) {
                if (oFilters.sector && oFilters.sector !== "All" && item.sector !== oFilters.sector) {
                    return false;
                }
                if (oFilters.region && oFilters.region !== "All" && item.region !== oFilters.region) {
                    return false;
                }
                if (oFilters.platform && oFilters.platform !== "All" && item.platform !== oFilters.platform) {
                    return false;
                }
                if (oFilters.system && oFilters.system !== "All" && item.system !== oFilters.system) {
                    return false;
                }
                if (oFilters.client && oFilters.client !== "All" && item.client !== oFilters.client) {
                    return false;
                }
                if (oFilters.control && oFilters.control !== "All" && item.controlId !== oFilters.control) {
                    return false;
                }
                if (oFilters.status && oFilters.status !== "All" && item.status !== oFilters.status) {
                    return false;
                }
                if (oFilters.startDate && item.alertDate < oFilters.startDate) {
                    return false;
                }
                if (oFilters.endDate && item.alertDate > oFilters.endDate) {
                    return false;
                }
                return true;
            });

            var iTotalIncidents = 0;
            var iOpenItems = 0;
            var iResolvedItems = 0;
            var iCriticalCount = 0;
            var iHighCount = 0;
            var iMediumCount = 0;
            var iLowCount = 0;

            var mControlSet = {};

            aFiltered.forEach(function (h) {
                iTotalIncidents += h.deviationCount;
                mControlSet[h.controlId] = true;

                if (h.status === "Open" || h.status === "In Progress") {
                    iOpenItems += h.deviationCount;
                } else if (h.status === "Resolved") {
                    iResolvedItems += h.deviationCount;
                }

                if (h.severity === "Critical") { iCriticalCount += h.deviationCount; }
                else if (h.severity === "High") { iHighCount += h.deviationCount; }
                else if (h.severity === "Medium") { iMediumCount += h.deviationCount; }
                else if (h.severity === "Low") { iLowCount += h.deviationCount; }
            });

            var iAuditedControls = Object.keys(mControlSet).length;

            return {
                headers: aFiltered,
                totalRecords: aFiltered.length,
                kpi: {
                    totalIncidents: iTotalIncidents,
                    openItems: iOpenItems,
                    resolvedItems: iResolvedItems,
                    auditedControls: iAuditedControls,
                    complianceRate: iTotalIncidents > 0 ? Math.round((iResolvedItems / iTotalIncidents) * 100) + "%" : "100%"
                },
                statusDistribution: [
                    { status: "Open", count: iOpenItems },
                    { status: "Resolved", count: iResolvedItems },
                    { status: "Pending", count: Math.max(0, iTotalIncidents - iOpenItems - iResolvedItems) }
                ],
                severitySummary: {
                    critical: iCriticalCount,
                    high: iHighCount,
                    medium: iMediumCount,
                    low: iLowCount
                }
            };
        },

        getAlertDetails: function (sAlertId, sControlId) {
            var oHeader = MOCK_ALERT_HEADERS.find(function (h) {
                return h.alertId === sAlertId || h.controlId === sControlId;
            }) || MOCK_ALERT_HEADERS[0];

            var aItems = MOCK_ALERT_ITEMS[oHeader.alertId] || MOCK_ALERT_ITEMS["ALT-1001"];

            return {
                header: oHeader,
                items: aItems
            };
        }
    };
});
