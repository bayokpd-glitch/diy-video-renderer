import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';
import {CONFIG} from './config';
import type {GraphicData} from './types';

const {fontFamily} = loadFont('normal', {
  weights: ['500', '700', '900'],
  subsets: ['latin'],
});

const EASE = Easing.bezier(0.4, 0, 0.2, 1);

/**
 * Split a spoken value like "60%", "$14", "104F", "3x" into
 * prefix + number + suffix so the number can count up while the
 * units stay put. Falls back to plain text when nothing numeric.
 */
const parseValue = (value: string) => {
  const match = value.match(/^([^0-9]*)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return null;
  const num = parseFloat(match[2].replace(',', '.'));
  if (!isFinite(num)) return null;
  const decimals = match[2].includes('.') || match[2].includes(',')
    ? (match[2].split(/[.,]/)[1] ?? '').length
    : 0;
  return {prefix: match[1], target: num, decimals, suffix: match[3]};
};

const Title: React.FC<{text: string; progress: number}> = ({text, progress}) => {
  if (!text) return null;
  return (
    <div
      style={{
        color: CONFIG.graphic.accent,
        fontSize: 44,
        fontWeight: 700,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        opacity: progress,
        transform: `translateY(${(1 - progress) * 24}px)`,
        marginBottom: 8,
      }}
    >
      {text}
    </div>
  );
};

const Rule: React.FC<{progress: number}> = ({progress}) => (
  <div
    style={{
      width: 340 * progress,
      height: 4,
      borderRadius: 2,
      backgroundColor: CONFIG.graphic.accent,
      margin: '26px 0 34px',
    }}
  />
);

const StatGraphic: React.FC<{
  title: string;
  value: string;
  label: string;
}> = ({title, value, label}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });
  const pop = spring({frame: frame - 6, fps, config: {damping: 14, mass: 0.7}});
  const countProgress = interpolate(frame, [6, 6 + fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const labelIn = interpolate(frame, [16, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });

  const parsed = parseValue(value);
  const shownValue = parsed
    ? `${parsed.prefix}${(parsed.target * countProgress).toFixed(parsed.decimals)}${parsed.suffix}`
    : value;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily,
        padding: '0 160px',
        // Keep clear of the avatar bubble in the bottom-right corner.
        transform: 'translateY(-70px)',
      }}
    >
      <Title text={title} progress={titleIn} />
      <Rule progress={titleIn} />
      <div
        style={{
          color: '#ffffff',
          fontSize: 230,
          fontWeight: 900,
          lineHeight: 1,
          transform: `scale(${0.8 + 0.2 * pop})`,
          textShadow: '0 18px 60px rgba(0,0,0,0.55)',
        }}
      >
        {shownValue}
      </div>
      {label ? (
        <div
          style={{
            color: 'rgba(255,255,255,0.82)',
            fontSize: 52,
            fontWeight: 500,
            marginTop: 40,
            maxWidth: 1000,
            lineHeight: 1.3,
            opacity: labelIn,
            transform: `translateY(${(1 - labelIn) * 26}px)`,
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const ListGraphic: React.FC<{title: string; items: string[]}> = ({
  title,
  items,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
        // Keep clear of the avatar bubble in the bottom-right corner.
        transform: 'translateY(-40px)',
      }}
    >
      <div style={{width: 1150}}>
        <Title text={title} progress={titleIn} />
        <Rule progress={titleIn} />
        {items.map((item, i) => {
          const appear = spring({
            frame: frame - 10 - i * 7,
            fps,
            config: {damping: 16, mass: 0.6},
          });
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 34,
                marginBottom: 34,
                opacity: appear,
                transform: `translateX(${(1 - appear) * -60}px)`,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  flexShrink: 0,
                  backgroundColor: `${CONFIG.graphic.accent}26`,
                  border: `3px solid ${CONFIG.graphic.accent}`,
                  color: CONFIG.graphic.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                  fontWeight: 900,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 54,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Fullscreen motion-graphic card for data/text beats (stats, lists of
 * steps/parts). Replaces AI-generated "text images" (maps, charts,
 * chalkboards) that always come out garbled and fake. Real typography,
 * animated in - the professional way to show numbers and lists.
 */
export const GraphicOverlay: React.FC<{graphic: GraphicData}> = ({graphic}) => {
  return (
    <AbsoluteFill style={{background: CONFIG.graphic.background}}>
      {/* Soft vignette to keep the card from feeling flat */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />
      {graphic.kind === 'stat' ? (
        <StatGraphic
          title={graphic.title}
          value={graphic.value}
          label={graphic.label}
        />
      ) : (
        <ListGraphic title={graphic.title} items={graphic.items} />
      )}
    </AbsoluteFill>
  );
};
