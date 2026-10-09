#!/usr/bin/env python3
"""A song's true lyrics, its vocals and its music in; the data a music video plays out.

    python3 tools/song.py assets/manager -o talk/manager.js --bpm 127.56 --phase 0.38

Reads from the song dir: lyrics.txt (with [Section] heads), vocals.json (Whisper,
word times), rhubarb.json (mouth cues), vocals.wav and music.wav (from stems.py).
The true lyrics are the text. Whisper only lends its times: each lyric word takes
the time of the heard word it matches, and an unheard word is placed between its
neighbours.

Writes window.SONG: sections, lines with words, mouth cues, the beat grid, and
loudness at 30 per second for the voice, the music and the kick.
"""
import argparse
import difflib
import json
import os
import re
import subprocess

import numpy as np

FPS = 30


def norm(w):
    w = w.lower().replace(":", "").replace(".", "")
    return re.sub(r"[^a-z0-9]", "", w)


def lyric_lines(path):
    """[(section, text)] in order. A [Head – note] line opens a section."""
    out, section = [], "Intro"
    for raw in open(path):
        line = raw.strip()
        if not line:
            continue
        m = re.match(r"\[([^\]–-]+)", line)
        if line.startswith("["):
            section = m.group(1).strip()
            continue
        out.append((section, line))
    return out


def heard_words(path):
    d = json.load(open(path))
    return [(norm(w["word"]), w["start"], w["end"]) for s in d["segments"] for w in s.get("words", []) if norm(w["word"])]


def align(lines, heard):
    """Give every lyric word a start and end from the heard words."""
    words = [(i, w) for i, (_, text) in enumerate(lines) for w in text.split()]
    a = [norm(w) for _, w in words]
    b = [h[0] for h in heard]
    times = [None] * len(words)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = heard[blk.b + k][1:]
    # unheard words share the gap between their timed neighbours
    k = 0
    while k < len(times):
        if times[k] is not None:
            k += 1
            continue
        j = k
        while j < len(times) and times[j] is None:
            j += 1
        t0 = times[k - 1][1] if k > 0 else 0.0
        t1 = times[j][0] if j < len(times) else t0 + 0.4 * (j - k)
        step = (t1 - t0) / (j - k)
        for n in range(k, j):
            times[n] = (t0 + step * (n - k), t0 + step * (n - k + 1))
        k = j
    out = [{"section": s, "text": t, "words": []} for s, t in lines]
    for (i, w), (s, e) in zip(words, times):
        out[i]["words"].append({"w": w, "s": round(s, 3), "e": round(e, 3)})
    for line in out:
        line["s"], line["e"] = line["words"][0]["s"], line["words"][-1]["e"]
    return out


def envelope(path, band=None):
    """Loudness at FPS, 0..1, from a wav. band=(lo, hi) Hz keeps only that range."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "22050", "-"],
                         capture_output=True, check=True).stdout
    y = np.frombuffer(raw, dtype=np.float32)
    hop = 22050 // FPS
    if band:
        spec = np.abs(np.fft.rfft(y[: len(y) // hop * hop].reshape(-1, hop), axis=1))
        f = np.fft.rfftfreq(hop, 1 / 22050)
        e = spec[:, (f >= band[0]) & (f < band[1])].sum(1)
    else:
        e = np.sqrt((y[: len(y) // hop * hop].reshape(-1, hop) ** 2).mean(1))
    e = e / (np.percentile(e, 98) or 1)
    return [round(float(v), 3) for v in np.clip(e, 0, 1)]


def refine(lines, voice):
    """Whisper's times, checked against where the voice sounds.
    A word that stretches over a long silence starts just before the next one.
    A line that starts in silence moves whole to the voice's next onset."""
    loud = lambda t: voice[min(len(voice) - 1, int(t * FPS))] > 0.08
    for line in lines:
        ws = line["words"]
        for a, b in zip(ws, ws[1:]):
            if b["s"] - a["s"] > 1.2:
                a["s"], a["e"] = round(b["s"] - 0.3, 3), b["s"]
        t0 = ws[0]["s"]
        if not loud(t0 + 0.05):
            onset = next((t0 + k / FPS for k in range(1, int(0.8 * FPS)) if loud(t0 + k / FPS)), None)
            if onset is not None:
                for w in ws:
                    w["s"], w["e"] = round(w["s"] + onset - t0, 3), round(w["e"] + onset - t0, 3)
        line["s"], line["e"] = ws[0]["s"], ws[-1]["e"]
    return lines


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("-o", required=True)
    ap.add_argument("--bpm", type=float, required=True)
    ap.add_argument("--phase", type=float, required=True)
    a = ap.parse_args()
    d = a.dir
    lines = align(lyric_lines(os.path.join(d, "lyrics.txt")), heard_words(os.path.join(d, "vocals.json")))
    cues = [{"s": c["start"], "v": c["value"]} for c in json.load(open(os.path.join(d, "rhubarb.json")))["mouthCues"]]
    voice = envelope(os.path.join(d, "vocals.wav"))
    lines = refine(lines, voice)
    song = {
        "bpm": a.bpm, "phase": a.phase, "fps": FPS,
        "lines": lines, "cues": cues,
        "voice": voice,
        "music": envelope(os.path.join(d, "music.wav")),
        "kick": envelope(os.path.join(d, "music.wav"), (30, 140)),
    }
    with open(a.o, "w") as f:
        f.write("window.SONG = " + json.dumps(song, separators=(",", ":")) + ";\n")
    for line in lines:
        print(f'{line["s"]:7.2f} {line["e"]:7.2f}  {line["section"]:10} {line["text"]}')


if __name__ == "__main__":
    main()
