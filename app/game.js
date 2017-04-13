
var game = {
    mat: [],
    score: 0,
    best: 0,
    LEFT: 0,
    DOWN: 1,
    RIGHT: 2,
    UP: 3,
    _history: {
        mat: [],
        score: [],
        best: [],
    },
    _last: {
        mat: [],
        score: 0,
        best: 0,
    },
    _started: false,
    _test: false,
    onStart: function() {},
    onScore: function() {},
    onGameOver: function() {},
};

function reset(resetBest) {
    game.mat = null;
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
    game._test = false;

    game.onScore();
}


function initMat() {
    game.mat = createFilledArr(0, 16);

    game.emptyTiles = getEmptyTiles();

    for (var i = 0, l = 2; i < l; i++) {
        genNumInEmpty();
    }
}

function getEmptyTiles() {
    var emptyTiles = [];
    game.mat.forEach(function(v, i) {
        if (v === 0) {
            emptyTiles.push(i);
        }
    });
    return emptyTiles;
}

function genNumInEmpty() {
    var randint = Math.floor(Math.random() * game.emptyTiles.length),
        tile = game.emptyTiles[randint];
    game.mat[tile] = choice([2, 4]);
    game.emptyTiles.splice(randint, 1);
}

function start() {
    game._started = true;
    initMat();
    game.onStart();
// TODO: keydown
}

function undo() {
    var history = game._history;
    if (!history || history.mat.length === 0) {
        return false;
    }
    game.mat = history.mat.pop();
    game.score = history.score.pop();
    game.best = history.best.pop();

    var last = game._last;
    last.mat = game.mat.slice();
    last.score = game.score;
    last.best = game.best;
    return true;
}

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

function move(direction, _testMat) {
    if (!game._started) {
        return;
    }
    // 检查是否有移动的机会
    if (isGameOver()) {
        return gameOver();
    }
    // 屏蔽无效移动
    if (!isValidMove()) {
        return;
    }

    var target = _testMat || game.mat;
    switch (direction) {
        case game.RIGHT:
            clockwiseTransform(target);
            clockwiseTransform(target);
            mergeToLeft(target);
            clockwiseTransform(target);
            clockwiseTransform(target);
            break;
        case game.UP:
            clockwiseTransform(target, true);
            mergeToLeft(target);
            clockwiseTransform(target);
            break;
        case game.DOWN:
            clockwiseTransform(target);
            mergeToLeft(target);
            clockwiseTransform(target, true);
            break;
        default:
            mergeToLeft(target);
    }

    if (!game._test) {
        genNumInEmpty();
    }
    record();
}

function mergeToLeft(matrix) {
    var block = 0;
    var mergeToNext = function (v, i) {
        if (i % 4 === 0 || v === 0) {
            return;
        }
        if (matrix[i - 1] === 0) {
            matrix[i - 1] = v;
            matrix[i] = 0;
            return mergeToNext(v, i - 1);
        } else if (i === block) {
            return;
        } else if (matrix[i - 1] === v) {
            matrix[i - 1] += v;
            matrix[i] = 0;
        // avoid emerging twice within the same tile in one step
            block = i;
            score(matrix[i - 1]);
            return;
        }
    };

    matrix.forEach(function (v, i) {
        mergeToNext(v, i);
    });

}

function score(v) {
    game.score += v;
    game.best = Math.max(game.score, game.best);
    game.onScore();

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

function index2RowCol(index) {
    return {
        row: Math.floor(index / 4),
        col: index % 4,
    };
}

function rowCol2Index(row, col) {
    return row * 4 + col;
}

function getMatValByRowCol(mat, row, col) {
    var index = rowCol2Index(row, col);
    return mat[index];
}


function isGameOver() {
    return false;
}

function gameOver() {
    reset();
    console.log('game over');
    game.onGameOver();
}

function isValidMove() {
    return true;

}


// console
function print(mat) {
    if (!mat) {
        mat = game.mat;
    }
    var str = '';
    mat.forEach(function (v, i) {
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


game.move = move;
game.print = print;
game.createFilledArr = createFilledArr;
game.index2RowCol = index2RowCol;
game.rowCol2Index = rowCol2Index;
game.getMatValByRowCol = getMatValByRowCol;
game.genNumInEmpty = genNumInEmpty;
game.start = start;
game.reset = reset;
game.undo = undo;


export default game;

