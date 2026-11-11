"""Silero Stress: исходник AccentorNgram и выход jit-модели."""
import os, glob, torch
import silero_stress
from silero_stress import load_accentor
d = os.path.dirname(silero_stress.__file__)
print("FILES", glob.glob(d + "/data/**", recursive=True)[:20])
print("@@INIT"); print(open(d + "/__init__.py").read()[:3000])
print("@@ACCPY"); print(open(d + "/accentor.py").read()[:4000])
for p in glob.glob(d + "/data/**/*.pt", recursive=True):
    try:
        imp = torch.package.PackageImporter(p)
        names = [n for n in imp.file_structure().get_dir("models").children] if True else []
        print("PKG", p, names)
        for mod in ("models/accentor.py", "models/model.py"):
            try:
                print("@@SRC", mod); print(imp.load_text(*mod.rsplit("/", 1))[:9000])
            except Exception as e:
                print("ERR", mod, e)
    except Exception as e:
        print("PKGERR", p, e)
acc = load_accentor()
words = ["грегори", "добил", "стражника", "у", "замка", "и", "забрал", "замок", "его", "ёлка"]
out = acc.accentor.model(words)
print("JITOUT", [ (t.shape, t.dtype, t.tolist()) for t in out])
print("FULL", acc(" ".join(words)))
