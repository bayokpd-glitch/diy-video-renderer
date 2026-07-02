import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CONFIG} from './config';

export const TRANSITION_FRAMES = CONFIG.transitionFrames;

/**
 * Eased cross-fade wrapper for every B-roll overlay.
 *
 * - Fade IN: always. If the previous scene was an avatar beat, this reveals
 *   the image over the fullscreen avatar. If it was another image, this one
 *   fades in ON TOP of it (the outgoing image stays at opacity 1, so the
 *   avatar never peeks through between two images).
 * - Fade OUT: only when the NEXT scene is an avatar beat (or this is the
 *   last scene) - a clean hand-back to the fullscreen avatar.
 */
export const TransitionWrapper: React.FC<{
  fadeOutAtEnd: boolean;
  children: React.ReactNode;
}> = ({fadeOutAtEnd, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, TRANSITION_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const fadeOut = fadeOutAtEnd
    ? interpolate(
        frame,
        [durationInFrames - TRANSITION_FRAMES, durationInFrames],
        [1, 0],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        },
      )
    : 1;

  return (
    <AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut)}}>
      {children}
    </AbsoluteFill>
  );
};
