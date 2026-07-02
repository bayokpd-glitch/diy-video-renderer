export type WhisperWord = {
  word: string;
  start: number; // seconds
  end: number; // seconds
};

export type Scene = {
  index: number;
  // "avatar": the talking avatar stays fullscreen, no overlay.
  // "image": a B-roll image fades in over the avatar.
  type: 'avatar' | 'image';
  image: string | null;
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
