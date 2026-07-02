# DIY Avatar Video Renderer

Remotion project that renders DIY / homestead avatar videos on GitHub Actions.

The composition (`DIYVideo`, 1920x1080, 30 fps) layers:

1. **Fullscreen talking avatar** (`avatar.mp4`) - never cut, carries the voiceover audio
2. **B-roll image overlays** with eased cross-fades and Ken Burns motion, per the timeline
3. **Corner avatar bubble** during B-roll (toggle in `src/config.ts`)
4. **Word-synced subtitles** from Whisper word timestamps

## Rendering a video

The assets are produced by the local `combined_diy_avatar_generator.py` app,
which builds a **render zip** containing at its root:

```
timeline.json    (fps, durationInSeconds, scenes[], words[])
avatar.mp4
images/scene_001.png ...
```

1. Create a **release** in this repo (tag e.g. `v1`) and attach one or more zips.
2. Go to **Actions -> Render Video -> Run workflow**, set `release_tag` to the tag.
3. The workflow splits every video into parallel frame chunks, renders them on
   separate runners, stitches them with ffmpeg, and uploads the final MP4 as a
   **`video-<name>` artifact** (kept 7 days). Download it from the workflow run page.

## Local preview

```
npm install
npm start        # Remotion Studio (needs assets in public/)
```
