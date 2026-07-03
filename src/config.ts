// All the look-and-feel knobs in one place.
export const CONFIG = {
  // Word-synced phrase subtitles at the bottom of the frame.
  showSubtitles: true,

  // Keep the avatar visible in a corner bubble while B-roll images are
  // fullscreen. Set to false for a pure cut-away style (avatar disappears
  // during image scenes, like a news package).
  showAvatarBubble: true,
  avatarBubble: {
    size: 380,
    right: 56,
    bottom: 56,
    // '50%' = circle. Use a number like 24 for a rounded rectangle.
    borderRadius: '50%' as string | number,
  },

  // Cross-fade length between scenes, in frames (10 ≈ 0.33s at 30fps).
  transitionFrames: 10,

  // Subtle zoom range for the Ken Burns movement on B-roll images.
  kenBurnsMaxScale: 1.12,

  // Motion-graphic scenes (stats, lists) - rendered typography instead of
  // fake AI text images.
  graphic: {
    accent: '#E8A33D', // warm amber, fits the homestead look
    background: 'linear-gradient(140deg, #171a14 0%, #24211a 55%, #1a170f 100%)',
  },
};
