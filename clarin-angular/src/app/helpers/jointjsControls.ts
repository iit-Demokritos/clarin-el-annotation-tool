import {dia, elementTools, g} from 'jointjs';

/*
interface RadiusControlOptions extends elementTools.Control.Options {
    defaultRadius?: number;
}

export class RadiusControl extends elementTools.Control {

    protected getPosition(view: dia.ElementView): dia.Point {
        const { model } = view;
        const radius = model.attr(['body', 'ry']) || 0;
        return { x: 0, y: radius };
    }

    protected setPosition(view: dia.ElementView, coordinates: dia.Point): void {
        const { model } = view;
        const { height } = model.size();
        const radius = Math.min(Math.max(coordinates.y, 0), height / 2);
        model.attr(['body'], { rx: radius, ry: radius  });
    }

    protected resetPosition(view): void {
        const { model } = view;
        // const { defaultRadius = 0 } = this.options;
        model.attr(['body'], { rx: defaultRadius, ry: defaultRadius });
    }
}
*/

export class ShapeLControl extends elementTools.Control {

    protected getPosition(view: dia.ElementView): dia.Point {
      const { model }         = view;
      const { width, height } = model.size();
      return { x: 0, y: height / 2 };
    }; /* getPosition */

    protected setPosition(view: dia.ElementView, coordinates: dia.Point): void {
      const { model }         = view;
      const { width, height } = model.size();
      const { x, y }          = model.position();
      var bbox = new g.Rect(x + coordinates.x, y,
                                  width - coordinates.x, height);
      bbox.normalize();
      model.set({
        position: { x: bbox.x, y: bbox.y },
        size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
      });
    }; /* setPosition */

    protected resetPosition(view): void {
    }; /* resetPosition */
}; /* ShapeLControl */

export class ShapeRControl extends elementTools.Control {

    protected getPosition(view: dia.ElementView): dia.Point {
      const { model }         = view;
      const { width, height } = model.size();
      const { y }             = model.position();
      return { x: width, y: height / 2 };
    }; /* getPosition */

    protected setPosition(view: dia.ElementView, coordinates: dia.Point): void {
      // console.error(coordinates);
      const { model }         = view;
      const { width, height } = model.size();
      const { x, y }          = model.position();
      var bbox = new g.Rect(x, y, coordinates.x, height);
      bbox.normalize();
      model.set({
        position: { x: bbox.x, y: bbox.y },
        size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
      });
    }; /* setPosition */

    protected resetPosition(view): void {
    }; /* resetPosition */
}; /* ShapeRControl */

export class ShapeTControl extends elementTools.Control {

    protected getPosition(view: dia.ElementView): dia.Point {
      const { model }         = view;
      const { width, height } = model.size();
      return { x: width / 2, y: 0 };
    }; /* getPosition */

    protected setPosition(view: dia.ElementView, coordinates: dia.Point): void {
      const { model }         = view;
      const { width, height } = model.size();
      const { x, y }          = model.position();
      var bbox = new g.Rect(x, y + coordinates.y,
                            width, height - coordinates.y);
      bbox.normalize();
      model.set({
        position: { x: bbox.x, y: bbox.y },
        size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
      });
    }; /* setPosition */

    protected resetPosition(view): void {
    }; /* resetPosition */
}; /* ShapeTControl */

export class ShapeBControl extends elementTools.Control {

    protected getPosition(view: dia.ElementView): dia.Point {
      const { model }         = view;
      const { width, height } = model.size();
      const { y }             = model.position();
      return { x: width /2 , y: height };
    }; /* getPosition */

    protected setPosition(view: dia.ElementView, coordinates: dia.Point): void {
      // console.error(coordinates);
      const { model }         = view;
      const { width, height } = model.size();
      const { x, y }          = model.position();
      var bbox = new g.Rect(x, y, width, coordinates.y);
      bbox.normalize();
      model.set({
        position: { x: bbox.x, y: bbox.y },
        size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
      });
    }; /* setPosition */

    protected resetPosition(view): void {
    }; /* resetPosition */
}; /* ShapeBControl */

export class ShapeLTControl extends elementTools.Control {

    protected getPosition(view: dia.ElementView): dia.Point {
      const { model }         = view;
      const { width, height } = model.size();
      return { x: 0, y: 0 };
    }; /* getPosition */

    protected setPosition(view: dia.ElementView, coordinates: dia.Point): void {
      const { model }         = view;
      const { width, height } = model.size();
      const { x, y }          = model.position();
      var bbox = new g.Rect(x + coordinates.x, y + coordinates.y,
                            width - coordinates.x, height - coordinates.y);
      bbox.normalize();
      model.set({
        position: { x: bbox.x, y: bbox.y },
        size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
      });
    }; /* setPosition */

    protected resetPosition(view): void {
    }; /* resetPosition */
}; /* ShapeLTControl */

export class ShapeLBControl extends elementTools.Control {

    protected getPosition(view: dia.ElementView): dia.Point {
      const { model }         = view;
      const { width, height } = model.size();
      return { x: 0, y: height };
    }; /* getPosition */

    protected setPosition(view: dia.ElementView, coordinates: dia.Point): void {
      // console.error(coordinates);
      const { model }         = view;
      const { width, height } = model.size();
      const { x, y }          = model.position();
      var bbox = new g.Rect(x + coordinates.x, y,
                            width - coordinates.x, coordinates.y);
      bbox.normalize();
      model.set({
        position: { x: bbox.x, y: bbox.y },
        size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
      });
    }; /* setPosition */

    protected resetPosition(view): void {
    }; /* resetPosition */
}; /* ShapeLBControl */

export class ShapeRTControl extends elementTools.Control {

    protected getPosition(view: dia.ElementView): dia.Point {
      const { model }         = view;
      const { width, height } = model.size();
      const { y }             = model.position();
      return { x: width, y: 0 };
    }; /* getPosition */

    protected setPosition(view: dia.ElementView, coordinates: dia.Point): void {
      // console.error(coordinates);
      const { model }         = view;
      const { width, height } = model.size();
      const { x, y }          = model.position();
      var bbox = new g.Rect(x, y + coordinates.y,
                            coordinates.x, height - coordinates.y);
      bbox.normalize();
      model.set({
        position: { x: bbox.x, y: bbox.y },
        size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
      });
    }; /* setPosition */

    protected resetPosition(view): void {
    }; /* resetPosition */
}; /* ShapeRTControl */

export class ShapeRBControl extends elementTools.Control {

    protected getPosition(view: dia.ElementView): dia.Point {
      const { model }         = view;
      const { width, height } = model.size();
      const { y }             = model.position();
      return { x: width, y: height };
    }; /* getPosition */

    protected setPosition(view: dia.ElementView, coordinates: dia.Point): void {
      // console.error(coordinates);
      const { model }         = view;
      const { width, height } = model.size();
      const { x, y }          = model.position();
      var bbox = new g.Rect(x, y, coordinates.x, coordinates.y);
      bbox.normalize();
      model.set({
        position: { x: bbox.x, y: bbox.y },
        size: { width: Math.max(bbox.width, 1), height: Math.max(bbox.height, 1) }
      });
    }; /* setPosition */

    protected resetPosition(view): void {
    }; /* resetPosition */
}; /* ShapeRBControl */

export class ShapeRotateControl extends elementTools.Control {

    protected getPosition(view: dia.ElementView): dia.Point {
      const { model }         = view;
      const { width, height } = model.size();
      return { x: width - 20, y: height / 2 };
    }; /* getPosition */

    // https://stackoverflow.com/questions/9614109/how-to-calculate-an-angle-from-points
    angle(originX, originY, targetX, targetY) {
      var dy = targetX - originX;
      var dx = targetY - originY;
      var theta = Math.atan2(dy, dx); // range (-PI, PI]
      theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
      return theta;
    }
    angle360(originX, originY, targetX, targetY) {
      var theta = this.angle(originX, originY, targetX, targetY); // range (-180, 180]
      if (theta < 0) theta += 360; // range [0, 360)
      return theta - 90;
    }

    protected setPosition(view: dia.ElementView, coordinates: dia.Point): void {
      // console.error(coordinates);
      const { model }         = view;
      const { width, height } = model.size();
      const { x, y }          = model.position();
      const abs               = model.getAbsolutePointFromRelative(coordinates);
      var angle = this.angle360(x+width/2, y+height/2, abs.x, abs.y);
      // console.error(angle, x+width/2, y+height/2, abs.x, abs.y);
      model.rotate(-angle, true);
    }; /* setPosition */

    protected resetPosition(view): void {
    }; /* resetPosition */
}; /* ShapeRotateControl */
