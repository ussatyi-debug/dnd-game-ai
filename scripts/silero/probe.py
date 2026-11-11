"""Silero: печать кода склейки модели."""
import torch
from silero import silero_tts
model, _ = silero_tts(language="ru", speaker="v5_cis_base")
pack = model.packages[0]
pack.unpack_q_model()
jm = pack.models[0]
print("@@@CODE@@@")
print(jm.code)
for name in ("get_support_ids", "replace_comma", "process_pauses"):
    try:
        print(f"@@@{name}@@@"); print(getattr(jm, name).code)
    except Exception as e:
        print("ERR", e)
print("@@@dur@@@"); print(jm.dur_predictor.code)
print("@@@pitch@@@"); print(jm.pitch_predictor.code)
print("@@@taco@@@"); print(jm.tacotron.code)
print("@@@voc@@@"); print(jm.vocoder.code)
print("@@@mask@@@")
import inspect
print([n for n in dir(jm) if not n.startswith("__")])
print("@@@END@@@")
