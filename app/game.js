
var game = {
    // 游戏面板显示的数字， 一维数组储存
    mat: [],
    emptyTiles: [],
    score: 0,
    best: 0,
    LEFT: 0,
    DOWN: 1,
    RIGHT: 2,
    UP: 3,
    // 历史状态记录，保存三条
    _history: {
        mat: [],
        score: [],
        best: [],
    },
    // 上一步状态记录
    _last: {
        mat: [],
        score: 0,
        best: 0,
    },
    _started: false,
    _noNewNum: false,
    onStart: null,
    onMove: null,
    onEmerge: null,
    onGenNewNum: null,
    onScore: null,
    onGameOver: null,
};

function reset(resetBest) {
    game.mat = null;
    game.emptyTiles = [];
    game._started = false;
    game.score = 0;
    if (resetBest) {
        game.best = 0;
    }
    game._history = {
        mat: [],
        score: [],
        best: [],
    };
    game._last = {
        mat: [],
        score: 0,
        best: game.best,
    };
    game._noNewNum = false;

    if (isFunction(game.onScore)) {
        game.onScore();
    }
}


function initMat() {
    game.mat = createFilledArr(0, 16);

    updateEmptyTiles();

    for (var i = 0, l = 2; i < l; i++) {
        genNumInEmpty();
    }
}

function updateEmptyTiles() {
    game.emptyTiles = [];
    game.mat.forEach(function(v, i) {
        if (v === 0) {
            game.emptyTiles.push(i);
        }
    });
}

function genNumInEmpty(pos) {
    if(game._noNewNum) return false;
    updateEmptyTiles();
    var position;
    if (pos) {
        position = pos;
    } else {
        var randint = Math.floor(Math.random() * game.emptyTiles.length);
        position = game.emptyTiles[randint];
    }
    var posIndex = game.emptyTiles.indexOf(position);
    if (game.mat[position] || posIndex === -1) {
        return false;
    }

    game.mat[position] = choice([2, 4]);
    if (isFunction(game.onGenNewNum)) {
        game.onGenNewNum(game.mat[position], position);
    }
    game.emptyTiles.splice(posIndex, 1);
    return true;
}

// 开始新游戏
function newGame(resetBest) {
    reset(resetBest);
    game._started = true;
    initMat();
    if (isFunction(game.onStart)) {
        game.onStart();
    }

}

// 得分
function score(v) {
    game.score += v;
    game.best = Math.max(game.score, game.best);
    if (isFunction(game.onScore)) {
        game.onScore();
    }

}

// 只有当没有空格，并且任意相邻的两格不相同才是gameOver
function isGameOver() {
    if (game.emptyTiles.length > 0) return false;
    // 对每个位置只查右下两格是否相等
    var flag = true;
    for (var i = 0, l = 16; i < l; i++) {
        if (Math.floor(i / 4) === 3) {
            // 最后一行，最后一个
            if (i % 4 === 3) continue;
            if (game.mat[i] === game.mat[i + 1]) {
                flag = false;
                break;
            }
        } else if (i % 4 === 3) {
            if (game.mat[i] === game.mat[i + 4]) {
                flag = false;
                break;
            }
        } else if (game.mat[i] === game.mat[i + 1] || game.mat[i] === game.mat[i + 4]) {
            flag = false;
            break;
        }

    }
    return flag;
}


// 游戏结束
function gameOver() {
    // reset();
    game._started = false;
    if (isFunction(game.onGameOver)) {
        game.onGameOver();
    }
}

// 回撤三步
function undo() {
    if (!game._started) return false;
    var history = game._history;
    if (!history || history.mat.length === 0) {
        return false;
    }
    game.mat = history.mat.pop();
    game.score = history.score.pop();
    game.best = history.best.pop();
    if (isFunction(game.onScore)) {
        game.onScore();
    }

    var last = game._last;
    last.mat = game.mat.slice();
    last.score = game.score;
    last.best = game.best;
    return true;
}

// 记录状态，用于undo
function record() {
    var last = game._last;
    var hist = game._history;
    // remember into history
    if (last.mat.length !== 0) {
        hist.mat.push(last.mat.slice());
        hist.score.push(last.score);
        hist.best.push(last.best);
    }
    if (hist.mat.length > 3) {
        hist.mat.shift();
        hist.score.shift();
        hist.best.shift();
    }
    // record this step
    last.mat = game.mat.slice();
    last.score = game.score;
    last.best = game.best;
}

function move(direction) {
    if (!game._started) {
        return;
    }
    var last = game.mat.slice();

    // 先移动再判断是否有效移动或者GAME OVER
    switch (direction) {
        case game.RIGHT:
            clockwiseTransform(game.mat);
            clockwiseTransform(game.mat);
            mergeToLeft(game.mat, onMove, onEmerge);
            clockwiseTransform(game.mat);
            clockwiseTransform(game.mat);
            break;
        case game.UP:
            clockwiseTransform(game.mat, true);
            mergeToLeft(game.mat, onMove, onEmerge);
            clockwiseTransform(game.mat);
            break;
        case game.DOWN:
            clockwiseTransform(game.mat);
            mergeToLeft(game.mat, onMove, onEmerge);
            clockwiseTransform(game.mat, true);
            break;
        case game.LEFT:
            mergeToLeft(game.mat, onMove, onEmerge);
            break;
    }

    // 首先检查是否有效移动
    if (last.toString() === game.mat.toString()) {
        // 然后检查emptyTiles还有没有元素
        if (isGameOver()) {
            // 无空格就gameOver
            gameOver();
        }
            // 无效移动不做任何事。
    } else {
        genNumInEmpty();
        record();
    }

    function onMove(v, newPos, lastPos) {
        if (isFunction(game.onMove)) {
            game.onMove(v, getOriginIndex(direction, newPos), getOriginIndex(direction, lastPos));
        }
    }

    function onEmerge(v, newPos, lastPos) {
        if (isFunction(game.onEmerge)) {
            game.onEmerge(v, getOriginIndex(direction, newPos), getOriginIndex(direction, lastPos));
        }
    }

}

// 合并格子
function mergeToLeft(matrix, onMove, onEmerge) {
    var block = 0;
    var mergeToNext = function (v, i) {
        if (i % 4 === 0 || v === 0) {
            return;
        }
        if (matrix[i - 1] === 0) {
            matrix[i - 1] = v;
            matrix[i] = 0;
            // 移动后的回调
            // 由于转置过，导致索引不对，因此要转置回去
            // XXX: 应该有更好的处理方法
            onMove(v, i - 1, i);
            return mergeToNext(v, i - 1);
        } else if (i === block) {
            return;
        } else if (matrix[i - 1] === v) {
            matrix[i - 1] += v;
            matrix[i] = 0;
            // 避免一次移动中同一格多次合并
            block = i;
            // 合并的回调
            onEmerge(matrix[i - 1], i - 1, i);
            score(matrix[i - 1]);
            return;
        }
    };

    matrix.forEach(function (v, i) {
        mergeToNext(v, i);
    });

}

// 由转置后的索引映射到原本的索引
function getOriginIndex(clockwiseTimes, index) {
    var pos, lastIndex = index;
    for (var i = 0, l = clockwiseTimes; i < l; i++) {
        pos = index2RowCol(lastIndex);
        lastIndex = rowCol2Index(3 - pos.col, pos.row);
    }
    return lastIndex;
}


function clockwiseTransform(matrix, reverse) {
    var temp = matrix.slice();
    if (reverse) {
        temp.forEach((v, i)=>{
            var pos = index2RowCol(i),
                newPos = rowCol2Index(3 - pos.col, pos.row);
            matrix[newPos] = v;
        });
    } else {
        temp.forEach((v, i)=>{
            var pos = index2RowCol(i),
                newPos = rowCol2Index(pos.col, 3 - pos.row);
            matrix[newPos] = v;
        });
    }

}

// 一维数组的索引转为行列
function index2RowCol(index) {
    return {
        row: Math.floor(index / 4),
        col: index % 4,
    };
}

// 行列转为一维数组索引
function rowCol2Index(row, col) {
    return row * 4 + col;
}

// 使用行列来获取一维数组的值
function getMatValByRowCol(mat, row, col) {
    var index = rowCol2Index(row, col);
    return mat[index];
}


// console
function print() {
    var str = '';
    game.mat.forEach(function (v, i) {
        str += (v || 0) + '\t';
        if (i % 4 === 3) {
            str += '\n';
        }
    });
    return str;
}

// util
function createFilledArr(data, size) {
    var arr = [];
    arr.length = size;
    return arr.join(',').split(',').map(()=>data);
}

function choice(opts) {
    var randomIndex = Math.floor(opts.length * Math.random());
    return opts[randomIndex];
}

function isFunction(obj) {
    return typeof obj === 'function';
}


game.move = move;
game.print = print;
game.createFilledArr = createFilledArr;
game.index2RowCol = index2RowCol;
game.rowCol2Index = rowCol2Index;
game.getMatValByRowCol = getMatValByRowCol;
game.genNumInEmpty = genNumInEmpty;
game.newGame = newGame;
game.reset = reset;
game.undo = undo;
game.isGameOver = isGameOver;
game.gameOver = gameOver;


export default game;

