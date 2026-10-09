#!/usr/bin/env python3
"""A tagged script and its voice in, the data a talking face plays out.

    python3 tools/talk.py talk/pip.txt assets/talk/pip.mp3 -o talk/pip.js

The script holds one line per mood, each opened by a tag: `[proud] Well, watch
my mouth.` The tag picks a pose from rig/poses.js or rig/moods.js, or an alias
below. The audio can be any voice: generated, or a person reading the lines.

Three readers, each kept for what it does best:
  Rhubarb   hears the audio and says which mouth shape, to the hundredth.
  Whisper   gives word times, so moods, subtitles and stresses land on words.
  the wave  gives loudness, so the jaw and the head follow the voice.

Writes a JS file setting window.TALK. The composition reads only that.
"""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RHUBARB = os.environ.get("RHUBARB", os.path.expanduser("~/tools/Rhubarb-Lip-Sync-1.14.0-macOS/rhubarb"))

# a voice tag names a delivery, the face needs a pose
ALIAS = {"laughs": "joy", "whispers": "secretive", "angry": "anger", "sighs": "sad",
         "happy": "cheerful", "scared": "fear", "shocked": "surprise", "sarcastic": "smug"}
FPS = 50          # loudness samples per second
LEAD = 0.25       # a face changes mood just before the words do


def poses():
    names = set()
    for f in ("rig/poses.js", "rig/moods.js"):
        names |= set(re.findall(r"^\s{2}(\w+): \{", open(os.path.join(ROOT, f)).read(), re.M))
    return names


def segments(path):
    """[(pose, text)], one per tagged line. An unbuilt mood stops the run by name."""
    known, out = poses(), []
    for line in open(path):
        m = re.match(r"\s*\[([a-z ]+)\]\s*(.+)", line)
        if not m:
            continue
        tag, text = m.group(1).strip(), m.group(2).strip()
        pose = ALIAS.get(tag, tag)
        if pose not in known:
            sys.exit(f"no pose for [{tag}]. Build it in rig/moods.js or add an alias.")
        out.append((pose, text))
    return out


def norm(w):
    return re.sub(r"[^a-z']", "", w.lower())


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def prepare(audio, segs, work):
    """16 kHz mono wav, Whisper words and Rhubarb cues, each made once."""
    stem = os.path.join(work, os.path.splitext(os.path.basename(audio))[0])
    wav, dialog = stem + ".wav", stem + ".dialog.txt"
    if not os.path.exists(wav):
        run(["ffmpeg", "-y", "-i", audio, "-ar", "16000", "-ac", "1", wav])
    open(dialog, "w").write("\n".join(t for _, t in segs) + "\n")
    if not os.path.exists(stem + ".json"):
        run(["whisper", wav, "--model", "small", "--language", "en", "--word_timestamps", "True",
             "--output_format", "json", "--output_dir", work, "--fp16", "False"])
    if not os.path.exists(stem + ".rhubarb.json"):
        run([RHUBARB, "-f", "json", "--extendedShapes", "GHX", "-d", dialog, "-o", stem + ".rhubarb.json", wav])
    words = [{"w": w["word"].strip(), "s": w["start"], "e": w["end"]}
             for seg in json.load(open(stem + ".json"))["segments"] for w in seg.get("words", [])]
    cues = json.load(open(stem + ".rhubarb.json"))["mouthCues"]
    return wav, words, cues


def loudness(wav):
    with wave.open(wav) as w:
        rate = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    hop = rate // FPS
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-9)
    db = 20 * np.log10(rms)
    lo, hi = np.percentile(db, 20), np.percentile(db, 98)
    e = np.clip((db - lo) / (hi - lo), 0, 1)
    k = np.ones(3) / 3                      # three samples: a syllable, not a click
    return np.convolve(e, k, mode="same"), len(x) / rate


def align(segs, words, cues):
    """Each segment's start and end, from the words Whisper heard of it.

    A segment Whisper missed, a laugh or a hum, takes the first spoken mouth
    shape after the segment before it.
    """
    script = [(i, norm(w)) for i, (_, t) in enumerate(segs) for w in t.split() if norm(w)]
    heard = [norm(w["w"]) for w in words]
    sm = difflib.SequenceMatcher(a=[w for _, w in script], b=heard, autojunk=False)
    owner, said = {}, set()
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            owner[b + k] = script[a + k][0]
            said.add(a + k)
    # a segment whose opening word went unheard (a hum, a laugh) starts on the mouth
    first = {}
    for k, (i, _) in enumerate(script):
        first.setdefault(i, k)
    for wi, w in enumerate(words):
        w["seg"] = owner.get(wi)
    # words between two matched ones of the same segment belong to it too
    for wi, w in enumerate(words):
        if w["seg"] is None:
            prev = next((words[j]["seg"] for j in range(wi - 1, -1, -1) if words[j]["seg"] is not None), 0)
            w["seg"] = prev
    spans, t = [], 0.0
    for i in range(len(segs)):
        mine = [w for w in words if w["seg"] == i]
        if mine:
            s, e = mine[0]["s"], mine[-1]["e"]
            if first.get(i) not in said:
                spoken = [c["start"] for c in cues if c["value"] != "X" and t + 0.05 <= c["start"] < s]
                s = spoken[0] if spoken else s
        else:
            spoken = [c for c in cues if c["value"] != "X" and c["start"] >= t]
            s = spoken[0]["start"] if spoken else t
            nxt = [w["s"] for w in words if w["seg"] is not None and w["seg"] > i]
            e = min(nxt) - 0.15 if nxt else s + 1.0
        spans.append((s, max(e, s + 0.3)))
        t = spans[-1][1]
    return spans


def emphasis(words, energy):
    """Stressed words: louder than the words around them."""
    peak = lambda w: float(energy[int(w["s"] * FPS): max(int(w["e"] * FPS), int(w["s"] * FPS) + 1)].max())
    peaks = [peak(w) for w in words]
    out, last = [], -9
    for i, w in enumerate(words):
        near = peaks[max(0, i - 4): i + 5]
        k = (peaks[i] - float(np.median(near))) / 0.2
        if k > 0.35 and w["e"] - w["s"] > 0.14 and w["s"] - last > 0.7:
            out.append({"t": round(w["s"], 3), "k": round(min(k, 1.0), 2)})
            last = w["s"]
    return out


def looks(words, spans, duration):
    """Blinks and glances, found in the pauses where a speaker really stops."""
    blinks, glances, aways = [], [], [(-16, -12), (15, -9), (-12, 6), (17, 5)]
    starts = [w["s"] for w in words]
    ends = [w["e"] for w in words]
    for a, b in zip(ends, starts[1:]):
        gap = b - a
        if gap >= 0.3:
            blinks.append(round(a + 0.06, 3))
        if gap >= 0.6 and len(blinks) % 2:
            gx, gy = aways[len(glances) % len(aways)]
            glances.append({"a": round(a + 0.1, 3), "b": round(b - 0.05, 3), "gx": gx, "gy": gy})
    blinks += [round(max(0, s - LEAD), 3) for s, _ in spans[1:]]
    blinks.sort()
    # a face never holds its eyes open past four seconds
    filled, t = [], 0.0
    for b in blinks + [duration]:
        while b - t > 4.0:
            t += 3.2
            filled.append(round(t, 3))
        if b < duration:
            filled.append(b)
        t = b
    out = []
    for b in sorted(filled):
        if not out or b - out[-1] > 0.45:
            out.append(b)
    return out, glances


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("script")
    p.add_argument("audio")
    p.add_argument("-o", "--out", required=True)
    a = p.parse_args()

    segs = segments(a.script)
    work = os.path.dirname(os.path.abspath(a.audio))
    wav, words, cues = prepare(a.audio, segs, work)
    energy, duration = loudness(wav)
    spans = align(segs, words, cues)
    blinks, glances = looks(words, spans, duration)
    talk = {
        "duration": round(duration, 3),
        "moods": [{"pose": pose, "s": round(s, 3), "e": round(e, 3), "text": text}
                  for (pose, text), (s, e) in zip(segs, spans)],
        "words": [{"w": w["w"], "s": round(w["s"], 3), "e": round(w["e"], 3), "seg": w["seg"]} for w in words],
        "mouth": [{"s": c["start"], "v": c["value"]} for c in cues],
        "energy": [round(float(v), 2) for v in energy],
        "fps": FPS,
        "stress": emphasis(words, energy),
        "blinks": blinks,
        "glances": glances,
    }
    open(a.out, "w").write("// Made by tools/talk.py. Do not edit by hand.\nwindow.TALK = " + json.dumps(talk) + ";\n")
    used = "".join(sorted({c["value"] for c in cues}))
    print(f"{a.out}: {duration:.1f}s, {len(segs)} moods, {len(words)} words, {len(cues)} mouth cues ({used}), "
          f"{len(talk['stress'])} stresses, {len(blinks)} blinks, {len(glances)} glances")
    for m in talk["moods"]:
        print(f"  {m['s']:6.2f}-{m['e']:6.2f}  {m['pose']:<12} {m['text'][:50]}")


if __name__ == "__main__":
    main()
