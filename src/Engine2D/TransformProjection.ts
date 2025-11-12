/*
===Coordinate Transitions===
======General Information=======
(x')   (a b tx)   (x)   (ax+by+tx)
|y'| = |c d ty| * |y| = |cx+dy+ty|
(1 )   (0 0 1 )   (1)   ( 1 )

Parallel Translation:
(1 0 tx)
|0 1 ty|
(0 0 1 )

Scaling:
(sx 0 0)
|0 sy 0|
(0 0 1)

(sx 0 tx)
|0 sy ty|
(0 0 1 )

F(Pscene)=Pscreen

Pscene -> translation -> scaling -> Pscreen

(x+tx)
|y+ty|
( 1 )

G = M * L

To transition between bases in space, it is necessary to use a transition matrix.
Let's imagine a vector space.
v is some vector in this space.
Va is the representation of the vector v in the basis a

Then the representation of the vector v in the basis b is related to Va by the following formula:
Vb = Pa->b * Va
where Pa->b is the transition matrix from the basis a to the basis b .

To transition back, you need to use the formula:
Va = (Pa->b)^-1 * Vb
where (Pa->b)^-1 is the inverse matrix to the matrix Pa->b

======Viewport======
This visual model has the following bases:
- object or local. Each object on the workspace has its own basis. The coordinate center is an arbitrarily chosen center of the object.
- viewport or canvas. Viewport is a special case of an object from the point of view of the world. Plays the role of a camera. Its center relative to the world is the upper left corner of the canvas.
- world. The center of the world is where the seconds (along the x-axis) and tracks (along the y-axis) count.
- tab windows. In the window basis, we get the mouse coordinates. They need to be converted to the canvas basis.

Accordingly, there are the following transition matrices:
Pobject->world
Pviewport->world
Pviewport->window

The following transitions are important for us:
Vworld -> Vviewport for displaying the world coordinate grid in the viewport.
Vobject -> Vviewport for displaying objects in the viewport.
Vviewport -> Vworld for defining the area of the world that needs to be displayed.
Vwindow -> Vworld for expressing the mouse coordinates in the world basis.

Let's write these transitions using transition matrices:
Vviewport = Fworld->viewport(Vworld) = (Pviewport->world)^-1 * Vworld
Vviewport = Fobject->viewport(Vobject) = Fworld->viewport(Pobject->world * Vobject) = (Pviewport->world)^-1 * Pobject->world * Vobject
Vworld = Fviewport->world(Vviewport) = Pviewport->world * Vviewport
Vworld = Fwindow->world(Vwindow) = Fviewport->world((Pviewport->window)^-1 * Vwindows) = Pviewport->world * (Pviewport->window)^-1 * Vwindows

Now let's write the transition matrices:
(1 0 a)
Pobject->world = |0 1 b|
(0 0 1)
where a is the offset of the object relative to the world along the OX axis,
b is the offset of the object relative to the world along the OY axis.
For now, the objects will only have translation. We will add other transformations if necessary.

(sx 0 a)
Pviewport->world = |0 sy b|
(0 0 1)
where a is the offset of the viewport relative to the world along the OX axis,
b is the offset of the viewport relative to the world along the OY axis.
sx and sy are the scale of the viewport along the OX and OY axes

(sx 0 a)
Pviewport->window = |0 sy b|
(0 0 1)
where a is the offset of the viewport relative to the window along the OX axis,
b is the offset of the viewport relative to the window along the OY axis.
sx and sy viewport scale along the OX and OY axes relative to the window

======Transitions between world units======
between seconds and ticks. The unit of the OX axis of the world is seconds. The first tick starts at the center of the world. y is the same as the world. We are not considering negative areas yet. But in terms of meaning, there should be -1 before the first tick, and -2 before -1. In this case, in the negative area, the fractions would be counted not from the origin, but from minus infinity. That is, if the size is 2/4, it should be like this: -1.1 -1.2 1.1 1.2 2.1 2.2. This is not so easy to achieve. If we consider F(xseconds) to F

So, it is important for us to have transitions:
xtick = Fseconds->tick(xseconds)
xsecond = Ftick->seconds(xtick)
*/

import { Point, Transform2D, Vector } from "@foundation/Geometry";
export class TransformProjection { 
  public static worldToCanvas(point: Point, viewportToCanvas: Transform2D, worldToViewport: Transform2D) {
    return viewportToCanvas.multiplyRight(worldToViewport).applyToPoint(point);
  }
  public static worldToCanvasVector(vector: Vector, viewportToCanvas: Transform2D, worldToViewport: Transform2D): Vector {
    return viewportToCanvas.multiplyRight(worldToViewport).applyToVector(vector);
  }
  public static objectToViewport(point: Point, worldToViewport: Transform2D, objectToWorld: Transform2D) {
    return worldToViewport.multiplyRight(objectToWorld).applyToPoint(point);
  }
  public static objectToCanvas(point: Point, viewportToCanvas: Transform2D, worldToViewport: Transform2D, objectToWorld: Transform2D) {
    return viewportToCanvas.multiplyRight(worldToViewport).multiplyRight(objectToWorld).applyToPoint(point);
  }

  /* window -> world */
  public static windowToWorld(point: Point, viewportToWorld: Transform2D, canvasToViewport: Transform2D, windowToCanvas: Transform2D): Point {
    return viewportToWorld.multiplyRight(canvasToViewport).multiplyRight(windowToCanvas).applyToPoint(point);
  }
  public static windowToWorldVector(vector: Vector, viewportToWorld: Transform2D, canvasToViewport: Transform2D, windowToCanvas: Transform2D): Vector {
    return viewportToWorld.multiplyRight(canvasToViewport).multiplyRight(windowToCanvas).applyToVector(vector);
  }
  /* /window -> world */

  /* viewport <-> window */
  public static canvasToViewport(point: Point, canvasToViewport: Transform2D) {
    return canvasToViewport.applyToPoint(point);
  }
  public static windowToCanvas(point: Point, windowToCanvas: Transform2D): Point {
    return windowToCanvas.applyToPoint(point);
  }
  public static windowToCanvasVector(vector: Vector, windowToCanvas: Transform2D): Vector {
    return windowToCanvas.applyToVector(vector);
  }
  /* /viewport <-> window */


  /* world container */
  public static worldToWorldContainer(point: Point, viewportToCanvas: Transform2D): Point {
    return viewportToCanvas.applyToPoint(point);
  } 
  public static worldToWorldContainerVector(vector: Vector, viewportToCanvas: Transform2D): Vector {
    return viewportToCanvas.applyToVector(vector);
  }
  /* /world container */
}


