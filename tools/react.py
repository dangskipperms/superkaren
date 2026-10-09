#!/usr/bin/env python3
"""A narration about her and its tagged script in, the cues of her silent reactions out.

    python3 tools/react.py film/intro/reactions.txt assets/intro/narration.mp3 -o film/intro/reactions.js

She never speaks. The script is the narration's own text with a tag before each
word she reacts on: `Meet [warm] Karen.` A tag is `[mood]`, `[mood k]` for a
share of it, `[mood k ~s]` for a blend of s seconds. A mood is an expression or
a shade in host/expressions.js, or one muscle by its slider name in host/stage.js.

Whisper reads the voice with the script as its prompt, so it hears every word.
The tagged words are matched to the heard ones, and each cue lands on its word.
Writes a JS file setting REACT. host/react-film.js plays only that.
"""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
LEAD = 0.12       # a face moves just before the word lands
RAMP = 0.5        # seconds a reaction takes to fill


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower())


def moods():
    names = set(re.findall(r"^\s{2}(\w+): \{ label", open(os.path.join(ROOT, "host/expressions.js")).read(), re.M))
    return names | set(re.findall(r'\["(\w+)", "', open(os.path.join(ROOT, "host/stage.js")).read()))


def parse(path):
    """The script's words, and the tags pinned to the word after each."""
    known, words, tags = moods(), [], []
    text = "".join(l for l in open(path) if not l.startswith("#"))
    for tok in re.findall(r"\[[^\]]+\]|[^\s\[]+", text):
        m = re.fullmatch(r"\[(\w+)(?:\s+([\d.]+))?(?:\s+~([\d.]+))?\]", tok)
        if m:
            if m.group(1) not in known:
                sys.exit(f"no mood [{m.group(1)}]. Build it in host/expressions.js.")
            tags.append({"word": len(words), "mood": m.group(1),
                         "k": float(m.group(2) or 1), "ramp": float(m.group(3) or RAMP)})
        elif tok.startswith("["):
            sys.exit(f"bad tag {tok}: [mood], [mood k] or [mood k ~s]")
        elif norm(tok):
            words.append(tok)
    return words, tags


def hear(audio, words):
    """Whisper's words with times, made once and kept beside the audio."""
    stem = os.path.splitext(audio)[0]
    wav, out = stem + ".wav", stem + ".json"
    if not os.path.exists(wav):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", audio, "-ar", "16000", "-ac", "1", wav], check=True)
    if not os.path.exists(out):
        subprocess.run(["whisper", wav, "--model", "small", "--language", "en", "--word_timestamps", "True",
                        "--output_format", "json", "--output_dir", os.path.dirname(out), "--fp16", "False",
                        "--initial_prompt", " ".join(words)],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return [{"w": w["word"].strip(), "s": w["start"], "e": w["end"]}
            for seg in json.load(open(out))["segments"] for w in seg.get("words", [])]


def duration(audio):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio],
                       check=True, capture_output=True, text=True)
    return float(r.stdout)


def align(words, heard, tags):
    """Each tag's time, from the heard word its script word matched. An unheard word stops the run."""
    script = [norm(w) for w in words]
    said = [norm(w["w"]) for w in heard]
    sm = difflib.SequenceMatcher(a=script, b=said, autojunk=False)
    at = {}
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            at[a + k] = heard[b + k]["s"]
    cues = []
    for t in tags:
        if t["word"] not in at:
            sys.exit(f"Whisper did not hear '{words[t['word']]}' (word {t['word']}). Move the tag to a heard word.")
        cues.append({"t": round(max(0, at[t["word"]] - LEAD), 3), "mood": t["mood"], "k": t["k"],
                     "ramp": t["ramp"], "word": words[t["word"]]})
    missed = len(script) - len(at)
    return cues, missed


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("script")
    p.add_argument("audio")
    p.add_argument("-o", "--out", required=True)
    a = p.parse_args()

    words, tags = parse(a.script)
    heard = hear(os.path.abspath(a.audio), words)
    cues, missed = align(words, heard, tags)
    data = {"audio": os.path.relpath(a.audio, ROOT), "duration": round(duration(a.audio), 3), "cues": cues}
    with open(a.out, "w") as f:
        f.write("// Written by tools/react.py from " + os.path.relpath(a.script, ROOT) + ". Do not edit.\n")
        f.write("const REACT = " + json.dumps(data, indent=1) + ";\n")
    print(f"{len(cues)} reactions over {data['duration']} s, {missed} of {len(words)} script words unheard")
    for c in cues:
        print(f"  {c['t']:7.2f}  {c['mood']:<12} {c['k']:<4} {c['word']}")


if __name__ == "__main__":
    main()
