# Super Karen — a cartoon face that acts, in code

One hand-built SVG face, moved by muscles. No images. No AI draws her.
She plays in HyperFrames: HTML compositions rendered to MP4.

## Run her
- Needs Node 22+ and ffmpeg. `npm run dev` opens the studio on the compositions.
- Render one: `npx hyperframes render . -c compositions/karen-sliders.html`.
- `npx hyperframes check .` must pass before a render.
- For HyperFrames know-how, `npx hyperframes skills` installs its agent skills.

## What is where
- `host/` is Super Karen.
  - `base.js` holds her muscle units (FACS), palette and drawing helpers.
  - `expressions.js` holds her expressions, shades and mouth shapes, each a mix of muscles.
  - `stage.js` is the slider stage her films share. `life.js` blinks, breathes and glances.
- `compositions/karen-sliders.html` runs every expression with its sliders.
- `compositions/manager.html` is her music video. Its scenes, acting and props live in `film/manager/`.
- `drawings/adult-host.html` is the first drawing she came from. Open it in a browser and play with the muscles.
- `rig/` is the earlier kid head, Pip. `index.html` is his reel, `compositions/talk.html` talks, `compositions/range.html` shows every mood.

## Laws of the motion
- One GSAP tween drives a clock. Every face value is a pure function of that time, so any frame can be seeked.
- New motion is an expression or a pose, or a keyframe, never a new tween.
- The eye shows through a clip between the two lid curves. Never paint skin over it.

## Make her react to a narration
- She stays silent and reacts. Tag the narration's own text: `Meet [warm] Karen.` Grammar in `tools/react.py`.
- `python3 tools/react.py <tagged.txt> <narration.mp3> -o <reactions.js>` times each tag on its word.
- `host/react-film.js` plays that file on the slider stage. Build its composition like `karen-sliders.html`, with the audio on a track.

## Make a face talk or sing
- Talk: lines as `[mood] text` in `talk/<name>.txt`, then `python3 tools/talk.py talk/<name>.txt <voice.mp3> -o talk/<name>.js`. Any voice works, recorded or generated.
- Sing: `tools/stems.py` splits the vocals, Whisper and Rhubarb read them, `tools/song.py` writes `talk/<song>.js`.
- The tools need Python 3 with numpy, the `whisper` CLI (openai-whisper, model `small`), and Rhubarb Lip Sync. Point `RHUBARB` at its binary. `stems.py` also needs demucs, torch and soundfile.
