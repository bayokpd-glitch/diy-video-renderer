import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';
import type {WhisperWord} from './types';

const {fontFamily} = loadFont('normal', {
  weights: ['600'],
  subsets: ['latin'],
});

// Phrase chunking limits - tuned for readability.
const MAX_WORDS_PER_CHUNK = 5;
const MAX_CHUNK_DURATION_SEC = 2.5;
const PAUSE_GAP_SEC = 0.4;

interface FixedWord {
  word: string;
  start: number;
  end: number;
}

interface Chunk {
  text: string;
  start: number;
  end: number;
}

/**
 * Fix Whisper zero-duration words so they actually show on screen: extend
 * them to the next word's start, or give them a 0.15s minimum.
 */
function fixWords(words: WhisperWord[]): FixedWord[] {
  const result: FixedWord[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const text = w.word.trim();
    if (!text) continue;

    const start = w.start;
    let end = w.end;
    if (end <= start) {
      const nextStart = words[i + 1]?.start;
      end = nextStart !== undefined && nextStart > start + 0.15 ? nextStart : start + 0.15;
    }
    result.push({word: text, start, end});
  }
  return result;
}

/**
 * Group words into readable 2-5 word phrases, breaking on hard punctuation,
 * long pauses, soft punctuation (with 3+ words), or the max duration/length.
 */
function chunkWords(words: FixedWord[]): Chunk[] {
  const chunks: Chunk[] = [];
  let i = 0;

  while (i < words.length) {
    const group: FixedWord[] = [words[i]];
    let j = i + 1;

    while (j < words.length) {
      const prev = words[j - 1];
      const curr = words[j];
      const gap = curr.start - prev.end;
      const chunkDur = curr.end - group[0].start;

      const shouldBreak =
        /[.!?]$/.test(prev.word) ||
        gap > PAUSE_GAP_SEC ||
        chunkDur > MAX_CHUNK_DURATION_SEC ||
        (group.length >= 3 && /[,;:]$/.test(prev.word)) ||
        group.length >= MAX_WORDS_PER_CHUNK;

      if (shouldBreak) break;
      group.push(curr);
      j++;
    }

    chunks.push({
      text: group.map((w) => w.word).join(' '),
      start: group[0].start,
      end: group[group.length - 1].end,
    });
    i = j;
  }

  return chunks;
}

/**
 * Word-synced phrase subtitles: each phrase appears exactly when its first
 * word is spoken. Overlapping chunks resolve to the most recently started
 * one so sync stays tight.
 */
export const Subtitles: React.FC<{words: WhisperWord[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const fixedWords = React.useMemo(() => fixWords(words), [words]);
  const chunks = React.useMemo(() => chunkWords(fixedWords), [fixedWords]);

  let active: Chunk | null = null;
  for (const c of chunks) {
    if (t >= c.start && t <= c.end) {
      if (!active || c.start > active.start) {
        active = c;
      }
    }
  }
  if (!active) return null;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '8%',
          transform: 'translateX(-50%)',
          fontFamily,
          fontSize: 44,
          fontWeight: 600,
          color: '#ffffff',
          letterSpacing: '0.02em',
          lineHeight: 1.35,
          textAlign: 'center',
          maxWidth: '85%',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            borderRadius: 6,
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          }}
        >
          {active.text}
        </span>
      </div>
    </AbsoluteFill>
  );
};
