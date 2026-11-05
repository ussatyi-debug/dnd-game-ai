import sys, pathlib, time, os
from vosk_tts import Model, Synth
text = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8").strip()
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
model = None
for name in ["vosk-model-tts-ru-0.10-multi", "vosk-model-tts-ru-0.9-multi", "vosk-model-tts-ru-0.8-multi", "vosk-model-tts-ru-0.7-multi"]:
    try:
        model = Model(model_name=name)
        print("модель", name)
        break
    except Exception as e:
        print("нет модели", name, e)
if model is None:
    raise SystemExit("ни одна модель Vosk TTS не загрузилась")
synth = Synth(model)
for sid in range(5):
    t = time.time()
    synth.synth(text, str(out / f"vosk-speaker{sid}.wav"), speaker_id=sid)
    print(f"vosk speaker {sid}: {time.time()-t:.1f} c")
home = pathlib.Path.home()
for root, dirs, files in os.walk(home / ".cache" / "vosk"):
    for f in files:
        p = pathlib.Path(root) / f
        print("файл модели:", p.relative_to(home), f"{p.stat().st_size/1048576:.1f} МБ")
