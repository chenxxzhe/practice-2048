import game from './app/game';
import {expect} from 'chai';

describe('Game', function () {

    beforeEach(function () {
        game.newGame(true);
    });

    it('init correctly', function () {
        // game.start();
        var count0 = 0,
            count2 = 0,
            count4 = 0;
        game.mat.forEach(function (v) {
            switch (v) {
                case 0: count0 += 1; break;
                case 2: count2 += 1; break;
                case 4: count4 += 1; break;
            }
        });
        // 4x4
        expect(game.mat.length).to.be.equal(16);
        // two tiles with 2 or 4
        expect(count2 === 2 || count2 === 1 || count2 === 0).to.be.true;
        expect(count4).to.be.equal(2 - count2);
        expect(count0).to.be.equal(14);
    });

    it('move correctly', function () {
        game._noNewNum = true;
        game.mat = game.createFilledArr(0, 16);
        game.mat[3] = game.mat[7] = game.mat[11] = game.mat[15] = 2;
        game.move(game.LEFT);

        expect(game.getMatValByRowCol(game.mat, 0, 0)).to.be.equal(2);
        expect(game.getMatValByRowCol(game.mat, 1, 0)).to.be.equal(2);
        game.move(game.RIGHT);
        expect(game.getMatValByRowCol(game.mat, 0, 3)).to.be.equal(2);
        expect(game.getMatValByRowCol(game.mat, 1, 3)).to.be.equal(2);
        game.move(game.UP);
        expect(game.getMatValByRowCol(game.mat, 0, 3)).to.be.equal(4);
        expect(game.getMatValByRowCol(game.mat, 1, 3)).to.be.equal(4);
        game.move(game.DOWN);
        expect(game.getMatValByRowCol(game.mat, 2, 3)).to.be.equal(0);
        expect(game.getMatValByRowCol(game.mat, 3, 3)).to.be.equal(8);

        game.mat[0] = game.mat[4] = 2;
        game.mat[8] = 4;
        game.move(game.UP);
        expect(game.getMatValByRowCol(game.mat, 0, 0)).to.be.equal(4);
        expect(game.getMatValByRowCol(game.mat, 1, 0)).to.be.equal(4);
    });

    it('generate number correctly', function () {
        // gen 2 random number when starting new game
        expect(game.emptyTiles.length).to.be.equal(14);
        game.genNumInEmpty();
        expect(game.emptyTiles.length).to.be.equal(13);
        // gen num when moving correctly;
        // reset emptyTiles
        game.emptyTiles = [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14];
        game.mat = game.createFilledArr(0, 16);
        game.mat[3] = game.mat[7] = game.mat[11] = game.mat[15] = 2;
        // can not gen number in the filled tile
        expect(game.genNumInEmpty(3)).to.be.false;
        expect(game.emptyTiles.length).to.be.equal(12);

        game.move(game.RIGHT);
        // no num generated beacuse movement invaild
        expect(game.emptyTiles.length).to.be.equal(12);

        game.move(game.LEFT);
        // after valid movement, emptyTiles list should be updated and gen new number
        expect(game.emptyTiles.length).to.be.equal(11);
        game.move(game.DOWN);
        expect(game.emptyTiles.length).to.be.equal(12);
        game.move(game.DOWN);
        expect(game.emptyTiles.length === 12 || game.emptyTiles.length === 13).to.be.true;
        if (game.mat[3]) {
            expect(game.genNumInEmpty(3)).to.be.false;
        } else {
            expect(game.genNumInEmpty(3)).to.be.true;
        }


    });

    it('score correctly', function () {
        game.mat = game.createFilledArr(0, 16);
        game.mat[3] = game.mat[7] = 2;
        game.move(game.UP);
        expect(game.score).to.be.equal(4);
        expect(game.best).to.be.equal(4);
        game.mat[3] = game.mat[7] = 4;
        game.move(game.UP);
        expect(game.score).to.be.equal(12);
        expect(game.best).to.be.equal(12);
        game.reset();
        expect(game.score).to.be.equal(0);
        expect(game.best).to.be.equal(12);
    });

    it('undo correctly', function () {
        game.mat = game.createFilledArr(0, 16);
        game.mat[3] = game.mat[7] = 2;
        game.mat[11] = 4;
        game._noNewNum = true;
        game.move(game.UP);
        var step0 = game.mat.slice();
        game.move(game.DOWN);
        var step1 = game.mat.slice();
        game.move(game.LEFT);
        var step2 = game.mat.slice();
        game.move(game.RIGHT);
        game.undo();
        expect(game.mat).to.be.eql(step2);
        expect(game.score).to.be.equal(12);
        expect(game.best).to.be.equal(12);
        game.undo();
        expect(game.mat).to.be.eql(step1);
        expect(game.score).to.be.equal(12);
        expect(game.best).to.be.equal(12);
        game.undo();
        expect(game.mat).to.be.eql(step0);
        expect(game.score).to.be.equal(4);
        expect(game.best).to.be.equal(4);
        expect(game.undo()).to.be.false;
        expect(game.mat).to.be.eql(step0);
        expect(game.score).to.be.equal(4);
        expect(game.best).to.be.equal(4);
    });

    it('will fail correctly', function () {
        // keep moving until game over
        var flag = '';
        game.onGameOver = function() {
            flag = 'game over';
        };
        var direction = 0;
        var count = 0;
        while (game._started) {
            game.move(direction);
            direction += 1;
            direction %= 4;
            if (count++ >= 1000) {
                break;
            }
        }
        expect(game._started).to.be.false;
        expect(flag).to.be.equal('game over');
        // game.onGameOver = null;
        // 检查满格但可以继续移动的情况
        flag = '';
        game._noNewNum = true;
        game.newGame();
        game.mat = game.createFilledArr(0, 16);
        var mat = game.mat;
        mat[0] = mat[4] = mat[8] = mat[12] = 2;
        mat[1] = mat[5] = mat[9] = mat[13] = 4;
        mat[2] = mat[6] = mat[10] = mat[14] = 2;
        mat[3] = mat[7] = mat[11] = mat[15] = 4;
        game.move(game.RIGHT);
        expect(game._started).to.be.true;
        expect(flag).to.be.equal('');

    });
});
