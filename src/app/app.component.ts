import { Component } from '@angular/core';
import { ViewPort, Layer, MouseToCanvas, CanvasHelper, IHelperPoint, HelperLine, ILayerAndMouseInfo } from '@dendrityc/ngx-smart-canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  rectangles: Rectangle[] = [];

  lines: Rectangle[] = [
    { x: 100, y: 100, width: 100, height: 0, name: 'red' },
    { x: 100, y: 100, width: 100, height: 100, name: 'green' },
    { x: 100, y: 100, width: 50, height: 100, name: 'blue' },
    { x: 100, y: 100, width: -100, height: -70, name: 'black' },
  ];

  rectangle = new Rectangle();
  lineMessage = '';
  nodeMessage = '';

  lastUIRectangle: Rectangle | undefined;

  lineRectangle: Rectangle | undefined;

  boxLayer: Layer | undefined;
  lineLayer: Layer | undefined;

  rectColor = '#FFDDEE'

  constructor() {
    Array(20).fill(0).forEach((v, rowIdx) => {
      Array(20).fill(0).forEach((v, colIdx) => {
        const x = this.rectangle.x + (this.rectangle.width + 20) * rowIdx;
        const y = this.rectangle.y + (this.rectangle.height + 20) * colIdx;
        const newR = new Rectangle();
        newR.x = x;
        newR.y = y;
        newR.name = `${rowIdx},${colIdx}`;
        this.rectangles.push(newR);
      });
    });
  }

  toggle(layer: Layer | undefined) {
    if (layer) {
      layer.visible = !layer.visible;
      layer.parentViewport.render();
    }
  }

  toggleColor() {
    this.rectColor = this.rectColor === '#FFDDEE' ? '#EEDDFF' : '#FFDDEE';   
    this.DrawBoxes(this.boxLayer as Layer);
    this.lineLayer?.parentViewport.render();
  }

  viewportReady(viewPort: ViewPort) {
    
    this.boxLayer = viewPort.AddLayer();
    this.lineLayer = viewPort.AddLayer();
    this.DrawBoxes(this.boxLayer);
    this.DrawLines(this.lineLayer);

    viewPort.render();
  }

  redrawRequest(layer: Layer) {

    if (this.boxLayer) { this.DrawBoxes(this.boxLayer); }
    if (this.lineLayer) { this.DrawLines(this.lineLayer); }
    layer.parentViewport.render();
  }


  find(x: MouseToCanvas): Rectangle | undefined {
    if (x.canvasXY) {
      const canvasXY = x.canvasXY;
      return this.rectangles.find(r => r.x < canvasXY.x && canvasXY.x < r.x + r.width && r.y < canvasXY.y && canvasXY.y < r.y + r.height);
    } else {
      return undefined;
    }
  }

  click(event: ILayerAndMouseInfo) {
    //  raw mouse event x/y
    console.log(`Mouse X/y: ${event.mouseToCanvas.mouseEvent.x}, ${event.mouseToCanvas.mouseEvent.y}`);

    // where mouse is on canvas element
    console.log(`Canvas Element X/y: ${event.mouseToCanvas.canvasMouseXy.x}, ${event.mouseToCanvas.canvasMouseXy.y}`);

    // where x/y actually fall on original canvas drawing (adjusted for scale/skew/scroll)
    console.log(`Canvas Coordinates X/y: ${event.mouseToCanvas.canvasXY.x}, ${event.mouseToCanvas.canvasXY.y}`);

    const match = this.find(event.mouseToCanvas);
    if (match) {
      this.nodeMessage = `clicked on ${match.name}`;
      this.lastUIRectangle = match;
    }
  }

  mouseOver(event: ILayerAndMouseInfo) {
    const match = this.find(event.mouseToCanvas);

    const lineMatch = CanvasHelper.LineHit(this.lines.map(l => this.toHelperLine(l)), event.mouseToCanvas.canvasXY as IHelperPoint, 20);
    this.lineMessage = lineMatch ? 'line ' + lineMatch.id : '';

    if (match) {
      const same = this.lastUIRectangle !== undefined && this.lastUIRectangle.x === match.x && this.lastUIRectangle.y === match.y;
      if (!same) {
        this.nodeMessage = `hovered over ${match.name}`;
        this.lastUIRectangle = match;
      }
    }


    if (lineMatch) {
      const r = {
        x: lineMatch.midpoint.x - 10,
        y: lineMatch.midpoint.y - 10,
        width: 20,
        height: 20,
        name: lineMatch.id
      }

      this.lineRectangle = r;

      // x.ctx.fillStyle = 'white';
      // // CanvasHelper.roundRect(x.ctx, r.x , r.y, r.width, r.height, 1);
      // x.ctx.fill();
      // x.ctx.fillStyle = 'black';    
      // x.ctx.fillText(lineMatch.id, r.x, r.y+10, r.width);
    } else {
      this.lineRectangle = undefined;
    }
  }

  doubleClick(event: ILayerAndMouseInfo) {
    const match = this.find(event.mouseToCanvas);
    if (match) {
      this.nodeMessage = `double clicked on ${match.name}`;
      this.lastUIRectangle = match;
    }
  }

  DrawBoxes(layer: Layer) {
    
    let i = 0;

    layer.scene.context.strokeStyle = 'black';

    this.rectangles.forEach(r => {
      layer.scene.context.fillStyle = this.rectColor;
      CanvasHelper.roundRect(layer.scene.context, r.x, r.y, r.width, r.height, 5);
      layer.scene.context.fill();
      layer.scene.context.fillStyle = 'black';
      layer.scene.context.fillText(`${i++}`, r.x + 3, r.y + 4);
    });
  }

  DrawLines(layer: Layer) {
    this.lines.forEach(line => {

      layer.scene.context.strokeStyle = line.name;
      layer.scene.context.beginPath();
      layer.scene.context.moveTo(line.x, line.y);
      layer.scene.context.lineTo(line.x + line.width, line.y + line.height);
      layer.scene.context.stroke();
    });
  }

  DrawOld(layer: Layer) {

    const rectColor = '#dddddd';
    let i = 0;

    layer.scene.context.strokeStyle = 'black';

    this.rectangles.forEach(r => {
      layer.scene.context.fillStyle = rectColor;
      CanvasHelper.roundRect(layer.scene.context, r.x, r.y, r.width, r.height, 5);
      layer.scene.context.fill();
      layer.scene.context.fillStyle = 'black';
      layer.scene.context.fillText(`${i++}`, r.x + 3, r.y + 4);
    });

    this.lines.forEach(line => {

      layer.scene.context.strokeStyle = line.name;
      layer.scene.context.beginPath();
      layer.scene.context.moveTo(line.x, line.y);
      layer.scene.context.lineTo(line.x + line.width, line.y + line.height);
      layer.scene.context.stroke();
    });


  }

  toHelperLine(rect: Rectangle): HelperLine {
    return new HelperLine(
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      rect.name
    );
  }

}

class Rectangle {
  x = 100;
  y = 100;
  width = 100;
  height = 40;
  name = '';
}
