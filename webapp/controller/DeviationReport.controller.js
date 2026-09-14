sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "xyraweb/service/DeviationClient",
    "xyraweb/model/GlobalLoading",
    "xyraweb/model/NotificationPopover",
    "xyraweb/model/config",
    "xyraweb/model/session",
    "xyraweb/model/sidebarState"
], function (Controller, MessageToast, MessageBox, JSONModel, DeviationService, GlobalLoading, NotificationPopover, Config, Session, SidebarState) {
    "use strict";

    return Controller.extend("xyraweb.controller.DeviationReport", {

        onAfterRendering: function () {
            this._updateSidebar();
        },

        _onRouteMatched: function () {
            this._updateSidebar();
        },

        _updateSidebar: function () {
            var oToolPage = this.byId("deviationToolPage");
            if (oToolPage && SidebarState) {
                oToolPage.setSideExpanded(SidebarState.get());
            }
            var oNav = this.byId("sideNavigation");
            if (oNav) {
                oNav.setSelectedKey("DeviationReport");
                var oList = oNav.getItem();
                if (oList && oList.setSelectedKey) {
                    oList.setSelectedKey("DeviationReport");
                }
            }
        },

        onInit: function () {
            if (this.getOwnerComponent() && this.getOwnerComponent().getRouter()) {
                var oRoute = this.getOwnerComponent().getRouter().getRoute("DeviationReport");
                if (oRoute) {
                    oRoute.attachPatternMatched(this._onRouteMatched, this);
                }
            }
            var oInitialData = {
                filters: {
                    organization: "All",
                    sector: "All",
                    region: "All",
                    platform: "All",
                    system: "All",
                    client: "All",
                    control: "All",
                    status: "All",
                    startDate: "",
                    endDate: ""
                },
                options: {
                    organizations: [{ key: "All", text: "All Organizations" }],
                    regions: [{ key: "All", text: "All Regions" }],
                    platforms: [{ key: "All", text: "All Platforms" }],
                    systems: [{ key: "All", text: "All Systems" }],
                    clients: [{ key: "All", text: "All Clients" }],
                    sectors: [{ key: "All", text: "All Sectors" }],
                    controls: [{ key: "All", text: "All Controls" }]
                },
                headers: [],
                totalRecords: 0,
                kpi: {
                    totalIncidents: 0,
                    openItems: 0,
                    resolvedItems: 0,
                    auditedControls: 0,
                    complianceRate: "0%"
                },
                statusSummary: {
                    pending: 0
                },
                severitySummary: {
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0
                },
                statusSvgHtml: ""
            };

            var oModel = new JSONModel(oInitialData);
            this.getView().setModel(oModel, "reportModel");

            this._loadFilterOptions();
            this._runQuery();
        },

        // Organization/System/Region/Platform/Sector/Client/Control dropdowns,
        // all from real data (Tenant -> many Organizations -> each org's own
        // Systems; Region/Platform/Sector/Client are the same System fields
        // Reports.controller.js/ControlEditor.controller.js already derive
        // the same way). On failure each dropdown just keeps its "All ..."
        // placeholder - no fake fallback rows.
        _loadFilterOptions: function () {
            var that = this;
            var oModel = this.getView().getModel("reportModel");
            var sSubdomain = (Session.get() && Session.get().subdomain) || Config.TEST_SUBDOMAIN;

            fetch(Config.AUTH_BASE_URL + "/api/organization/listOrganizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: sSubdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listOrganizations failed"); }
                    oModel.setProperty("/options/organizations", [{ key: "All", text: "All Organizations" }].concat(
                        (oData.organizations || []).map(function (o) { return { key: o.id, text: o.orgCode + " - " + o.name }; })
                    ));
                })
                .catch(function () { /* keep the "All" fallback already in the model */ });

            fetch(Config.AUTH_BASE_URL + "/api/system-config/listSystems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: sSubdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listSystems failed"); }
                    that._aAllSystems = oData.systems || [];
                    that._applySystemFacets(that._aAllSystems);
                })
                .catch(function () { /* keep the "All" fallback already in the model */ });

            fetch(Config.AUTH_BASE_URL + "/api/control/listControls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subdomain: sSubdomain })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) { throw new Error(oData.message || "listControls failed"); }
                    oModel.setProperty("/options/controls", [{ key: "All", text: "All Controls" }].concat(
                        (oData.controls || []).map(function (c) { return { key: c.code, text: c.code + " - " + c.description }; })
                    ));
                })
                .catch(function () { /* keep the "All" fallback already in the model */ });
        },

        // System dropdown is narrowed to the selected Organization's own
        // Systems (same Organization -> Systems cascade as ControlEditor);
        // Region/Platform/Sector/Client are independent facets derived from
        // the same list, not further narrowed by org.
        _applySystemFacets: function (aSystems) {
            var oModel = this.getView().getModel("reportModel");
            var distinct = function (get) {
                var seen = {};
                var out = [];
                aSystems.forEach(function (s) {
                    var v = get(s);
                    if (v && !seen[v]) { seen[v] = true; out.push(v); }
                });
                return out.map(function (v) { return { key: v, text: v }; });
            };
            oModel.setProperty("/options/systems", [{ key: "All", text: "All Systems" }].concat(
                aSystems.map(function (s) { return { key: s.sysId, text: s.sysId }; })
            ));
            oModel.setProperty("/options/clients", [{ key: "All", text: "All Clients" }].concat(distinct(function (s) { return s.client; })));
            oModel.setProperty("/options/regions", [{ key: "All", text: "All Regions" }].concat(distinct(function (s) { return s.region; })));
            oModel.setProperty("/options/platforms", [{ key: "All", text: "All Platforms" }].concat(distinct(function (s) { return s.platform; })));
            oModel.setProperty("/options/sectors", [{ key: "All", text: "All Sectors" }].concat(distinct(function (s) { return s.sector; })));
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("deviationToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        // Filter Handlers - Organization is the one real cascade (narrows the
        // System select to that org's own Systems, matching ControlEditor's
        // Organization -> Systems flow); every other filter is an
        // independent facet, no fake cascading between them.
        onOrganizationChange: function (oEvent) {
            var sOrgId = oEvent.getParameter("selectedItem").getKey();
            var aAll = this._aAllSystems || [];
            var aScoped = sOrgId === "All" ? aAll : aAll.filter(function (s) { return s.organizationId === sOrgId; });
            this._applySystemFacets(aScoped);
            // Previously-picked System/Region/Platform/Sector/Client may not
            // exist in the narrowed set - reset rather than leave a stale,
            // now-invisible selection.
            var oModel = this.getView().getModel("reportModel");
            oModel.setProperty("/filters/system", "All");
            oModel.setProperty("/filters/region", "All");
            oModel.setProperty("/filters/platform", "All");
            oModel.setProperty("/filters/sector", "All");
            oModel.setProperty("/filters/client", "All");
            this.onSearch();
        },

        onSectorChange: function () {
            this.onSearch();
        },

        onRegionChange: function () {
            this.onSearch();
        },

        onPlatformChange: function () {
            this.onSearch();
        },

        onSystemChange: function () {
            this.onSearch();
        },

        onClientChange: function () {
            this.onSearch();
        },

        onControlChange: function () {
            this.onSearch();
        },

        onStatusChange: function () {
            this.onSearch();
        },

        onSearch: function () {
            this._runQuery();
            MessageToast.show("Report search completed.");
        },

        onReset: function () {
            var oModel = this.getView().getModel("reportModel");
            oModel.setProperty("/filters", {
                organization: "All",
                sector: "All",
                region: "All",
                platform: "All",
                system: "All",
                client: "All",
                control: "All",
                status: "All",
                startDate: "",
                endDate: ""
            });
            this._applySystemFacets(this._aAllSystems || []);
            if (this.byId("filterStartingDate")) { this.byId("filterStartingDate").reset(); }
            if (this.byId("filterEndingDate")) { this.byId("filterEndingDate").reset(); }
            if (this.byId("filterDateRange")) { this.byId("filterDateRange").reset(); }
            this._runQuery();
            MessageToast.show("Filter criteria reset.");
        },

        onControlLinkPress: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("reportModel").getObject();
            var sAlertId = oItem.alertId || "ALT-1001";
            var sControlId = oItem.controlId || "NLG08";

            this.getOwnerComponent().getRouter().navTo("AlertItem", {
                alertId: sAlertId,
                controlId: sControlId
            });
        },

        onRefresh: function () {
            this._runQuery();
            MessageToast.show("Deviation Report refreshed.");
        },

        onNotificationPress: function (oEvent) {
            NotificationPopover.toggle(oEvent, this);
        },

        onLogout: function () {
            GlobalLoading.logout(this);
        },

        _runQuery: function () {
            var that = this;
            var oModel = this.getView().getModel("reportModel");
            var oFilters = oModel.getProperty("/filters");

            GlobalLoading.show("Loading Deviation Report", 0, true, true);
            return DeviationService.queryDeviations(oFilters).then(function (oResult) {
                oModel.setProperty("/headers", oResult.headers);
                oModel.setProperty("/totalRecords", oResult.totalRecords);
                oModel.setProperty("/kpi", oResult.kpi);
                oModel.setProperty("/severitySummary", oResult.severitySummary);
                oModel.setProperty("/statusSummary", oResult.statusSummary);

                // Generate SVG Donut Chart HTML
                var sSvg = that._generatePieChartSvg(oResult.kpi.openItems, oResult.kpi.resolvedItems, oResult.statusSummary.pending);
                oModel.setProperty("/statusSvgHtml", sSvg);
            }).catch(function () {
                // No mock fallback for this report - a failed fetch means an
                // empty table with a real error, not fake incident rows.
                MessageBox.error("Could not reach the server to load the Deviation Report.");
                oModel.setProperty("/headers", []);
                oModel.setProperty("/totalRecords", 0);
            }).then(function () {
                GlobalLoading.hide();
            });
        },

        _generatePieChartSvg: function (iOpen, iResolved, iPending) {
            var iTotal = iOpen + iResolved + iPending;
            if (iTotal === 0) {
                return '<svg width="170" height="170" viewBox="0 0 170 170"><circle cx="85" cy="85" r="56" fill="none" stroke="#e2e8f0" stroke-width="18"/><text x="85" y="90" text-anchor="middle" fill="#94a3b8" font-size="14">0 Incidents</text></svg>';
            }

            var fOpenPct = (iOpen / iTotal);
            var fResolvedPct = (iResolved / iTotal);
            var fPendingPct = (iPending / iTotal);

            var pctOpenText = (fOpenPct * 100).toFixed(1) + "%";
            var pctResolvedText = (fResolvedPct * 100).toFixed(1) + "%";
            var pctPendingText = (fPendingPct * 100).toFixed(1) + "%";

            // Angles
            var a1 = fOpenPct * 360;
            var a2 = a1 + (fResolvedPct * 360);

            function getCoordinatesForAngle(angle) {
                var rad = (angle - 90) * Math.PI / 180;
                return {
                    x: 85 + 56 * Math.cos(rad),
                    y: 85 + 56 * Math.sin(rad)
                };
            }

            var p1 = getCoordinatesForAngle(a1);
            var p2 = getCoordinatesForAngle(a2);

            var d1 = "M 85 29 A 56 56 0 " + (a1 > 180 ? 1 : 0) + " 1 " + p1.x + " " + p1.y;
            var d2 = "M " + p1.x + " " + p1.y + " A 56 56 0 " + ((a2 - a1) > 180 ? 1 : 0) + " 1 " + p2.x + " " + p2.y;
            var d3 = "M " + p2.x + " " + p2.y + " A 56 56 0 " + ((360 - a2) > 180 ? 1 : 0) + " 1 85 29";

            var sUid = "dev_pie_" + Math.floor(Math.random() * 100000);

            var html = '<div class="donut-chart-wrapper" style="position:relative; width:170px; height:170px; display:inline-block;">';
            html += '<svg width="170" height="170" viewBox="0 0 170 170" style="overflow:visible;">';
            html += '<style>' +
                '.dev-donut-path { transition: all 0.25s ease-in-out; cursor: pointer; transform-origin: 85px 85px; }' +
                '.dev-donut-path:hover { stroke-width: 25px !important; filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.35)); opacity: 1 !important; }' +
                '</style>';

            html += '<circle cx="85" cy="85" r="56" fill="none" stroke="#f8fafc" stroke-width="18"/>';

            if (iOpen > 0) {
                html += '<path d="' + d1 + '" fill="none" stroke="#ef4444" stroke-width="18" class="dev-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + pctOpenText + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#ef4444\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Open\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Open: ' + iOpen + ' (' + pctOpenText + ')</title></path>';
            }
            if (iResolved > 0) {
                html += '<path d="' + d2 + '" fill="none" stroke="#10b981" stroke-width="18" class="dev-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + pctResolvedText + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#10b981\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Resolved\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Resolved: ' + iResolved + ' (' + pctResolvedText + ')</title></path>';
            }
            if (iPending > 0) {
                html += '<path d="' + d3 + '" fill="none" stroke="#f59e0b" stroke-width="18" class="dev-donut-path"' +
                    ' onmouseenter="document.getElementById(\'' + sUid + '_val\').textContent=\'' + pctPendingText + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#f59e0b\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Pending\';"' +
                    ' onmouseleave="document.getElementById(\'' + sUid + '_val\').textContent=\'' + iTotal + '\'; document.getElementById(\'' + sUid + '_val\').setAttribute(\'fill\', \'#0f172a\'); document.getElementById(\'' + sUid + '_lbl\').textContent=\'Total\';">' +
                    '<title>Pending: ' + iPending + ' (' + pctPendingText + ')</title></path>';
            }

            html += '<text id="' + sUid + '_val" x="85" y="81" text-anchor="middle" fill="#0f172a" font-size="20" font-weight="bold" style="transition: all 0.2s ease;">' + iTotal + '</text>';
            html += '<text id="' + sUid + '_lbl" x="85" y="97" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600" style="transition: all 0.2s ease;">Total</text>';
            html += '</svg>';
            html += '</div>';

            return html;
        },

        onNavAutomationMonitoring: function () {
            this.getOwnerComponent().getRouter().navTo("AutomationMonitoring");
        },

        // Group headers ("Control Management") have sub-items and no key of
        // their own - select="onToggleSideNavGroup" on that item handles the
        // actual toggle; this guard is defense-in-depth in case the click
        // also bubbles up here, so it can never fall through to a navTo.
        onToggleSideNavGroup: function (oEvent) {
            var oItem = oEvent.getSource();
            oItem.setExpanded(!oItem.getExpanded());
        },

        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (!oItem) { return; }
            if (oItem.getItems && oItem.getItems().length) {
                oItem.setExpanded(!oItem.getExpanded());
                return;
            }
            var sKey = oItem.getKey();
            if (sKey && this[sKey]) {
                this[sKey]();
            } else if (sKey) {
                this.getOwnerComponent().getRouter().navTo(sKey);
            }
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onDeviationReport: function () { this.getOwnerComponent().getRouter().navTo("DeviationReport"); },
        onAIInsights: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onSOXCompliance: function () { this.getOwnerComponent().getRouter().navTo("SOXCompliance"); },
        onReports: function () { this.getOwnerComponent().getRouter().navTo("Reports"); },
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onOrganization: function () { this.getOwnerComponent().getRouter().navTo("Organization"); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); }

    });
});
