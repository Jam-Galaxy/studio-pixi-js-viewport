import { Point, Rect, Transform2D, Vector } from "@foundation/Geometry";

type Engine2DConfiguration = {
  worldConstraints: Rect; //px
  minPPU: Vector;
  maxPPU: Vector;
  defaultPPU: Vector;
  styles: {
    rulerTextColor: string,
    rulerTextAlpha: number,
    rulerTextFont: string,
    rulerTextWeight: string,
    rulerTextSize: number,
    primaryRuler: {
      // color: string;
      height: number, //px
      majorMark: {
        height: number,
        width: number,
        color: string,
      },
      minorMark: {
        height: number,
        width: number,
        color: string,
      }
    },
    secondaryRuler: {
      height: number, //px
      // color: string;
      majorMark: {
        height: number,
        width: number,
        color: string,
      },
      minorMark: {
        height: number,
        width: number,
        color: string,
      }
    },
    workarea: {
      tracksZebra: {
        gap: number;
        primaryBand: {
          color: string;
        },
        secondaryBand: {
          color: string;
        }
      }
    }
  },
  performance: {
    waveform: {
      /**
       * Prefer true by default. When redrawing a piece, a webworker and offscreen canvas are used. The webworker calculates the waveform coordinates, draws them on the offline canvas using graphics, creates a texture, and sends it to the main thread. This relieves the main thread. Use the false value only for debugging or when the webworker is not available in the runtime environment.
       */
      withWebWorker: boolean;
      /**
       * This option allows you to control how the waveform behaves when the viewport scales (PPU changes).
       * 'redraw-between-commited' - Preferred method. Use it by default. Redrawing will occur every time the PPU changes. This only makes sense if withWebWorker=true. If withWebWorker=false, it will slow down even with 10 segments on the workspace.
       * 'stretch-between-commited' - When changing the scale in intermediate states (during dragging), the texture will stretch. When releasing the mouse, the waveform will be redrawn.
       *     Use in cases where:
       *     - withWebWorker=false
       *     - withWebWorker=true and performance is still insufficient for 'redraw-between-commited'
       */
      onPPUChangedStrategy: 'redraw-between-commited' | 'stretch-between-commited'; 
    }
  }
}
export const configuration: Engine2DConfiguration = {
  worldConstraints: {
    x: 0,
    y: 0,
    w: Number.POSITIVE_INFINITY,
    h: Number.POSITIVE_INFINITY,
  },
  minPPU: Transform2D.V(2, 2),
  maxPPU: Transform2D.V(1000, 1000),
  defaultPPU: Transform2D.V(100, 90),
  styles: {
    rulerTextColor: "rgb(255, 255, 255)",
    rulerTextAlpha: 0.3,
    rulerTextFont: "Wix Madefor Text",
    rulerTextWeight: '700',
    rulerTextSize: 11,
    primaryRuler: {
      // color: "#1E1E1E",
      height: 26, 
      majorMark: {
        height: 26,
        width: 1,
        color: "rgba(255, 255, 255, 0.09)",
      },
      minorMark: {
        height: 15,
        width: 1,
        color: "rgba(255, 255, 255, 0.05)",
      }
    },
    secondaryRuler: {
      height: 26,
      // color: "#1E1E1E",
      majorMark: {
        height: 26,
        width: 1,
        color: "rgba(255, 255, 255, 0.08)",
      },
      minorMark: {
        height: 15,
        width: 1,
        color: "rgba(255, 255, 255, 0.04)",
      }
    },
    workarea: {
      tracksZebra: {
        gap: 4,
        primaryBand: {
          color: "#FFFFFF08",
          // color: "#00FFFF",
        },
        secondaryBand: {
          color: "#FFFFFF03",
          // color: "#0000FF",
        },
      }
    },
  },
  performance: {
    waveform: {
      withWebWorker: true,
      // onPPUChangedStrategy: 'redraw-between-commited',
      onPPUChangedStrategy: 'stretch-between-commited',
    }
    
  }
}