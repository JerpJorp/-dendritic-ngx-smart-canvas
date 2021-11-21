import { CanvasHelper } from "../canvas-helper";

export class Hit {
    height = 0;
    width = 0;

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'concrete-hit-canvas';
        this.canvas.style.display = 'none';
        this.canvas.style.position = 'relative';
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.style.width;
        this.canvas.height = height;
        this.canvas.style.height = height + 'px';
        return this;
    }

    clear() {
        CanvasHelper.clear(this.context);       
    }

    getIntersection(x: number, y: number) {
        x = Math.round(x);
        y = Math.round(y);
        // if x or y are out of bounds return -1
        if (x < 0 || y < 0 || x > this.width || y > this.height) {
            return -1;
        }
        const data = this.context.getImageData(x, y, 1, 1).data;

        if (data[3] < 255) {
            return -1;
        }

        return this.rgbToInt(data);
    }

    getColorFromIndex(index: number) {
        var rgb = this.intToRGB(index);
        return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
    }

    rgbToInt(rgb: Uint8ClampedArray) {

        var r = rgb[0];
        var g = rgb[1];
        var b = rgb[2];
        return (r << 16) + (g << 8) + b;
    }

    intToRGB(number: number) {
        var r = (number & 0xff0000) >> 16;
        var g = (number & 0x00ff00) >> 8;
        var b = (number & 0x0000ff);
        return [r, g, b];
    }


}
