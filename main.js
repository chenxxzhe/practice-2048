window.onload = function () {
    var zone = document.getElementById('zone');
    var bestScore = document.getElementById('best');
    var currentScore = document.getElementById('current');
    var startBtn = document.getElementById('start');
    var undoBtn  = document.getElementById('undo');

    startBtn.onclick = function () {
        game.onStart = function () {
            zone.innerHTML = game.print();
        }

        window.addEventListener('keydown', function (e) {
            var action = {
                37: function() {
                    game.move(game.LEFT);
                },
                38: function() {
                    game.move(game.UP);
                },
                39: function() {
                    game.move(game.RIGHT);
                },
                40: function() {
                    game.move(game.DOWN);
                },
            };
            action[e.keyCode]();

            zone.innerHTML = game.print()
        });

        game.onScore = function() {
            bestScore.innerHTML = 'best: ' + game.best;
            currentScore.innerHTML = 'score: ' + game.score;
        }

        game.onGameOver = function() {

        }

        game.start();
    };

    undoBtn.onclick = function () {

    }
};
