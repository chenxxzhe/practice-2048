import game from './game.js';
import './main.less';

// COOKIE 记录游戏状态
function recordCookie() {
    var status = {
        mat: game.mat,
        score: game.score,
        best: game.best,
    };
    document.cookie = 's=' + JSON.stringify(status);
}

function parseCookie() {
    if (document.cookie.substring(0, 2) === 's=') {
        var status = JSON.parse(document.cookie.substring(2));
        game.mat = status.mat;
        game.score = status.score;
        game.best = status.best;
        return true;
    }
    return false;

}


window.onload = function() {


    var newGameBtn = document.getElementById('newGameBtn'),
        undoBtn = document.getElementById('undoBtn'),
        currentScore = document.getElementById('currentScore'),
        bestScore = document.getElementById('bestScore'),
        gameOverShade = document.querySelector('.game-over'),
        gameOverModal = document.querySelector('.game-over-modal'),
        tryAgainBtn = document.querySelector('.try-again'),
        tileContainer = document.querySelector('.tile-container'),
        gameBoard = document.querySelector('.gameboard');


    newGameBtn.onclick = newGame;
    undoBtn.onclick = undo;

    game.onScore = function() {
        currentScore.innerHTML = game.score;
        bestScore.innerHTML = game.best;
    };

    game.onGameOver = function() {
        showModal();
        tryAgainBtn.onclick = function() {
            newGame();
            hideModal();
        };
    };
    function showModal() {
        gameOverShade.style.display = 'block';
        gameOverModal.className += ' slide-in';
    }
    function hideModal() {
        gameOverShade.style.display = 'none';
        gameOverModal.className = 'game-over-modal';
    }


    // 监听按键
    document.onkeydown = function(e) {
        var move = [37, 38, 39, 40];
        if (move.indexOf(e.keyCode) !== -1) {
            var action = {
                37: ()=>{
                    game.move(game.LEFT);
                },
                38: ()=>{
                    game.move(game.UP);
                },
                39: ()=>{
                    game.move(game.RIGHT);
                },
                40: ()=>{
                    game.move(game.DOWN);
                },
            };
            action[e.keyCode]();
            e.preventDefault();
            // e.stopPropagation();
            // e.returnValue = false;
            recordCookie();
        }
    };

    // 监听滑动
    var touchStartClientX, touchStartClientY, touchEndClientX, touchEndClientY;
    gameBoard.addEventListener('touchstart', function(e) {
        // e.preventDefault();
        if (event.targetTouches.length > 1) return; // 多于1个手指控制
        touchStartClientX = e.touches[0].clientX;
        touchStartClientY = e.touches[0].clientY;
    });
    gameBoard.addEventListener('touchmove', function(e) {
        e.preventDefault();
    });
    gameBoard.addEventListener('touchend', function(e) {
        if (event.targetTouches.length > 0) return; // 持续滑动
        touchEndClientX = event.changedTouches[0].clientX;
        touchEndClientY = event.changedTouches[0].clientY;
        var dx = touchEndClientX - touchStartClientX;
        var absDx = Math.abs(dx);
        var dy = touchEndClientY - touchStartClientY;
        var absDy = Math.abs(dy);
        if (Math.max(absDx, absDy) > 10) {
            if (absDx > absDy) {
                if (dx > 0) game.move(game.RIGHT);
                else game.move(game.LEFT);
            } else if (dy > 0) game.move(game.DOWN);
            else game.move(game.UP);
        }
    });

    game.onStart = function() {
        recordCookie();
    };
    game.onMove = function(v, newPos, lastPos) {
        var tile = getTile(lastPos);
        if (tile) {
            tile.className = getTileClassName(v, newPos);
        }
    };

    game.onEmerge = function(v, posIndex, removedPosIndex) {
        var removedTile = getTile(removedPosIndex);
        // 一定要在改className之前找到元素
        var emergedTile = getTile(posIndex);
        removedTile.className = getTileClassName(v, posIndex) + ' hide';
        setTimeout(function() {
        // 为了让动画完成
            tileContainer.removeChild(removedTile);
        }, 100);
        emergedTile.innerHTML = v;
        emergedTile.className = getTileClassName(v, posIndex);
    };
    game.onGenNewNum = function(v, posIndex) {
        var tile = createTile(v, posIndex);
        tile.className += ' fade-in';
        tileContainer.appendChild(tile);
    };

    if (parseCookie()) {
        resetTile();
    }

    function newGame() {
        hideModal();
        // 移动如何改变tile
        tileContainer.innerHTML = '';
        game.newGame();
    }
    function getTileClassName(value, pos) {
        return ['tile', 'tile-' + value, getColorClassName(value), getPosClassName(pos)].join(' ');
    }

    function getPosClassName(pos) {
        var posObj = game.index2RowCol(pos);
        return 'tile-pos-' + posObj.row + '-' + posObj.col;
    }
    function getColorClassName(value) {
        return 'tile-color-' + value;
    }

    function createTile(value, posIndex) {
        var tile = document.createElement('div');
        tile.className = getTileClassName(value, posIndex);
        tile.innerHTML = value;
        return tile;
    }

    function getTile(pos) {
        var className = getPosClassName(pos);
        return document.querySelector('.' + className);
    }

    function undo() {
        if (game.undo()) {
            resetTile();
        }
    }

    function resetTile() {
        game._started = true;
        tileContainer.innerHTML = '';
        var fragment = document.createDocumentFragment();
        game.mat.forEach((v, i)=>{
            if (v !== 0) {
                fragment.appendChild(createTile(v, i));
            }
        });
        tileContainer.appendChild(fragment);
        game.onScore();
    }
};


