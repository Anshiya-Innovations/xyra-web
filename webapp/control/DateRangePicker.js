sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Input",
    "sap/m/Popover",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/Button",
    "sap/ui/core/HTML"
], function (Control, Input, Popover, VBox, HBox, Text, Button, HTML) {
    "use strict";

    var MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    var WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return Control.extend("xyraweb.control.DateRangePicker", {
        metadata: {
            properties: {
                value: { type: "string", defaultValue: "" },
                placeholder: { type: "string", defaultValue: "Select Date Range" },
                startDate: { type: "string", defaultValue: "" },
                endDate: { type: "string", defaultValue: "" },
                width: { type: "string", defaultValue: "100%" },
                enabled: { type: "boolean", defaultValue: true }
            },
            aggregations: {
                _input: { type: "sap.m.Input", multiple: false, visibility: "hidden" }
            },
            events: {
                change: {
                    parameters: {
                        value: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" }
                    }
                }
            }
        },

        init: function () {
            var that = this;
            this._dCurrentDisplayMonth = new Date();
            this._dStart = null;
            this._dEnd = null;
            this._dTentativeStart = null;
            this._dTentativeEnd = null;
            this._sViewMode = "DAYS";

            var oInput = new Input({
                placeholder: this.getPlaceholder(),
                width: "100%",
                valueHelpOnly: true,
                showValueHelp: true,
                valueHelpIconSrc: "sap-icon://appointment-2",
                valueHelpRequest: function (oEvent) {
                    that._togglePopover();
                }
            }).addStyleClass("xyraDateRangeInput");

            this.setAggregation("_input", oInput);
        },

        onclick: function (oEvent) {
            if (oEvent) {
                oEvent.stopPropagation();
                if (oEvent.preventDefault) {
                    oEvent.preventDefault();
                }
            }
            this._togglePopover();
        },

        ontap: function (oEvent) {
            if (oEvent) {
                oEvent.stopPropagation();
                if (oEvent.preventDefault) {
                    oEvent.preventDefault();
                }
            }
            this._togglePopover();
        },

        onBeforeRendering: function () {
            var oInput = this.getAggregation("_input");
            if (oInput) {
                oInput.setPlaceholder(this.getPlaceholder());
                oInput.setWidth(this.getWidth());
                oInput.setEnabled(this.getEnabled());
            }

            var sStart = this.getStartDate();
            var sEnd = this.getEndDate();
            if (sStart && !this._dStart) {
                this._dStart = this._parseDateStr(sStart);
            }
            if (sEnd && !this._dEnd) {
                this._dEnd = this._parseDateStr(sEnd);
            }
            this._updateInputValue();
        },

        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                oRm.openStart("div", oControl);
                oRm.style("width", oControl.getWidth());
                oRm.class("xyraDateRangePickerWrapper");
                oRm.openEnd();
                oRm.renderControl(oControl.getAggregation("_input"));
                oRm.close("div");
            }
        },

        getStartDate: function () {
            return this._dStart;
        },

        getEndDate: function () {
            return this._dEnd;
        },

        getStartDateString: function () {
            return this._formatISO(this._dStart);
        },

        getEndDateString: function () {
            return this._formatISO(this._dEnd);
        },

        getDateValue: function () {
            return this._dStart;
        },

        getSecondDateValue: function () {
            return this._dEnd;
        },

        getValue: function () {
            return this._formatDisplayRange(this._dStart, this._dEnd);
        },

        setValue: function (sVal) {
            this.setProperty("value", sVal, true);
            if (!sVal) {
                this.reset();
            } else {
                var oInput = this.getAggregation("_input");
                if (oInput) {
                    oInput.setValue(sVal);
                }
            }
            return this;
        },

        setStartDate: function (vVal) {
            this._dStart = this._parseDateStr(vVal);
            this.setProperty("startDate", this._formatISO(this._dStart), true);
            this._updateInputValue();
            return this;
        },

        setEndDate: function (vVal) {
            this._dEnd = this._parseDateStr(vVal);
            this.setProperty("endDate", this._formatISO(this._dEnd), true);
            this._updateInputValue();
            return this;
        },

        reset: function () {
            this._dStart = null;
            this._dEnd = null;
            this._dTentativeStart = null;
            this._dTentativeEnd = null;
            this.setProperty("startDate", "", true);
            this.setProperty("endDate", "", true);
            this.setProperty("value", "", true);
            var oInput = this.getAggregation("_input");
            if (oInput) {
                oInput.setValue("");
            }
            this.fireChange({
                value: "",
                startDate: "",
                endDate: ""
            });
            return this;
        },

        clear: function () {
            return this.reset();
        },

        _parseDateStr: function (vVal) {
            if (!vVal) { return null; }
            if (vVal instanceof Date) { return new Date(vVal.getFullYear(), vVal.getMonth(), vVal.getDate()); }
            var d = new Date(vVal);
            if (isNaN(d.getTime())) { return null; }
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        },

        _formatISO: function (d) {
            if (!d) { return ""; }
            var y = d.getFullYear();
            var m = String(d.getMonth() + 1).padStart(2, "0");
            var day = String(d.getDate()).padStart(2, "0");
            return y + "-" + m + "-" + day;
        },

        _formatDisplayDate: function (d) {
            if (!d) { return ""; }
            var day = String(d.getDate()).padStart(2, "0");
            var monthStr = MONTH_NAMES[d.getMonth()].substring(0, 3);
            var year = d.getFullYear();
            return day + " " + monthStr + " " + year;
        },

        _formatDisplayRange: function (d1, d2) {
            if (!d1 && !d2) { return ""; }
            if (d1 && !d2) { return this._formatDisplayDate(d1); }
            if (!d1 && d2) { return this._formatDisplayDate(d2); }
            return this._formatDisplayDate(d1) + " – " + this._formatDisplayDate(d2);
        },

        _updateInputValue: function () {
            var sFormatted = this._formatDisplayRange(this._dStart, this._dEnd);
            this.setProperty("value", sFormatted, true);
            var oInput = this.getAggregation("_input");
            if (oInput) {
                oInput.setValue(sFormatted);
            }
        },

        _togglePopover: function () {
            var iNow = Date.now();
            if (this._iLastToggle && (iNow - this._iLastToggle < 250)) {
                return;
            }
            this._iLastToggle = iNow;

            if (this._oPopover && this._oPopover.isOpen()) {
                this._oPopover.close();
            } else {
                this._openPopover();
            }
        },

        _openPopover: function () {
            var oInput = this.getAggregation("_input");

            this._sViewMode = "DAYS";
            if (this._dStart) {
                this._dTentativeStart = new Date(this._dStart.getTime());
                this._dTentativeEnd = this._dEnd ? new Date(this._dEnd.getTime()) : null;
                this._dCurrentDisplayMonth = new Date(this._dStart.getFullYear(), this._dStart.getMonth(), 1);
            } else {
                var dToday = new Date();
                this._dTentativeStart = new Date(dToday.getFullYear(), dToday.getMonth(), dToday.getDate());
                this._dTentativeEnd = null;
                this._dCurrentDisplayMonth = new Date(dToday.getFullYear(), dToday.getMonth(), 1);
            }

            if (!this._oPopover) {
                this._buildPopoverUI();
            } else {
                this._updatePopoverContent();
            }

            if (this._oPopover && !this._oPopover.isOpen()) {
                var oTarget = (oInput && oInput.getDomRef()) ? oInput : this;
                this._oPopover.openBy(oTarget);
            }
        },

        _buildPopoverUI: function () {
            var that = this;

            this._oPrevBtn = new Button({
                icon: "sap-icon://slim-arrow-left",
                type: "Transparent",
                press: function () {
                    if (that._sViewMode === "MONTHS") {
                        that._dCurrentDisplayMonth.setFullYear(that._dCurrentDisplayMonth.getFullYear() - 1);
                    } else if (that._sViewMode === "YEARS") {
                        that._dCurrentDisplayMonth.setFullYear(that._dCurrentDisplayMonth.getFullYear() - 12);
                    } else {
                        that._dCurrentDisplayMonth.setMonth(that._dCurrentDisplayMonth.getMonth() - 1);
                    }
                    that._updatePopoverContent();
                }
            }).addStyleClass("xyraCalNavBtn");

            this._oMonthText = new Text({
                text: ""
            }).addStyleClass("xyraCalHeaderTitleText xyraCalHeaderMonthText");

            this._oMonthText.attachBrowserEvent("click", function (oEvent) {
                oEvent.stopPropagation();
                if (that._sViewMode === "MONTHS") {
                    that._sViewMode = "DAYS";
                } else {
                    that._sViewMode = "MONTHS";
                }
                that._updatePopoverContent();
            });

            this._oYearText = new Text({
                text: ""
            }).addStyleClass("xyraCalHeaderTitleText xyraCalHeaderYearText");

            this._oYearText.attachBrowserEvent("click", function (oEvent) {
                oEvent.stopPropagation();
                if (that._sViewMode === "YEARS") {
                    that._sViewMode = "DAYS";
                } else {
                    that._sViewMode = "YEARS";
                }
                that._updatePopoverContent();
            });

            var oTitleBox = new HBox({
                alignItems: "Center",
                justifyContent: "Center",
                items: [this._oMonthText, this._oYearText]
            }).addStyleClass("xyraCalTitleBox");

            this._oNextBtn = new Button({
                icon: "sap-icon://slim-arrow-right",
                type: "Transparent",
                press: function () {
                    if (that._sViewMode === "MONTHS") {
                        that._dCurrentDisplayMonth.setFullYear(that._dCurrentDisplayMonth.getFullYear() + 1);
                    } else if (that._sViewMode === "YEARS") {
                        that._dCurrentDisplayMonth.setFullYear(that._dCurrentDisplayMonth.getFullYear() + 12);
                    } else {
                        that._dCurrentDisplayMonth.setMonth(that._dCurrentDisplayMonth.getMonth() + 1);
                    }
                    that._updatePopoverContent();
                }
            }).addStyleClass("xyraCalNavBtn");

            var oHeaderRow = new HBox({
                justifyContent: "SpaceBetween",
                alignItems: "Center",
                items: [this._oPrevBtn, oTitleBox, this._oNextBtn]
            }).addStyleClass("xyraCalHeader");

            var aWeekdayTexts = WEEKDAY_NAMES.map(function (sDay) {
                return new Text({ text: sDay }).addStyleClass("xyraCalWeekdayCell");
            });

            this._oWeekdayRow = new HBox({
                justifyContent: "SpaceAround",
                alignItems: "Center",
                items: aWeekdayTexts
            }).addStyleClass("xyraCalWeekdayHeader");

            this._oGridHTML = new HTML({
                content: "<div class='xyraCalGrid'></div>"
            });

            this._oGridHTML.attachBrowserEvent("click", function (oEvent) {
                oEvent.stopPropagation();
                var $target = $(oEvent.target);

                var $day = $target.hasClass("xyraCalDay") ? $target : $target.closest(".xyraCalDay");
                if ($day.length) {
                    var sDate = $day.attr("data-date");
                    if (sDate) {
                        that._onDayClick(that._parseDateStr(sDate));
                    }
                    return;
                }

                var $cell = $target.hasClass("xyraCalPickerCell") ? $target : $target.closest(".xyraCalPickerCell");
                if ($cell.length) {
                    if ($cell.attr("data-month") !== undefined) {
                        var iM = parseInt($cell.attr("data-month"), 10);
                        that._dCurrentDisplayMonth.setMonth(iM);
                        that._sViewMode = "DAYS";
                        that._updatePopoverContent();
                    } else if ($cell.attr("data-year") !== undefined) {
                        var iY = parseInt($cell.attr("data-year"), 10);
                        that._dCurrentDisplayMonth.setFullYear(iY);
                        that._sViewMode = "MONTHS";
                        that._updatePopoverContent();
                    }
                }
            });

            var oMainContainer = new VBox({
                items: [oHeaderRow, this._oWeekdayRow, this._oGridHTML]
            }).addStyleClass("xyraCalPopupContainer");

            this._oPopover = new Popover({
                placement: "Bottom",
                showCloseButton: false,
                showHeader: false,
                contentWidth: "310px",
                contentHeight: "auto",
                verticalScrolling: false,
                horizontalScrolling: false,
                content: [oMainContainer]
            }).addStyleClass("xyraCompactDateRangePopover");

            this.addDependent(this._oPopover);

            this._updatePopoverContent();
        },

        _updatePopoverContent: function () {
            var year = this._dCurrentDisplayMonth.getFullYear();
            var month = this._dCurrentDisplayMonth.getMonth();

            if (this._oMonthText) {
                this._oMonthText.setText(MONTH_NAMES[month]);
            }

            if (this._oYearText) {
                if (this._sViewMode === "YEARS") {
                    var startDecade = year - (year % 12);
                    var endDecade = startDecade + 11;
                    this._oYearText.setText(startDecade + " - " + endDecade);
                } else {
                    this._oYearText.setText(year.toString());
                }
            }

            if (this._oMonthText && this._oYearText) {
                this._oMonthText.removeStyleClass("xyraCalHeaderTitleActive");
                this._oYearText.removeStyleClass("xyraCalHeaderTitleActive");

                if (this._sViewMode === "MONTHS") {
                    this._oMonthText.addStyleClass("xyraCalHeaderTitleActive");
                } else if (this._sViewMode === "YEARS") {
                    this._oYearText.addStyleClass("xyraCalHeaderTitleActive");
                }
            }

            if (this._sViewMode === "MONTHS") {
                if (this._oWeekdayRow) { this._oWeekdayRow.setVisible(false); }

                var sHtml = "<div class='xyraCalPickerGrid xyraCalMonthGrid'>";
                for (var m = 0; m < 12; m++) {
                    var sMName = MONTH_NAMES[m].substring(0, 3);
                    var bSelected = (m === month);
                    sHtml += "<div class='xyraCalPickerCell " + (bSelected ? "xyraCalPickerCellActive" : "") + "' data-month='" + m + "'>" + sMName + "</div>";
                }
                sHtml += "</div>";

                if (this._oGridHTML) {
                    this._oGridHTML.setContent(sHtml);
                }

            } else if (this._sViewMode === "YEARS") {
                if (this._oWeekdayRow) { this._oWeekdayRow.setVisible(false); }
                var startDecade = year - (year % 12);
                var endDecade = startDecade + 11;

                var sHtml = "<div class='xyraCalPickerGrid xyraCalYearGrid'>";
                for (var y = startDecade; y <= endDecade; y++) {
                    var bSelected = (y === year);
                    sHtml += "<div class='xyraCalPickerCell " + (bSelected ? "xyraCalPickerCellActive" : "") + "' data-year='" + y + "'>" + y + "</div>";
                }
                sHtml += "</div>";

                if (this._oGridHTML) {
                    this._oGridHTML.setContent(sHtml);
                }

            } else {
                // DAYS mode
                if (this._oWeekdayRow) { this._oWeekdayRow.setVisible(true); }

                var firstDayIndex = new Date(year, month, 1).getDay();
                var daysInMonth = new Date(year, month + 1, 0).getDate();
                var dToday = new Date();

                var sHtml = "<div class='xyraCalGrid'>";

                for (var i = 0; i < firstDayIndex; i++) {
                    sHtml += "<div class='xyraCalDayEmpty'></div>";
                }

                for (var day = 1; day <= daysInMonth; day++) {
                    var dCell = new Date(year, month, day);
                    var sDateAttr = this._formatISO(dCell);

                    var bIsStart = this._dTentativeStart && this._isSameDate(dCell, this._dTentativeStart);
                    var bIsEnd = this._dTentativeEnd && this._isSameDate(dCell, this._dTentativeEnd);
                    var bIsInRange = this._dTentativeStart && this._dTentativeEnd &&
                        dCell > this._dTentativeStart && dCell < this._dTentativeEnd;
                    var bIsToday = this._isSameDate(dCell, dToday);

                    var aClasses = ["xyraCalDay"];
                    if (bIsStart && bIsEnd) {
                        aClasses.push("xyraCalDayStart", "xyraCalDayEnd");
                    } else if (bIsStart) {
                        aClasses.push("xyraCalDayStart");
                    } else if (bIsEnd) {
                        aClasses.push("xyraCalDayEnd");
                    } else if (bIsInRange) {
                        aClasses.push("xyraCalDayInRange");
                    }

                    if (bIsToday) {
                        aClasses.push("xyraCalDayToday");
                    }

                    sHtml += "<div class='" + aClasses.join(" ") + "' data-date='" + sDateAttr + "'>" + day + "</div>";
                }

                sHtml += "</div>";

                if (this._oGridHTML) {
                    this._oGridHTML.setContent(sHtml);
                }
            }
        },

        _isSameDate: function (d1, d2) {
            if (!d1 || !d2) { return false; }
            return d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate();
        },

        _onDayClick: function (dClicked) {
            if (!dClicked) { return; }

            if (!this._dTentativeStart || (this._dTentativeStart && this._dTentativeEnd)) {
                this._dTentativeStart = dClicked;
                this._dTentativeEnd = null;
                this._updatePopoverContent();
            } else if (this._dTentativeStart && !this._dTentativeEnd) {
                if (this._isSameDate(dClicked, this._dTentativeStart)) {
                    this._dTentativeEnd = new Date(dClicked.getTime());
                } else if (dClicked < this._dTentativeStart) {
                    this._dTentativeEnd = new Date(this._dTentativeStart.getTime());
                    this._dTentativeStart = dClicked;
                } else {
                    this._dTentativeEnd = dClicked;
                }
                this._updatePopoverContent();
                var that = this;
                setTimeout(function () {
                    that._applyTentativeSelection();
                }, 200);
            }
        },

        _applyTentativeSelection: function () {
            if (this._dTentativeStart && !this._dTentativeEnd) {
                this._dTentativeEnd = new Date(this._dTentativeStart.getTime());
            }

            this._dStart = this._dTentativeStart;
            this._dEnd = this._dTentativeEnd;

            var sFormatted = this._formatDisplayRange(this._dStart, this._dEnd);
            var sStartIso = this._formatISO(this._dStart);
            var sEndIso = this._formatISO(this._dEnd);

            this.setProperty("value", sFormatted, true);
            this.setProperty("startDate", sStartIso, true);
            this.setProperty("endDate", sEndIso, true);

            var oInput = this.getAggregation("_input");
            if (oInput) {
                oInput.setValue(sFormatted);
            }

            this.fireChange({
                value: sFormatted,
                startDate: sStartIso,
                endDate: sEndIso
            });

            if (this._oPopover) {
                this._oPopover.close();
            }
        },

        exit: function () {
            if (this._oPopover) {
                this._oPopover.destroy();
                this._oPopover = null;
            }
        }
    });
});
