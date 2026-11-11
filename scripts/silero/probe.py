"""Silero v5_cis_base -> ONNX по частям и сверка конвейера (как будет в JS) с оригиналом."""
import os, time, traceback, torch, numpy as np
import onnxruntime as ort
from silero import silero_tts

OUT = "scripts/silero/out"; os.makedirs(OUT, exist_ok=True)
model, _ = silero_tts(language="ru", speaker="v5_cis_base")
pack = model.packages[0]
pack.unpack_q_model(); pack.q_model_unpacked = True
torch._C._jit_set_profiling_mode(False)
jm = pack.models[0]
print("UPC", jm.update_pitch_coef.code if hasattr(jm, "update_pitch_coef") else "none")

class Predict(torch.nn.Module):
    def __init__(self, m):
        super().__init__(); self.dur = m.dur_predictor; self.pitch = m.pitch_predictor
    def forward(self, sequence: torch.Tensor, speaker_ids: torch.Tensor):
        mask = torch.eq(sequence, 0)
        d = self.dur(sequence, speaker_ids, mask, 1.0, None)
        p = self.pitch(sequence, speaker_ids, mask, 1.0)
        return d, p

class Acoustic(torch.nn.Module):
    def __init__(self, m):
        super().__init__(); self.t = m.tacotron
    def forward(self, sequence: torch.Tensor, speaker_ids: torch.Tensor, dur: torch.Tensor, pitch: torch.Tensor):
        mask = torch.eq(sequence, 0)
        return self.t(sequence, speaker_ids, mask, dur, pitch, None)

class Vocoder(torch.nn.Module):
    def __init__(self, m):
        super().__init__(); self.v = m.vocoder
    def forward(self, mel: torch.Tensor):
        return self.v(mel, 24000, 0.0, True)

def post_dur(log_dur):
    d = np.exp(log_dur) - 1.0
    d[d < 0] = 0
    d = np.round(d)
    if d[0, 0] > 5: d[0, 0] = 5
    d = np.round(d / 1.0)
    if d[0, 0] > 5: d[0, 0] = 5
    if d[0, -1] > 7: d[0, -1] = 7
    d[0, -2] = 13
    if d[0, -3] > 13: d[0, -3] = 13
    return d

spk_name = "ru_dmitriy"
spk = torch.LongTensor([pack.speaker_to_ids[0][spk_name]])
texts = ["прив+ет, мир. это пр+оба г+олоса.", "в глубин+е шт+река гор+ит факел, и псы ж+дут ком+анды."]
seq, _ = pack.preprocess_tacotron(texts[0]); seq = seq.unsqueeze(0)

with torch.no_grad():
    log_d, pitch = Predict(jm)(seq, spk)
    print("PRED", log_d.shape, pitch.shape)
    dur = torch.tensor(post_dur(log_d.numpy()), dtype=log_d.dtype)
    mel = Acoustic(jm)(seq, spk, dur, pitch)
    print("MEL", mel.shape, mel.dtype)

ok = {}
def export(mod, args, name, inputs, outputs, dyn):
    try:
        sm = torch.jit.script(mod)
        torch.onnx.export(sm, args, f"{OUT}/{name}.onnx", opset_version=17, input_names=inputs,
                          output_names=outputs, dynamic_axes=dyn, dynamo=False)
        print("EXPORT OK", name, os.path.getsize(f"{OUT}/{name}.onnx")); ok[name] = True
    except Exception:
        print("EXPORT FAIL", name); traceback.print_exc(limit=4)

export(Predict(jm), (seq, spk), "predict", ["sequence", "speaker_ids"], ["log_dur", "pitch"],
       {"sequence": {1: "L"}, "log_dur": {1: "L"}, "pitch": {2: "L"}})
export(Acoustic(jm), (seq, spk, dur, pitch), "acoustic", ["sequence", "speaker_ids", "dur", "pitch"], ["mel"],
       {"sequence": {1: "L"}, "dur": {1: "L"}, "pitch": {2: "L"}, "mel": {2: "T"}})
export(Vocoder(jm), (mel,), "vocoder", ["mel"], ["audio"], {"mel": {2: "T"}, "audio": {1: "S"}})

if len(ok) == 3:
    sp = ort.InferenceSession(f"{OUT}/predict.onnx"); sa = ort.InferenceSession(f"{OUT}/acoustic.onnx"); sv = ort.InferenceSession(f"{OUT}/vocoder.onnx")
    for t in texts:
        s, _ = pack.preprocess_tacotron(t); s = s.unsqueeze(0)
        L = s.shape[1]
        ref, _ = jm(sequence=s, speaker_ids=spk, sr=24000, symb_durs={}, durs_rate=torch.ones(1, L), pitch_coefs=torch.ones(1, L), device="cpu")
        t0 = time.time()
        ld, p = sp.run(None, {"sequence": s.numpy(), "speaker_ids": spk.numpy()})
        d = post_dur(ld).astype(ld.dtype)
        m, = sa.run(None, {"sequence": s.numpy(), "speaker_ids": spk.numpy(), "dur": d, "pitch": p})
        a, = sv.run(None, {"mel": m})
        dt = time.time() - t0
        r = ref.numpy()[0]; a = a.reshape(-1)
        n = min(len(r), len(a))
        corr = float(np.corrcoef(r[:n], a[:n])[0, 1]) if n > 0 else 0
        print("COMPARE", repr(t[:30]), "ref", len(r), "onnx", len(a), "corr", round(corr, 4), "maxdiff", float(np.abs(r[:n] - a[:n]).max()), "sec", round(dt, 2), "audio_sec", round(len(a) / 24000, 2))
