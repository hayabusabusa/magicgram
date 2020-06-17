const Magicgram = require('../index');

Magicgram.render(3, 3, [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]], null, 'DepthMapTest');
Magicgram.render(1024, 600, null, new Magicgram.TextDepthMapper('月曜日', 'text-test', "bold 200px Helvetica, Arial, sans-serif"), 'TextTest', [[46, 204, 113, 255], [39, 174, 96, 255], [236, 240, 241, 255]]);