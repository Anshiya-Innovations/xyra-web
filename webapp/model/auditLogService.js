sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    var oAuditLogModel = null;

    var aInitialLogs = [
        {
            logId: "LOG-2026-008",
            timestamp: "2026-08-12 16:42:10",
            adminUser: "admin@xyra.com (System Admin)",
            action: "Create",
            module: "Control Management",
            objectId: "XYRA-28",
            description: "Created new Security Control Master rule for SAP HANA Security Audit Logging.",
            previousValue: "None (New Record)",
            newValue: "Control ID: XYRA-28 | System: PRD | Freq: Weekly (Every Monday) | Rules: 2",
            result: "Success",
            resultState: "Success"
        },
        {
            logId: "LOG-2026-007",
            timestamp: "2026-08-12 15:18:45",
            adminUser: "admin@xyra.com (System Admin)",
            action: "Update",
            module: "Control Management",
            objectId: "XYRA-08",
            description: "Updated Execution Frequency for SAP Java Audit Log Filters & Security Event Monitoring.",
            previousValue: "Frequency: Monthly (Last day of month) | Total Run: 12",
            newValue: "Frequency: Daily | Total Run: 365",
            result: "Success",
            resultState: "Success"
        },
        {
            logId: "LOG-2026-006",
            timestamp: "2026-08-12 14:05:22",
            adminUser: "sysadmin@xyra.com (Security Manager)",
            action: "Delete",
            module: "Control Management",
            objectId: "XYRA-OLD-01",
            description: "Deleted deprecated security control master rule XYRA-OLD-01.",
            previousValue: "Control ID: XYRA-OLD-01 | Status: Obsolete",
            newValue: "Record Deleted",
            result: "Success",
            resultState: "Success"
        },
        {
            logId: "LOG-2026-005",
            timestamp: "2026-08-12 11:30:00",
            adminUser: "admin@xyra.com (System Admin)",
            action: "Configuration Change",
            module: "System Configuration",
            objectId: "CFG-SCS-99",
            description: "Enforced mandatory TLS 1.3 encryption for SAP HANA audit logs extraction endpoint.",
            previousValue: "TLS_VERSION = 1.2 | ENFORCE_SSL = Optional",
            newValue: "TLS_VERSION = 1.3 | ENFORCE_SSL = Strict",
            result: "Success",
            resultState: "Success"
        },
        {
            logId: "LOG-2026-004",
            timestamp: "2026-08-11 18:22:14",
            adminUser: "secops@xyra.com (Escalation Manager)",
            action: "Access Grant",
            module: "Access Management",
            objectId: "USR-REV-104",
            description: "Granted Reviewer Level 2 privileges to user J.Doe@forte.com for SOX Basis Audit.",
            previousValue: "Role: Standard User | Scope: Read-Only",
            newValue: "Role: Reviewer Level 2 | Scope: Deviation Approval",
            result: "Success",
            resultState: "Success"
        },
        {
            logId: "LOG-2026-003",
            timestamp: "2026-08-11 16:10:05",
            adminUser: "admin@xyra.com (System Admin)",
            action: "Update",
            module: "Control Management",
            objectId: "NLG01",
            description: "Modified parameter validation rules for SAP System Security Baseline & Parameter Enforcement.",
            previousValue: "Parameter: Password Changed | Expected: 90 Days",
            newValue: "Parameter: Password Changed | Expected: 60 Days",
            result: "Success",
            resultState: "Success"
        },
        {
            logId: "LOG-2026-002",
            timestamp: "2026-08-11 10:00:00",
            adminUser: "sysadmin@xyra.com (Security Manager)",
            action: "Configuration Change",
            module: "System Configuration",
            objectId: "CFG-AUTH-02",
            description: "Updated Admin Session Timeout setting from 30 minutes to 15 minutes.",
            previousValue: "SESSION_TIMEOUT = 30",
            newValue: "SESSION_TIMEOUT = 15",
            result: "Success",
            resultState: "Success"
        },
        {
            logId: "LOG-2026-001",
            timestamp: "2026-08-10 09:15:30",
            adminUser: "admin@xyra.com (System Admin)",
            action: "Create",
            module: "Control Management",
            objectId: "XYRA-003",
            description: "Created Security Control Master rule for Automated Kernel Audit Logging & Parameter Validation.",
            previousValue: "None (New Record)",
            newValue: "Control ID: XYRA-003 | System: DEV, QAS, PRD | Freq: Cron Expression",
            result: "Success",
            resultState: "Success"
        }
    ];

    return {
        getModel: function () {
            if (!oAuditLogModel) {
                oAuditLogModel = new JSONModel({
                    logs: aInitialLogs,
                    allLogs: aInitialLogs,
                    isAdmin: true,
                    selectedLog: null,
                    filters: {
                        searchQuery: "",
                        action: "All",
                        module: "All",
                        adminUser: "All",
                        startDate: null,
                        endDate: null
                    }
                });
            }
            return oAuditLogModel;
        },

        addLog: function (oLogEntry) {
            var oModel = this.getModel();
            var aLogs = oModel.getProperty("/allLogs") || [];

            var dNow = new Date();
            var sTimestamp = dNow.getFullYear() + "-" +
                String(dNow.getMonth() + 1).padStart(2, "0") + "-" +
                String(dNow.getDate()).padStart(2, "0") + " " +
                String(dNow.getHours()).padStart(2, "0") + ":" +
                String(dNow.getMinutes()).padStart(2, "0") + ":" +
                String(dNow.getSeconds()).padStart(2, "0");

            var sNewId = "LOG-2026-" + String(aLogs.length + 1).padStart(3, "0");

            var oNewLog = {
                logId: sNewId,
                timestamp: sTimestamp,
                adminUser: oLogEntry.adminUser || "admin@xyra.com (System Admin)",
                action: oLogEntry.action || "Update",
                module: oLogEntry.module || "Control Management",
                objectId: oLogEntry.objectId || "XYRA-01",
                description: oLogEntry.description || "Admin action performed.",
                previousValue: oLogEntry.previousValue || "N/A",
                newValue: oLogEntry.newValue || "N/A",
                result: oLogEntry.result || "Success",
                resultState: oLogEntry.result === "Failure" ? "Error" : (oLogEntry.result === "Warning" ? "Warning" : "Success")
            };

            aLogs.unshift(oNewLog);
            oModel.setProperty("/allLogs", aLogs);
            oModel.setProperty("/logs", aLogs.slice());
        }
    };
});
