"""Silero Stress: исходник AccentorNgram и выход jit-модели."""
import os, torch
import silero_stress
d = os.path.dirname(silero_stress.__file__)
imp = torch.package.PackageImporter(d + "/data/accentor.pt")
for mod, f in (("models", "accentor.py"), ("models", "model.py")):
    try:
        print(f"@@SRC {mod}/{f}"); print(imp.load_text(mod, f)[:12000])
    except Exception as e:
        print("ERR", mod, f, e)
from silero_stress import load_accentor
acc = load_accentor()
words = ["грегори", "добил", "стражника", "у", "замка", "и", "забрал", "замок", "его", "елка"]
a, b = acc.accentor.model(words)
print("A", a.shape, a.dtype, a.argmax(-1).tolist())
print("B", b.shape, b.dtype, b.tolist()[:3])
print("FULL", acc(" ".join(words)))
