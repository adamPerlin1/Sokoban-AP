'use strict';
// type
const WALL = 'wall';
const FLOOR = 'floor';
const TARGET = 'target';
// game elements
const GAMER = 'GAMER';
const BOX = 'BOX';
const CLOCK = 'CLOCK';
const GOLD = 'GOLD';
const GLUE = 'GLUE';
const WATER = 'WATER';
const MAGNET = 'MAGNET';
// assets
const GAMER_IMG = '<img src="images/player.jpg" />';
const BOX_IMG = '📦';
const CLOCK_IMG = '⏱';
const GOLD_IMG = '🥇';
const GLUE_IMG = '🛑';
const WATER_IMG = '💦';
const MAGNET_IMG = '🧲';

var gBoard;
var gTargets = [];
var gBonusInterval;
var gObstacleInterval;
var gScore = 100;
var gBoardType = false;
var gBlockType;
var gPrevBoards = [];

function init() {
    buildDefault();
}

function startGame() {
    clearInterval(gBonusInterval);
    clearInterval(gObstacleInterval);
    document.querySelector('.board').style.borderCollapse = 'collapse';
    if (gBoardType) {
        gBoardType = false;
        renderBoard(gBoard);
        const buttons = document.querySelectorAll('.hidden');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].style.display = 'none';
        }
    }
    gPlayer.isStuck = false;
    gBonusInterval = setInterval(addBonus, 10000);
    gObstacleInterval = setInterval(addObstacle, 10000);
}

function buildDefault() {
    gPlayerPos = { i: 2, j: 2 };
    gBoardType = false;
    gBoard = buildBoard();
    gTargets = [{ i: 2, j: 7 }, { i: 7, j: 2 }];
    placeTargets(gTargets);
    renderBoard(gBoard);
    createBoxes(gBoard, gBoxes);
    createPlayer(gBoard, gPlayerPos);
}

function buildCustom() {
    const buttons = document.querySelectorAll('.hidden');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].style.display = 'inline';
    }
    gBoardType = true;
    gTargets = [];
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function buildBoard() {
    const size = 10;
    var board = createMat(size, size);
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var cell = { type: FLOOR, gameElement: null }
            if (!gBoardType) {
                if (i === 0 || i === board.length - 1 ||
                    j === 0 || j === board[i].length - 1 ||
                    (i === 5 && j !== 5)) {
                    cell.type = WALL;
                }
            }

            board[i][j] = cell;
        }
    }
    return board;
}

function placeTargets(targetsPos) {
    for (var i = 0; i < targetsPos.length; i++) {
        var currCell = targetsPos[i];
        // Model
        gBoard[currCell.i][currCell.j].type = TARGET;
    }
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[i].length; j++) {
            const currCell = board[i][j];
            const cellTypeClass = currCell.type + ` cell${i}-${j}`;
            var functionType = (gBoardType) ? `markInput(this,${i},${j})` : `moveTo(${i},${j})`;
            strHTML += `\t<td class="${cellTypeClass}" onclick="${functionType}" >`;
            strHTML += (currCell.gameElement) ? getElementImg(currCell.gameElement) : '';
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    const elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function setBuildTypeAsDefault() {
    gBoardType = false;
}

function setBuildTypeAsCustom() {
    gBoardType = true;
}

function setBlockTypeAs(type) {
    // gBlockType = type

    switch (type) {
        case WALL:
            gBlockType = WALL;
            break;
        case BOX:
            gBlockType = BOX;
            break;
        case TARGET:
            gBlockType = TARGET;
            break;
        case GAMER:
            gBlockType = GAMER;
            break;
    }
}

function markInput(elCell, i, j) {
    if (gBlockType === GAMER) {
        gPlayerPos = { i: i, j: j };
        createPlayer(gBoard, gPlayerPos);
    } else if (gBlockType === BOX) {
        gBoard[i][j].gameElement = gBlockType;
        renderCell({ i: i, j: j }, getElementImg(gBlockType));
    } else {
        gBoard[i][j].type = gBlockType;
        elCell.classList.add(gBoard[i][j].type);
        if (gBlockType === TARGET) gTargets.push({ i: i, j: j });
    }

}

function addBonus() {
    console.log(1)
    const bonuses = [CLOCK, MAGNET, GOLD];
    const currBonus = bonuses[getRandomInt(0, bonuses.length)];
    const emptySpaces = getEmptySpaces(gBoard);
    const location = emptySpaces[getRandomInt(0, emptySpaces.length)];
    gBoard[location.i][location.j].gameElement = currBonus;
    renderCell(location, getElementImg(currBonus));
    setTimeout(removeElement, 5000, location);
}

function addObstacle() {
    const obstacles = [WATER, GLUE];
    const rndIdx = (Math.random() > 0.5) ? 0 : 1;
    const currObstacle = obstacles[rndIdx];
    if (currObstacle === WATER) addWater();
    else if (currObstacle === GLUE) addGlue();
}

function addWater() {
    const emptySpaces = getEmptySpaces(gBoard);
    const location = emptySpaces[getRandomInt(0, emptySpaces.length)];
    gBoard[location.i][location.j].gameElement = WATER;
    renderCell(location, WATER_IMG);
    setTimeout(function () { removeElement(location); }, 5000);
}

function addGlue() {
    const emptySpaces = getEmptySpaces(gBoard);
    const location = emptySpaces[getRandomInt(0, emptySpaces.length)];
    gBoard[location.i][location.j].gameElement = GLUE;
    renderCell(location, GLUE_IMG);
    setTimeout(function () { removeElement(location) }, 5000);
}


function countSteps() {
    gPlayer.stepCount++;
    const elCounter = document.querySelector('.step-count span');
    elCounter.innerText = gPlayer.stepCount;
    addScore(-1);
}

function addScore(diff) {
    gScore += diff;
    const elScoreCounter = document.querySelector('.score span');
    elScoreCounter.innerText = gScore;
}

function removeElement(location) {
    console.log(2)
    if (gBoard[location.i][location.j].gameElement !== GAMER) {
        gBoard[location.i][location.j].gameElement = null;
        renderCell(location, '');
    }
}

function getElementImg(element) {
    var img;
    switch (element) {
        case GAMER:
            return getPlayerSpan();
        case BOX:
            img = BOX_IMG;
            break
        case CLOCK:
            img = CLOCK_IMG;
            break
        case GOLD:
            img = GOLD_IMG;
            break
        case GLUE:
            img = GLUE_IMG;
            break
        case WATER:
            img = WATER_IMG;
            break
        case MAGNET:
            img = MAGNET_IMG;
            break
    }
    return img
}

function undo() {
    var prevBoard = gPrevBoards[gPrevBoards.length - 1];
    gPrevBoards.pop();
    gBoard = prevBoard.board;
    gPlayerPos = prevBoard.pos;
    renderBoard(gBoard);
}

function getEmptySpaces(mat) {
    var emptySpaces = [];
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat.length; j++) {
            if (mat[i][j].type !== WALL && mat[i][j].gameElement === null) {
                emptySpaces.push({ i: i, j: j });
            }
        }
    }
    return emptySpaces;
}

function checkGameOver() {
    for (var i = 0; i < gTargets.length; i++) {
        var currPos = gTargets[i];
        if (gBoard[currPos.i][currPos.j].gameElement !== BOX) return;
    }
    gameOver();
}

function gameOver() {
    document.querySelector('.modal').style.display = 'block';
    clearInterval(gBonusInterval);
    clearInterval(gObstacleInterval);
    gPlayer.isStuck = true;
}

function closeModal() {
    document.querySelector('.modal').style.display = 'none';
}

function restart() {
    closeModal();
    gPrevBoards = [];
    gPlayer.stepCount = 0;
    gScore = 100;
    gPlayer.isMagnetized = false;
    gPlayer.isStuck = false;
    gPlayer.countSteps = true;
    gPlayer.freeStepsCounter = null;
    gToBePulledBoxLoc = null;
    document.querySelector('.step-count span').innerText = 0;
    document.querySelector('.score span').innerText = 100;
    init();
}