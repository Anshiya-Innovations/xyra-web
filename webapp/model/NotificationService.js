sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "xyraweb/model/config",
    "xyraweb/model/session"
], function (JSONModel, MessageToast, Config, Session) {
    "use strict";

    // ponytail: shown only when xyra-core can't be reached, same "dummy data"
    // pattern as mockData.js - the real notifications live in the tenant DB now
    // (see xyra-core lib/notification_engine), fetched by refresh() below.
    var DUMMY_ITEMS = [
        {
            id: "dummy-1",
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
            id: "dummy-2",
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
        }
    ];

    var oModel = new JSONModel({
        unreadCount: 0,
        activeTab: "ALL", // "ALL", "TASK", "REMINDER"
        items: [],
        isDummyData: false
    });

    var bNoticeShown = false;
    function notice() {
        if (bNoticeShown) { return; }
        bNoticeShown = true;
        MessageToast.show("xyra-core is offline — showing dummy notifications for testing purposes only.", { duration: 5000 });
    }

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

    function formatRelativeTime(sIsoString) {
        if (!sIsoString) { return ""; }
        var iDiffMs = Date.now() - new Date(sIsoString).getTime();
        var iMin = Math.floor(iDiffMs / 60000);
        if (iMin < 1) { return "Just now"; }
        if (iMin < 60) { return iMin + " min ago"; }
        var iHour = Math.floor(iMin / 60);
        if (iHour < 24) { return iHour + (iHour === 1 ? " hour ago" : " hours ago"); }
        var iDay = Math.floor(iHour / 24);
        if (iDay === 1) { return "Yesterday"; }
        return iDay + " days ago";
    }

    function toDisplayItem(r) {
        return {
            id: r.id,
            title: r.title,
            message: r.message,
            category: r.category,
            timestamp: formatRelativeTime(r.createdAt),
            read: r.read,
            priority: r.priority,
            targetPage: r.targetPage,
            targetRecord: r.targetRecord,
            icon: r.icon,
            iconClass: r.iconClass
        };
    }

    function getSubdomain() {
        var oSession = Session.get();
        return (oSession && oSession.subdomain) || Config.TEST_SUBDOMAIN;
    }

    // No "previous/read" archive anymore - a notification is either in this
    // unread list or it's gone (Mark As Read / Clear All both just drop it).
    function refresh() {
        return fetch(Config.AUTH_BASE_URL + "/api/notifications/listNotifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subdomain: getSubdomain() })
        })
            .then(function (oResponse) { return oResponse.json(); })
            .then(function (oData) {
                if (!oData.success) { throw new Error(oData.message || "listNotifications failed"); }
                var aUnread = (oData.notifications || []).filter(function (r) { return !r.read; }).map(toDisplayItem);
                oModel.setProperty("/items", aUnread);
                oModel.setProperty("/unreadCount", aUnread.length);
                oModel.setProperty("/isDummyData", false);
                updateGlobalBellBadges();
            })
            .catch(function () {
                notice();
                oModel.setProperty("/items", DUMMY_ITEMS.slice());
                oModel.setProperty("/unreadCount", DUMMY_ITEMS.length);
                oModel.setProperty("/isDummyData", true);
                updateGlobalBellBadges();
            });
    }

    // Initial load, then a light poll so the bell reflects things other users/
    // systems trigger without needing a websocket layer for this - see
    // xyra-core lib/notification_engine.
    refresh();
    var POLL_INTERVAL_MS = 20000;
    setInterval(refresh, POLL_INTERVAL_MS);

    return {
        getModel: function () {
            return oModel;
        },

        refresh: refresh,

        setActiveTab: function (sTab) {
            oModel.setProperty("/activeTab", sTab);
        },

        markAsRead: function (sId) {
            var aItems = oModel.getProperty("/items") || [];
            var aNewItems = aItems.filter(function (item) { return item.id !== sId; });

            if (aNewItems.length !== aItems.length) {
                oModel.setProperty("/items", aNewItems);
                oModel.setProperty("/unreadCount", aNewItems.length);
                updateGlobalBellBadges();
            }

            if (!oModel.getProperty("/isDummyData")) {
                fetch(Config.AUTH_BASE_URL + "/api/notifications/markAsRead", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subdomain: getSubdomain(), id: sId })
                }).catch(function () { /* best-effort - local state already updated */ });
            }
        },

        clearAll: function () {
            oModel.setProperty("/items", []);
            oModel.setProperty("/unreadCount", 0);
            updateGlobalBellBadges();

            if (!oModel.getProperty("/isDummyData")) {
                fetch(Config.AUTH_BASE_URL + "/api/notifications/clearAll", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subdomain: getSubdomain() })
                }).catch(function () { /* best-effort - local state already updated */ });
            }
        },

        updateBadges: updateGlobalBellBadges
    };
});
