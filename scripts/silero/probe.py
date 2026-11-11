"""Разбор пакета Silero v5_cis_base изнутри: из чего состоит синтез."""
import inspect, torch
from silero import silero_tts

model, _ = silero_tts(language="ru", speaker="v5_cis_base")
pid = model.speaker_to_package["ru_dmitriy"]
pack = model.packages[pid]
print("PACKS", len(model.packages), "PID", pid, "TYPE", type(pack))
print("DIR", [a for a in dir(pack) if not a.startswith("__")])
for k, v in vars(pack).items():
    print("ATTR", k, type(v), (v if isinstance(v, (int, float, str, bool)) else ""))
try:
    print(inspect.getsource(type(pack))[:15000])
except Exception as e:
    print("NO SOURCE", e)
for k, v in vars(pack).items():
    if isinstance(v, torch.jit.ScriptModule) or isinstance(v, torch.nn.Module):
        print("=== MODULE", k, type(v))
        try:
            print("CODE", v.code[:4000])
        except Exception as e:
            print("NO CODE", e)
        try:
            for n, m in v.named_children():
                print("  CHILD", n, type(m))
        except Exception:
            pass
        try:
            for n in dir(v):
                if not n.startswith("_"):
                    a = getattr(v, n, None)
                    if callable(a) and hasattr(a, "schema"):
                        print("  METHOD", n, a.schema)
        except Exception as e:
            print("NO METHODS", e)
