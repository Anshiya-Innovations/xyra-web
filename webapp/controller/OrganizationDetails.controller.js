sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "xyraweb/model/sidebarState",
    "xyraweb/model/focusRing"
], function (Controller, MessageToast, MessageBox, UIComponent, JSONModel, SidebarState, killFocusRing) {
    "use strict";

    var mMockOrgs = {
        "ORG-TATA-01": {
            orgId: "ORG-TATA-01",
            companyName: "Tata Sons & Group",
            industry: "Conglomerate & Technology",
            region: "Asia Pacific",
            country: "India",
            primaryContact: "Ratan Sharma (VP GRC)",
            email: "grc@tata.com",
            phone: "+91 22 6665 8282",
            sapSystems: "DEV, QAS, PRD (12 Systems)",
            status: "Active",
            statusState: "Success"
        },
        "ORG-ACCN-02": {
            orgId: "ORG-ACCN-02",
            companyName: "Accenture Global Services",
            industry: "IT Consulting & Services",
            region: "North America",
            country: "United States",
            primaryContact: "Sarah Jenkins (Director Security)",
            email: "compliance@accenture.com",
            phone: "+1 312 844 5000",
            sapSystems: "DEV, PRD (8 Systems)",
            status: "Active",
            statusState: "Success"
        },
        "ORG-SAP-03": {
            orgId: "ORG-SAP-03",
            companyName: "SAP Enterprise Systems",
            industry: "Enterprise Software",
            region: "Europe",
            country: "Germany",
            primaryContact: "Hans Mueller (Chief Information Officer)",
            email: "h.mueller@sap.com",
            phone: "+49 6227 747474",
            sapSystems: "PRD (5 Systems)",
            status: "Active",
            statusState: "Success"
        },
        "ORG-INFY-04": {
            orgId: "ORG-INFY-04",
            companyName: "Infosys Technologies",
            industry: "IT & Cloud Solutions",
            region: "Asia Pacific",
            country: "India",
            primaryContact: "Nitin Kamath (Risk Head)",
            email: "risk@infosys.com",
            phone: "+91 80 2852 0261",
            sapSystems: "DEV, QAS, PRD (15 Systems)",
            status: "Pending Setup",
            statusState: "Warning"
        },
        "ORG-RELIANCE-05": {
            orgId: "ORG-RELIANCE-05",
            companyName: "Reliance Industries",
            industry: "Energy & Retail",
            region: "Asia Pacific",
            country: "India",
            primaryContact: "Mukesh Varma (Head GRC Operations)",
            email: "grc.ops@ril.com",
            phone: "+91 22 3555 5000",
            sapSystems: "DEV, QAS, PRD (20 Systems)",
            status: "Under Audit Review",
            statusState: "Information"
        }
    };

    return Controller.extend("xyraweb.controller.OrganizationDetails", {

        onInit: function () {
            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter) {
                var oRoute = oRouter.getRoute("OrganizationDetails");
                if (oRoute) {
                    oRoute.attachPatternMatched(this._onRouteMatched, this);
                }
            }

            this._loadOrgData("ORG-TATA-01");
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sOrgId = oArgs && oArgs.orgId ? oArgs.orgId : "ORG-TATA-01";
            this._loadOrgData(sOrgId);
        },

        _loadOrgData: function (sOrgId) {
            var oOrgData = mMockOrgs[sOrgId] || mMockOrgs["ORG-TATA-01"];

            var aParameters = [
                { paramType: "SET/GET Parameter", paramIdName: "BUK - Company Code", value: "1000", status: "Enforced", statusState: "Success" },
                { paramType: "SET/GET Parameter", paramIdName: "WRK - Plant", value: "1010", status: "Active", statusState: "Success" },
                { paramType: "SET/GET Parameter", paramIdName: "VKO - Sales Organization", value: "1000", status: "Active", statusState: "Success" },
                { paramType: "SET/GET Parameter", paramIdName: "VTEG - Distribution Channel", value: "10", status: "Active", statusState: "Success" },
                { paramType: "SET/GET Parameter", paramIdName: "SPA - Memory ID", value: "MEM_TATA_PRD", status: "Enforced", statusState: "Success" },
                { paramType: "SET/GET Parameter", paramIdName: "KOK - Cost Center", value: "CC_2000", status: "Active", statusState: "Success" },
                { paramType: "SET/GET Parameter", paramIdName: "EKO - Purchasing Organization", value: "PO_1000", status: "Active", statusState: "Success" },
                { paramType: "User Default Value", paramIdName: "Decimal Notation", value: "1,234,567.89", status: "Enforced", statusState: "Success" },
                { paramType: "User Default Value", paramIdName: "Date Format", value: "DD.MM.YYYY", status: "Enforced", statusState: "Success" },
                { paramType: "User Default Value", paramIdName: "Time Zone", value: "IST (UTC+5:30)", status: "Active", statusState: "Success" },
                { paramType: "User Default Value", paramIdName: "Logon Language", value: "EN", status: "Active", statusState: "Success" },
                { paramType: "User Default Value", paramIdName: "Spool Output (DEST)", value: "LOCL", status: "Active", statusState: "Success" },
                { paramType: "User Default Value", paramIdName: "Output Device (PRINTER)", value: "PRN01_MUMBAI", status: "Pending Verification", statusState: "Warning" }
            ];

            var aPolicies = [
                { policyId: "POL-SEC-01", policyName: "Enterprise SAP Security & Encryption Standard", category: "Security Policy", status: "Active", statusState: "Success", lastUpdated: "2024-05-10" },
                { policyId: "POL-ACC-02", policyName: "User Emergency Privilege Access & Firefighter Mandate", category: "Access Policy", status: "Active", statusState: "Success", lastUpdated: "2024-04-18" },
                { policyId: "POL-CTL-03", policyName: "Automated SOD Matrix & Dual Approval Policy", category: "SAP Control Policy", status: "Active", statusState: "Success", lastUpdated: "2024-03-22" },
                { policyId: "POL-CMP-04", policyName: "SOX 404 Financial ITGC Compliance Policy", category: "Compliance Policy", status: "Under Review", statusState: "Warning", lastUpdated: "2024-06-01" }
            ];

            var oDetailsModel = new JSONModel({
                currentOrg: oOrgData,
                parameters: aParameters,
                allParameters: JSON.parse(JSON.stringify(aParameters)),
                policies: aPolicies
            });

            this.getView().setModel(oDetailsModel, "orgDetailsModel");
        },

        onNavBack: function () {
            this.navToRoute("Organization");
        },

        onFilterParameters: function () {
            var oModel = this.getView().getModel("orgDetailsModel");
            var aAll = oModel.getProperty("/allParameters") || [];
            var sKey = this.byId("paramTypeFilterSelect").getSelectedKey();

            if (sKey === "All") {
                oModel.setProperty("/parameters", aAll);
            } else {
                var aFiltered = aAll.filter(function (p) {
                    return p.paramType === sKey;
                });
                oModel.setProperty("/parameters", aFiltered);
            }
        },

        onOpenAddParamDialog: function () {
            this.byId("newParamTypeSelect").setSelectedKey("SET/GET Parameter");
            this.byId("newParamIdSetGetSelect").setVisible(true).setSelectedKey("BUK - Company Code");
            this.byId("newParamIdUserDefSelect").setVisible(false).setSelectedKey("Decimal Notation");
            this.byId("newParamValueInput").setValue("");
            this.byId("newParamStatusSelect").setSelectedKey("Active");

            this.byId("addParamDialog").open();
        },

        onCloseAddParamDialog: function () {
            this.byId("addParamDialog").close();
        },

        onParamTypeChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            if (sKey === "SET/GET Parameter") {
                this.byId("newParamIdSetGetSelect").setVisible(true);
                this.byId("newParamIdUserDefSelect").setVisible(false);
            } else {
                this.byId("newParamIdSetGetSelect").setVisible(false);
                this.byId("newParamIdUserDefSelect").setVisible(true);
            }
        },

        onSubmitAddParam: function () {
            var sType = this.byId("newParamTypeSelect").getSelectedKey();
            var sParamIdName = (sType === "SET/GET Parameter")
                ? this.byId("newParamIdSetGetSelect").getSelectedKey()
                : this.byId("newParamIdUserDefSelect").getSelectedKey();

            var sValue = (this.byId("newParamValueInput").getValue() || "").trim();
            var sStatus = this.byId("newParamStatusSelect").getSelectedKey();

            if (!sValue) {
                MessageBox.error("Please enter a configured value for the parameter.");
                return;
            }

            var sState = "Success";
            if (sStatus === "Pending Verification") { sState = "Warning"; }

            var oNewParam = {
                paramType: sType,
                paramIdName: sParamIdName,
                value: sValue,
                status: sStatus,
                statusState: sState
            };

            var oModel = this.getView().getModel("orgDetailsModel");
            var aAll = oModel.getProperty("/allParameters") || [];
            aAll.unshift(oNewParam);
            oModel.setProperty("/allParameters", aAll);

            this.onFilterParameters();
            this.onCloseAddParamDialog();
            MessageToast.show("Parameter '" + sParamIdName + "' added successfully!");
        },

        onRemoveParameter: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("orgDetailsModel");
            if (oContext) {
                var sPath = oContext.getPath();
                var iIndex = parseInt(sPath.split("/").pop(), 10);
                var oModel = this.getView().getModel("orgDetailsModel");
                var aParams = oModel.getProperty("/parameters") || [];
                aParams.splice(iIndex, 1);
                oModel.setProperty("/parameters", aParams);
                oModel.setProperty("/allParameters", JSON.parse(JSON.stringify(aParams)));
                MessageToast.show("Parameter removed.");
            }
        },

        onOpenAssignPolicyDialog: function () {
            this.byId("policyCategorySelect").setSelectedKey("Security Policy");
            this.byId("policyNameInput").setValue("");
            this.byId("policyIdInput").setValue("");
            this.byId("policyStatusSelect").setSelectedKey("Active");

            this.byId("assignPolicyDialog").open();
        },

        onCloseAssignPolicyDialog: function () {
            this.byId("assignPolicyDialog").close();
        },

        onSubmitAssignPolicy: function () {
            var sCategory = this.byId("policyCategorySelect").getSelectedKey();
            var sName = (this.byId("policyNameInput").getValue() || "").trim();
            var sId = (this.byId("policyIdInput").getValue() || "").trim();
            var sStatus = this.byId("policyStatusSelect").getSelectedKey();

            if (!sName || !sId) {
                MessageBox.error("Please fill in both Policy Name and Policy ID Code.");
                return;
            }

            var dNow = new Date();
            var sDateStr = dNow.toISOString().split("T")[0];
            var sState = (sStatus === "Active") ? "Success" : "Warning";

            var oNewPolicy = {
                policyId: sId,
                policyName: sName,
                category: sCategory,
                status: sStatus,
                statusState: sState,
                lastUpdated: sDateStr
            };

            var oModel = this.getView().getModel("orgDetailsModel");
            var aPolicies = oModel.getProperty("/policies") || [];
            aPolicies.unshift(oNewPolicy);
            oModel.setProperty("/policies", aPolicies);

            this.onCloseAssignPolicyDialog();
            MessageToast.show("Policy '" + sName + "' assigned successfully!");
        },

        onEditSummaryPress: function () {
            var oModel = this.getView().getModel("orgDetailsModel");
            var oOrg = oModel ? oModel.getProperty("/currentOrg") : null;
            if (!oOrg) { return; }

            this.byId("editSummaryCompanyNameInput").setValue(oOrg.companyName || "").setValueState("None");
            this.byId("editSummaryOrgIdInput").setValue(oOrg.orgId || "").setValueState("None");
            this.byId("editSummaryIndustrySelect").setSelectedKey(oOrg.industry || "Conglomerate & Technology");
            this.byId("editSummaryRegionSelect").setSelectedKey(oOrg.region || "Asia Pacific");
            this.byId("editSummaryCountryInput").setValue(oOrg.country || "").setValueState("None");
            this.byId("editSummaryContactInput").setValue(oOrg.primaryContact || "").setValueState("None");
            this.byId("editSummaryEmailInput").setValue(oOrg.email || "").setValueState("None");
            this.byId("editSummaryPhoneInput").setValue(oOrg.phone || "").setValueState("None");
            this.byId("editSummaryStatusSelect").setSelectedKey(oOrg.status || "Active");

            this.byId("editSummaryDialog").open();
        },

        onCloseEditSummaryDialog: function () {
            this.byId("editSummaryDialog").close();
        },

        onSubmitEditSummary: function () {
            var sCompanyName = (this.byId("editSummaryCompanyNameInput").getValue() || "").trim();
            var sOrgId = (this.byId("editSummaryOrgIdInput").getValue() || "").trim();
            var sIndustry = this.byId("editSummaryIndustrySelect").getSelectedKey();
            var sRegion = this.byId("editSummaryRegionSelect").getSelectedKey();
            var sCountry = (this.byId("editSummaryCountryInput").getValue() || "").trim();
            var sContact = (this.byId("editSummaryContactInput").getValue() || "").trim();
            var sEmail = (this.byId("editSummaryEmailInput").getValue() || "").trim();
            var sPhone = (this.byId("editSummaryPhoneInput").getValue() || "").trim();
            var sStatus = this.byId("editSummaryStatusSelect").getSelectedKey();

            var bValid = true;

            if (!sCompanyName) {
                this.byId("editSummaryCompanyNameInput").setValueState("Error").setValueStateText("Company Name is required.");
                bValid = false;
            } else {
                this.byId("editSummaryCompanyNameInput").setValueState("None");
            }

            if (!sOrgId) {
                this.byId("editSummaryOrgIdInput").setValueState("Error").setValueStateText("Organization ID is required.");
                bValid = false;
            } else {
                this.byId("editSummaryOrgIdInput").setValueState("None");
            }

            if (!sCountry) {
                this.byId("editSummaryCountryInput").setValueState("Error").setValueStateText("Country is required.");
                bValid = false;
            } else {
                this.byId("editSummaryCountryInput").setValueState("None");
            }

            if (!sContact) {
                this.byId("editSummaryContactInput").setValueState("Error").setValueStateText("Primary Contact is required.");
                bValid = false;
            } else {
                this.byId("editSummaryContactInput").setValueState("None");
            }

            if (!sEmail || sEmail.indexOf("@") === -1) {
                this.byId("editSummaryEmailInput").setValueState("Error").setValueStateText("Valid Email address is required.");
                bValid = false;
            } else {
                this.byId("editSummaryEmailInput").setValueState("None");
            }

            if (!bValid) {
                MessageBox.error("Please fill in all required fields before saving.");
                return;
            }

            var sStatusState = "Success";
            if (sStatus === "Pending Setup") { sStatusState = "Warning"; }
            else if (sStatus === "Inactive") { sStatusState = "Error"; }
            else if (sStatus === "Under Audit Review") { sStatusState = "Information"; }

            var oModel = this.getView().getModel("orgDetailsModel");
            var oOrg = oModel.getProperty("/currentOrg") || {};

            oOrg.companyName = sCompanyName;
            oOrg.orgId = sOrgId;
            oOrg.industry = sIndustry;
            oOrg.region = sRegion;
            oOrg.country = sCountry;
            oOrg.primaryContact = sContact;
            oOrg.email = sEmail;
            oOrg.phone = sPhone;
            oOrg.status = sStatus;
            oOrg.statusState = sStatusState;

            oModel.setProperty("/currentOrg", oOrg);

            this.onCloseEditSummaryDialog();
            MessageToast.show("Company Executive Summary updated successfully!");
        },

        navToRoute: function (sRouteName, oParams) {
            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter) {
                oRouter.navTo(sRouteName, oParams || {});
            } else {
                window.location.hash = "#/" + sRouteName;
            }
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("orgDetailsToolPage");
            if (oToolPage) {
                var bExpanded = !oToolPage.getSideExpanded();
                oToolPage.setSideExpanded(bExpanded);
                SidebarState.save(bExpanded);
            }
        },

        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (oItem) {
                var sKey = oItem.getKey();
                if (sKey) {
                    this.navToRoute(sKey);
                }
            }
        },

        onAdmin: function () { this.navToRoute("Admin"); },
        onControlManagement: function () { this.navToRoute("ControlManagement"); },
        onAIInsights: function () { this.navToRoute("Admin"); },
        onSOXCompliance: function () { this.navToRoute("SOXCompliance"); },
        onReports: function () { this.navToRoute("Reports"); },
        onAuditLogs: function () { this.navToRoute("AuditLogs"); },
        onConfiguration: function () { this.navToRoute("Configuration"); },
        onAccessManagement: function () { this.navToRoute("AccessManagement"); },
        onOrganization: function () { this.navToRoute("Organization"); },
        onRiskAnalytics: function () { this.navToRoute("Admin"); },
        onProfile: function () { this.navToRoute("Profile"); }

    });

});
