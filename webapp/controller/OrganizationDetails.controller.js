sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "xyraweb/model/sidebarState",
    "xyraweb/model/focusRing",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/config",
    "xyraweb/model/session"
], function (Controller, MessageToast, MessageBox, UIComponent, JSONModel, SidebarState, killFocusRing, GlobalLoading, Config, Session) {
    "use strict";

    function slaSummaryText(s) {
        return "Reviewer 1: " + s.reviewer1Days + " business days  ·  " +
            "Reviewer 2: " + s.reviewer2Days + " business days  ·  " +
            "Escalation delay: " + s.escalationDelayDays + " business days past Reviewer 2 SLA";
    }

    function orgStatusStateFor(sStatus) {
        if (sStatus === "Pending Setup") { return "Warning"; }
        if (sStatus === "Under Audit Review") { return "Information"; }
        if (sStatus === "Inactive") { return "Error"; }
        return "Success";
    }

    return Controller.extend("xyraweb.controller.OrganizationDetails", {

        onInit: function () {
            var oRouter = UIComponent.getRouterFor(this) || (this.getOwnerComponent() && this.getOwnerComponent().getRouter());
            if (oRouter) {
                var oRoute = oRouter.getRoute("OrganizationDetails");
                if (oRoute) {
                    oRoute.attachPatternMatched(this._onRouteMatched, this);
                }
            }

            this._loadOrgData(null);
            this._loadSlaSettings();
            this._syncSidebar();
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._loadOrgData(oArgs && oArgs.orgId);
            this._loadSlaSettings();
            this._syncSidebar();
        },

        // The one real backend-integrated card on this otherwise 100% mock
        // page (see mMockOrgs above) - review SLA windows are per-tenant real
        // data (SystemConfigService.getSlaSettings/updateSlaSettings), not
        // sample org data. Reused by onInit (populate the summary line) and
        // onOpenSlaSettingsDialog (prefill the edit dialog).
        _loadSlaSettings: function () {
            var that = this;
            var oSession = Session.get();
            if (!oSession) { return Promise.resolve(null); }

            return fetch(Config.AUTH_BASE_URL + "/api/system-config/getSlaSettings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: oSession.subdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { return null; }
                    var oModel = that.getView().getModel("orgDetailsModel");
                    if (oModel) { oModel.setProperty("/slaSummary", slaSummaryText(oData.settings)); }
                    return oData.settings;
                })
                .catch(function () { return null; });
        },

        onOpenSlaSettingsDialog: function () {
            var that = this;
            GlobalLoading.show("Loading SLA Settings", 0, true, true);
            this._loadSlaSettings().then(function (s) {
                GlobalLoading.hide();
                if (!s) { MessageBox.error("Could not load SLA settings. Is xyra-core running?"); return; }
                that.byId("slaReviewer1Days").setValue(s.reviewer1Days);
                that.byId("slaReviewer2Days").setValue(s.reviewer2Days);
                that.byId("slaEscalationDelayDays").setValue(s.escalationDelayDays);
                that.byId("slaSettingsDialog").open();
            });
        },

        onCloseSlaSettingsDialog: function () {
            this.byId("slaSettingsDialog").close();
        },

        onSaveSlaSettings: function () {
            var that = this;
            var oSession = Session.get();
            if (!oSession) { MessageBox.error("No active session. Please log in again."); return; }

            var oPayload = {
                subdomain: oSession.subdomain,
                reviewer1Days: parseInt(this.byId("slaReviewer1Days").getValue(), 10),
                reviewer2Days: parseInt(this.byId("slaReviewer2Days").getValue(), 10),
                escalationDelayDays: parseInt(this.byId("slaEscalationDelayDays").getValue(), 10),
                performedBy: oSession.email,
                performedByRole: oSession.role
            };

            GlobalLoading.show("Saving SLA Settings", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/system-config/updateSlaSettings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oPayload)
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    GlobalLoading.hide();
                    if (!oData.success) { MessageBox.error(oData.message || "Could not update SLA settings."); return; }
                    var oModel = that.getView().getModel("orgDetailsModel");
                    if (oModel) { oModel.setProperty("/slaSummary", slaSummaryText(oPayload)); }
                    that.onCloseSlaSettingsDialog();
                    MessageToast.show("SLA settings updated.");
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        },

        _syncSidebar: function () {
            var oSideNav = this.byId("sideNavigation");
            if (oSideNav) {
                oSideNav.setSelectedKey("Organization");
            }
            var oNavList = this.byId("navigationList");
            if (oNavList) {
                oNavList.setSelectedKey("Organization");
            }
        },

        // sOrgId is the real Organizations.ID (routed here from Organization's
        // onViewDetails). Falls back to whichever org is first in the tenant's
        // list when none is given (e.g. this route opened with no id).
        _loadOrgData: function (sOrgId) {
            var that = this;
            var oOrgData = { orgId: "", dbId: sOrgId || "", companyName: "Loading...", industry: "", region: "", country: "", primaryContact: "", email: "", phone: "", sapSystems: "", status: "Active", statusState: "Success" };

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

            var oDetailsModel = new JSONModel({
                currentOrg: oOrgData,
                parameters: aParameters,
                allParameters: JSON.parse(JSON.stringify(aParameters)),
                slaSummary: "Loading...",
                jiraSettings: {
                    enabled: false, siteUrl: "", email: "", projectKey: "", issueType: "Task", hasToken: false,
                    statusCreated: "", statusInProgress: "", statusResolved: ""
                },
                jiraStatusOptions: [{ key: "", text: "-- Use Jira's default category --" }],
                orgSystems: []
            });

            this.getView().setModel(oDetailsModel, "orgDetailsModel");
            this._fetchOrganization(sOrgId, oDetailsModel);
        },

        // Real org fields (Tenant -> many Organizations -> each org's own
        // Systems) - Parameters above stays mock, unrelated demo content with
        // nothing in GDL-8864/SOP-8865/STR-1862 backing it. The Policies tab
        // used to be the same kind of fake CRUD (assign a fake policy, kept
        // in memory only, read by nothing) - removed; the Review SLA is the
        // one real governance policy this app enforces, so that tab now
        // shows/edits the real SlaSettings instead.
        _fetchOrganization: function (sOrgId, oDetailsModel) {
            var that = this;
            var oSession = Session.get();
            if (!oSession) { return; }

            GlobalLoading.show("Loading Organization", 0, true, true);

            var pOrgId = sOrgId
                ? Promise.resolve(sOrgId)
                : fetch(Config.AUTH_BASE_URL + "/api/organization/listOrganizations", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subdomain: oSession.subdomain })
                })
                    .then(function (r) { return r.json(); })
                    .then(function (oData) { return oData.success && oData.organizations[0] ? oData.organizations[0].id : null; });

            pOrgId.then(function (sId) {
                if (!sId) { MessageBox.error("No organization to show yet - add one from the Organization list."); return; }
                return fetch(Config.AUTH_BASE_URL + "/api/organization/getOrganization", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subdomain: oSession.subdomain, id: sId })
                })
                    .then(function (r) { return r.json(); })
                    .then(function (oData) {
                        if (!oData.success || !oData.organization) { MessageBox.error(oData.message || "Could not load organization."); return; }
                        var o = oData.organization;
                        that._orgDbId = o.id;
                        oDetailsModel.setProperty("/currentOrg", {
                            orgId: o.orgCode, dbId: o.id, companyName: o.name, industry: o.industry || "",
                            region: o.region || "", country: o.country || "", primaryContact: o.primaryContact || "",
                            email: o.email || "", phone: o.phone || "",
                            sapSystems: o.systemCount + (o.systemCount === 1 ? " System" : " Systems"),
                            status: o.status, statusState: orgStatusStateFor(o.status)
                        });
                        return Promise.all([
                            that._loadJiraSettings(o.id, oDetailsModel),
                            that._loadOrgSystems(o.id, oDetailsModel)
                        ]);
                    });
            }).catch(function () {
                MessageToast.show("Could not reach xyra-core. Is it running?", { duration: 4000 });
            }).then(function () {
                GlobalLoading.hide();
            });
        },

        // Configurations tab - every real System whose organizationId
        // matches this Organization (Tenant -> many Organizations -> each
        // org's own Systems). listSystems already returns organizationId
        // per row (system-config-service.js) - no new backend endpoint
        // needed, just filter client-side, same pattern as ControlEditor's
        // own Organization -> Systems cascade.
        _loadOrgSystems: function (sOrgId, oDetailsModel) {
            var oSession = Session.get();
            if (!oSession) { return Promise.resolve(); }

            return fetch(Config.AUTH_BASE_URL + "/api/system-config/listSystems", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: oSession.subdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { return; }
                    var aRows = (oData.systems || [])
                        .filter(function (s) { return s.organizationId === sOrgId; })
                        .map(function (s) {
                            return {
                                sysId: s.sysId, client: s.client, sysType: s.sysType, hostName: s.hostName,
                                platform: s.platform || "", region: s.region || "", sector: s.sector || "",
                                lastConnectionStatus: s.lastConnectionStatus || "UNKNOWN",
                                connectionState: s.lastConnectionStatus === "ONLINE" ? "Success" : s.lastConnectionStatus === "OFFLINE" ? "Error" : "None"
                            };
                        });
                    oDetailsModel.setProperty("/orgSystems", aRows);
                });
        },

        // Jira Integration tab - one row of settings per Organization (see
        // db/tenant/jira-settings.cds). apiToken is write-only: the backend
        // never returns it, just whether one is on file (hasToken), so a
        // blank API Token field on save means "keep the existing token".
        _loadJiraSettings: function (sOrgId, oDetailsModel) {
            var oSession = Session.get();
            if (!oSession) { return Promise.resolve(); }

            return fetch(Config.AUTH_BASE_URL + "/api/organization/getJiraSettings", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: oSession.subdomain, organizationId: sOrgId })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { return; }
                    oDetailsModel.setProperty("/jiraSettings", oData.settings);
                    // Seed the 3 mapping Selects with whatever's already saved, so
                    // they show the real mapping on load without forcing a live
                    // Jira fetch just to see what's already configured.
                    this._mergeJiraStatusOptions(oDetailsModel, [
                        oData.settings.statusCreated, oData.settings.statusInProgress, oData.settings.statusResolved
                    ].filter(Boolean));
                }.bind(this));
        },

        // Keeps the blank "use default category" option plus every distinct
        // status name seen so far (saved mapping + whatever the last live
        // fetch returned) - so switching back to an already-mapped value
        // never goes blank just because it isn't in the latest fetch result.
        _mergeJiraStatusOptions: function (oDetailsModel, aNames) {
            var aExisting = oDetailsModel.getProperty("/jiraStatusOptions") || [];
            var oSeen = {};
            var aMerged = [{ key: "", text: "-- Use Jira's default category --" }];
            aExisting.concat(aNames.map(function (n) { return { key: n, text: n }; })).forEach(function (o) {
                if (o.key && !oSeen[o.key]) { oSeen[o.key] = true; aMerged.push(o); }
            });
            oDetailsModel.setProperty("/jiraStatusOptions", aMerged);
        },

        // Reads whatever's currently in the form (site/email/project - token
        // falls back to the one on file if left blank) and lists that
        // project's real statuses from Jira, live - so the mapping dropdowns
        // reflect this specific board, not a guess.
        onFetchJiraStatuses: function () {
            var that = this;
            var oSession = Session.get();
            if (!oSession || !this._orgDbId) { MessageBox.error("No active session or organization."); return; }

            var oPayload = {
                subdomain: oSession.subdomain,
                organizationId: this._orgDbId,
                siteUrl: (this.byId("jiraSiteUrlInput").getValue() || "").trim(),
                email: (this.byId("jiraEmailInput").getValue() || "").trim(),
                apiToken: this.byId("jiraApiTokenInput").getValue() || "",
                projectKey: (this.byId("jiraProjectKeyInput").getValue() || "").trim()
            };
            if (!oPayload.siteUrl || !oPayload.email || !oPayload.projectKey) {
                MessageBox.error("Fill in Site URL, Email, and Project Key first.");
                return;
            }

            GlobalLoading.show("Fetching Jira Statuses", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/organization/getJiraStatusOptions", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oPayload)
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    GlobalLoading.hide();
                    if (!oData.success) { MessageBox.error(oData.message || "Could not fetch statuses from Jira."); return; }
                    that._mergeJiraStatusOptions(that.getView().getModel("orgDetailsModel"), oData.statuses || []);
                    MessageToast.show((oData.statuses || []).length + " status(es) loaded from Jira.");
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
        },

        onSaveJiraSettings: function () {
            var that = this;
            var oSession = Session.get();
            if (!oSession || !this._orgDbId) { MessageBox.error("No active session or organization to update."); return; }

            var sSiteUrl = (this.byId("jiraSiteUrlInput").getValue() || "").trim();
            var sEmail = (this.byId("jiraEmailInput").getValue() || "").trim();
            var sProjectKey = (this.byId("jiraProjectKeyInput").getValue() || "").trim();
            var bEnabled = this.byId("jiraEnabledSwitch").getState();

            if (bEnabled && (!sSiteUrl || !sEmail || !sProjectKey)) {
                MessageBox.error("Site URL, Email, and Project Key are required to enable Jira ticket creation.");
                return;
            }

            var oPayload = {
                subdomain: oSession.subdomain,
                organizationId: this._orgDbId,
                enabled: bEnabled,
                siteUrl: sSiteUrl,
                email: sEmail,
                apiToken: this.byId("jiraApiTokenInput").getValue() || "",
                projectKey: sProjectKey,
                issueType: (this.byId("jiraIssueTypeInput").getValue() || "Task").trim(),
                statusCreated: this.byId("jiraStatusCreatedSelect").getSelectedKey(),
                statusInProgress: this.byId("jiraStatusInProgressSelect").getSelectedKey(),
                statusResolved: this.byId("jiraStatusResolvedSelect").getSelectedKey(),
                performedBy: oSession.email,
                performedByRole: oSession.role
            };

            GlobalLoading.show("Saving Jira Settings", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/organization/updateJiraSettings", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oPayload)
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    GlobalLoading.hide();
                    if (!oData.success) { MessageBox.error(oData.message || "Could not update Jira settings."); return; }
                    that.byId("jiraApiTokenInput").setValue("");
                    that._loadJiraSettings(that._orgDbId, that.getView().getModel("orgDetailsModel"));
                    MessageToast.show("Jira settings updated.");
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
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

            var oModel = this.getView().getModel("orgDetailsModel");
            var oOrg = oModel.getProperty("/currentOrg") || {};
            var oSession = Session.get();
            if (!oOrg.dbId || !oSession) { MessageBox.error("No active session or organization to update."); return; }

            var that = this;
            // orgCode (sOrgId, "Organization ID") isn't editable - same "id
            // isn't editable" stance as Configuration's Edit System dialog -
            // updateOrganization doesn't even accept it as a param.
            var oPayload = {
                subdomain: oSession.subdomain,
                id: oOrg.dbId,
                name: sCompanyName,
                industry: sIndustry,
                region: sRegion,
                country: sCountry,
                primaryContact: sContact,
                email: sEmail,
                phone: sPhone,
                status: sStatus,
                performedBy: oSession.email,
                performedByRole: oSession.role
            };

            GlobalLoading.show("Saving Organization", 0, true, true);
            fetch(Config.AUTH_BASE_URL + "/api/organization/updateOrganization", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oPayload)
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    GlobalLoading.hide();
                    if (!oData.success) { MessageBox.error(oData.message || "Could not update organization."); return; }
                    oOrg.companyName = sCompanyName;
                    oOrg.industry = sIndustry;
                    oOrg.region = sRegion;
                    oOrg.country = sCountry;
                    oOrg.primaryContact = sContact;
                    oOrg.email = sEmail;
                    oOrg.phone = sPhone;
                    oOrg.status = sStatus;
                    oOrg.statusState = orgStatusStateFor(sStatus);
                    oModel.setProperty("/currentOrg", oOrg);
                    that.onCloseEditSummaryDialog();
                    MessageToast.show("Company Executive Summary updated successfully!");
                })
                .catch(function () {
                    GlobalLoading.hide();
                    MessageBox.error("Could not reach the server. Is xyra-core running?");
                });
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
