sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "xyraweb/model/GlobalLoading"
], function (
    Controller,
    UIComponent,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    GlobalLoading
) {
    "use strict";

    return Controller.extend("xyraweb.controller.Auditor", {

        onInit: function () {
            this._loadAuditorData();
        },

        _loadAuditorData: function () {
            var oData = {
                kpis: {
                    active: 12,
                    completed: 88,
                    critical: 2,
                    open: 3,
                    score: 96.8,
                    progress: 82
                },
                remediationKpis: {
                    open: 3,
                    verified: 42,
                    underReview: 5
                },
                historyKpis: {
                    passed: 88,
                    archived: 88,
                    avgRemediationTime: "3.2 Days"
                },
                audits: [
                    {
                        logId: "LOG-2026-088",
                        timestamp: "2026-08-12 16:42:10",
                        performedBy: "admin@xyra.com",
                        role: "System Admin",
                        action: "Create",
                        actionState: "Success",
                        module: "Control Management",
                        objectId: "XYRA-28",
                        description: "Created new Security Control Master rule for SAP HANA Security Audit Logging.",
                        result: "Success",
                        resultState: "Success",
                        previousValue: "N/A (New Entry)",
                        newValue: "Rule ID: XYRA-28 | Target: HANA DB | Frequency: Continuous",
                        checksumHash: "0xa8f4b1e9c2",
                        auditId: "AUD-101",
                        controlId: "SOX-001",
                        application: "SAP ECC",
                        businessProcess: "User Access Review & Authorization",
                        businessUser: "John Smith",
                        controlOwner: "Reviewer 2 (Technical Team)",
                        risk: "Low",
                        riskState: "Success",
                        riskIcon: "sap-icon://sys-enter",
                        compliancePercent: 98,
                        complianceStatus: "Compliant",
                        complianceState: "Success",
                        scopeDescription: "Evaluation of quarterly SAP ECC user access privileges, PFCG role assignments, and privileged BASIS user activities.",
                        testedTCodes: "PFCG, SU01, SM20, ST03N",
                        sampleSize: "250 User Accounts Sampled across Production Systems",
                        findingsSummary: "No SOD conflicts identified. All access requests approved per Delegation of Authority policy.",
                        evidenceStatus: "Verified & Sealed",
                        auditStatus: "Completed",
                        auditorNotes: "SOX-001 control operating effectively. Audit trail hash verified."
                    },
                    {
                        logId: "LOG-2026-087",
                        timestamp: "2026-08-12 15:18:45",
                        performedBy: "reviewer2@xyra.com",
                        role: "Reviewer 2 (Technical Team)",
                        action: "Review Sign-Off",
                        actionState: "Success",
                        module: "Reviewer 2 Queue",
                        objectId: "TCK-1002",
                        description: "Technical review completed for Firefighter log SOD violation #882. Forwarded for sign-off.",
                        result: "Success",
                        resultState: "Success",
                        previousValue: "Status: Pending Tech Review",
                        newValue: "Status: Tech Review Completed | Reviewer 2 Approved",
                        checksumHash: "0xb7c3d2e1f4",
                        auditId: "AUD-102",
                        controlId: "SOX-002",
                        application: "SAP S/4HANA",
                        businessProcess: "Emergency Access Log & Firefighter Audit",
                        businessUser: "Jane Doe",
                        controlOwner: "Reviewer 1 (Manual Team)",
                        risk: "High",
                        riskState: "Error",
                        riskIcon: "sap-icon://alert",
                        compliancePercent: 65,
                        complianceStatus: "Non-Compliant",
                        complianceState: "Warning",
                        scopeDescription: "Audit of SAP S/4HANA Firefighter privileged session logs, SPM access requests, and log review sign-offs.",
                        testedTCodes: "SPM, /n/VIRSA/ZVFAT, SU53",
                        sampleSize: "14 Emergency Sessions Audited",
                        findingsSummary: "Unassigned SOD conflict detected during Firefighter session ID FF_BASIS_01. Missing manager sign-off for session #882.",
                        evidenceStatus: "Action Required",
                        auditStatus: "In Progress",
                        auditorNotes: "High risk finding raised for unverified emergency log. Remediation pending."
                    },
                    {
                        logId: "LOG-2026-086",
                        timestamp: "2026-08-12 14:05:22",
                        performedBy: "escalation@xyra.com",
                        role: "Escalation Manager",
                        action: "Escalation Approval",
                        actionState: "Success",
                        module: "Escalation Manager Queue",
                        objectId: "TCK-1005",
                        description: "Discrepancy resolved for HANA DB parameter retention buffer. Approved remediation plan.",
                        result: "Success",
                        resultState: "Success",
                        previousValue: "Status: Escalated | Discrepancy Flagged",
                        newValue: "Status: Approved & Closed | Remediation Verified",
                        checksumHash: "0xc6d5e4f3a2",
                        auditId: "AUD-103",
                        controlId: "PAR-104",
                        system: "HANA DB",
                        application: "HANA DB",
                        businessProcess: "Database Audit Logging & Parameter Inspection",
                        businessUser: "David Lead",
                        controlOwner: "Escalation Manager",
                        risk: "Medium",
                        riskState: "Warning",
                        riskIcon: "sap-icon://warning",
                        compliancePercent: 88,
                        complianceStatus: "Compliant",
                        complianceState: "Success",
                        scopeDescription: "Inspection of SAP HANA database audit policies, log retention limits, and system parameters.",
                        testedTCodes: "HANA Cockpit, ALTER SYSTEM, AUDIT POLICIES",
                        sampleSize: "12 Database Audit Policies Inspected",
                        findingsSummary: "Audit trail log buffer retention set to 30 days instead of recommended 90 days. Parameter remediated.",
                        evidenceStatus: "Verified & Sealed",
                        auditStatus: "Completed",
                        auditorNotes: "Remediation verified by Security Team Lead. Buffer updated to 90 days."
                    },
                    {
                        logId: "LOG-2026-085",
                        timestamp: "2026-08-12 11:30:00",
                        performedBy: "admin@xyra.com",
                        role: "System Admin",
                        action: "Configuration Change",
                        actionState: "Warning",
                        module: "System Configuration",
                        objectId: "CFG-SCS-99",
                        description: "Enforced mandatory TLS 1.3 encryption for SAP HANA audit logs extraction endpoint.",
                        result: "Success",
                        resultState: "Success",
                        previousValue: "TLS 1.2 (Legacy)",
                        newValue: "TLS 1.3 (Strict Enforced)",
                        checksumHash: "0xd5e4f3a2b1"
                    },
                    {
                        logId: "LOG-2026-084",
                        timestamp: "2026-08-11 18:22:14",
                        performedBy: "secops@xyra.com",
                        role: "Escalation Manager",
                        action: "Access Grant",
                        actionState: "Information",
                        module: "Access Management",
                        objectId: "USR-REV-104",
                        description: "Granted Reviewer Level 2 privileges to user J.Doe@forte.com for SOX Basis Audit.",
                        result: "Success",
                        resultState: "Success",
                        previousValue: "Role: Reviewer Level 1",
                        newValue: "Role: Reviewer Level 2",
                        checksumHash: "0xe4f3a2b1c0"
                    },
                    {
                        logId: "LOG-2026-083",
                        timestamp: "2026-08-11 16:10:05",
                        performedBy: "reviewer1@xyra.com",
                        role: "Reviewer 1 (Manual Team)",
                        action: "Review Sign-Off",
                        actionState: "Success",
                        module: "Reviewer 1 Queue",
                        objectId: "TCK-1001",
                        description: "Initial technical verification completed for SAP ECC role assignment sample.",
                        result: "Passed",
                        resultState: "Success",
                        previousValue: "Status: Unassigned Queue",
                        newValue: "Status: Level 1 Verified",
                        checksumHash: "0xf3a2b1c0d9"
                    },
                    {
                        logId: "LOG-2026-082",
                        timestamp: "2026-08-11 10:00:00",
                        performedBy: "auditor@xyra.com",
                        role: "Internal Auditor",
                        action: "Update",
                        actionState: "Information",
                        module: "Auditor Governance",
                        objectId: "AUD-102",
                        description: "Updated findings summary and evidence verification notes for Firefighter SOD finding.",
                        result: "In Progress",
                        resultState: "Warning",
                        previousValue: "Status: Draft Finding",
                        newValue: "Status: Verified & Action Required",
                        checksumHash: "0xa1b2c3d4e5"
                    },
                    {
                        logId: "LOG-2026-081",
                        timestamp: "2026-08-10 09:15:30",
                        performedBy: "admin@xyra.com",
                        role: "System Admin",
                        action: "Create",
                        actionState: "Success",
                        module: "Control Management",
                        objectId: "XYRA-003",
                        description: "Created Security Control Master rule for Automated Kernel Audit Logging & Parameter Validation.",
                        result: "Success",
                        resultState: "Success",
                        previousValue: "N/A (New Rule)",
                        newValue: "Rule ID: XYRA-003 | Target: Kernel Audit",
                        checksumHash: "0xb2c3d4e5f6"
                    }
                ],
                remediations: [
                    {
                        auditId: "AUD-102",
                        controlId: "SOX-002",
                        application: "SAP S/4HANA",
                        finding: "Unassigned SOD Conflict in Firefighter Session #882",
                        deviation: "Emergency access session FF_BASIS_01 executed without post-session log sign-off within 24 hours.",
                        remediation: "Revoked elevated SPM role and conducted retrospective log audit with Reviewer 2 (Technical Team).",
                        evidenceStatus: "Verified & Sealed",
                        reviewStatus: "Approved",
                        reviewState: "Success",
                        evidenceFile: "Firefighter_Log_Session_882_Signed.pdf",
                        verificationNote: "Log sign-off attached and approved by Reviewer 2 (Technical Team). Remediation closed."
                    },
                    {
                        auditId: "AUD-103",
                        controlId: "PAR-104",
                        application: "HANA DB",
                        finding: "HANA DB Audit Trail Retention Parameter Out of Spec",
                        deviation: "Log retention buffer configured for 30 days instead of SOX mandate 90 days.",
                        remediation: "Executed SQL ALTER SYSTEM ALTER AUDIT POLICY to increase retention buffer to 90 days.",
                        evidenceStatus: "Verified & Sealed",
                        reviewStatus: "Approved",
                        reviewState: "Success",
                        evidenceFile: "HANA_AuditPolicy_Parameter_Proof.pdf",
                        verificationNote: "Remediation evidence verified against database configuration dump. Finding closed."
                    }
                ],
                history: [
                    {
                        auditId: "AUD-100",
                        controlId: "SOX-001",
                        application: "SAP ECC",
                        businessProcess: "Q3 User Access Review & Authorization Audit",
                        auditorName: "Alex Auditor",
                        completionDate: "2026-08-10",
                        complianceScore: "98.5%",
                        remediationStatus: "Fully Remediated",
                        status: "Archived & Closed",
                        checksumHash: "0x8f7a91b4c3e21098d5f4",
                        archiveSummary: "Q3 SOX User Access Review verified & sealed. 100% remediation of low-risk role assignment deviations."
                    },
                    {
                        auditId: "AUD-099",
                        controlId: "PAR-104",
                        application: "HANA DB",
                        businessProcess: "SAP HANA Database Audit Policy & Log Retention Inspection",
                        auditorName: "Alex Auditor",
                        completionDate: "2026-07-30",
                        complianceScore: "99.1%",
                        remediationStatus: "Verified & Passed",
                        status: "SOX Certified",
                        checksumHash: "0x4b2c1d9e8f7a6b5c4d3e",
                        archiveSummary: "Database audit trail log buffer verified at 90 days retention requirement. Vault evidence sealed."
                    },
                    {
                        auditId: "AUD-098",
                        controlId: "SEC-201",
                        application: "SAP S/4HANA",
                        businessProcess: "Privileged User Password Policy & Rotation Compliance",
                        auditorName: "Alex Auditor",
                        completionDate: "2026-06-30",
                        complianceScore: "96.8%",
                        remediationStatus: "Fully Remediated",
                        status: "Passed",
                        checksumHash: "0x3a4b5c6d7e8f9a0b1c2d",
                        archiveSummary: "All 180 privileged SAP S/4HANA user accounts verified against password complexity and rotation schedules."
                    },
                    {
                        auditId: "AUD-097",
                        controlId: "SOD-302",
                        application: "SAP GRC",
                        businessProcess: "Firefighter Session Access & Toxic Combination Inspection",
                        auditorName: "Alex Auditor",
                        completionDate: "2026-05-15",
                        complianceScore: "100%",
                        remediationStatus: "Verified & Passed",
                        status: "Archived & Closed",
                        checksumHash: "0x1e2d3c4b5a6f7e8d9c0b",
                        archiveSummary: "Comprehensive audit of 45 emergency access Firefighter log sign-offs. Zero unverified sessions found."
                    },
                    {
                        auditId: "AUD-096",
                        controlId: "BAS-105",
                        application: "SAP ECC",
                        businessProcess: "BASIS System Administrator Privilege & Profile Audit",
                        auditorName: "Alex Auditor",
                        completionDate: "2026-04-20",
                        complianceScore: "97.4%",
                        remediationStatus: "Remediated",
                        status: "Passed",
                        checksumHash: "0x9f8e7d6c5b4a3f2e1d0c",
                        archiveSummary: "BASIS user SAP_ALL and SAP_NEW profile assignments reviewed. Unused privileges revoked per policy."
                    }
                ],
                selectedAudit: null,
                selectedRemediation: null,
                selectedHistoryItem: null,
                selectedLog: null,
                riskPieChartSvgHtml: ""
            };

            oData.selectedAudit = oData.audits[0];
            oData.selectedRemediation = oData.remediations[0];
            oData.selectedHistoryItem = oData.history[0];
            oData.selectedLog = oData.audits[0];
            oData.riskPieChartSvgHtml = this._generateRiskPieChart();

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "auditorModel");
        },

        _generateRiskPieChart: function () {
            var sUid = "aud_pie_" + Math.floor(Math.random() * 100000);

            function getCoords(angle) {
                var rad = (angle - 90) * Math.PI / 180;
                return {
                    x: 85 + 56 * Math.cos(rad),
                    y: 85 + 56 * Math.sin(rad)
                };
            }

            var a1 = 136.8;
            var a2 = 259.2;

            var pt1 = getCoords(a1);
            var pt2 = getCoords(a2);

            var dLow = "M 85 29 A 56 56 0 0 1 " + pt1.x.toFixed(2) + " " + pt1.y.toFixed(2);
            var dMed = "M " + pt1.x.toFixed(2) + " " + pt1.y.toFixed(2) + " A 56 56 0 0 1 " + pt2.x.toFixed(2) + " " + pt2.y.toFixed(2);
            var dHigh = "M " + pt2.x.toFixed(2) + " " + pt2.y.toFixed(2) + " A 56 56 0 0 1 85 29";

            var html = '<div class="donut-chart-wrapper" style="position:relative; width:170px; height:170px; display:inline-block;">';
            html += '<svg width="170" height="170" viewBox="0 0 170 170" style="overflow:visible;">';
            html += '<style>' +
                '.auditor-donut-path { transition: all 0.25s ease-in-out; cursor: pointer; transform-origin: 85px 85px; }' +
                '.auditor-donut-path:hover { stroke-width: 25px !important; filter: drop-shadow(0px 4px 12px rgba(0,0,0,0.35)); opacity: 1 !important; }' +
                '</style>';

            html += '<circle cx="85" cy="85" r="56" fill="none" stroke="#f1f5f9" stroke-width="18"/>';

            // Low Risk (Green)
            html += '<path d="' + dLow + '" fill="none" stroke="#10b981" stroke-width="18" class="auditor-donut-path"' +
                ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'98%\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#10b981\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Low Risk\';"' +
                ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'83.7%\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Avg Compliance\';">' +
                '<title>Low Risk: 98% Compliance</title></path>';

            // Medium Risk (Orange)
            html += '<path d="' + dMed + '" fill="none" stroke="#f59e0b" stroke-width="18" class="auditor-donut-path"' +
                ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'88%\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#f59e0b\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Medium Risk\';"' +
                ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'83.7%\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Avg Compliance\';">' +
                '<title>Medium Risk: 88% Compliance</title></path>';

            // High Risk (Red)
            html += '<path d="' + dHigh + '" fill="none" stroke="#ef4444" stroke-width="18" class="auditor-donut-path"' +
                ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'65%\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#ef4444\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'High Risk\';"' +
                ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'83.7%\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Avg Compliance\';">' +
                '<title>High Risk: 65% Compliance</title></path>';

            html += '<text id="' + sUid + '_val" x="85" y="81" text-anchor="middle" fill="#0f172a" font-size="20" font-weight="bold" style="transition: all 0.2s ease;">83.7%</text>';
            html += '<text id="' + sUid + '_lbl" x="85" y="97" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600" style="transition: all 0.2s ease;">Avg Compliance</text>';
            html += '</svg>';
            html += '</div>';

            return html;
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("auditorToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onProfileNav: function () {
            UIComponent.getRouterFor(this).navTo("AuditorProfile");
        },

        // SIDEBAR SLIDE NAVIGATION HANDLERS
        onSelectTabAuditRecords: function () {
            this._showSlide("vboxAuditRecords", "AuditRecords");
        },

        onSelectTabAuditAnalysis: function () {
            this._showSlide("vboxAuditAnalysis", "AuditAnalysis");
        },

        onSelectTabRemediationReview: function () {
            this._showSlide("vboxRemediationReview", "RemediationReview");
        },

        onSelectTabAuditHistory: function () {
            this._showSlide("vboxAuditHistory", "AuditHistory");
        },

        _showSlide: function (sSlideId, sKey) {
            var aSlides = ["vboxAuditRecords", "vboxAuditAnalysis", "vboxRemediationReview", "vboxAuditHistory"];
            var self = this;
            aSlides.forEach(function (id) {
                var oVbox = self.byId(id);
                if (oVbox) {
                    oVbox.setVisible(id === sSlideId);
                }
            });

            var oSideNav = this.byId("auditorSideNavigation");
            if (oSideNav) {
                oSideNav.setSelectedKey(sKey);
            }
        },

        onSideNavItemSelect: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            if (sKey === "AuditRecords") {
                this.onSelectTabAuditRecords();
            } else if (sKey === "AuditAnalysis") {
                this.onSelectTabAuditAnalysis();
            } else if (sKey === "RemediationReview") {
                this.onSelectTabRemediationReview();
            } else if (sKey === "AuditHistory") {
                this.onSelectTabAuditHistory();
            } else if (sKey === "Profile") {
                this.onProfileNav();
            }
        },

        // ROW SELECTION & ANALYSIS INSPECTION
        onAuditSelect: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            if (oItem) {
                var oContext = oItem.getBindingContext("auditorModel");
                if (oContext) {
                    var oAudit = oContext.getObject();
                    this.getView().getModel("auditorModel").setProperty("/selectedAudit", oAudit);
                }
            }
        },

        onInspectAuditAnalysis: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext("auditorModel");
            if (oContext) {
                var oAudit = oContext.getObject();
                this.getView().getModel("auditorModel").setProperty("/selectedAudit", oAudit);
            }
            this.onSelectTabAuditAnalysis();
        },

        // LIVE AUTOMATIC FILTERING HANDLERS FOR OVERALL SYSTEM ACTIVITY AUDIT TRAIL
        onSearchAuditor: function () {
            var sSearchText = this.byId("searchAuditor") ? this.byId("searchAuditor").getValue() : "";
            var sAction = this.byId("filterActionAuditor") ? this.byId("filterActionAuditor").getSelectedKey() : "All";
            var sModule = this.byId("filterModuleAuditor") ? this.byId("filterModuleAuditor").getSelectedKey() : "All";
            var sUser = this.byId("filterUserAuditor") ? this.byId("filterUserAuditor").getSelectedKey() : "All";

            var aFilters = [];

            if (sSearchText && sSearchText.trim() !== "") {
                var aSubFilters = [
                    new Filter("logId", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("performedBy", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("role", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("action", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("module", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("objectId", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("description", FilterOperator.Contains, sSearchText.trim())
                ];
                aFilters.push(new Filter({ filters: aSubFilters, and: false }));
            }

            if (sAction && sAction !== "All") {
                aFilters.push(new Filter("action", FilterOperator.Contains, sAction));
            }

            if (sModule && sModule !== "All") {
                aFilters.push(new Filter("module", FilterOperator.Contains, sModule));
            }

            if (sUser && sUser !== "All") {
                aFilters.push(new Filter("performedBy", FilterOperator.Contains, sUser));
            }

            var oTable = this.byId("auditorTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onResetFilters: function () {
            if (this.byId("searchAuditor")) { this.byId("searchAuditor").setValue(""); }
            if (this.byId("filterActionAuditor")) { this.byId("filterActionAuditor").setSelectedKey("All"); }
            if (this.byId("filterModuleAuditor")) { this.byId("filterModuleAuditor").setSelectedKey("All"); }
            if (this.byId("filterUserAuditor")) { this.byId("filterUserAuditor").setSelectedKey("All"); }
            if (this.byId("filterStartDateAuditor")) { this.byId("filterStartDateAuditor").setValue(""); }
            if (this.byId("filterEndDateAuditor")) { this.byId("filterEndDateAuditor").setValue(""); }
            this.onSearchAuditor();
            MessageToast.show("Audit filters reset.");
        },

        onOpenAuditDetailsDialog: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext("auditorModel");
            if (oContext) {
                var oLog = oContext.getObject();
                this.getView().getModel("auditorModel").setProperty("/selectedLog", oLog);
            }
            if (this.byId("auditDetailsDialog")) {
                this.byId("auditDetailsDialog").open();
            }
        },

        onCloseAuditDetailsDialog: function () {
            if (this.byId("auditDetailsDialog")) {
                this.byId("auditDetailsDialog").close();
            }
        },

        onSearchRemediation: function () {
            var sSearchText = this.byId("searchRemediation") ? this.byId("searchRemediation").getValue() : "";
            var sControlId = this.byId("inputRemediationControlId") ? this.byId("inputRemediationControlId").getValue() : "";
            var sApp = this.byId("selectRemediationApp") ? this.byId("selectRemediationApp").getSelectedKey() : "All";
            var sStatus = this.byId("selectRemediationStatus") ? this.byId("selectRemediationStatus").getSelectedKey() : "All";

            var aFilters = [];

            if (sSearchText && sSearchText.trim() !== "") {
                var aSubFilters = [
                    new Filter("auditId", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("finding", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("deviation", FilterOperator.Contains, sSearchText.trim())
                ];
                aFilters.push(new Filter({ filters: aSubFilters, and: false }));
            }

            if (sControlId && sControlId.trim() !== "") {
                aFilters.push(new Filter("controlId", FilterOperator.Contains, sControlId.trim()));
            }

            if (sApp && sApp !== "All") {
                aFilters.push(new Filter("application", FilterOperator.Contains, sApp));
            }

            if (sStatus && sStatus !== "All") {
                aFilters.push(new Filter("remediationStatus", FilterOperator.Contains, sStatus));
            }

            var oTable = this.byId("remediationTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onResetRemediationFilters: function () {
            if (this.byId("searchRemediation")) { this.byId("searchRemediation").setValue(""); }
            if (this.byId("inputRemediationControlId")) { this.byId("inputRemediationControlId").setValue(""); }
            if (this.byId("selectRemediationApp")) { this.byId("selectRemediationApp").setSelectedKey("All"); }
            if (this.byId("selectRemediationStatus")) { this.byId("selectRemediationStatus").setSelectedKey("All"); }
            this.onSearchRemediation();
            MessageToast.show("Remediation filters reset.");
        },

        onSearchAuditHistory: function () {
            var sSearchText = this.byId("searchAuditHistory") ? this.byId("searchAuditHistory").getValue() : "";
            var sAction = this.byId("selectHistoryActionAud") ? this.byId("selectHistoryActionAud").getSelectedKey() : "All";
            var sModule = this.byId("selectHistoryModuleAud") ? this.byId("selectHistoryModuleAud").getSelectedKey() : "All";
            var sUser = this.byId("selectHistoryUserAud") ? this.byId("selectHistoryUserAud").getSelectedKey() : "All";

            var aFilters = [];

            if (sSearchText && sSearchText.trim() !== "") {
                var aSubFilters = [
                    new Filter("logId", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("performedBy", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("role", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("action", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("module", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("objectId", FilterOperator.Contains, sSearchText.trim()),
                    new Filter("description", FilterOperator.Contains, sSearchText.trim())
                ];
                aFilters.push(new Filter({ filters: aSubFilters, and: false }));
            }

            if (sAction && sAction !== "All") {
                aFilters.push(new Filter("action", FilterOperator.Contains, sAction));
            }

            if (sModule && sModule !== "All") {
                aFilters.push(new Filter("module", FilterOperator.Contains, sModule));
            }

            if (sUser && sUser !== "All") {
                aFilters.push(new Filter("performedBy", FilterOperator.Contains, sUser));
            }

            var oTable = this.byId("auditHistoryTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onResetAuditHistoryFilters: function () {
            if (this.byId("searchAuditHistory")) { this.byId("searchAuditHistory").setValue(""); }
            if (this.byId("selectHistoryActionAud")) { this.byId("selectHistoryActionAud").setSelectedKey("All"); }
            if (this.byId("selectHistoryModuleAud")) { this.byId("selectHistoryModuleAud").setSelectedKey("All"); }
            if (this.byId("selectHistoryUserAud")) { this.byId("selectHistoryUserAud").setSelectedKey("All"); }
            if (this.byId("dpHistoryStartDateAud")) { this.byId("dpHistoryStartDateAud").setValue(""); }
            if (this.byId("dpHistoryEndDateAud")) { this.byId("dpHistoryEndDateAud").setValue(""); }
            this.onSearchAuditHistory();
            MessageToast.show("Audit History filters reset.");
        },

        // DIALOG HANDLERS
        onViewEvidence: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("auditorModel");
            if (oContext) {
                var oRemediation = oContext.getObject();
                this.getView().getModel("auditorModel").setProperty("/selectedRemediation", oRemediation);
                var oDialog = this.byId("viewEvidenceDialogAuditor");
                if (oDialog) {
                    oDialog.open();
                }
            }
        },

        onCloseEvidenceDialog: function () {
            var oDialog = this.byId("viewEvidenceDialogAuditor");
            if (oDialog) {
                oDialog.close();
            }
        },

        onViewHistoryDetails: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("auditorModel");
            if (oContext) {
                var oHistoryItem = oContext.getObject();
                this.getView().getModel("auditorModel").setProperty("/selectedHistoryItem", oHistoryItem);
                var oDialog = this.byId("viewAuditHistoryDetailsDialog");
                if (oDialog) {
                    oDialog.open();
                }
            }
        },

        onCloseHistoryDetailsDialog: function () {
            var oDialog = this.byId("viewAuditHistoryDetailsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onRefresh: function () {
            this.onSearchAuditor();
            MessageToast.show("Audit data refreshed.");
        },

        onProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oPopover = this.byId("auditorProfilePopover");
            if (oPopover) {
                oPopover.openBy(oButton);
            }
        },

        onActionPress: function (oEvent) {
            var sText = oEvent.getSource().getText() || oEvent.getSource().getTooltip() || "Action";
            MessageToast.show("Auditor Action: " + sText);
        },

        onLogout: function () {
            GlobalLoading.logout(this);
        }

    });

});