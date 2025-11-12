import { IWaveTrackApi, IWaveTrackRM } from "../interfaces/provided/IEngine2D";
import { UniqueId } from "../interfaces/required/misc";

export class WaveTrackApi implements IWaveTrackApi {
  addTrack(trackRM: IWaveTrackRM): void {
    // throw new Error("Method not implemented.");
  }
  removeTrack(id: UniqueId): void {
    throw new Error("Method not implemented.");
  }
  
}