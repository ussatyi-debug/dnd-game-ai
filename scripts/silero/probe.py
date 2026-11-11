"""Разбор Silero: исходник apply_tts, входы jit-модели и попытка ONNX."""
import inspect, os, traceback, torch
from silero import silero_tts

model, _ = silero_tts(language="ru", speaker="v5_cis_base")
pack = model.packages[0]
src = inspect.getsource(type(pack))
i = src.find("def apply_tts")
print(src[i:i + 9000])
print("NMODELS", len(pack.models))
jm = pack.models[0]
print("JIT TYPE", type(jm))
print("FORWARD SCHEMA", jm.forward.schema)
try:
    print("CODE", jm.code[:5000])
except Exception as e:
    print("NO CODE", e)
for n in jm._method_names() if hasattr(jm, "_method_names") else []:
    print("METHOD", n, getattr(jm, n).schema)

captured = {}
orig = pack.models[0]
class Rec(torch.nn.Module):
    def __init__(self, m):
        super().__init__(); self.m = m
    def forward(self, *a, **k):
        captured["args"] = a; captured["kwargs"] = k
        return self.m(*a, **k)
    def __getattr__(self, n):
        try:
            return super().__getattr__(n)
        except AttributeError:
            return getattr(self.m, n)
pack.models[0] = Rec(orig)
try:
    audio = model.apply_tts(text="Прив+ет, мир. Это пр+оба г+олоса.", speaker="ru_dmitriy", sample_rate=24000)
    print("AUDIO", audio.shape)
except Exception:
    traceback.print_exc()
pack.models[0] = orig
for idx, a in enumerate(captured.get("args", ())):
    print("ARG", idx, type(a), getattr(a, "shape", a) if not isinstance(a, (list, tuple)) else [getattr(x, "shape", x) for x in a], getattr(a, "dtype", ""))
for k, a in captured.get("kwargs", {}).items():
    print("KW", k, type(a), getattr(a, "shape", a), getattr(a, "dtype", ""))

os.makedirs("scripts/silero/out", exist_ok=True)
args = captured.get("args")
if args:
    try:
        torch.onnx.export(orig, tuple(args), "scripts/silero/out/silero.onnx", opset_version=17, dynamo=False)
        print("ONNX OK", os.path.getsize("scripts/silero/out/silero.onnx"))
    except Exception:
        traceback.print_exc()
