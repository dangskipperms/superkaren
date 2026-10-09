#!/usr/bin/env python3
"""A song in, its vocals and its music out, as two wavs.

    python3 tools/stems.py assets/manager/song.mp3 assets/manager/

Runs demucs htdemucs in process and writes with soundfile: the demucs CLI saves
through torchcodec, which fails to load on this Mac. Lip-sync hears the vocals
alone. Music would read as speech.
"""
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
import torch
from demucs.apply import apply_model
from demucs.pretrained import get_model

SR = 44100


def load(path):
    """Decode any audio to float32 stereo at the model's rate, through ffmpeg."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).T.copy()


def main():
    src, out = sys.argv[1], sys.argv[2]
    model = get_model("htdemucs")
    model.eval()
    wav = torch.from_numpy(load(src))
    ref = wav.mean(0)
    wav = (wav - ref.mean()) / ref.std()
    with torch.no_grad():
        sources = apply_model(model, wav[None], device="cpu", progress=True)[0]
    sources = sources * ref.std() + ref.mean()
    vocals = sources[model.sources.index("vocals")]
    music = sources.sum(0) - vocals
    os.makedirs(out, exist_ok=True)
    sf.write(os.path.join(out, "vocals.wav"), vocals.numpy().T, SR)
    sf.write(os.path.join(out, "music.wav"), music.numpy().T, SR)
    print("wrote", os.path.join(out, "vocals.wav"), "and music.wav")


if __name__ == "__main__":
    main()
