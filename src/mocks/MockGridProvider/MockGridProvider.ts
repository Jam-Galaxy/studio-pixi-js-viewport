import { BarsGrid, IGridProvider, SecondsGrid, TracksGrid } from "@Engine2D/interfaces/required/IGridProvider";
import { barsGrid1, secondsGrid1 } from "./mockData";

export class MockGridProvider implements IGridProvider {
  getSecondsGrid(): SecondsGrid {
    const secondsGrid: SecondsGrid = secondsGrid1;
    return secondsGrid;
  }
  getBarsGrid(): BarsGrid {
    const barsGrid: BarsGrid = barsGrid1;
    return barsGrid;
  }
  getTracksGrid(): TracksGrid {
    const tracksGrid: TracksGrid = {
      primaryBandStep: 1
    }
    return tracksGrid;
  }
}