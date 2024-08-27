//TODO:
//Add Colors to positions
//Add Tiers
//Add My vs someone elses draft
//

var draftNumber = 0;

$(document).ready(function () {
    $(".nav-container a").click(toggleContainer);
    $(".table tbody").on("change", "input.notMine", notMineClicked);
    $(".table tbody").on("change", "input.mine", mineClicked);
    $("#uploadCsv").change(mainUploadCsv);
    $("#exportedCsv").change(exportedUploadCsv);
    $("#tiersCsv").change(tierUploadCsv);
    $(".export").click(exportMain);
    $(".hidden").click(toggleHidden);
    $(".hidden-tiers").click(toggleTiers);
    $(".translate").click(exportUnderdog);
});

function toggleContainer() {
    var container = $(this).attr("data-container");
    $(".table-container").hide();
    $("." + container).show();
    $(".nav-container a.active").removeClass("active");
    $(this).addClass("active");
}

function notMineClicked() {
    var checkbox = $(this);
    var tr = checkbox.parent().parent();
    if (tr.hasClass("strikeout")) {
        tr.removeClass("strikeout");

        draftNumber--;
        tr.find(".draftedAt").text("");
    } else {
        tr.addClass("strikeout");

        draftNumber++;
        tr.find(".draftedAt").text(draftNumber);
    }

    var playerName = tr.find(".playerName").text().trim();
    strikeTieredPlayer(playerName);
    // tr.slideUp();
    if (isDefault) tr.addClass("hide-me");
    else tr.addClass("show-me");
}

function mineClicked() {
    var checkbox = $(this);
    var tr = checkbox.parent().parent();
    if (tr.hasClass("mine")) {
        tr.removeClass("mine");

        draftNumber--;
        tr.find(".draftedAt").text("");
    } else {
        tr.addClass("mine");

        draftNumber++;
        tr.find(".draftedAt").text(draftNumber);
    }

    var playerName = tr.find(".playerName").text().trim();
    strikeTieredPlayer(playerName);
    if (isDefault) tr.addClass("hide-me");
    else tr.addClass("show-me");
}

function strikeTieredPlayer(playerName) {
    $(".tiers-table tbody tr td").each(function () {
        var cell = $(this);
        var tierPlayerName = cell
            .text()
            .replace(/\(\d+\)/, "")
            .trim();
        if (
            tierPlayerName.toLowerCase() == playerName.toLowerCase() &&
            !cell.hasClass("smol-strike")
        ) {
            cell.addClass("smol-strike");
        } else if (
            tierPlayerName.toLowerCase() == playerName.toLowerCase() &&
            cell.hasClass("smol-strike")
        ) {
            cell.removeClass("smol-strike");
        }

        var tr = cell.parent();
        if (tr.find(".smol-strike").length == 4) {
            tr.addClass("hideTiers");
        } else {
            tr.removeClass("hideTiers");
        }
    });
}

function mainUploadCsv() {
    if (this.files && this.files[0]) {
        var myFile = this.files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function (e) {
            let csvData = e.target.result;
            parseMainCsvData(csvData); // calling function for parse csv data
            $("#uploadCsv").val("");
            $(".main-table-container").show();
        });

        reader.readAsBinaryString(myFile);
    }
}

function parseMainCsvData(csvData) {
    let parsedData = [];
    let objectData = [];

    let newLinebrk = csvData.split("\n");
    for (let i = 1; i < newLinebrk.length; i++) {
        var line = newLinebrk[i].split(",");
        parsedData.push(line);

        objectData.push({
            mine: false,
            notMine: false,
            neither: true,
            name: line[0].replace(/"/g, ""),
            team: line[1] ? line[1].replace(/"/g, "") : "",
            position: line[2]
                ? line[2].replace(/"/g, "")[0] + line[2].replace(/"/g, "")[1]
                : "",
            etrRank: line[3] ? line[3].replace(/"/g, "") : "",
            etrPositionRank: line[4] ? line[4].replace(/"/g, "") : "",
            adp: line[5] ? line[5].replace(/"/g, "") : "",
            adpPosRank: line[6] ? line[6].replace(/"/g, "") : "",
            adpDiff: line[7] ? line[7].replace(/"/g, "") : "",
            Notes: line[8],
            draftedAt: "",
        });
    }

    var template = document.getElementById("main-template").innerHTML;
    var tableBody = Mustache.render(template, objectData);
    $(".main-table tbody").html(tableBody);

    // console.table(parsedata);
}

function exportedUploadCsv() {
    if ($(".tiers-table tbody tr").length == 0) {
        $("#exportedCsv").val("");
        alert("Upload Tiers first");
        return;
    }

    if (this.files && this.files[0]) {
        var myFile = this.files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function (e) {
            let csvData = e.target.result;
            parseExportedCsvData(csvData); // calling function for parse csv data
            $("#exportedCsv").val("");
            $(".main-table-container").show();
        });

        reader.readAsBinaryString(myFile);
    }
}

function parseExportedCsvData(csvData) {
    let parsedData = [];
    let objectData = [];

    let newLinebrk = csvData.split("\n");
    for (let i = 1; i < newLinebrk.length; i++) {
        var line = newLinebrk[i].split(",");
        parsedData.push(line);

        var notMine = line[0].toLowerCase() == "true";
        var mine = line[1].toLowerCase() == "true";

        var draftedAt = line[10];
        if (!isNaN(draftedAt)) {
            var number = parseInt(draftedAt);
            if (number > draftNumber) {
                draftNumber = number;
            }
        }

        if (mine || notMine) {
            strikeTieredPlayer(line[2]);
        }

        objectData.push({
            mine: mine,
            notMine: notMine,
            neither: !mine && !notMine,
            name: line[2],
            etrRank: line[3],
            team: line[4],
            position: line[5],
            etrPositionRank: line[6],
            adp: line[7],
            adpPositionRank: line[8],
            adpDiff: line[9],
            notes: line[11],
            draftedAt: draftedAt,
        });
    }

    var template = document.getElementById("main-template").innerHTML;
    var tableBody = Mustache.render(template, objectData);
    $(".main-table tbody").html(tableBody);
}

function tierUploadCsv() {
    if (this.files && this.files[0]) {
        var myFile = this.files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function (e) {
            let csvData = e.target.result;
            parseTierCsvData(csvData); // calling function for parse csv data
            $("#tiersCsv").val("");
            $(".tiers-table").show();
        });

        reader.readAsBinaryString(myFile);
    }
}

function parseTierCsvData(csvData) {
    let parsedData = [];
    let objectData = [];

    let newLinebrk = csvData.split("\n");
    for (let i = 1; i < newLinebrk.length; i++) {
        var line = newLinebrk[i].split(",");
        parsedData.push(line);

        var wrName = line[6] ? line[6].replace(/"/g, "") : "";
        var wrRank = line[8] ? line[8].replace(/"/g, "") : "";
        var rbName = line[3] ? line[3].replace(/"/g, "") : "";
        var rbRank = line[5] ? line[5].replace(/"/g, "") : "";
        var teName = line[9] ? line[9].replace(/"/g, "") : "";
        var teRank = line[11] ? line[11].replace(/"/g, "") : "";
        var qbName = line[0] ? line[0].replace(/"/g, "") : "";
        var qbRank = line[2] ? line[2].replace(/"/g, "") : "";

        objectData.push({
            rank: line[0],
            wrName: wrName,
            wrRank: wrRank,
            rbName: rbName,
            rbRank: rbRank,
            teName: teName,
            teRank: teRank,
            qbName: qbName,
            qbRank: qbRank,
        });
    }

    var template = document.getElementById("tier-template").innerHTML;
    var tableBody = Mustache.render(template, objectData);
    $(".tiers-table tbody").html(tableBody);

    // console.table(parsedata);
}

function getRankForPosition(stringRank) {
    var rank = "";

    if (stringRank) {
        rank = "_" + stringRank.trim()[stringRank.trim().length - 2];
    }

    return rank;
}

function exportMain() {
    var rows = [];

    $(".main-table tr").each(function () {
        var row = $(this);

        var currentRow = [];
        row.find("td").each(function () {
            if (
                $(this).hasClass("notMineContainer") ||
                $(this).hasClass("mineContainer")
            ) {
                if ($(this).find("input[type=checkbox]").is(":checked")) {
                    currentRow.push("true");
                } else {
                    currentRow.push("false");
                }
            } else {
                currentRow.push($(this).text().trim());
            }
        });

        rows.push(currentRow);
    });

    let csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mainrankinsExported.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
}

var isDefault = true;
function toggleHidden() {
    // $( ".table tbody .strikeout").toggle();
    // $( ".table tbody tr.mine").toggle();

    if (isDefault) {
        $(".table tbody .hide-me").addClass("show-me");
        $(".table tbody .hide-me").removeClass("hide-me");
        isDefault = false;
    } else {
        $(".table tbody .show-me").addClass("hide-me");
        $(".table tbody .show-me").removeClass("show-me");
        isDefault = true;
    }
}

function toggleTiers() {
    $(".hideTiers").toggle();
}

function exportUnderdog() {
    exportUnderdogFile();
}

var etrCsvData;
var underdogCsvData;

function exportUnderdogFile() {
    var etrFile = $("#etrCSV");
    var etrFileValue = etrFile[0].files[0];
    var etrReader = new FileReader();

    etrReader.addEventListener("load", function (etrEvent) {
        etrCsvData = etrEvent.target.result;
        $("#etrCSV").val("");

        var underdogFile = $("#underogCSV");
        var underdogFileValue = underdogFile[0].files[0];
        var underdogReader = new FileReader();

        underdogReader.addEventListener("load", function (underDogEvent) {
            underdogCsvData = underDogEvent.target.result;
            $("#underogCSV").val("");

            combineAndExport();
        });

        underdogReader.readAsBinaryString(underdogFileValue);
    });

    etrReader.readAsBinaryString(etrFileValue);
}

function combineAndExport() {
    var underdogDictionary = {};

    let underdogLines = underdogCsvData.split("\n");
    for (var index = 1; index < underdogLines.length; index++) {
        var line = underdogLines[index].split(",");
        if (!line[1]) {
            continue;
        }

        var name =
            line[1]
                .replace(/(\r\n|\n|\r)/gm, "")
                .replace('"', "")
                .replace('"', "") +
            line[2]
                .replace(/(\r\n|\n|\r)/gm, "")
                .replace('"', "")
                .replace('"', "");
        underdogDictionary[name] = line[0];
    }

    console.log(underdogDictionary.length);

    var exportLines = [];
    var etrLines = etrCsvData.split("\n");

    var headerRow = [];
    headerRow.push("id");
    headerRow.push("name");
    exportLines.push(headerRow);

    for (var index = 1; index < etrLines.length; index++) {
        var line = etrLines[index].split(",");
        if (!line[0]) {
            continue;
        }
        var name = line[0].replace(" ", "").replace('"', "").replace('"', "");
        var currentRow = [];
        if (underdogDictionary[name]) {
            currentRow.push(underdogDictionary[name]);
            currentRow.push(name);
            exportLines.push(currentRow);
            delete underdogDictionary[name];
        }
    }

    for (const property in underdogDictionary) {
        var currentRow = [];
        currentRow.push(underdogDictionary[property]);
        currentRow.push(property);
        exportLines.push(currentRow);
    }

    let csvContent =
        "data:text/csv;charset=utf-8," +
        exportLines.map((e) => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mainrankinsExported.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
}
