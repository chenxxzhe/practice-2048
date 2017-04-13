
import game from './game.js';

import './main.less';

window.onload = function() {
    var zone = document.getElementById('test');
    var tileContainer = document.getElementsByClassName('tile-container')[0];
    for (var i = 0, l = 4; i < l; i++) {
        var tile = document.createElement('div');
        var pos = ' tile-pos-' + (i + 1) + '-4 ';
        var color = 'tile-color-' + Math.pow(2, i + 3);
        tile.className = 'tile ' + color + pos;
        tileContainer.appendChild(tile);
    }

};

