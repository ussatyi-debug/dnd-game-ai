"""Свой сервер озвучки для DnD Game AI на Silero (модели v5_cis_base и silero-stress, MIT).

Нужен, если озвучка Silero нужна на телефоне или в веб-версии, а версии для Windows с
раздачей в сеть нет (например, ПК с Linux или macOS).

Установка (Python 3.10+):
    pip install --index-url https://download.pytorch.org/whl/cpu torch
    pip install silero silero-stress omegaconf
Запуск:
    python silero_server.py            # порт 5150
    python silero_server.py 6000       # другой порт
В игре: Настройки → Озвучка → «Свой сервер» → http://<IP этого компьютера>:5150

Протокол: GET /voices → {"engine", "voices": [{"id", "name", "gender"}]};
POST /tts с JSON {"text", "voice", "rate"} → audio/wav.
"""
import io
import json
import socket
import sys
import threading
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import torch
from silero import silero_tts

SAMPLE_RATE = 24000
NAMES = {
    "aigul": ("Айгуль", "f"), "albina": ("Альбина", "f"), "alexandr": ("Александр", "m"),
    "alfia": ("Альфия", "f"), "alfia2": ("Альфия (2)", "f"), "bogdan": ("Богдан", "m"),
    "dmitriy": ("Дмитрий", "m"), "ekaterina": ("Екатерина", "f"), "vika": ("Вика", "f"),
    "gamat": ("Гамат", "m"), "igor": ("Игорь", "m"), "karina": ("Карина", "f"),
    "marat": ("Марат", "m"), "nurgul": ("Нургуль", "f"), "oksana": ("Оксана", "f"),
    "ramilia": ("Рамиля", "f"), "roman": ("Роман", "m"), "timur": ("Тимур", "m"),
    "zhadyra": ("Жадыра", "f"),
}

print("Загружаю модель Silero…")
model, _ = silero_tts(language="ru", speaker="v5_cis_base")
try:
    from silero_stress import load_accentor
    accentor = load_accentor()
except Exception as e:  # без ударений Silero читает хуже, но работает
    print("Модель ударений не загрузилась:", e)
    accentor = None
lock = threading.Lock()
VOICES = sorted(
    ({"id": s, "name": NAMES.get(s[3:], (s[3:], ""))[0], "gender": NAMES.get(s[3:], ("", ""))[1]}
     for s in model.speakers if s.startswith("ru_")),
    key=lambda v: v["name"],
)


def synth(text: str, voice: str, rate: float) -> bytes:
    voice = voice if any(v["id"] == voice for v in VOICES) else "ru_dmitriy"
    rate_word = "x-slow" if rate < 0.65 else "slow" if rate < 0.9 else "medium" if rate < 1.1 else "fast" if rate < 1.35 else "x-fast"
    with lock:
        accented = accentor(text) if accentor else text
        safe = accented.replace("&", "и").replace("<", " ").replace(">", " ")
        audio = model.apply_tts(ssml_text=f'<speak><prosody rate="{rate_word}">{safe}</prosody></speak>',
                                speaker=voice, sample_rate=SAMPLE_RATE, put_accent=False, put_yo=False)
    pcm = (audio.clamp(-1, 1) * 32767).to(torch.int16).numpy().tobytes()
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(pcm)
    return buf.getvalue()


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, kind: str, body: bytes) -> None:
        self.send_response(code)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):  # noqa: N802
        self._send(204, "text/plain", b"")

    def do_GET(self):  # noqa: N802
        if self.path.split("?")[0] == "/voices":
            body = json.dumps({"engine": "silero", "voices": VOICES}, ensure_ascii=False).encode()
            self._send(200, "application/json; charset=utf-8", body)
        else:
            self._send(404, "text/plain; charset=utf-8", "Адреса: /voices, /tts".encode())

    def do_POST(self):  # noqa: N802
        if self.path.split("?")[0] != "/tts":
            return self._send(404, "text/plain; charset=utf-8", "Адреса: /voices, /tts".encode())
        try:
            req = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            wav = synth(str(req.get("text", "")), str(req.get("voice", "")), float(req.get("rate", 1)))
            self._send(200, "audio/wav", wav)
        except Exception as e:
            self._send(500, "text/plain; charset=utf-8", str(e).encode())

    def log_message(self, fmt, *args):
        pass


def lan_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("192.168.0.1", 80))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5150
    print(f"Сервер озвучки: http://{lan_ip()}:{port}  (голосов: {len(VOICES)}). Остановить — Ctrl+C.")
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
