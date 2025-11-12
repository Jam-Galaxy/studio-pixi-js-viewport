import { configuration } from "@Engine2D/data/configuration";
import { BarsGrid, IGridProvider } from "@Engine2D/interfaces/required/IGridProvider";
import { TransformProjectionProvider } from "@Engine2D/TransformProjectionProvider";
import { Viewport } from "@Engine2D/Viewport";
import { Point, Transform2D } from "@foundation/Geometry";
import { Application, Container, Graphics } from "pixi.js";
import { GridLines } from "./GridCommon/GridLines";
import { GridLabels } from "./GridCommon/GridLabels/GridLabels";
import { formatBar } from "./GridCommon/GridLabels/BarLabelFormatter";

export class PrimaryRuler {
  private container: Container;
  private backgroundRect: Graphics;
  private gridLines: GridLines;
  private gridLabels: GridLabels;
  private _grid: BarsGrid | null = null;
  private get grid() {
    if(!this._grid) {
      throw new Error;
    }
    return this._grid;
  }

  constructor(private pixiApp: Application, private parentContainer: Container, private tpp: TransformProjectionProvider,
    private viewport: Viewport,
    private gridProvider: IGridProvider
  ) {
    this.container = new Container({label: "PrimaryRuler"});
    this.backgroundRect = new Graphics();

    const styleConfig = {
      height: configuration.styles.primaryRuler.height,
      majorMark: {
        width: configuration.styles.primaryRuler.majorMark.width,
        height: configuration.styles.primaryRuler.majorMark.height,
        color: configuration.styles.primaryRuler.majorMark.color,
      },
      minorMark: {
        width: configuration.styles.primaryRuler.minorMark.width,
        height: configuration.styles.primaryRuler.minorMark.height,
        color: configuration.styles.primaryRuler.minorMark.color,
      }
    };
    const barTextResolver = (xWorld: number): string => {
      const bars = xWorld / this.grid.secondsPerBar; 
      const result = formatBar(bars, this.grid.timeSignature, this.grid.isSubdivided, this.grid.power);
      return result.formattedBar;
    }
    this.gridLines = new GridLines(this.pixiApp, this.viewport, this.tpp, this.container, styleConfig);
    this.gridLabels = new GridLabels(this.container, this.viewport, barTextResolver);
  }
  private updateStaticContent() {
    this.backgroundRect.clear();
    // this.backgroundRect.rect(0,0, this.viewport.viewWidthPx, configuration.styles.primaryRuler.height).fill(configuration.styles.primaryRuler.color);
  }
  private addStaticContent() {
    this.container.addChild(this.backgroundRect);
    this.updateStaticContent();
  }
  private getGridLinesSpacingConfig() {
    const majorMarkStepWorld = this.grid.majorMarkStep * this.grid.secondsPerBar;
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
  }
  getGridLabelsSpacingConfig() {
    const majorMarkStepWorld = this.grid.majorMarkStep * this.grid.secondsPerBar;
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
    this._grid = this.gridProvider.getBarsGrid();
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
    this._grid = this.gridProvider.getBarsGrid();
    this.gridLines.onPPUChanged(this.getGridLinesSpacingConfig());
    this.gridLabels.onPPUChanged(this.getGridLabelsSpacingConfig());
  }
}