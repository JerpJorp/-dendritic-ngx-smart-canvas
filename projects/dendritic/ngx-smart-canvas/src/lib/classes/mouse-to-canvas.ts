export class MouseToCanvas {
    constructor(
        public mouseEvent: MouseEvent,
        public canvasMouseXy: {x: number, y: number},
        public canvasXY: {x: number, y: number}) {}
}
