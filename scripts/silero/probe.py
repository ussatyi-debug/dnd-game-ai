"""Silero: полный код модели, подмодули и попытки ONNX."""
import os, traceback, torch
from silero import silero_tts

OUT = "scripts/silero/out"
os.makedirs(OUT, exist_ok=True)
model, _ = silero_tts(language="ru", speaker="v5_cis_base")
pack = model.packages[0]
pack.unpack_q_model(); pack.q_model_unpacked = True
torch._C._jit_set_profiling_mode(False)
jm = pack.models[0]
with open(f"{OUT}/forward.txt", "w") as f:
    f.write(jm.code)
    for n, m in jm.named_children():
        f.write(f"\n\n===== {n} {m.original_name}\n")
        try:
            f.write(m.code)
        except Exception as e:
            f.write(f"NO CODE {e}")
for n, m in jm.named_children():
    try:
        print("CHILD", n, m.original_name, m.forward.schema)
    except Exception as e:
        print("CHILD", n, e)
print("WRAPPED", type(pack.wrapped_jit_v))

seq, _ = pack.preprocess_tacotron("прив+ет, мир.")
seq = seq.unsqueeze(0)
L = seq.shape[1]
spk = torch.LongTensor([pack.speaker_to_ids[0]["ru_dmitriy"]])
rate = torch.ones(1, L); pitch = torch.ones(1, L)
out, add = jm(sequence=seq, speaker_ids=spk, sr=24000, symb_durs={}, durs_rate=rate, pitch_coefs=pitch, device="cpu")
print("OUT", type(out), getattr(out, "shape", None))

class Whole(torch.nn.Module):
    def __init__(self, m):
        super().__init__(); self.m = m
    def forward(self, sequence, speaker_ids, durs_rate, pitch_coefs):
        out, _ = self.m(sequence=sequence, speaker_ids=speaker_ids, sr=24000, symb_durs=None,
                        durs_rate=durs_rate, pitch_coefs=pitch_coefs, device="cpu")
        return out

for opset in (17, 14):
    try:
        torch.onnx.export(Whole(jm), (seq, spk, rate, pitch), f"{OUT}/whole_{opset}.onnx", opset_version=opset,
                          input_names=["sequence", "speaker_ids", "durs_rate", "pitch_coefs"], output_names=["audio"],
                          dynamic_axes={"sequence": {1: "L"}, "durs_rate": {1: "L"}, "pitch_coefs": {1: "L"}, "audio": {1: "T"}},
                          dynamo=False)
        print("WHOLE ONNX OK", opset, os.path.getsize(f"{OUT}/whole_{opset}.onnx"))
        import onnxruntime as ort
        s = ort.InferenceSession(f"{OUT}/whole_{opset}.onnx")
        seq2, _ = pack.preprocess_tacotron("это совсем другая и более длинная фраза для проверки.")
        seq2 = seq2.unsqueeze(0); L2 = seq2.shape[1]
        r = s.run(None, {"sequence": seq2.numpy(), "speaker_ids": spk.numpy(),
                         "durs_rate": torch.ones(1, L2).numpy(), "pitch_coefs": torch.ones(1, L2).numpy()})
        print("ORT RUN OK", r[0].shape)
        break
    except Exception:
        traceback.print_exc()
