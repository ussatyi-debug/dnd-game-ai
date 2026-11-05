import sys, pathlib, time, wave
import torch
text = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8").strip()
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
model = None
for mid in ["v5_5_ru", "v5_ru", "v4_ru"]:
    try:
        model, _ = torch.hub.load("snakers4/silero-models", "silero_tts", language="ru", speaker=mid, trust_repo=True)
        print("модель", mid)
        break
    except Exception as e:
        print("нет модели", mid, e)
torch.set_num_threads(4)
for spk in ["aidar", "xenia"]:
    t = time.time()
    audio = model.apply_tts(text=text.replace("120", "сто двадцать"), speaker=spk, sample_rate=48000)
    pcm = (audio.clamp(-1, 1) * 32767).to(torch.int16).numpy().tobytes()
    with wave.open(str(out / f"long-silero-{spk}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(48000); w.writeframes(pcm)
    print(f"silero {spk}: {time.time()-t:.1f} c")
