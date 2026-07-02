import React from 'react';
import {Composition, staticFile} from 'remotion';
import {DIYVideo} from './DIYVideo';
import type {Timeline} from './types';

export const FPS = 30;

const emptyTimeline: Timeline = {
  fps: FPS,
  durationInSeconds: 10,
  scenes: [],
};

export const Root: React.FC = () => {
  return (
    <Composition
      id="DIYVideo"
      component={DIYVideo}
      width={1920}
      height={1080}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{timeline: emptyTimeline}}
      calculateMetadata={async () => {
        try {
          const res = await fetch(staticFile('timeline.json'));
          if (!res.ok) throw new Error('timeline.json not found');
          const timeline = (await res.json()) as Timeline;
          return {
            durationInFrames: Math.max(
              1,
              Math.round(timeline.durationInSeconds * FPS),
            ),
            props: {timeline},
          };
        } catch {
          // No timeline yet - the composition shows setup instructions.
          return {durationInFrames: 300, props: {timeline: emptyTimeline}};
        }
      }}
    />
  );
};
