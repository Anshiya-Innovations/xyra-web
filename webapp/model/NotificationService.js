sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    var oModel = new JSONModel({
        unreadCount: 4,
        activeTab: "ALL", // "ALL", "TASK", "REMINDER"
        items: [
            {
                id: "NOT-001",
                title: "Control Execution Deviation",
                message: "3 new Basis control deviations detected in PRD system.",
                category: "TASK",
                timestamp: "5 min ago",
                read: false,
                priority: "HIGH",
                targetPage: "ControlManagement",
                targetRecord: "XYRA-08",
                icon: "sap-icon://alert",
                iconClass: "xyraNotifyIconGreen"
            },
            {
                id: "NOT-002",
                title: "Access Request Pending",
                message: "Admin role access grant requested for sysadmin@xyra.com.",
                category: "TASK",
                timestamp: "20 min ago",
                read: false,
                priority: "HIGH",
                targetPage: "AccessManagement",
                targetRecord: "USR-004",
                icon: "sap-icon://key-user-settings",
                iconClass: "xyraNotifyIconBlue"
            },
            {
                id: "NOT-003",
                title: "Technical Review Pending",
                message: "Report REP-101 is awaiting second-level technical review.",
                category: "TASK",
                timestamp: "1 hour ago",
                read: false,
                priority: "MEDIUM",
                targetPage: "Reviewer2",
                targetRecord: "REP-101",
                icon: "sap-icon://user-edit",
                iconClass: "xyraNotifyIconBlue"
            },
            {
                id: "NOT-004",
                title: "Review Deadline Approaching",
                message: "Quarterly SOX Audit review is due tomorrow for system PRD001.",
                category: "REMINDER",
                timestamp: "3 hours ago",
                read: false,
                priority: "MEDIUM",
                targetPage: "SOXCompliance",
                targetRecord: "SOX-2026",
                icon: "sap-icon://future",
                iconClass: "xyraNotifyIconGreen"
            }
        ],
        previousItems: [
            {
                id: "NOT-005",
                title: "New Control Created",
                message: "Security control XYRA-28 was successfully configured in DEV/QAS.",
                category: "TASK",
                timestamp: "Yesterday",
                read: true,
                priority: "LOW",
                targetPage: "ControlManagement",
                targetRecord: "XYRA-28",
                icon: "sap-icon://add",
                iconClass: "xyraNotifyIconGrey"
            },
            {
                id: "NOT-006",
                title: "Audit Review Available",
                message: "Audit report AUD-101 is ready for independent auditor sign-off.",
                category: "REMINDER",
                timestamp: "2 days ago",
                read: true,
                priority: "LOW",
                targetPage: "Auditor",
                targetRecord: "AUD-101",
                icon: "sap-icon://accept",
                iconClass: "xyraNotifyIconGrey"
            }
        ]
    });

    function updateGlobalBellBadges() {
        var iUnread = oModel.getProperty("/unreadCount");
        try {
            var sSelector = '.sapMBtn[title="Notifications"], .sapMBtn[title="Alert Notifications"], .sapMBtn[aria-label="Notifications"], .sapMBtn[tooltip="Notifications"], .xyraNotificationBtn';
            var aBellBtns = document.querySelectorAll(sSelector);
            aBellBtns.forEach(function (btn) {
                if (iUnread === 0) {
                    btn.setAttribute('data-unread-count', '0');
                    btn.classList.add('xyraNoUnreadBadge');
                } else {
                    btn.setAttribute('data-unread-count', String(iUnread));
                    btn.classList.remove('xyraNoUnreadBadge');
                }
            });
        } catch (e) {
            console.error("Error updating bell badges:", e);
        }
    }

    function recalculateUnreadCount() {
        var aItems = oModel.getProperty("/items") || [];
        var iUnread = aItems.filter(function (item) { return !item.read; }).length;
        oModel.setProperty("/unreadCount", iUnread);
        updateGlobalBellBadges();
    }

    // Initial badge setup on DOM load
    setTimeout(updateGlobalBellBadges, 500);

    return {
        getModel: function () {
            return oModel;
        },

        setActiveTab: function (sTab) {
            oModel.setProperty("/activeTab", sTab);
        },

        markAsRead: function (sId) {
            var aItems = oModel.getProperty("/items") || [];
            var aPrev = oModel.getProperty("/previousItems") || [];
            var oFoundItem = null;

            var aNewItems = aItems.filter(function (item) {
                if (item.id === sId) {
                    item.read = true;
                    oFoundItem = item;
                    return false;
                }
                return true;
            });

            if (oFoundItem) {
                aPrev.unshift(oFoundItem);
                oModel.setProperty("/items", aNewItems);
                oModel.setProperty("/previousItems", aPrev);
                recalculateUnreadCount();
            }
        },

        clearAll: function () {
            var aItems = oModel.getProperty("/items") || [];
            var aPrev = oModel.getProperty("/previousItems") || [];

            aItems.forEach(function (item) {
                item.read = true;
                aPrev.unshift(item);
            });

            oModel.setProperty("/items", []);
            oModel.setProperty("/previousItems", aPrev);
            oModel.setProperty("/unreadCount", 0);
            updateGlobalBellBadges();
        },

        clearPrevious: function () {
            oModel.setProperty("/previousItems", []);
        },

        updateBadges: updateGlobalBellBadges
    };
});
