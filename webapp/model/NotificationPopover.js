sap.ui.define([
    "sap/m/ResponsivePopover",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/List",
    "sap/m/CustomListItem",
    "sap/m/MessageToast",
    "sap/ui/core/Icon",
    "xyraweb/model/NotificationService"
], function (ResponsivePopover, VBox, HBox, Text, Button, List, CustomListItem, MessageToast, Icon, NotificationService) {
    "use strict";

    var oNotificationPopover = null;
    var _oCurrentController = null;

    // No "previous/read" archive - Mark As Read just drops the item from this
    // list (see NotificationService.markAsRead).
    function renderListItems(aItems) {
        if (!aItems || aItems.length === 0) {
            var oEmptyBox = new VBox({
                alignItems: "Center",
                items: [
                    new Text({ text: "No new notifications." }).addStyleClass("textMuted")
                ]
            }).addStyleClass("sapUiMediumMargin");

            return [new CustomListItem({ content: [oEmptyBox] })];
        }

        return aItems.map(function (item) {
            var oIconCircle = new HBox({
                justifyContent: "Center",
                alignItems: "Center",
                items: [
                    new Icon({ src: item.icon || "sap-icon://bell", size: "1rem" })
                ]
            }).addStyleClass("xyraNotifyIconCircle " + (item.iconClass || "xyraNotifyIconBlue"));

            var oTimeBox = new HBox({
                alignItems: "Center",
                items: [
                    new Icon({ src: "sap-icon://future", size: "0.75rem" }).addStyleClass("textMuted sapUiTinyMarginEnd"),
                    new Text({ text: (item.timestamp || "").toUpperCase() }).addStyleClass("xyraNotifyItemTime")
                ]
            }).addStyleClass("sapUiTinyMarginTop");

            var oTextBox = new VBox({
                width: "78%",
                items: [
                    new Text({
                        text: item.title + " - " + item.message
                    }).addStyleClass("xyraNotifyItemText"),
                    oTimeBox
                ]
            }).addStyleClass("sapUiTinyMarginBegin");

            var oRightAction = new Button({
                icon: "sap-icon://accept",
                type: "Transparent",
                tooltip: "Mark As Read",
                press: function (oEvent) {
                    oEvent.stopPropagation();
                    NotificationService.markAsRead(item.id);
                    updatePopoverUI();
                    MessageToast.show("Marked as read");
                }
            }).addStyleClass("xyraNotifyItemActionBtn");

            var oRowContent = new HBox({
                alignItems: "Start",
                items: [oIconCircle, oTextBox, oRightAction]
            }).addStyleClass("sapUiSmallMargin");

            var oListItem = new CustomListItem({
                content: [oRowContent]
            }).addStyleClass("xyraNotifyListItem");

            oListItem.attachPress(function () {
                NotificationService.markAsRead(item.id);
                updatePopoverUI();
                if (item.targetPage && _oCurrentController) {
                    try {
                        _oCurrentController.getOwnerComponent().getRouter().navTo(item.targetPage);
                    } catch (e) {
                        console.error("Navigation target failed:", item.targetPage, e);
                    }
                }
                if (oNotificationPopover && oNotificationPopover.isOpen()) {
                    oNotificationPopover.close();
                }
            });

            return oListItem;
        });
    }

    function updatePopoverUI() {
        if (!oNotificationPopover) { return; }
        var oModel = NotificationService.getModel();
        var iUnread = oModel.getProperty("/unreadCount") || 0;
        var sTab = oModel.getProperty("/activeTab") || "ALL";
        var aAllItems = oModel.getProperty("/items") || [];

        // Filter items by category tab
        var aFilteredItems = aAllItems;
        if (sTab === "TASK") {
            aFilteredItems = aAllItems.filter(function (item) { return item.category === "TASK"; });
        } else if (sTab === "REMINDER") {
            aFilteredItems = aAllItems.filter(function (item) { return item.category === "REMINDER"; });
        }

        // Update badge text inside popover
        if (oNotificationPopover._oBadgePill) {
            oNotificationPopover._oBadgePill.setText(iUnread + " New");
            oNotificationPopover._oBadgePill.setVisible(iUnread > 0);
        }

        // Update list
        if (oNotificationPopover._oNewList) {
            oNotificationPopover._oNewList.destroyItems();
            renderListItems(aFilteredItems).forEach(function (oItem) {
                oNotificationPopover._oNewList.addItem(oItem);
            });
        }

        // Update Tab styles
        if (oNotificationPopover._oTabAll && oNotificationPopover._oTabTasks && oNotificationPopover._oTabReminders) {
            oNotificationPopover._oTabAll.removeStyleClass("xyraNotifyTabActive");
            oNotificationPopover._oTabTasks.removeStyleClass("xyraNotifyTabActive");
            oNotificationPopover._oTabReminders.removeStyleClass("xyraNotifyTabActive");

            if (sTab === "TASK") {
                oNotificationPopover._oTabTasks.addStyleClass("xyraNotifyTabActive");
            } else if (sTab === "REMINDER") {
                oNotificationPopover._oTabReminders.addStyleClass("xyraNotifyTabActive");
            } else {
                oNotificationPopover._oTabAll.addStyleClass("xyraNotifyTabActive");
            }
        }
    }

    return {
        toggle: function (oEvent, oController) {
            var oButton = (oEvent && typeof oEvent.getSource === "function") ? oEvent.getSource() : oEvent;
            _oCurrentController = oController;

            if (!oNotificationPopover) {
                var oBadgePill = new Text({ text: "0 New" }).addStyleClass("xyraNotifyBadgePill");

                var oTabAll = new Text({ text: "VIEW ALL" }).addStyleClass("xyraNotifyTabItem xyraNotifyTabActive");
                var oTabTasks = new Text({ text: "TASKS" }).addStyleClass("xyraNotifyTabItem");
                var oTabReminders = new Text({ text: "REMINDERS" }).addStyleClass("xyraNotifyTabItem");

                oTabAll.attachBrowserEvent("click", function () {
                    NotificationService.setActiveTab("ALL");
                    updatePopoverUI();
                });
                oTabTasks.attachBrowserEvent("click", function () {
                    NotificationService.setActiveTab("TASK");
                    updatePopoverUI();
                });
                oTabReminders.attachBrowserEvent("click", function () {
                    NotificationService.setActiveTab("REMINDER");
                    updatePopoverUI();
                });

                var oClearAllBtn = new Button({
                    text: "Clear All",
                    icon: "sap-icon://decline",
                    type: "Reject",
                    press: function () {
                        NotificationService.clearAll();
                        updatePopoverUI();
                        MessageToast.show("All notifications cleared.");
                    }
                }).addStyleClass("xyraNotifyClearBtn");

                var oHeaderTopRow = new HBox({
                    justifyContent: "SpaceBetween",
                    alignItems: "Center",
                    items: [
                        new HBox({
                            alignItems: "Center",
                            items: [
                                new Text({ text: "YOUR NOTIFICATIONS" }).addStyleClass("xyraNotifyHeaderTitle"),
                                oBadgePill
                            ]
                        }),
                        oClearAllBtn
                    ]
                }).addStyleClass("xyraNotifyHeaderTopRow");

                var oTabRow = new HBox({
                    alignItems: "Center",
                    items: [oTabAll, oTabTasks, oTabReminders]
                }).addStyleClass("xyraNotifyTabRow");

                var oHeaderBox = new VBox({
                    items: [oHeaderTopRow, oTabRow]
                }).addStyleClass("xyraNotifyHeaderBox");

                var oNewList = new List({ showSeparators: "Inner" }).addStyleClass("xyraNotifyList");

                var oMainContainer = new VBox({
                    items: [oHeaderBox, oNewList]
                });

                oNotificationPopover = new ResponsivePopover({
                    placement: "Bottom",
                    showCloseButton: false,
                    contentWidth: "420px",
                    content: [oMainContainer]
                }).addStyleClass("xyraCustomNotificationPopover");

                oNotificationPopover._oBadgePill = oBadgePill;
                oNotificationPopover._oTabAll = oTabAll;
                oNotificationPopover._oTabTasks = oTabTasks;
                oNotificationPopover._oTabReminders = oTabReminders;
                oNotificationPopover._oNewList = oNewList;
            }

            updatePopoverUI();

            if (oNotificationPopover.isOpen()) {
                oNotificationPopover.close();
            } else if (oButton) {
                oNotificationPopover.openBy(oButton);
            }
        }
    };
});
