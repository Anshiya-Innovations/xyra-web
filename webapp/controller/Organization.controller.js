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

    return Controller.extend("xyraweb.controller.Organization", {

        onInit: function () {
            var aOrganizations = [
                {
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
                    statusState: "Success",
                    createdDate: "2024-01-15"
                },
                {
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
                    statusState: "Success",
                    createdDate: "2024-02-01"
                },
                {
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
                    statusState: "Success",
                    createdDate: "2024-03-10"
                },
                {
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
                    statusState: "Warning",
                    createdDate: "2024-04-05"
                },
                {
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
                    statusState: "Information",
                    createdDate: "2024-04-18"
                },
                {
                    orgId: "ORG-WIPRO-06",
                    companyName: "Wipro Digital Solutions",
                    industry: "IT Consulting & Services",
                    region: "Asia Pacific",
                    country: "India",
                    primaryContact: "Anand Verma (Audit Lead)",
                    email: "audit@wipro.com",
                    phone: "+91 80 2844 0011",
                    sapSystems: "DEV, QAS (6 Systems)",
                    status: "Inactive",
                    statusState: "Error",
                    createdDate: "2024-05-02"
                }
            ];

            var oOrgModel = new JSONModel({
                organizations: aOrganizations,
                allOrganizations: JSON.parse(JSON.stringify(aOrganizations))
            });
            this.getView().setModel(oOrgModel, "orgModel");
        },

        onSearchOrg: function () {
            this._applyFilters();
        },

        onFilterOrg: function () {
            this._applyFilters();
        },

        _applyFilters: function () {
            var oOrgModel = this.getView().getModel("orgModel");
            var aAll = oOrgModel.getProperty("/allOrganizations") || [];

            var sQuery = (this.byId("searchOrgInput").getValue() || "").toLowerCase().trim();
            var sStatus = this.byId("statusFilterSelect").getSelectedKey();
            var sRegion = this.byId("regionFilterSelect").getSelectedKey();

            var aFiltered = aAll.filter(function (org) {
                var bMatchQuery = !sQuery ||
                    org.orgId.toLowerCase().indexOf(sQuery) !== -1 ||
                    org.companyName.toLowerCase().indexOf(sQuery) !== -1 ||
                    org.industry.toLowerCase().indexOf(sQuery) !== -1;

                var bMatchStatus = (sStatus === "All") || (org.status === sStatus);
                var bMatchRegion = (sRegion === "All") || (org.region === sRegion);

                return bMatchQuery && bMatchStatus && bMatchRegion;
            });

            oOrgModel.setProperty("/organizations", aFiltered);
        },

        onOpenAddOrgDialog: function () {
            this.byId("addOrgIdInput").setValue("").setValueState("None");
            this.byId("addCompanyNameInput").setValue("").setValueState("None");
            this.byId("addIndustrySelect").setSelectedKey("Conglomerate & Technology");
            this.byId("addRegionSelect").setSelectedKey("Asia Pacific");
            this.byId("addCountryInput").setValue("").setValueState("None");
            this.byId("addContactInput").setValue("").setValueState("None");
            this.byId("addEmailInput").setValue("").setValueState("None");
            this.byId("addPhoneInput").setValue("").setValueState("None");
            this.byId("addStatusSelect").setSelectedKey("Active");

            this.byId("addOrgDialog").open();
        },

        onCloseAddOrgDialog: function () {
            this.byId("addOrgDialog").close();
        },

        onSubmitAddOrg: function () {
            var sOrgId = (this.byId("addOrgIdInput").getValue() || "").trim();
            var sCompanyName = (this.byId("addCompanyNameInput").getValue() || "").trim();
            var sIndustry = this.byId("addIndustrySelect").getSelectedKey();
            var sRegion = this.byId("addRegionSelect").getSelectedKey();
            var sCountry = (this.byId("addCountryInput").getValue() || "").trim();
            var sContact = (this.byId("addContactInput").getValue() || "").trim();
            var sEmail = (this.byId("addEmailInput").getValue() || "").trim();
            var sPhone = (this.byId("addPhoneInput").getValue() || "").trim();
            var sStatus = this.byId("addStatusSelect").getSelectedKey();

            var bValid = true;

            if (!sOrgId) {
                this.byId("addOrgIdInput").setValueState("Error").setValueStateText("Organization ID is required.");
                bValid = false;
            } else {
                this.byId("addOrgIdInput").setValueState("None");
            }

            if (!sCompanyName) {
                this.byId("addCompanyNameInput").setValueState("Error").setValueStateText("Company Name is required.");
                bValid = false;
            } else {
                this.byId("addCompanyNameInput").setValueState("None");
            }

            if (!sCountry) {
                this.byId("addCountryInput").setValueState("Error").setValueStateText("Country is required.");
                bValid = false;
            } else {
                this.byId("addCountryInput").setValueState("None");
            }

            if (!sContact) {
                this.byId("addContactInput").setValueState("Error").setValueStateText("Primary Contact is required.");
                bValid = false;
            } else {
                this.byId("addContactInput").setValueState("None");
            }

            if (!sEmail || sEmail.indexOf("@") === -1) {
                this.byId("addEmailInput").setValueState("Error").setValueStateText("Valid Email address is required.");
                bValid = false;
            } else {
                this.byId("addEmailInput").setValueState("None");
            }

            if (!bValid) {
                MessageBox.error("Please fill in all mandatory fields correctly before saving.");
                return;
            }

            var sStatusState = "Success";
            if (sStatus === "Pending Setup") { sStatusState = "Warning"; }
            else if (sStatus === "Inactive") { sStatusState = "Error"; }
            else if (sStatus === "Under Audit Review") { sStatusState = "Information"; }

            var dNow = new Date();
            var sDateStr = dNow.toISOString().split("T")[0];

            var oNewOrg = {
                orgId: sOrgId,
                companyName: sCompanyName,
                industry: sIndustry,
                region: sRegion,
                country: sCountry,
                primaryContact: sContact,
                email: sEmail,
                phone: sPhone || "+1 800 555 0199",
                sapSystems: "DEV, QAS, PRD (Default)",
                status: sStatus,
                statusState: sStatusState,
                createdDate: sDateStr
            };

            var oOrgModel = this.getView().getModel("orgModel");
            var aAll = oOrgModel.getProperty("/allOrganizations") || [];
            aAll.unshift(oNewOrg);

            oOrgModel.setProperty("/allOrganizations", aAll);
            this._applyFilters();

            this.onCloseAddOrgDialog();
            MessageToast.show("Organization '" + sCompanyName + "' created successfully!");
        },

        onViewDetails: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("orgModel").getObject();
            var sOrgId = oItem.orgId;

            this.navToRoute("OrganizationDetails", { orgId: sOrgId });
        },

        navToRoute: function (sRouteName, oParams) {
            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter) {
                oRouter.navTo(sRouteName, oParams || {});
            } else {
                window.location.hash = "#/" + sRouteName + (oParams && oParams.orgId ? "/" + oParams.orgId : "");
            }
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("orgToolPage");
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
