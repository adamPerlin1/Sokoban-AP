'use strict';

var gPlayer;
var gPlayerPos;

function createPlayer(board, pos) {
    gPlayer = {
        color: null,
        isMagnetized: false,
        isStuck: true,
        stepCount: 0,
        countSteps: true,
        freeStepsCounter: null
    };
    board[pos.i][pos.j].gameElement = GAMER;
    renderCell(pos, getPlayerSpan());
}

function moveTo(i, j) {
    if (gPlayer.isStuck) return;
    const targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;
    const iAbsDiff = Math.abs(i - gPlayerPos.i);
    const jAbsDiff = Math.abs(j - gPlayerPos.j);

    if ((iAbsDiff === 1 && jAbsDiff === 0) ||
        (jAbsDiff === 1 && iAbsDiff === 0)) {
        const prevBoard = {
            board: JSON.parse(JSON.stringify(gBoard)),
            pos: JSON.parse(JSON.stringify(gPlayerPos))
        };

        gPrevBoards.push(prevBoard);

        if (gPlayer.freeStepsCounter) {
            gPlayer.freeStepsCounter--;
            document.querySelector('h4 span').innerText = gPlayer.freeStepsCounter;
        } else if (gPlayer.freeStepsCounter === 0) {
            document.querySelector('h4').style.display = 'none';
            gPlayer.countSteps = true;
            gPlayer.freeStepsCounter = null;
        }

        if (targetCell.gameElement === BOX) {
            if (gPlayer.isMagnetized && checkIfNextToWall(i, j)) {
                gToBePulledBoxLoc = { i: i, j: j };
                return;
            }
            if (!handleBoxMovement(i, j)) return;
        } else if (targetCell.gameElement === CLOCK) {
            gPlayer.countSteps = false;
            gPlayer.freeStepsCounter = 10;
            document.querySelector('h4 span').innerText = gPlayer.freeStepsCounter;
            document.querySelector('h4').style.display = 'block';
        } else if (targetCell.gameElement === GOLD) {
            addScore(100);
        } else if (targetCell.gameElement === GLUE) {
            gPlayer.isStuck = true;
            gPlayer.stepCount += 5;
            addScore(-5);
            setTimeout(function () { gPlayer.isStuck = false }, 5000);
        } else if (targetCell.gameElement === MAGNET) {
            gPlayer.isMagnetized = true;
            gPlayer.color = 'red';
        }

        if (gToBePulledBoxLoc) {

            handleBoxMovement(gToBePulledBoxLoc.i, gToBePulledBoxLoc.j);
            gPlayer.isMagnetized = false;
            gToBePulledBoxLoc = null;
            gPlayer.color = null;
        } else {
            //model
            gBoard[gPlayerPos.i][gPlayerPos.j].gameElement = null;
            //DOM
            document.querySelector(`.cell${gPlayerPos.i}-${gPlayerPos.j}`).style.border = 'none';
            renderCell(gPlayerPos, '');
        }
        // model
        gPlayerPos.i = i;
        gPlayerPos.j = j;
        gBoard[gPlayerPos.i][gPlayerPos.j].gameElement = GAMER;
        // DOM
        document.querySelector(`.cell${gPlayerPos.i}-${gPlayerPos.j}`).style.border = 'blue solid 1px';
        renderCell(gPlayerPos, getPlayerSpan());


        if (gPlayer.countSteps) countSteps();
        checkGameOver();
    }
}

function handleKey(eventKeyboard) {
    const i = gPlayerPos.i;
    const j = gPlayerPos.j;
    switch (eventKeyboard.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            moveTo(i + 1, j);
            break;
    };
}

function getGamerDirection(targetLoc) {
    if (targetLoc.j < gPlayerPos.j) return 'Left';
    else if (targetLoc.j > gPlayerPos.j) return 'Right';
    else if (targetLoc.i < gPlayerPos.i) return 'Up';
    else return 'Down';
}

function getPlayerSpan() {
    return `<span style="border: ${gPlayer.color} solid 3px" >${GAMER_IMG}</span>`;
}