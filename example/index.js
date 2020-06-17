const Magicgram = require('../index');

Magicgram.render(3, 3, [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]], null, `${__dirname}/default/`);
Magicgram.render(1024, 600, null, new Magicgram.TextDepthMapper('月曜日', `${__dirname}/text/`, "bold 200px Helvetica, Arial, sans-serif"), `${__dirname}/text/`, [[46, 204, 113, 255], [39, 174, 96, 255], [236, 240, 241, 255]]);