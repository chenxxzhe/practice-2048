var game = require('./game.js');

var expect = require('chai').expect;

describe('Game', function () {

    beforeEach(function () {
        game.reset(true);
        game.start();
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
        var testMat = game.createFilledArr(0, 16);
        testMat[3] = testMat[6] = testMat[9] = testMat[15] = 2;

        game.move(game.LEFT, testMat);
        expect(game.getMatValByRowCol(testMat, 0, 0)).to.be.equal(2);
        expect(game.getMatValByRowCol(testMat, 1, 0)).to.be.equal(2);
        game.move(game.RIGHT, testMat);
        expect(game.getMatValByRowCol(testMat, 0, 3)).to.be.equal(2);
        expect(game.getMatValByRowCol(testMat, 1, 3)).to.be.equal(2);
        game.move(game.UP, testMat);
        expect(game.getMatValByRowCol(testMat, 0, 3)).to.be.equal(4);
        expect(game.getMatValByRowCol(testMat, 1, 3)).to.be.equal(4);
        game.move(game.DOWN, testMat);
        expect(game.getMatValByRowCol(testMat, 2, 3)).to.be.equal(0);
        expect(game.getMatValByRowCol(testMat, 3, 3)).to.be.equal(8);

        testMat[0] = testMat[4] = 2;
        testMat[8] = 4;
        game.move(game.UP, testMat);
        expect(game.getMatValByRowCol(testMat, 0, 0)).to.be.equal(4);
        expect(game.getMatValByRowCol(testMat, 1, 0)).to.be.equal(4);
    });
    it('generate number correctly', function () {
        game.mat = game.createFilledArr(0, 16);
        testMat[3] = testMat[6] = testMat[9] = testMat[15] = 2;
        game.genNumInEmpty();
        expect(game.emptyTiles.length).to.be.equal(13);
        game.genNumInEmpty();
        expect(game.emptyTiles.length).to.be.equal(12);
        // new empty tile record after emerging

    });
    it('score correctly', function () {
        // game.start();
        var testMat = game.createFilledArr(0, 16);
        testMat[3] = testMat[7] = 2;
        game.move(game.UP, testMat);
        expect(game.score).to.be.equal(4);
        expect(game.best).to.be.equal(4);
        testMat[3] = testMat[7] = 4;
        game.move(game.UP, testMat);
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
        game._test = true;
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

    })
});
