import React from 'react';
import {OffthreadVideo} from 'remotion';
import {CONFIG} from './config';

/**
 * Corner avatar bubble shown on top of B-roll overlays. It lives inside the
 * overlay's Sequence, so `trimBefore` (the sequence's absolute start frame)
 * keeps this copy of the avatar video in sync with the fullscreen one.
 * Muted - the fullscreen base layer already carries the audio.
 */
export const AvatarBubble: React.FC<{src: string; trimBefore: number}> = ({
  src,
  trimBefore,
}) => {
  const {size, right, bottom, borderRadius} = CONFIG.avatarBubble;
  return (
    <div
      style={{
        position: 'absolute',
        right,
        bottom,
        width: size,
        height: size,
        borderRadius,
        overflow: 'hidden',
        border: '8px solid rgba(255,255,255,0.92)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        backgroundColor: '#000',
      }}
    >
      <OffthreadVideo
        src={src}
        muted
        trimBefore={trimBefore}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </div>
  );
};
