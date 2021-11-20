
import { MouseToCanvas } from "./mouse-to-canvas";

export class CanvasHelper {

    static MouseXY(canvas: HTMLCanvasElement, event: MouseEvent): {x: number, y: number} {
        const bcr = canvas.getBoundingClientRect(); // abs. size of element
        const scaleX = canvas.width / bcr.width;    // relationship bitmap vs. element for X
        const scaleY = canvas.height / bcr.height;  // relationship bitmap vs. element for Y
        return {
            x: (event.clientX - bcr.left) * scaleX,
            y: (event.clientY - bcr.top) * scaleY
        }
    }

    static GetCanvasCoords = function(ctx: CanvasRenderingContext2D, mouseXY:  {x: number, y: number}): {x: number, y: number} {
        const matrix = ctx.getTransform();
        const imatrix = matrix.invertSelf();
        let x = mouseXY.x * imatrix.a + mouseXY.y * imatrix.c + imatrix.e;
        let y = mouseXY.x * imatrix.b + mouseXY.y * imatrix.d + imatrix.f;
        return {x: x, y: y};
      }

    static MouseToCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, event: MouseEvent): MouseToCanvas {

        const canvasMouseXY = this.MouseXY(canvas, event);

        const canvasXY =  this.GetCanvasCoords(ctx, canvasMouseXY)

        return new MouseToCanvas(event, canvasMouseXY, canvasXY)

    }

    static clear(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        // Will always clear the right space
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
        ctx.restore();    
    }

    static  roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        return this;
    }

    // returns closest line within line's rectangle.  If no lines are within rectange, returns undefined
    static LineHit(lines: HelperLine[], point: IHelperPoint, minDistance: number ): HelperLine | undefined {

        const closeEnough = lines.filter(line => {
            if (Math.abs(point.x - line.midpoint.x) < line.length) {
                if (Math.abs(point.y - line.midpoint.y) < line.length) {
                    return true;
                }
            }
            return false;
        });

        let closestLine: HelperLine | undefined;
        let closestDistance = Number.MAX_SAFE_INTEGER;
        closeEnough.forEach((line, idx) => {
            const distance = CanvasHelper.LineDistanceFromCoordinate(line, point);
            if (distance < closestDistance && distance < minDistance) {
                closestDistance = distance;
                closestLine = line;
            }
        });
        
        return closestLine;        
    }

    static LineDistanceFromCoordinate (line: HelperLine, point: IHelperPoint ): number {      
        const nearestPoint = this.LinePointNearestCoordinate(line, point);

        const dx = nearestPoint.x - point.x;
        const dy = nearestPoint.y - point.y;

        return Math.sqrt(dx*dx  + dy*dy);
    }

    static LinePointNearestCoordinate(line: HelperLine, point: IHelperPoint ): IHelperPoint {      
        return this.findNearest(point, line.p0, line.p1);
    };

    static findNearest( p: IHelperPoint, a: IHelperPoint, b: IHelperPoint ) : IHelperPoint {
        var atob = { x: b.x - a.x, y: b.y - a.y };
        var atop = { x: p.x - a.x, y: p.y - a.y };
        var len = atob.x * atob.x + atob.y * atob.y;
        var dot = atop.x * atob.x + atop.y * atob.y;
        var t = Math.min( 1, Math.max( 0, dot / len ) );
        dot = ( b.x - a.x ) * ( p.y - a.y ) - ( b.y - a.y ) * ( p.x - a.x );

        return {x: a.x + atob.x * t, y: a.y + atob.y * t};
    }
}

export class HelperLine {
    
    length: number;
    midpoint: IHelperPoint;
    minX: number;
    minY: number;
    dx: number;
    dy: number;

    constructor (public p0: IHelperPoint, public p1: IHelperPoint, public id?: any) {
        this.length = 
            Math.sqrt(
                Math.pow(p1.x - p0.x, 2) + 
                Math.pow(p1.y - p0.y, 2)
            );

        this.minX = Math.min(p0.x, p1.x);
        this.minY = Math.min(p0.y, p1.y);
        this.dx = Math.abs(p0.x - p1.x);
        this.dy = Math.abs(p0.y - p1.y);

        this.midpoint = {
            x: this.minX + (this.dx / 2),
            y: this.minY + (this.dy / 2)
        }
    }
}

export interface IHelperPoint {
    x: number;
    y: number;
}
