import { Hit } from "./hit";
import { Scene } from "./scene";
import { ViewPort } from "./view-port";

export class Layer {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  visible = true;
  id: string;
  hit: Hit;
  scene: Scene;
    
  constructor(public parentViewport: ViewPort) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.hit = new Hit()
    this.scene = new Scene();
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.scene.setSize(width, height);
    this.hit.setSize(width, height);
  }

  moveUp() {
    const index = this.getIndex();
    const viewport = this.parentViewport;
    const layers = viewport.layers;

    if (index < layers.length - 1) {
      // swap
      layers[index] = layers[index + 1];
      layers[index + 1] = this;
    }
  }

  moveDown() {
    const index = this.getIndex();
    const viewport = this.parentViewport;
    const layers = viewport.layers;

    if (index > 0) {
      // swap
      layers[index] = layers[index - 1];
      layers[index - 1] = this;
    }
  }

  moveToTop() {
    const index = this.getIndex();
    const viewport = this.parentViewport;
    const layers = viewport.layers;

    layers.splice(index, 1);
    layers.push(this);
  }

  moveToBottom() {
    const index = this.getIndex();
    const viewport = this.parentViewport;
    const layers = viewport.layers;

    layers.splice(index, 1);
    layers.unshift(this);
  }

  getIndex() {
    return this.parentViewport.layers.findIndex(x => x.id == this.id);      
  }

  destroy() {
    // remove self from layers array
    this.parentViewport.layers.splice(this.getIndex(), 1);
  }


}
