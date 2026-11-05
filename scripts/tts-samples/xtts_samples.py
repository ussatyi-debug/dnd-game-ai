import sys, pathlib, time, os
os.environ["COQUI_TOS_AGREED"] = "1"
from TTS.api import TTS
text = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8").strip()
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
for spk in ["Damien Black", "Viktor Menelaos", "Ana Florence"]:
    t = time.time()
    tts.tts_to_file(text=text.replace("120", "сто двадцать"), speaker=spk, language="ru", file_path=str(out / f"xtts-{spk.split()[0].lower()}.wav"))
    print(f"xtts {spk}: {time.time()-t:.1f} c")
