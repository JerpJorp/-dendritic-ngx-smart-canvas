import { Component, ElementRef, Input, Output, AfterViewInit, ViewChild, EventEmitter } from '@angular/core';

import { CanvasHelper } from './classes/canvas-helper';
import { Concrete } from './classes/Concrete/concrete';
import { ViewPort } from './classes/Concrete/view-port';
import { Layer } from './classes/Concrete/layer';

import { MouseToCanvas } from '../public-api';

@Component({
  selector: 'lib-ngx-smart-canvas',
  templateUrl: './ngx-smart-canvas.component.html',
  styleUrls: ['./ngx-smart-canvas.component.scss']
})
export class NgxSmartCanvasComponent implements AfterViewInit {

  @ViewChild('localContainer', { static: true })
  container: ElementRef<HTMLDivElement> | undefined;

  @Input() zoomable = true;    //  true -> wheel zooms in and out. false -> wheel is handled normally (scroll)
  @Input() minimumZoom = 0.4;
  @Input() maximumZoom = 5;
  @Input() zoomDelta = 0.05;
  @Input() ctrlZoomMultiplier = 2;
  @Input() altZoomMultiplier = 2;
  @Input() canvasWidth = 2500;
  @Input() canvasHeight = 3500;

  @Output() viewportReady = new EventEmitter<ViewPort>();
  @Output() redrawRequest = new EventEmitter<Layer>();
  @Output() cvsMouseOver = new EventEmitter<ILayerAndMouseInfo>();
  @Output() cvsClick = new EventEmitter<ILayerAndMouseInfo>();
  @Output() cvsDoubleClick = new EventEmitter<ILayerAndMouseInfo>();
  
  concreteObject: Concrete | undefined;
  viewport: ViewPort | undefined;

  dragStart: { x: number, y: number } | undefined;
  dragEnd: { x: number, y: number } = { x: 0, y: 0 };

  showReset = false;

  constructor() { }

  ngAfterViewInit(): void {
    if (this.container) {
      this.concreteObject = new Concrete(this.container.nativeElement);
      this.viewport = this.concreteObject.AddViewPort(this.canvasWidth, this.canvasHeight);
      this.viewportReady.emit(this.viewport);
      this.viewport.render();
    }
  }

  canvasWheel(event: WheelEvent) {

    if (this.viewport?.scene.context && this.zoomable) {

      let keepGoing = true;      

      this.viewport.layers.forEach(layer => {

        const translatedXY = CanvasHelper.MouseToCanvas(this.viewport?.scene.canvas as HTMLCanvasElement, layer.scene.context, event);

        const context = layer.scene.context;

        const currentTxfrm = context.getTransform();

        // (a, d) = scale x,y
        // (e, f) = translation x,y

        const currentScale = currentTxfrm.a;
        const ctrlModifier = event.ctrlKey ? this.ctrlZoomMultiplier : 1;
        const shiftModifer = event.altKey ? this.altZoomMultiplier : 1;

        let scaleDelta = this.zoomDelta;
        if (event.deltaY < 0)  {
          scaleDelta *= -1;
        }
        
        scaleDelta *= ctrlModifier;
        scaleDelta *= shiftModifer;

        if (currentScale < this.minimumZoom && scaleDelta < 0) {
          //minimum zoom
          keepGoing = false;
        }

        if (currentScale > this.maximumZoom && scaleDelta > 0) {
          //maximum zoom
          keepGoing = false;
        }

        if (keepGoing) {
          //adjust delta for current zoom amount (txfrmA)
          const scaleDeltaNormalized = scaleDelta / currentScale;
          const scaleFactor = scaleDeltaNormalized + 1;
          const mouseCoords = translatedXY.canvasMouseXy;
          context.translate(mouseCoords.x, mouseCoords.y);
          context.scale(scaleFactor, scaleFactor);
          context.translate(mouseCoords.x * -1, mouseCoords.y * -1);  

          this.xRedrawRequest(layer);
        }                
      });

      return false;
    }
    return true;
  }

  canvasMouseOver(event: any) {
    this.mouseEmissionHander(event, this.cvsMouseOver);
  }
  
  canvasDoubleClick(event: MouseEvent) {
    this.mouseEmissionHander(event, this.cvsDoubleClick);
  }

  canvasMouseClick(event: MouseEvent) {
    this.mouseEmissionHander(event, this.cvsClick);
  }

  private mouseEmissionHander(event: MouseEvent, emitter: EventEmitter<ILayerAndMouseInfo>) {
    if (this.viewport?.scene.context) {
      const canvas = this.viewport.scene.canvas;
      this.viewport?.layers.filter(x => x.visible).forEach(layer => {        
        const context = layer.scene.context;
        const translatedXY = CanvasHelper.MouseToCanvas(canvas, context, event);
        emitter.emit({layer: layer, mouseToCanvas: translatedXY});  
      });
    }
  }

  canvasDragStart(event: DragEvent) { 
    this.dragStart = { x: event.x, y: event.y }
  }

  canvasDrop(event: DragEvent) { 
    
    if (this.dragStart) {
      this.dragEnd = { x: event.x, y: event.y }

      this.viewport?.layers.forEach(layer => {
        const dragStart = this.dragStart as {x: number, y: number};
        const txfrm = layer.scene.context.getTransform();
        layer.scene.context.translate((this.dragEnd.x - dragStart.x) / txfrm.a, (this.dragEnd.y - dragStart.y) / txfrm.d);
        this.xRedrawRequest(layer);
      });
      this.dragStart = undefined;
    }
  }

  canvasDragOver(event: any) { 
    if (this.dragStart) {
      event.preventDefault(); // allow dropping into here as it is the source of drag
    }
  }

  resetCanvasZoom() {
    this.viewport?.layers.forEach(layer => {
      const txfrm = layer.scene.context.getTransform();
      layer.scene.context.setTransform(1,0,0,1,txfrm.e,txfrm.f);
      this.xRedrawRequest(layer);
    });
  }

  resetCanvasCenter() {
    this.viewport?.layers.forEach(layer => {
      const txfrm = layer.scene.context.getTransform();
      layer.scene.context.setTransform(txfrm.a,0,0,txfrm.d,0,0);
      this.xRedrawRequest(layer);
    });
  }

  resetCanvas() {
    this.viewport?.layers.forEach(layer => {
      const txfrm = layer.scene.context.getTransform();
      layer.scene.context.setTransform(txfrm.a,0,0,txfrm.d,0,0);
      this.xRedrawRequest(layer);
    });
  }

  private xRedrawRequest(layer: Layer) {
    layer.scene.clear();
    this.redrawRequest.emit(layer);
    this.viewport?.render();
    
    this.checkShowReset();
  }


  checkShowReset() {
    this.viewport?.layers.forEach(layer => {
      const txfrm = layer.scene.context.getTransform();
      this.showReset = txfrm.a !== 1 || txfrm.f !== 0;
    });
  }


}

export interface ILayerAndMouseInfo {
  layer: Layer;
  mouseToCanvas: MouseToCanvas
}