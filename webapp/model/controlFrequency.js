sap.ui.define([], function () {
    "use strict";

    // Frequency: UI select label <-> backend Controls.frequency enum.
    // Shared by ControlManagement (table's Frequency Run display) and
    // ControlEditor (create/edit form) - was duplicated in both before the
    // dialogs moved to a dedicated page, which is exactly how the same
    // cron-parsing bug would've needed fixing twice.
    var FREQ_UI_TO_BE = {
        "Monthly (Last day of month)": "MONTHLY",
        "Weekly (Every Monday)": "WEEKLY",
        "Daily": "DAILY",
        "Realtime": "REALTIME",
        "Cron Expression": "CRON"
    };
    var FREQ_BE_TO_UI = {
        MONTHLY: "Monthly (Last day of month)",
        WEEKLY: "Weekly (Every Monday)",
        DAILY: "Daily",
        REALTIME: "Realtime",
        CRON: "Cron Expression"
    };

    function calculateCronRunCount(sCron) {
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
    }

    function calculateTotalRun(sFrequency, sCron) {
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
                return calculateCronRunCount(sCron);
            default:
                return "365";
        }
    }

    return {
        FREQ_UI_TO_BE: FREQ_UI_TO_BE,
        FREQ_BE_TO_UI: FREQ_BE_TO_UI,
        calculateCronRunCount: calculateCronRunCount,
        calculateTotalRun: calculateTotalRun
    };
});
