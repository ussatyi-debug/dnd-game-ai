import os, torch
import silero_stress
d = os.path.dirname(silero_stress.__file__)
imp = torch.package.PackageImporter(d + "/data/accentor.pt")
src = imp.load_text("models", "accentor.py")
i = src.find("def _tokenize")
print(src[i:i + 6000])
