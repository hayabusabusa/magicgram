'use strict'

const Canvas = require('canvas');
const fs = require('fs');
const DepthMapper = require('./depthMapper');

class TextDepthMapper extends DepthMapper {
    constructor(
        text,
        output = null,
        font = "bold 56px Helvetica, Arial, sans-serif", 
        paddingX = null, 
        paddingY = null, 
        sizeToFill = true, 
        verticalAlign = 'middle'
        ) {
        super();
        this.text = text;
        this.output = output;
        this.font = font;
        this.paddingX = paddingX;
        this.paddingY = paddingY;
        this.sizeToFill = sizeToFill;
        this.verticalAlign = verticalAlign;
    }

    make(width, height) {
        const canvas = Canvas.createCanvas(width, height);

        const context = canvas.getContext('2d');
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillRect(0, 0, width, height);
        context.fillStyle = 'rgb(255,255,255)';

        const paddingX = this.paddingX || Math.round(width * 0.1);
        const paddingY = this.paddingY || Math.round(height * 0.1);

        const canvasTextWrapper = new CanvasTextWrapper(canvas, this.text, this.output, this.font, paddingX, paddingY);
        canvasTextWrapper.drawText();

        var x, y, offset,
            depthMap = [],
            pixelData = context.getImageData(0, 0, width, height).data;
        
        for (y = 0; y < height; y++) {
            depthMap[y] = new Float32Array(width);
            offset = width * y * 4;
            for (x = 0; x < width; x++) {
                // assume grayscale (R, G, and B are equal)
                depthMap[y][x] = pixelData[offset + (x * 4)] / 255;
            }
        }
        return depthMap;
    }
}

/*! CanvasTextWrapper (https://github.com/namniak/CanvasTextWrapper, forked to peeinears/CanvasTextWrapper)
*  Version:  0.1.0
*
*  MIT License (http://www.opensource.org/licenses/mit-license.html)
*  Copyright (c) 2014 Vadim Namniak
*/

class CanvasTextWrapper {
    constructor(
        canvas, 
        text,
        output = null,
        font = '18px Arial, sans-serif',
        paddingX = 0,           // zero px left & right text padding relative to canvas or parent
        paddingY = 0,           // zero px top & bottom text padding relative to canvas or parent
        textAlign = 'center',     // each line of text is aligned left
        verticalAlign = 'middle',  // text lines block is aligned top
        fitParent = false,      // text is tested to fit canvas width
        lineBreak = 'auto',     // text fills the element's (canvas or parent) width going to a new line on a whole word
        sizeToFill = false      // text is resized to fill the container height (given font size is ignored)
        ) {
        this.canvas = canvas;
        this.text = text;
        this.output = output
        this.font = font;
        this.textAlign = textAlign;
        this.verticalAlign = verticalAlign;
        this.paddingX = paddingX;
        this.paddingY = paddingY;
        this.fitParent = fitParent;
        this.lineBreak = lineBreak;
        this.sizeToFill = sizeToFill;

        // extract font size
        this.lineHeight = parseInt(this.font.replace(/^\D+/g, ''), 10);

        // validate all set properties
        this.validate();

        // basic context settings
        this.context = this.canvas.getContext('2d');
        this.context.font = this.font;
        this.context.textBaseline = 'bottom';
    }

    drawText() {
        const elementWidth = (this.fitParent === false) ? this.canvas.width : this.canvas.parentNode.clientWidth;
        var textPos = {
            x: 0,
            y: 0
        };

        if (this.sizeToFill) {
            // starting at 1px increase font size by 1px until text block exceeds the height of its padded container or until words break
            const elementHeight = ((this.fitParent === false) ? this.canvas.height : this.canvas.parentNode.clientHeight) - (this.paddingX * 2);
            const numWords = this.text.trim().split(/\s+/).length;

            var fontSize = 0;
            do {
                this.setFontSize(++fontSize);
                var lines = this.getWrappedText(elementWidth);
                var textBlockHeight = lines.length * this.lineHeight;
            } while (textBlockHeight < elementHeight && lines.join(' ').split(/\s+/).length == numWords);

            // use previous font size, not the one that broke the while condition
            this.setFontSize(--fontSize);
        }

        var lines = this.getWrappedText(elementWidth);
        var textBlockHeight = lines.length * this.lineHeight;

        // set vertical align for the whole text block
        this.setTextVerticalAlign(textPos, textBlockHeight);

        for (var i = 0; i < lines.length; i++) {
            this.setTextHorizontalAlign(this.context, textPos, elementWidth, lines[i]);

            textPos.y = parseInt(textPos.y) + parseInt(this.lineHeight);
            this.context.fillText(lines[i], textPos.x, textPos.y);
        }

        // output text image if needed
        if(this.output) {
            this.outputTextPNGImage();
        }
    }

    setFontSize(size) {
        const fontParts = this.context.font.split(/\b\d+px\b/i);
        this.context.font = fontParts[0] + size + 'px' + fontParts[1];
        this.lineHeight = size;
    }

    getWrappedText(elementWidth) {
        const maxTextLength = elementWidth - (this.paddingX * 2);

        const words = this.text.trim().split(/\s+/);
        const lines = [];

        this.checkWordsLength(this.context, words, maxTextLength);
        this.breakTextIntoLines(this.context, lines, words, maxTextLength);

        return lines;
    }

    checkWordsLength(context, words, maxTextLength) {
        for (var i = 0; i < words.length; i++) {
            var testString = '';
            const tokenLen = context.measureText(words[i]).width;

            // check if a word exceeds the element's width
            if (tokenLen > maxTextLength) {
                for (var k = 0; (context.measureText(testString + words[i][k]).width <= maxTextLength) && (k < words[i].length); k++) {
                    testString += words[i][k];
                }

                // break the word because it's too  long
                var sliced = words[i].slice(0, k);
                var leftover = words[i].slice(k);
                words.splice(i, 1, sliced, leftover);
            }
        }
    }

    breakTextIntoLines(context, lines, words, maxTextLength) {
        for (var i = 0, j = 0; i < words.length; j++) {
            lines[j] = '';

            if (this.lineBreak === 'auto') {
                // put as many full words in a line as can fit element
                while ((context.measureText(lines[j] + words[i]).width <= maxTextLength) && (i < words.length)) {
                    lines[j] += words[i] + ' ';
                    i++;
                }
                lines[j] = lines[j].trim();
            } else if (this.lineBreak === 'word') {
                // put each next word in a new line
                lines[j] = words[i];
                i++;
            }
        }
    }

    setTextHorizontalAlign(context, textPos, elementWidth, line) {
        if (this.textAlign === 'center') {
            textPos.x = (elementWidth - context.measureText(line).width) / 2;
        } else if (this.textAlign === 'right') {
            textPos.x = elementWidth - context.measureText(line).width - this.paddingX;
        } else {
            textPos.x = this.paddingX;
        }
    }

    setTextVerticalAlign(textPos, textBlockHeight) {
        const elementHeight = (this.fitParent === false) ? this.canvas.height : this.canvas.parentNode.clientHeight;

        if (this.verticalAlign === 'middle') {
            textPos.y = (elementHeight - textBlockHeight) / 2;
        } else if (this.verticalAlign === 'bottom') {
            textPos.y = elementHeight - textBlockHeight - this.paddingY;
        } else {
            textPos.y = this.paddingY;
        }
    }

    outputTextPNGImage() {
        const writeStream = fs.createWriteStream(this.output + "text.png");
        const pngStream = this.canvas.pngStream();
        
        pngStream.on("data", function(chunk) {
            writeStream.write(chunk);
        });
    
        pngStream.on("end", function() {
            console.log("save png to", writeStream.path);
        });
    }

    validate() {
        if (!(this.canvas instanceof Canvas.Canvas)) {
            throw new TypeError('From CanvasTextWrapper(): Element passed as the first parameter is not an instance of Canvas.');
        }
        if (typeof this.text !== 'string') {
            throw new TypeError('From CanvasTextWrapper(): The second, dedicated for the text, parameter must be a string.');
        }
        if (isNaN(this.lineHeight)) {
            throw new TypeError('From CanvasTextWrapper(): Cannot parse font size as an Integer. Check "font" property\'s value.');
        }
        if (this.textAlign !== 'left' && this.textAlign !== 'center' && this.textAlign !== 'right') {
            throw new TypeError('From CanvasTextWrapper(): Unsupported horizontal align value is used. Property "textAlign" can only be set to "left", "center", or "right".');
        }
        if (this.verticalAlign !== 'top' && this.verticalAlign !== 'middle' && this.verticalAlign !== 'bottom') {
            throw new TypeError('From CanvasTextWrapper(): Unsupported vertical align value is used. Property "verticalAlign" can only be set to "top", "middle", or "bottom".');
        }
        if (isNaN(this.paddingX)) {
            throw new TypeError('From CanvasTextWrapper(): Unsupported horizontal padding value is used. Property "paddingX" must be set to a number');
        }
        if (isNaN(this.paddingY)) {
            throw new TypeError('From CanvasTextWrapper(): Unsupported vertical padding value is used. Property "paddingY" must be set to a number.');
        }
        if (typeof this.fitParent !== 'boolean') {
            throw new TypeError('From CanvasTextWrapper(): Property "fitParent" must be set to a Boolean.');
        }
        if (this.lineBreak !== 'auto' && this.lineBreak !== 'word') {
            throw new TypeError('From CanvasTextWrapper(): Unsupported line break value is used. Property "lineBreak" can only be set to "auto", or "word".');
        }
        if (typeof this.sizeToFill !== 'boolean') {
            throw new TypeError('From CanvasTextWrapper(): Property "sizeToFill" must be set to a Boolean.');
        }
    }
}

module.exports = TextDepthMapper;