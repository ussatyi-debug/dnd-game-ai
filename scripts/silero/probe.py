"""Silero для ПК: сохранить jit-модель синтеза и проверить ударения без Python-кода пакета."""
import inspect, json, os, subprocess, sys, textwrap, traceback, torch
from silero import silero_tts

OUT = "scripts/silero/out"; os.makedirs(OUT, exist_ok=True)
model, _ = silero_tts(language="ru", speaker="v5_cis_base")
pack = model.packages[0]
pack.unpack_q_model(); pack.q_model_unpacked = True
jm = pack.models[0]
jm.save(f"{OUT}/silero_tts.jit")
meta = {"symbol_to_id": pack.symbol_to_id, "speakers": pack.speaker_to_ids[0], "symbols": pack.symbols,
        "sos": pack.sos_token, "eos": pack.eos_token, "alphabet": pack.alphabet}
json.dump(meta, open(f"{OUT}/silero_meta.json", "w"), ensure_ascii=False)
print("JIT SIZE", os.path.getsize(f"{OUT}/silero_tts.jit"))
print("ACCENTOR IN PACK", type(pack.accentor))

# Отдельный процесс: только torch, без пакета silero — как будет у libtorch.
code = textwrap.dedent('''
import json, torch, time
torch._C._jit_set_profiling_mode(False)
m = torch.jit.load("scripts/silero/out/silero_tts.jit")
meta = json.load(open("scripts/silero/out/silero_meta.json"))
text = "|" + "прив+ет, мир. это пр+оба г+олоса." + "~"
ids = torch.tensor([[meta["symbol_to_id"][c] for c in text]])
spk = torch.tensor([meta["speakers"]["ru_dmitriy"]])
L = ids.shape[1]
t = time.time()
out = m.forward(ids, spk, 24000, None, torch.ones(1, L), torch.ones(1, L))
print("STANDALONE OK", out[0].shape, round(time.time() - t, 3))
''')
r = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True)
print(r.stdout, r.stderr[-2000:])

# Ударения
try:
    import silero_stress
    print("STRESS MODULE", silero_stress.__file__)
    print(os.listdir(os.path.dirname(silero_stress.__file__)))
    from silero_stress import load_accentor
    acc = load_accentor()
    print("ACC TYPE", type(acc), [a for a in dir(acc) if not a.startswith("__")][:40])
    print("ACC OUT", acc("Грегори добил стражника у замка и забрал замок от сундука."))
    for k, v in vars(acc).items():
        print("ACC ATTR", k, type(v))
    try:
        print(inspect.getsource(type(acc))[:4000])
    except Exception as e:
        print("NO SRC", e)
except Exception:
    traceback.print_exc()
