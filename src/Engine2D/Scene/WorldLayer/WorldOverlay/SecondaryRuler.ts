import { configuration } from "@Engine2D/data/configuration";
import { BarsGrid, IGridProvider, SecondsGrid } from "@Engine2D/interfaces/required/IGridProvider";
import { TransformProjectionProvider } from "@Engine2D/TransformProjectionProvider";
import { Viewport } from "@Engine2D/Viewport";
import { Point, Rect, Transform2D } from "@foundation/Geometry";
import { Application, Container, Graphics } from "pixi.js";
import { GridLines } from "./GridCommon/GridLines";
import { GridLabels } from "./GridCommon/GridLabels/GridLabels";
import { formatBar } from "./GridCommon/GridLabels/BarLabelFormatter";
import { getSecondLabel } from "./GridCommon/GridLabels/SecondLabelFormatter";

/**
 * auxiliary ruler
 */
export class SecondaryRuler {
  private container: Container;
  private backgroundRect: Graphics;
  private gridLines: GridLines;
  private gridLabels: GridLabels;
  private _grid: SecondsGrid | null = null;
  private get grid() {
    if(!this._grid) {
      throw new Error;
    }
    return this._grid;
  }

  private get containerRect(): Rect {
    return {
      x: 0,
      y: this.viewport.viewHeightPx - configuration.styles.secondaryRuler.height,
      w: this.viewport.viewWidthPx,
      h: configuration.styles.secondaryRuler.height,
    }
  }

  constructor(private pixiApp: Application, private parentContainer: Container, private tpp: TransformProjectionProvider,
    private viewport: Viewport,
    private gridProvider: IGridProvider
  ) {
    this.container = new Container({label: "SecondaryRuler"});
    this.container.y = this.containerRect.y;
    this.backgroundRect = new Graphics();

    const styleConfig = {
      height: configuration.styles.secondaryRuler.height,
      majorMark: {
        width: configuration.styles.secondaryRuler.majorMark.width,
        height: configuration.styles.secondaryRuler.majorMark.height,
        color: configuration.styles.secondaryRuler.majorMark.color,
      },
      minorMark: {
        width: configuration.styles.secondaryRuler.minorMark.width,
        height: configuration.styles.secondaryRuler.minorMark.height,
        color: configuration.styles.secondaryRuler.minorMark.color,
      }
    };
    const secondsTextResolver = (xWorld: number): string => {
      const seconds = xWorld; 
      return getSecondLabel(seconds, this.grid.majorMarkStep, this.grid.majorMarkStepPower);
    }
    this.gridLines = new GridLines(this.pixiApp, this.viewport, this.tpp, this.container, styleConfig);
    this.gridLabels = new GridLabels(this.container, this.viewport, secondsTextResolver);
  }
  private updateStaticContent() {
    this.container.y = this.containerRect.y;
    this.backgroundRect.clear();
    // this.backgroundRect.rect(0,0, this.viewport.viewWidthPx, configuration.styles.secondaryRuler.height).fill(configuration.styles.secondaryRuler.color);
  }
  private addStaticContent() {
    this.container.addChild(this.backgroundRect);
    this.updateStaticContent();
  }
  private getGridLinesSpacingConfig() {
    const majorMarkStepWorld = this.grid.majorMarkStep;
    const majorMarkStepPx = this.tpp.worldToCanvasVector(Transform2D.V(majorMarkStepWorld, 0)).x;

    const spacingConfig = {
      majorMarkStepWorld: majorMarkStepWorld,
      majorMarkStepPx: majorMarkStepPx,
      minorMarkCount: this.grid.minorMarkCount,
    };
    return spacingConfig;
  }
  private addLines() {
    this.gridLines.addLayer(this.getGridLinesSpacingConfig());
    // const batchCount = Math.ceil(this.viewport.worldRect.w / majorMarkStepWorld) + 1;
  }
  getGridLabelsSpacingConfig() {
    const majorMarkStepWorld = this.grid.majorMarkStep;
    const majorMarkStepPx = this.tpp.worldToCanvasVector(Transform2D.V(majorMarkStepWorld, 0)).x;

    return {
      labelStepWorld: majorMarkStepWorld,
      labelStepPx: majorMarkStepPx,
    }
  }
  private addLabels() {
    this.gridLabels.addLayer(this.getGridLabelsSpacingConfig());
  }
  private addDynamicContent() {
    this._grid = this.gridProvider.getSecondsGrid();
    this.addLines();
    this.addLabels();
  }
  private addTestLine(graphics: Graphics, start: Point, end: Point) {
    const startPx = this.tpp.worldToWorldContainer(start);
    const endPx = this.tpp.worldToWorldContainer(end);
    graphics.beginPath();
    graphics.moveTo(startPx.x, startPx.y);
    graphics.lineTo(endPx.x, endPx.y);
    graphics.stroke({
      width: 1,
      color: "blue"
    });
  }
  public addRuler() {
    this.parentContainer.addChild(this.container);
    this.addStaticContent();
    this.addDynamicContent();


    const graphics = new Graphics();
    // this.addTestLine(graphics, Transform2D.P(40, 0), Transform2D.P(40, 10));
    this.container.addChild(graphics);
  }
  public onCanvasResize() {
    this.updateStaticContent();
    this.gridLines.onCanvasResize();
    this.gridLabels.onCanvasResize();
  }
  public onViewportMoved() {
    this.gridLines.onViewportMoved();    
    this.gridLabels.onViewportMoved();
  }
  public onPPUChanged() {
    this._grid = this.gridProvider.getSecondsGrid();
    this.gridLines.onPPUChanged(this.getGridLinesSpacingConfig());
    this.gridLabels.onPPUChanged(this.getGridLabelsSpacingConfig());
  }
}