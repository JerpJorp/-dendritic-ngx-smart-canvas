# @dendrityc/ngx-smart-canvas


I couldn't find any good  canvas related packages for Angular that make it easy to have multiple layers and handle zooming and panning.  
* zoom/pan handling requires responding to user mouse wheel/drag events, transforming the canvas, and dealiing with the change in coordinate locations
* canvas layering requires creating multiple canvases that can be individually manipulated and somehow combining them into one canvas for display.

For layering, I converted concrete.js (https://www.npmjs.com/package/concretejs) to some TypeScript classes.
For panning and zooming, I created a library of helper functiions to do the pan/zoom and coordinate translations to original canvas coordinates
For both, I created a component (lib-ngx-smart-canvas) that 
* hosts a canvas controlled by concrete.js derived viewport, that is
* placed inside a div with mouse events for panning/zooming

## Client usage example
1. Capture viewportReady component output event
```javascript
@Output() viewportReady = new EventEmitter<ViewPort>();
```
2.  Add one or more layers to the viewport and draw on them using layer.scene.context
```javascript
viewportReady(viewPort: ViewPort) {
  this.boxLayer = viewPort.AddLayer();
  this.lineLayer = viewPort.AddLayer();
  this.DrawBoxes(this.boxLayer);
  this.DrawLines(this.lineLayer);
  this.boxLayer.parentViewport.render();
}
``` 
3. Capture redrawRequest component output event
```javascript
@Output() redrawRequest = new EventEmitter<Layer>();
```
4. redraw whichever layer
```javascript
redrawRequest(layer: Layer) {
  if (this.boxLayer && this.boxLayer.id === layer.id)   { this.DrawBoxes(this.boxLayer); }
  if (this.lineLayer && this.lineLayer.id === layer.id) { this.DrawLines(this.lineLayer); }    
}
```
**Note** Redraw requests are required when zooming and panning since the concrete.js mechanism for layering gets an image of each layer's convas and combines them.  Zooming  in makes lines/text pixelated.  This means whatever data you are using to determine your layer drawings needs to be in state for redraw later.

5. Optionally handle mouse events
```javascript
click(event: ILayerAndMouseInfo) {
  const match = this.find(event.mouseToCanvas);
  if (match) { console.log = `clicked on ${match.name}`;  }
}
mouseOver(event: ILayerAndMouseInfo) {
  const match = this.find(event.mouseToCanvas);
  if (match) { console.log = `hovered over ${match.name}`;  }
}
doubleClick(event: ILayerAndMouseInfo) {
  const match = this.find(event.mouseToCanvas);
  if (match) { console.log = `double clicked ${match.name}`;  }
}

find(x: MouseToCanvas): Rectangle | undefined {
  //x.canvasXY is the actual coordinates used when drawing, adjusted from the mouse/xy based on current pan/zoom transformations
  if (x.canvasXY) {
    const canvasXY = x.canvasXY;
    return this.rectangles.find(r => r.x < canvasXY.x && canvasXY.x < r.x + r.width && r.y < canvasXY.y && canvasXY.y < r.y + r.height);
  } else {
    return undefined;
}
```

## other input settings 
```html
<lib-ngx-smart-canvas 
  [canvasWidth]= "2000" 
  [canvasHeight]= "1000"
  [zoomable] = "true"
  [minimumZoom] = "0.5"
  [maximumZoom]= "2"
  [zoomDelta]="0.1"
  [ctrlZoomMultiplier]= "1.5"
  [altZoomMultiplier]= "2">
</lib-ngx-smart-canvas>
```
defaults:
```javascript
  @Input() canvasWidth = 2500;
  @Input() canvasHeight = 3500;
  @Input() zoomable = true;    //  true -> wheel zooms in and out. false -> wheel is handled normally (scroll)
  @Input() minimumZoom = 0.4;
  @Input() maximumZoom = 5;
  @Input() zoomDelta = 0.05;
  @Input() ctrlZoomMultiplier = 2;
  @Input() altZoomMultiplier = 2;

```

## Doing your own canvas updates
If your host component needs to redraw or turn layers on off, here are some examples.

```javascript
toggle(layer: Layer) {
  layer.visible = !layer.visible;
  layer.parentViewport.render();
}
toggleColor() {
  this.rectColor = this.rectColor === '#FFDDEE' ? '#EEDDFF' : '#FFDDEE';   
  this.DrawBoxes(this.boxLayer);
  this.lineLayer.parentViewport.render();
}
```
### Other things

If you want to find the nearest line to a mouse event, you can use CanvasHelper.LineHit().  In this example, it will return the closest line  within
20 px from a point, if any.
```javascript
mouseOver(event: ILayerAndMouseInfo) {
  const lineMatch = CanvasHelper.LineHit(this.lines.map(l => this.toHelperLine(l)), event.mouseToCanvas.canvasXY as IHelperPoint, 20);
  this.lineMessage = lineMatch ? 'line ' + lineMatch.id : '';
}

toHelperLine(rect: Rectangle): HelperLine {
  return new HelperLine(
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    rect.name
  );
}
```

### How the concrete.js derived classes work
### Concrete
* Top level class initialized with a div where all the majic canvas stuff happens.

### ViewPort
* Contains and manages all canvas layers
* Has a child 'scene', which is just a wrapper around a canvas element
* The scene canvas element is the only real canvas element, dynamically created and appended to container div from Concrete
* Has 0..n layers, each of which is described below

### Layer 
* has a child 'scene' with a canvas element
* The scene canvas element is never attached to DOM: you draw on them and the parent ViewPort.render() method draws all layers content to it's real canvas

In this library, panning and zooming apply to each layer's canvas instead of the parent canvas, which is the reason for the requestRedraw output event.  It is 
possible to do panning/zooming on the real canvas element, but zooming and redrawing a layer causes the results to be pixelated, especially text, since 
the child canvas images aren't vectors


### publishing
```
ng build @dendrityc/ngx-smart-canvas
cd dist/dendrityc/ngx-smart-canvas/
npm publish
cd ../../..

```