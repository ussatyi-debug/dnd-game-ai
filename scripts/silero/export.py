"""Silero для ПК: модели синтеза и ударений в формате TorchScript + данные для Rust.

Выход (scripts/silero/out): silero_tts.jit, silero_meta.json, silero_stress.jit,
silero_stress_exceptions.json. Лицензии: v5_cis_base и silero-stress — MIT.
"""
import json, os, subprocess, sys, textwrap
from typing import Tuple

import torch
from silero import silero_tts
from silero_stress import load_accentor

OUT = sys.argv[1] if len(sys.argv) > 1 else "scripts/silero/out"
os.makedirs(OUT, exist_ok=True)
model, _ = silero_tts(language="ru", speaker="v5_cis_base")
pack = model.packages[0]
pack.unpack_q_model()
pack.models[0].save(f"{OUT}/silero_tts.jit")
ru = {k: v for k, v in pack.speaker_to_ids[0].items() if k.startswith("ru_")}
json.dump({"symbol_to_id": pack.symbol_to_id, "speakers": ru, "sos": pack.sos_token, "eos": pack.eos_token},
          open(f"{OUT}/silero_meta.json", "w"), ensure_ascii=False)
acc = load_accentor()


class StressWords(torch.nn.Module):
    """Слова одной строкой через пробел: из Rust (libtorch) список строк не передаётся."""

    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, text: str) -> Tuple[torch.Tensor, torch.Tensor]:
        return self.model(text.split(" "))


torch.jit.script(StressWords(acc.accentor.model)).save(f"{OUT}/silero_stress.jit")
json.dump({k: list(v) for k, v in acc.accentor.exceptions.items()},
          open(f"{OUT}/silero_stress_exceptions.json", "w"), ensure_ascii=False)
words = ["грегори", "добил", "стражника", "замка", "забрал", "замок", "елка"]
ref = acc.accentor.model(words)
check = textwrap.dedent(f'''
import torch
m = torch.jit.load("{OUT}/silero_stress.jit")
a, b = m({" ".join(words)!r})
print("STRESS RELOAD", a.argmax(-1).tolist(), b.argmax(-1).tolist())
''')
print("STRESS REF", ref[0].argmax(-1).tolist(), ref[1].argmax(-1).tolist())
print(subprocess.run([sys.executable, "-c", check], capture_output=True, text=True).stdout)
for f in sorted(os.listdir(OUT)):
    print("FILE", f, os.path.getsize(f"{OUT}/{f}"))
