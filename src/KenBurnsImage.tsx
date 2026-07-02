import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG} from './config';

// Alternating slow zoom/pan movements so consecutive scenes never move the
// same way. Values are end-of-scene targets; movement is linear and subtle.
// Opacity fades are handled by TransitionWrapper, not here.
const MAX = CONFIG.kenBurnsMaxScale;
const MOVES = [
  {scale: [1.0, MAX], x: [0, -35], y: [0, -18]},
  {scale: [MAX, 1.0], x: [-30, 0], y: [15, 0]},
  {scale: [1.0, (1 + MAX) / 2], x: [0, 35], y: [0, 12]},
  {scale: [(1 + MAX) / 2, 1.0], x: [30, 0], y: [-12, 0]},
];

export const KenBurnsImage: React.FC<{
  src: string;
  sceneIndex: number;
}> = ({src, sceneIndex}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const move = MOVES[sceneIndex % MOVES.length];

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(progress, [0, 1], move.scale);
  const x = interpolate(progress, [0, 1], move.x);
  const y = interpolate(progress, [0, 1], move.y);

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
