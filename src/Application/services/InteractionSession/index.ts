import { Point, Vector } from "@/foundation/Geometry";

export type InteractionSessionState = "begin" | "update" | "commit";
type PPUChangeStartMemento = {
  startPosition: Point;
  startPPU: Vector;
  auxiliaryOriginWorld: Point | null;
}
export type InteractionSession = {
  state: InteractionSessionState;
  interactionStartMemento: PPUChangeStartMemento;
  deltaPPU: Vector;
}
