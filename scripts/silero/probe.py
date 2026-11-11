"""Пробный разбор Silero v5_cis_base: что внутри и можно ли перевести в ONNX."""
import inspect, json, sys, traceback
import torch
from silero import silero_tts

model, example = silero_tts(language="ru", speaker="v5_cis_base")
print("TYPE", type(model))
print("DIR", [a for a in dir(model) if not a.startswith("__")])
for name in ("speakers", "symbols", "sample_rate"):
    print(name.upper(), getattr(model, name, None))
for name, val in vars(model).items() if hasattr(model, "__dict__") else []:
    print("ATTR", name, type(val))
try:
    print("APPLY_SIG", inspect.signature(model.apply_tts))
    print(inspect.getsource(type(model)))
except Exception as e:
    print("NO SOURCE", e)
inner = getattr(model, "model", None)
if inner is not None:
    print("INNER", type(inner))
    try:
        print(inner.code[:6000])
    except Exception as e:
        print("NO CODE", e)
    try:
        for n, m in inner.named_children():
            print("CHILD", n, type(m))
            try:
                print(m.code[:3000])
            except Exception:
                pass
    except Exception as e:
        print("NO CHILDREN", e)
spk = [s for s in (getattr(model, "speakers", []) or []) if str(s).startswith("ru_")]
print("RU_SPEAKERS", spk)
try:
    audio = model.apply_tts(text="Прив+ет, мир. Это пр+оба г+олоса.", speaker=spk[0] if spk else None, sample_rate=24000)
    print("AUDIO", audio.shape)
except Exception:
    traceback.print_exc()
