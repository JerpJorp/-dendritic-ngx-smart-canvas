import { CanvasHelper } from "../canvas-helper";

export class Scene {

    width = 0;
    height = 0;
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'concrete-scene-canvas';
        this.canvas.style.display = 'inline-block';
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.style.width = width + 'px';
        this.canvas.height = height;
        this.canvas.style.height = height + 'px';
    }

    clear() {
        CanvasHelper.clear(this.context);       
    }

    
    toImage(callback: (n: HTMLImageElement) => any) {
        var that = this,
            imageObj = new Image(),
            dataURL = this.canvas.toDataURL('image/png');

        imageObj.onload = function () {
            imageObj.width = that.width;
            imageObj.height = that.height;
            callback(imageObj);
        };
        imageObj.src = dataURL;
    }

    downloadfunction(config: any) {
        this.canvas.toBlob(function (blob) {
            var anchor = document.createElement('a'),
                dataUrl = URL.createObjectURL(blob),
                fileName = config.fileName || 'canvas.png',
                evtObj;

            // set a attributes
            anchor.setAttribute('href', dataUrl);
            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('download', fileName);

            // simulate click
            if (document.createEvent) {
                evtObj = document.createEvent('MouseEvents');
                evtObj.initEvent('click', true, true);
                anchor.dispatchEvent(evtObj);
            }
            else if (anchor.click) {
                anchor.click();
            }
        });
    }
}
