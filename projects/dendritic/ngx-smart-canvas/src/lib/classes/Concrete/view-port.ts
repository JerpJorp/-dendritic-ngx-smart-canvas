import { Concrete } from "./concrete";
import { Layer } from "./layer";
import { Scene } from "./scene";

export class ViewPort {

  layers: Layer[] = [];
  scene: Scene;
  id: string;

  constructor(public width: number, public height: number, public container: HTMLDivElement, public parentConcrete: Concrete) {

    this.id = Math.random().toString(36).substr(2, 9);
    this.scene = new Scene();
    this.setSize(width, height);

    // container.innerHTML = '';
    container.appendChild(this.scene.canvas);

  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.scene.setSize(width, height);
    this.layers.forEach(l =>  l.setSize(width, height));
  }

  AddLayer(): Layer {
    const layer = new Layer(this);
    this.layers.push(layer);
    layer.setSize(this.width, this.height);
    layer.parentViewport = this;
    return layer;
  }

  getIntersection(x: number, y: number) {
    const foundLayer = this.layers.map(l => l.hit.getIntersection(x, y)).find(k => k > 0);
    return foundLayer || -1;
  }

  getIndex() {
    var viewports = this.parentConcrete.viewports,
        len = viewports.length,
        n = 0,
        viewport;

    for (n=0; n<len; n++) {
      viewport = viewports[n];
      if (this.id === viewport.id) {
        return n;
      }
    }
    
    return -1;
  }

  destroy() {
    // destroy layers
    this.layers.forEach(function(layer) {
      layer.destroy();
    });

    // clear dom
    // this.container.innerHTML = '';
    
    // remove self from viewports array
    this.parentConcrete.viewports.splice(this.getIndex(), 1);
  }
  
  render() {
    this.scene.clear();
    this.layers.filter(x => x.visible).forEach(l => this.scene.context.drawImage(l.scene.canvas, 0, 0, l.width, l.height))
 }


}
