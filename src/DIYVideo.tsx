import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from 'remotion';
import {AvatarBubble} from './AvatarBubble';
import {CONFIG} from './config';
import {KenBurnsImage} from './KenBurnsImage';
import {Subtitles} from './Subtitles';
import {TRANSITION_FRAMES, TransitionWrapper} from './TransitionWrapper';
import type {Timeline} from './types';

/**
 * Layer order (bottom -> top):
 *   1. Avatar MP4, fullscreen and continuous - never cut. Its audio track is
 *      the voiceover for the whole video.
 *   2. B-roll image overlays (one Sequence per "image" scene) with eased
 *      cross-fades. Consecutive images fade into each other; when the next
 *      beat is an "avatar" scene the overlay fades out to reveal the host.
 *      Optionally the avatar stays visible in a corner bubble on top of the
 *      B-roll (CONFIG.showAvatarBubble).
 *   3. Word-synced phrase subtitles.
 */
export const DIYVideo: React.FC<{timeline: Timeline}> = ({timeline}) => {
  const {fps} = useVideoConfig();

  if (timeline.scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#111',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          fontSize: 48,
          textAlign: 'center',
          padding: 100,
        }}
      >
        No timeline.json found in video/public/.
        <br />
        Run the pipeline: 1_diy_prompts.py, 2_generate_images.py, then
        3_align_audio.py your_avatar.mp4
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {/* Bottom layer: fullscreen avatar (voiceover source, never cut) */}
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile('avatar.mp4')}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AbsoluteFill>

      {/* Middle layer: B-roll overlays, one Sequence per image scene */}
      {timeline.scenes.map((scene, i) => {
        if (scene.type !== 'image' || !scene.image) return null;

        // Start the fade-in early so the previous visual is still on screen
        // underneath while this one eases in.
        const startFrame = Math.max(0, Math.round(scene.start * fps) - TRANSITION_FRAMES);

        const nextScene = timeline.scenes[i + 1];
        const overlayEndTime = nextScene ? nextScene.start : scene.end;
        const endFrame = Math.round(overlayEndTime * fps);
        const duration = Math.max(1, endFrame - startFrame);

        // Fade out only when handing back to the fullscreen avatar (or at
        // the very end). Between two images the next overlay covers this one.
        const fadeOutAtEnd =
          !nextScene || nextScene.type !== 'image' || !nextScene.image;

        return (
          <Sequence
            key={scene.index}
            from={startFrame}
            durationInFrames={duration}
            premountFor={2 * fps}
          >
            <TransitionWrapper fadeOutAtEnd={fadeOutAtEnd}>
              <KenBurnsImage src={staticFile(scene.image)} sceneIndex={i} />
              {CONFIG.showAvatarBubble ? (
                <AvatarBubble src={staticFile('avatar.mp4')} trimBefore={startFrame} />
              ) : null}
            </TransitionWrapper>
          </Sequence>
        );
      })}

      {/* Top layer: word-synced subtitles */}
      {CONFIG.showSubtitles && timeline.words && timeline.words.length > 0 ? (
        <Subtitles words={timeline.words} />
      ) : null}
    </AbsoluteFill>
  );
};
