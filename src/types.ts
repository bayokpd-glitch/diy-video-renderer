export type WhisperWord = {
  word: string;
  start: number; // seconds
  end: number; // seconds
};

export type GraphicData =
  | {kind: 'stat'; title: string; value: string; label: string}
  | {kind: 'list'; title: string; items: string[]};

export type Scene = {
  index: number;
  // "avatar": the talking avatar stays fullscreen, no overlay.
  // "image": a B-roll image fades in over the avatar.
  // "graphic": an animated motion-graphic card (crisp real text) fades in
  //            over the avatar - used for stats, lists, diagrams, maps.
  type: 'avatar' | 'image' | 'graphic';
  image: string | null;
  graphic?: GraphicData | null;
  script_text: string;
  start: number; // seconds
  end: number; // seconds
};

export type Timeline = {
  fps: number;
  durationInSeconds: number;
  scenes: Scene[];
  words?: WhisperWord[];
};
