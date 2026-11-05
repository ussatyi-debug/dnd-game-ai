import sys, pathlib, time, os
from vosk_tts import Model, Synth
text = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8").strip().replace("120", "сто двадцать").replace("«", "").replace("»", "")
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
import json, urllib.request
models = json.load(urllib.request.urlopen("https://alphacephei.com/vosk/models/model-list.json"))
tts = [m for m in models if m.get("type") == "tts" and m.get("lang") == "ru" and not m.get("obsolete") == "true"]
for m in tts:
    print("доступна:", m["name"], m.get("size_text"), m.get("version"))
for name, speakers in [("vosk-model-tts-ru-0.9-multi", [2, 4])]:
    try:
        model = Model(model_name=name)
        synth = Synth(model)
    except BaseException as e:
        print("не загрузилась", name, e)
        continue
    short = name.replace("vosk-model-tts-ru-", "")
    for sid in speakers:
        try:
            t = time.time()
            synth.synth(text, str(out / f"long-vosk-speaker{sid}.wav"), speaker_id=sid)
            print(f"vosk {short} speaker {sid}: {time.time()-t:.1f} c")
        except BaseException as e:
            print("ошибка", short, sid, e)
home = pathlib.Path.home()
for root, dirs, files in os.walk(home / ".cache" / "vosk"):
    for f in files:
        p = pathlib.Path(root) / f
        print("файл модели:", p.relative_to(home), f"{p.stat().st_size/1048576:.1f} МБ")
