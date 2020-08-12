//TODO:
//Add Colors to positions
//Add Tiers
//Add My vs someone elses draft
//


var draftNumber = 0;


$(document).ready(function(){
    $(".nav-container a").click(toggleContainer);
    $( ".table tbody").on( "change", "input.notMine", notMineClicked);
    $( ".table tbody").on( "change", "input.mine", mineClicked);
    $("#uploadCsv").change(mainUploadCsv);
    $("#exportedCsv").change(exportedUploadCsv);
    $("#tiersCsv").change(tierUploadCsv);
    $(".export").click(exportMain);
});

function toggleContainer() {
    var container = $(this).attr("data-container");
    $(".table-container").hide();
    $("." + container).show();
    $(".nav-container a.active").removeClass("active");
    $(this).addClass("active");
};

function notMineClicked() {
    var checkbox = $(this);
    var tr = checkbox.parent().parent();
    if (tr.hasClass("strikeout")) {
        tr.removeClass("strikeout");

        draftNumber--;
        tr.find(".draftedAt").text("");
    }
    else {
        tr.addClass("strikeout");
        
        draftNumber++;
        tr.find(".draftedAt").text(draftNumber);
    }


    var playerName = tr.find(".playerName").text().trim();
    strikeTieredPlayer(playerName);
}

function mineClicked() {
    var checkbox = $(this);
    var tr = checkbox.parent().parent();
    if (tr.hasClass("mine")) {
        tr.removeClass("mine");

        draftNumber--;
        tr.find(".draftedAt").text("");
    }
    else {
        tr.addClass("mine");

        draftNumber++;
        tr.find(".draftedAt").text(draftNumber);
    }

    var playerName = tr.find(".playerName").text().trim();
    strikeTieredPlayer(playerName);
}

function strikeTieredPlayer(playerName){

    $(".tiers-table tbody tr td").each(function(){
        var cell = $(this);
        var tierPlayerName = cell.text().replace(/\(\d+\)/, "").trim();
        if (tierPlayerName.toLowerCase() == playerName.toLowerCase() && !cell.hasClass("smol-strike")) {
            cell.addClass("smol-strike");
        }
        else if (tierPlayerName.toLowerCase() == playerName.toLowerCase() && cell.hasClass("smol-strike")) {
            cell.removeClass("smol-strike");
        }
    });
}

function mainUploadCsv() {
    if (this.files && this.files[0]) {
        
        var myFile = this.files[0];
        var reader = new FileReader();

        reader.addEventListener('load', function (e) {
              
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
    for(let i = 1; i < newLinebrk.length; i++) {

        var line = newLinebrk[i].split(",");
        parsedData.push(line);

        objectData.push({
            mine: false,
            notMine: false,
            neither: true,
            name: line[0],
            etrRank: line[1],
            team: line[2],
            position: line[3],
            etrPositionRank: line[4],
            adp: line[5],
            adpPositionRank: line[6],
            adpDiff: line[7],
            notes: line[8],
            draftedAt: ""
        });
    }

    var template = document.getElementById('main-template').innerHTML;
    var tableBody = Mustache.render(template, objectData);
    $(".main-table tbody").html(tableBody);

    // console.table(parsedata);
}

function exportedUploadCsv(){

    if ($(".tiers-table tbody tr").length == 0) {
        $("#exportedCsv").val("");
        alert("Upload Tiers first");
        return;
    }

    if (this.files && this.files[0]) {
        
        var myFile = this.files[0];
        var reader = new FileReader();

        reader.addEventListener('load', function (e) {
              
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
    for(let i = 1; i < newLinebrk.length; i++) {

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
            draftedAt: draftedAt
        });
    }

    var template = document.getElementById('main-template').innerHTML;
    var tableBody = Mustache.render(template, objectData);
    $(".main-table tbody").html(tableBody);
}

function tierUploadCsv() {
    if (this.files && this.files[0]) {
        
        var myFile = this.files[0];
        var reader = new FileReader();

        reader.addEventListener('load', function (e) {
              
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
    for(let i = 1; i < newLinebrk.length; i++) {

        var line = newLinebrk[i].split(",");
        parsedData.push(line);

        var wrName = line[1].replace(/"/g, '');
        var wrRank = getRankForPosition(wrName);
        var rbName = line[2].replace(/"/g, '');;
        var rbRank = getRankForPosition(rbName);
        var teName = line[3].replace(/"/g, '');;
        var teRank = getRankForPosition(teName);
        var qbName = line[4].replace(/"/g, '');;
        var qbRank = getRankForPosition(qbName);

        objectData.push({
            rank: line[0],
            wrName: wrName,
            wrRank: wrRank,
            rbName: rbName,
            rbRank: rbRank,
            teName: teName,
            teRank: teRank,
            qbName: qbName,
            qbRank: qbRank
        });
    }

    var template = document.getElementById('tier-template').innerHTML;
    var tableBody = Mustache.render(template, objectData);
    $(".tiers-table tbody").html(tableBody);

    // console.table(parsedata);
}

function getRankForPosition(stringRank){
    var rank = "";
    
    if (stringRank) {
        rank = "_" + stringRank.trim()[stringRank.trim().length - 2];
    }

    return rank;
}

function exportMain(){
    var rows = [];

    $(".main-table tr").each(function(){

        var row = $(this);

        var currentRow = [];
        row.find("td").each(function(){
            if ($(this).hasClass("notMineContainer") || $(this).hasClass("mineContainer")){
                if ($(this).find("input[type=checkbox]").is(":checked")) {
                    currentRow.push("true");
                }
                else {
                    currentRow.push("false");
                }
            }
            else{
                currentRow.push($(this).text().trim());            
            }
        });

        rows.push(currentRow);


    });

    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mainrankinsExported.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);

};



