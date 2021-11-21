import { ViewPort } from "./view-port";

export class Concrete {

    viewports: ViewPort[] = [];

    constructor(public container: HTMLDivElement) {
        
    }

    AddViewPort(width: number, height: number): ViewPort {
        const viewPort = new ViewPort(width, height, this.container, this);
        viewPort.parentConcrete = this;
        
        this.viewports.push(viewPort);
        return viewPort;
    }

}
