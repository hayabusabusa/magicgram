'use strict'

class DepthMapper {
    autoResize = true;

    make(width, height) {
        // !!! Overwrite this method
        return [[0]];
    }

    generate(width, height) {
        if (this.autoResize) return this.resize(this.make(width, height), width, height);
        else return this.make(width, height);
    }

    resize(origDepthMap, width, height) {
        var origDepthMapY, x, y,
            resizedDepthMap = [],
            origDepthMapHeight = origDepthMap.length,
            origDepthMapWidth = origDepthMap[0].length;
        
        if (origDepthMapWidth === width && origDepthMapHeight === height) {
            return origDepthMap;
        }
        
        for (y = 0; y < height; y++) {
            resizedDepthMap[y] = new Float32Array(width);
            origDepthMapY = Math.floor(y * origDepthMapHeight / height);
            for (x = 0; x < width; x++) {
                resizedDepthMap[y][x] = origDepthMap[origDepthMapY][Math.floor(x * origDepthMapWidth / width)];
            }
        }
        
        return resizedDepthMap;
    }
}

module.exports = DepthMapper;