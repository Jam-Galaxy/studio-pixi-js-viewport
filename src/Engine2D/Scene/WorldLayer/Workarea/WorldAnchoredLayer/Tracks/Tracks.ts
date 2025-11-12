import { UniqueId } from "@/Engine2D/interfaces/required/misc";
import { WaveTrack } from "./WaveTrack";
import { MidiTrack } from "./MidiTrack";
import { Container } from "pixi.js";

export class Tracks {
  private container: Container;
  private waveTracks: Map<UniqueId, WaveTrack> = new Map();
  // private waveSegments: Map<UniqueId, WaveSegment> = new Map();

  private midiTracks: Map<UniqueId, MidiTrack> = new Map();
  // private midiSegments: Map<UniqueId, MidiSegment> = new Map();

  constructor() {
    this.container = new Container({label: "Tracks"});
  }
  public addLayer() {
    
  }
  public addTrack(id: UniqueId) {
    const track = new WaveTrack(this.container);
    this.waveTracks.set(id, track);
    track.addLayer();
  }
  public addSegment() {

  }
  public addMidiTrack() {

  }
  public addMidiSegment() {

  }

}