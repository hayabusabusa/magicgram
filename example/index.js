const Magicgram = require('../index');

Magicgram.render(3, 3, [[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]], null, 'DepthMapTest');
Magicgram.render(1024, 600, null, new Magicgram.TextDepthMapper('あ'), 'TextTest');