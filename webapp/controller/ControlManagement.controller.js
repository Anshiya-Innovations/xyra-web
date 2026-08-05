sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("xyraweb.controller.ControlManagement", {

        onInit: function () {
            var oData = {
                controls: [
                    {
                        id: "NLG-08",
                        description: "SAP Java Audit Log Filters & Security Event Monitoring",
                        sysType1: "DEV",
                        sysType2: "QAS",
                        sysType3: "PRD",
                        frequencyRun: "Daily",
                        cronExpr: "",
                        totalRun: "365",
                        category: "Security"
                    },
                    {
                        id: "NLG-28",
                        description: "SAP HANA Security Audit Logging & Retention Check",
                        sysType1: "PRD",
                        sysType2: "QAS",
                        sysType3: "None",
                        frequencyRun: "Weekly (Every Monday)",
                        cronExpr: "",
                        totalRun: "52",
                        category: "ITGC"
                    },
                    {
                        id: "NLG-001",
                        description: "Segregation of Duties (SoD) Conflict Scan & Privilege Escalation",
                        sysType1: "DEV",
                        sysType2: "PRD",
                        sysType3: "None",
                        frequencyRun: "Realtime",
                        cronExpr: "",
                        totalRun: "Continuous",
                        category: "Security"
                    },
                    {
                        id: "NLG-002",
                        description: "Financial Journal Entry Threshold Audit & PO Limit Verification",
                        sysType1: "PRD",
                        sysType2: "None",
                        sysType3: "None",
                        frequencyRun: "Monthly (Last day of month)",
                        cronExpr: "",
                        totalRun: "12",
                        category: "Financial"
                    },
                    {
                        id: "NLG-003",
                        description: "Automated Kernel Audit Logging & Parameter Validation",
                        sysType1: "DEV",
                        sysType2: "QAS",
                        sysType3: "PRD",
                        frequencyRun: "Cron Expression",
                        cronExpr: "0 0 1 * *",
                        totalRun: "12",
                        category: "SOX"
                    }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "controlsModel");
        },

        _calculateCronRunCount: function (sCron) {
            if (!sCron) {
                return "12";
            }
            var sClean = sCron.trim().replace(/\s+/g, " ");

            // Realtime: * * * * * or */1 * * * *
            if (sClean === "* * * * *" || sClean.indexOf("*/1 ") === 0) {
                return "Continuous";
            }

            var aParts = sClean.split(" ");
            if (aParts.length < 5) {
                return "12";
            }

            var min = aParts[0];
            var hour = aParts[1];
            var dom = aParts[2];
            var mon = aParts[3];
            var dow = aParts[4];

            // 1. Realtime check: * * * * *
            if (min === "*" && hour === "*" && dom === "*" && mon === "*" && dow === "*") {
                return "Continuous";
            }

            // 2. Monthly check: 0 0 1 * * or 0 0 L * *
            if ((dom === "1" || dom === "L" || dom === "28" || dom === "30" || dom === "31") && mon === "*" && dow === "*") {
                return "12";
            }

            // 3. Weekly check: 0 0 * * 1 or 0 0 * * MON
            if (dom === "*" && (dow === "1" || dow === "MON" || dow === "mon")) {
                return "52";
            }

            // 4. Daily check: 0 0 * * *
            if (min !== "*" && hour !== "*" && dom === "*" && mon === "*" && dow === "*") {
                return "365";
            }

            // 5. Hourly check: 0 * * * *
            if (min !== "*" && hour === "*" && dom === "*") {
                return "8,760 Runs/Year";
            }

            // 6. Every X mins: */5 * * * *
            if (min.indexOf("*/") === 0) {
                var step = parseInt(min.replace("*/", ""), 10);
                if (!isNaN(step) && step > 0) {
                    var runsPerDay = (24 * 60) / step;
                    var total = Math.round(runsPerDay * 365);
                    return total.toLocaleString() + " Runs/Year";
                }
            }

            if (dom !== "*") {
                return "12";
            }

            return "365";
        },

        _calculateTotalRun: function (sFrequency, sCron) {
            switch (sFrequency) {
                case "Monthly (Last day of month)":
                    return "12";
                case "Weekly (Every Monday)":
                    return "52";
                case "Daily":
                    return "365";
                case "Realtime":
                    return "Continuous";
                case "Cron Expression":
                    return this._calculateCronRunCount(sCron);
                default:
                    return "365";
            }
        },

        _validateSystemTypes: function (sSys1, sSys2, sSys3) {
            if (!sSys1 || sSys1 === "None") {
                MessageBox.error("System Type is mandatory.");
                return false;
            }

            var aSelected = [sSys1];

            if (sSys2 && sSys2 !== "None") {
                if (aSelected.indexOf(sSys2) !== -1) {
                    MessageBox.error("Do not allow duplicate environment selections (" + sSys2 + ").");
                    return false;
                }
                aSelected.push(sSys2);
            }

            if (sSys3 && sSys3 !== "None") {
                if (aSelected.indexOf(sSys3) !== -1) {
                    MessageBox.error("Do not allow duplicate environment selections (" + sSys3 + ").");
                    return false;
                }
                aSelected.push(sSys3);
            }

            return true;
        },

        onCronInputChange: function (oEvent) {
            var sCron = oEvent.getParameter("value") || "";
            var sCalculated = this._calculateCronRunCount(sCron);

            if (this.byId("createTotalRunInput")) {
                this.byId("createTotalRunInput").setValue(sCalculated);
            }
            if (this.byId("editTotalRunInput")) {
                this.byId("editTotalRunInput").setValue(sCalculated);
            }
        },

        onRowSysTypeChange: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            if (oContext) {
                var oItem = oContext.getObject();
                if (!this._validateSystemTypes(oItem.sysType1, oItem.sysType2, oItem.sysType3)) {
                    this.getView().getModel("controlsModel").refresh(true);
                    return;
                }
                MessageToast.show("Updated System Type environment mapping for " + oItem.id);
            }
        },

        onRowFrequencyChange: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            if (oContext) {
                var oItem = oContext.getObject();
                var sNewTotalRun = this._calculateTotalRun(oItem.frequencyRun, oItem.cronExpr);
                var oModel = this.getView().getModel("controlsModel");
                oModel.setProperty(oContext.getPath() + "/totalRun", sNewTotalRun);
                MessageToast.show("Updated Frequency Run for " + oItem.id + " to " + oItem.frequencyRun);
            }
        },

        onCreateFrequencyChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            var oVboxCron = this.byId("vboxCreateCron");
            var oTotalRunInput = this.byId("createTotalRunInput");
            var sCron = this.byId("createCronInput") ? this.byId("createCronInput").getValue() : "";

            var bIsCron = (sKey === "Cron Expression");
            if (oVboxCron) {
                oVboxCron.setVisible(bIsCron);
            }
            if (oTotalRunInput) {
                oTotalRunInput.setValue(this._calculateTotalRun(sKey, sCron));
            }
        },

        onEditFrequencyChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            var oVboxCron = this.byId("vboxEditCron");
            var oTotalRunInput = this.byId("editTotalRunInput");
            var sCron = this.byId("editCronInput") ? this.byId("editCronInput").getValue() : "";

            var bIsCron = (sKey === "Cron Expression");
            if (oVboxCron) {
                oVboxCron.setVisible(bIsCron);
            }
            if (oTotalRunInput) {
                oTotalRunInput.setValue(this._calculateTotalRun(sKey, sCron));
            }
        },

        onSysTypeChange: function () {
            // Dialog dropdown selection change handler
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("controlManagementToolPage");
            if (oToolPage) {
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            }
        },

        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (oItem) {
                var sKey = oItem.getKey();
                if (sKey && this[sKey]) {
                    this[sKey]();
                } else if (sKey) {
                    this.getOwnerComponent().getRouter().navTo(sKey);
                }
            }
        },

        onNavAutomationMonitoring: function () {
            this.getOwnerComponent().getRouter().navTo("AutomationMonitoring");
        },

        onCreateControl: function () {
            var oDialog = this.byId("createControlDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseCreateControlDialog: function () {
            var oDialog = this.byId("createControlDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitCreateControl: function () {
            var sId = this.byId("createControlIdInput") ? this.byId("createControlIdInput").getValue().trim() : "";
            var sDesc = this.byId("createControlDescInput") ? this.byId("createControlDescInput").getValue().trim() : "";
            var sSys1 = this.byId("createSysType1Select") ? this.byId("createSysType1Select").getSelectedKey() : "DEV";
            var sSys2 = this.byId("createSysType2Select") ? this.byId("createSysType2Select").getSelectedKey() : "None";
            var sSys3 = this.byId("createSysType3Select") ? this.byId("createSysType3Select").getSelectedKey() : "None";
            var sFreq = this.byId("createFrequencySelect") ? this.byId("createFrequencySelect").getSelectedKey() : "Daily";
            var sCron = this.byId("createCronInput") ? this.byId("createCronInput").getValue().trim() : "";

            if (!sId || !sDesc) {
                MessageBox.error("Control ID and Control Description are mandatory.");
                return;
            }

            if (!this._validateSystemTypes(sSys1, sSys2, sSys3)) {
                return;
            }

            if (sFreq === "Cron Expression" && !sCron) {
                MessageBox.error("Please specify a Cron Expression.");
                return;
            }

            var sTotalRun = this._calculateTotalRun(sFreq, sCron);

            var oModel = this.getView().getModel("controlsModel");
            var aControls = oModel.getProperty("/controls") || [];

            aControls.unshift({
                id: sId,
                description: sDesc,
                sysType1: sSys1,
                sysType2: sSys2,
                sysType3: sSys3,
                frequencyRun: sFreq,
                cronExpr: sCron,
                totalRun: sTotalRun,
                category: "Security"
            });

            oModel.setProperty("/controls", aControls);
            MessageToast.show("Security Control '" + sId + "' Created Successfully!");

            // Reset inputs
            if (this.byId("createControlIdInput")) { this.byId("createControlIdInput").setValue(""); }
            if (this.byId("createControlDescInput")) { this.byId("createControlDescInput").setValue(""); }

            this.onCloseCreateControlDialog();
        },

        onEditControl: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            this._sEditingPath = oContext.getPath();
            var oItem = oContext.getObject();

            if (this.byId("editControlIdInput")) { this.byId("editControlIdInput").setValue(oItem.id); }
            if (this.byId("editControlDescInput")) { this.byId("editControlDescInput").setValue(oItem.description); }
            if (this.byId("editSysType1Select")) { this.byId("editSysType1Select").setSelectedKey(oItem.sysType1 || "DEV"); }
            if (this.byId("editSysType2Select")) { this.byId("editSysType2Select").setSelectedKey(oItem.sysType2 || "None"); }
            if (this.byId("editSysType3Select")) { this.byId("editSysType3Select").setSelectedKey(oItem.sysType3 || "None"); }
            if (this.byId("editFrequencySelect")) { this.byId("editFrequencySelect").setSelectedKey(oItem.frequencyRun || "Daily"); }
            if (this.byId("editCronInput")) { this.byId("editCronInput").setValue(oItem.cronExpr || ""); }

            var bIsCron = (oItem.frequencyRun === "Cron Expression");
            if (this.byId("vboxEditCron")) { this.byId("vboxEditCron").setVisible(bIsCron); }
            if (this.byId("editTotalRunInput")) {
                var sTotal = this._calculateTotalRun(oItem.frequencyRun, oItem.cronExpr);
                this.byId("editTotalRunInput").setValue(sTotal);
            }

            var oDialog = this.byId("editControlDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseEditControlDialog: function () {
            var oDialog = this.byId("editControlDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSubmitEditControl: function () {
            if (!this._sEditingPath) { return; }

            var sDesc = this.byId("editControlDescInput").getValue().trim();
            var sSys1 = this.byId("editSysType1Select").getSelectedKey();
            var sSys2 = this.byId("editSysType2Select").getSelectedKey();
            var sSys3 = this.byId("editSysType3Select").getSelectedKey();
            var sFreq = this.byId("editFrequencySelect").getSelectedKey();
            var sCron = this.byId("editCronInput").getValue().trim();

            if (!sDesc) {
                MessageBox.error("Control Description cannot be empty.");
                return;
            }

            if (!this._validateSystemTypes(sSys1, sSys2, sSys3)) {
                return;
            }

            if (sFreq === "Cron Expression" && !sCron) {
                MessageBox.error("Please specify a Cron Expression.");
                return;
            }

            var sTotalRun = this._calculateTotalRun(sFreq, sCron);
            var oModel = this.getView().getModel("controlsModel");

            oModel.setProperty(this._sEditingPath + "/description", sDesc);
            oModel.setProperty(this._sEditingPath + "/sysType1", sSys1);
            oModel.setProperty(this._sEditingPath + "/sysType2", sSys2);
            oModel.setProperty(this._sEditingPath + "/sysType3", sSys3);
            oModel.setProperty(this._sEditingPath + "/frequencyRun", sFreq);
            oModel.setProperty(this._sEditingPath + "/cronExpr", sCron);
            oModel.setProperty(this._sEditingPath + "/totalRun", sTotalRun);

            MessageToast.show("Security Control Updated Successfully!");
            this.onCloseEditControlDialog();
        },

        onDeleteControl: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("controlsModel");
            var oItem = oContext.getObject();
            var oModel = this.getView().getModel("controlsModel");

            MessageBox.confirm("Are you sure you want to delete Security Control '" + oItem.id + "'?", {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var aControls = oModel.getProperty("/controls") || [];
                        var iIndex = aControls.indexOf(oItem);
                        if (iIndex !== -1) {
                            aControls.splice(iIndex, 1);
                            oModel.setProperty("/controls", aControls);
                            MessageToast.show("Security Control '" + oItem.id + "' deleted.");
                        }
                    }
                }
            });
        },

        onSearchControls: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue") || (this.byId("searchControlId") ? this.byId("searchControlId").getValue() : "");
            sQuery = sQuery ? sQuery.trim() : "";

            var aFilters = [];
            if (sQuery) {
                var oFilterId = new Filter("id", FilterOperator.Contains, sQuery);
                var oFilterDesc = new Filter("description", FilterOperator.Contains, sQuery);
                aFilters.push(new Filter({
                    filters: [oFilterId, oFilterDesc],
                    and: false
                }));
            }

            var oTable = this.byId("controlsTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onAdmin: function () { this.getOwnerComponent().getRouter().navTo("Admin"); },
        onRoleManagement: function () { this.getOwnerComponent().getRouter().navTo("RoleManagement"); },
        onControlManagement: function () { this.getOwnerComponent().getRouter().navTo("ControlManagement"); },
        onAIInsights: function () { this.getOwnerComponent().getRouter().navTo("AIInsights"); },
        onSOXCompliance: function () { this.getOwnerComponent().getRouter().navTo("SOXCompliance"); },
        onReports: function () { this.getOwnerComponent().getRouter().navTo("Reports"); },
        onAuditLogs: function () { this.getOwnerComponent().getRouter().navTo("AuditLogs"); },
        onConfiguration: function () { this.getOwnerComponent().getRouter().navTo("Configuration"); },
        onAccessManagement: function () { this.getOwnerComponent().getRouter().navTo("AccessManagement"); },
        onRiskAnalytics: function () { this.getOwnerComponent().getRouter().navTo("RiskAnalytics"); },
        onSystemHealth: function () { this.getOwnerComponent().getRouter().navTo("SystemHealth"); },
        onProfile: function () { this.getOwnerComponent().getRouter().navTo("Profile"); },

        onNotificationPress: function () { MessageToast.show("No new notifications."); },
        onLogout: function () {
            MessageToast.show("Logged Out Successfully");
            this.getOwnerComponent().getRouter().navTo("Login");
        }

    });

});
