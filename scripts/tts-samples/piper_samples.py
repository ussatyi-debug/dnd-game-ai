import sys, wave, urllib.request, pathlib, time
from piper import PiperVoice
text = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8").strip()
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/ru/ru_RU"
for name in ["dmitri", "irina", "denis", "ruslan"]:
    base = f"ru_RU-{name}-medium"
    for ext in [".onnx", ".onnx.json"]:
        p = pathlib.Path(base + ext)
        if not p.exists():
            urllib.request.urlretrieve(f"{HF}/{name}/medium/{base}{ext}", p)
    voice = PiperVoice.load(base + ".onnx")
    t = time.time()
    with wave.open(str(out / f"piper-{name}.wav"), "wb") as w:
        if hasattr(voice, "synthesize_wav"):
            voice.synthesize_wav(text, w)
        else:
            voice.synthesize(text, w)
    print(f"piper {name}: {time.time()-t:.1f} c")
