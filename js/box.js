'use strict';
var gBoxes = [{ i: 7, j: 5 }, { i: 7, j: 6 }];
var gToBePulledBoxLoc = null;

function createBoxes(board, boxesPos) {
    for (var i = 0; i < boxesPos.length; i++) {
        const currCell = boxesPos[i];
        // Model
        board[currCell.i][currCell.j].gameElement = BOX;
        // DOM
        renderCell(currCell, BOX_IMG);
    }
}

function handleBoxMovement(i, j) {
    const direction = getGamerDirection({ i: i, j: j });
    const nextBoxLocation = getNextBoxLocation(i, j, direction);
    const nextCell = gBoard[nextBoxLocation.i][nextBoxLocation.j];
    if (nextCell.type === WALL || nextCell.gameElement === BOX) return false;
    gBoard[i][j].gameElement = null;
    renderCell({ i: i, j: j }, '');
    if (nextCell.gameElement === WATER) {
        handleWaterMovement(nextBoxLocation, direction, BOX);
        gBoard[gPlayerPos.i][gPlayerPos.j].gameElement = null;
        renderCell(gPlayerPos, '');
        handleWaterMovement(gPlayerPos, direction, GAMER);
        return false;
    } else {
        gBoard[nextBoxLocation.i][nextBoxLocation.j].gameElement = BOX;
        renderCell(nextBoxLocation, BOX_IMG);
    }
    return true;
}

function handleWaterMovement(location, direction, element) {
    var nextCell = gBoard[location.i][location.j];
    var condition = true;
    while (condition) {
        var prevLoc = JSON.parse(JSON.stringify(location));
        location = getNextBoxLocation(location.i, location.j, direction);
        nextCell = gBoard[location.i][location.j];
        if (nextCell.type === WALL || nextCell.gameElement === BOX) condition = false;
        if (element === GAMER && gPlayer.countSteps) countSteps();
    }
    if (element === GAMER) gPlayerPos = prevLoc;
    gBoard[prevLoc.i][prevLoc.j].gameElement = element;
    renderCell(prevLoc, getElementImg(element));
}

function getNextBoxLocation(prevBoxLocI, prevBoxLocJ, direction) {
    var nextBoxLoc = {
        i: prevBoxLocI,
        j: prevBoxLocJ
    };
    switch (direction) {
        case 'Left':
            if (gToBePulledBoxLoc) nextBoxLoc.j++;
            else nextBoxLoc.j--;
            break;
        case 'Right':
            if (gToBePulledBoxLoc) nextBoxLoc.j--;
            else nextBoxLoc.j++;
            break;
        case 'Up':
            if (gToBePulledBoxLoc) nextBoxLoc.i++;
            else nextBoxLoc.i--;
            break;
        case 'Down':
            if (gToBePulledBoxLoc) nextBoxLoc.i--;
            else nextBoxLoc.i++;
            break;
    }
    return nextBoxLoc;
}

function checkIfNextToWall(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if ((i === cellI && j === cellJ) ||
                (i === cellI - 1 && j === cellJ - 1) ||
                (i === cellI + 1 && j === cellJ - 1) ||
                (i === cellI - 1 && j === cellJ + 1) ||
                (i === cellI + 1 && j === cellJ + 1)) continue;
            const cell = gBoard[i][j];
            if (cell.type === WALL) return true;
        }
    }
    return false;
}