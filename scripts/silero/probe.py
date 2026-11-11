"""Silero v5_cis_base -> три ONNX: предсказатели, акустика, вокодер. Сверка с оригиналом."""
import os, time, traceback, torch, numpy as np
from typing import Optional
from silero import silero_tts

OUT = "scripts/silero/out"; os.makedirs(OUT, exist_ok=True)
model, _ = silero_tts(language="ru", speaker="v5_cis_base")
pack = model.packages[0]
pack.unpack_q_model(); pack.q_model_unpacked = True
torch._C._jit_set_profiling_mode(False)
jm = pack.models[0]
g = str(jm.inlined_graph).splitlines()
print("@@@GRAPH@@@"); print("\n".join(g[:60])); print("@@@GEND@@@")
print("PUNKT", jm.punkt_symbols if hasattr(jm, "punkt_symbols") else None)
for a in ("punkt_symbols", "comma_ids", "point_id"):
    try: print(a, getattr(jm, a))
    except Exception as e: print(a, "ERR", e)

text = "прив+ет, мир. это пр+оба г+олоса."
seq, _ = pack.preprocess_tacotron(text); seq = seq.unsqueeze(0)
spk = torch.LongTensor([pack.speaker_to_ids[0]["ru_dmitriy"]])
L = seq.shape[1]
ref, ref_dur = jm(sequence=seq, speaker_ids=spk, sr=24000, symb_durs={}, durs_rate=torch.ones(1, L), pitch_coefs=torch.ones(1, L), device="cpu")
print("REF", ref.shape, "DUR", ref_dur.shape, ref_dur[0][:10].tolist())

def export(mod, args, name, inputs, outputs, dyn):
    try:
        t = time.time()
        torch.onnx.export(mod, args, f"{OUT}/{name}.onnx", opset_version=17, input_names=inputs,
                          output_names=outputs, dynamic_axes=dyn, dynamo=False)
        print("EXPORT OK", name, os.path.getsize(f"{OUT}/{name}.onnx"), round(time.time() - t, 1))
        return True
    except Exception:
        print("EXPORT FAIL", name); traceback.print_exc(limit=3); return False

# 1. маска
mask = None
try:
    import re
    print("SEQ", seq.tolist())
except Exception: pass

@torch.jit.script
def token_mask(seq: torch.Tensor) -> torch.Tensor:
    return torch.ones(1)

# Предсказатели: маску берём той же функцией, что и модель, вызывая её через forward с gt — недоступно; пробуем маску (seq != 0)
for mask_try in ("ne0_T_B", "ne0_B_T"):
    m = (seq != 0)
    m = m.transpose(0, 1) if mask_try == "ne0_T_B" else m
    try:
        d = jm.dur_predictor(seq, spk, m, 1.0, None)
        print("MASK", mask_try, m.shape, "OK dur", d.shape)
        mask = m
        break
    except Exception as e:
        print("MASK", mask_try, "ERR", str(e)[:200])
