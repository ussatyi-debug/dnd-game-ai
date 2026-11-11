"""Silero Stress изнутри: что за данные и модели у AccentorNgram и HomoSolver."""
import inspect, sys, torch
from silero_stress import load_accentor
acc = load_accentor()
def show(obj, name, depth=0):
    print("=" * 10, name, type(obj))
    for k, v in vars(obj).items():
        extra = ""
        if isinstance(v, dict): extra = f"len={len(v)} sample={list(v.items())[:3]}"
        elif isinstance(v, (list, tuple, set)): extra = f"len={len(v)} sample={list(v)[:5]}"
        elif isinstance(v, torch.Tensor): extra = f"tensor {tuple(v.shape)} {v.dtype}"
        elif isinstance(v, (int, float, str, bool)): extra = repr(v)[:200]
        print("  ATTR", k, type(v).__name__, str(extra)[:400])
        if depth < 1 and hasattr(v, "__dict__") and not isinstance(v, (type, torch.jit.ScriptModule)) and not isinstance(v, (str, int)):
            show(v, f"{name}.{k}", depth + 1)
        if isinstance(v, torch.jit.ScriptModule):
            try: print("  JIT", k, v.forward.schema)
            except Exception as e: print("  JIT", k, e)
    for m in ("__call__", "forward", "put_accent", "predict"):
        f = getattr(type(obj), m, None)
        if f:
            try: print(f"  SRC {m}:\n" + inspect.getsource(f)[:3500])
            except Exception as e: print("  NOSRC", m, e)
show(acc, "acc")
show(acc.accentor, "accentor")
show(acc.homosolver, "homosolver")
print("CALLSIG", inspect.signature(acc.__call__) if hasattr(acc, "__call__") else None)
